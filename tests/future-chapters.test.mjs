import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {IDBFactory} from 'fake-indexeddb';
import {createStudentStore} from '../docs/store.js';
import {createProgressSync,appsScriptTransport} from '../docs/sync.js';
import {progressCatalog} from '../docs/sync-protocol.js';

const base=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url),'utf8'));
const installer=await readFile(new URL('../integrations/progress/Instalar.gs',import.meta.url),'utf8');
function withChapters(count){
  const course=structuredClone(base);
  for(let n=3;n<=count;n++){
    const lesson={id:`algebra-uni-c${n}`,topics:Array.from({length:10},(_,i)=>({id:`algebra-uni-c${n}-topic${i}`}))};
    course.additionalLessons.push(lesson);
    for(const level of ['basico','intermedio','avanzado'])course.tasks.push({id:`algebra-uni-c${n}-${level}`,chapterId:lesson.id,published:true,
      questions:Array.from({length:10},(_,i)=>({id:`alg-uni-c${n}-${level}-${i+1}`,options:['A','B','C','D','E']}))});
  }
  return course;
}
function service(course=base){
  const properties={},cache=new Map(),requests=[],publisher={course:structuredClone(course),fail:false};let locked=false;
  const context=vm.createContext({
    CacheService:{getScriptCache:()=>({get:key=>cache.get(key)||null,put:(key,value,ttl)=>{assert.ok(value.length<100000);assert.equal(ttl,21600);cache.set(key,value);}})},
    UrlFetchApp:{fetch:(url,options)=>{
      requests.push(url);assert.equal(url,'https://raw.githubusercontent.com/aludenah/fernando/main/docs/data/course.json');
      assert.equal(options.method,'get');assert.equal(options.followRedirects,false);assert.equal(options.payload,undefined);
      return {getResponseCode:()=>publisher.fail?503:200,getContentText:()=>JSON.stringify(publisher.course)};
    }},
    PropertiesService:{getScriptProperties:()=>({getProperties:()=>({...properties}),setProperties:(changes,remove)=>{assert.equal(locked,true);assert.equal(remove,false);Object.assign(properties,changes);}})},
    LockService:{getScriptLock:()=>({waitLock:()=>{assert.equal(locked,false);locked=true;},releaseLock:()=>{locked=false;}})},
    ContentService:{MimeType:{JSON:'application/json'},createTextOutput:text=>({text,setMimeType(){return this;}})}
  });
  vm.runInContext(installer,context);
  return {publisher,properties,cache,requests,context,
    send:input=>JSON.parse(context.doPost({postData:{contents:JSON.stringify(input)}}).text),
    read:()=>JSON.parse(context.doGet({parameter:{studentId:'fernando'}}).text),
    age:()=>{for(const [key,value]of cache){const entry=JSON.parse(value);entry.fetchedAt-=60001;cache.set(key,JSON.stringify(entry));}}
  };
}
async function device(server,course){
  const store=createStudentStore('fernando',new IDBFactory()),statuses=[];
  const sync=createProgressSync({studentId:'fernando',course,store,transport:async p=>server.send(p),onStatus:s=>statuses.push(s)});
  await sync.initialize();return {store,sync,statuses};
}
const answers=async(device,id)=>(await device.store.all('drafts')).find(d=>d.id===id)?.answers||{};

test('publishing chapter 3 automatically synchronizes its answers and theory on a second device',async()=>{
  const course=withChapters(3),server=service(course),a=await device(server,course),b=await device(server,course);
  const task=course.tasks.find(t=>t.chapterId==='algebra-uni-c3');
  await a.sync.saveAnswer(task.id,task.questions[0].id,4);await a.sync.saveAnswer(task.id,task.questions[1].id,2);
  await a.sync.saveTopic(course.additionalLessons[1].topics[0].id,true);
  assert.equal(await a.sync.sync(),true);assert.equal(await b.sync.sync(),true);
  assert.deepEqual(await answers(b,task.id),{[task.questions[0].id]:4,[task.questions[1].id]:2});
  assert.equal(server.read().supportedFields.length,Object.keys(progressCatalog(course)).length);
  assert.equal(server.requests.length,1,'a cached catalog is shared across requests');
});

test('future chapters refresh after publication without changing the deployed script',async()=>{
  const server=service(),a=await device(server,base);await a.sync.sync();
  const course=withChapters(4);server.publisher.course=course;server.age();
  const b=await device(server,course),task=course.tasks.at(-1);
  await b.sync.saveAnswer(task.id,task.questions[0].id,1);assert.equal(await b.sync.sync(),true);
  const fresh=await device(server,course);await fresh.sync.sync();
  assert.deepEqual(await answers(fresh,task.id),{[task.questions[0].id]:1});
  assert.equal(server.requests.length,2);
});

test('an old page cannot erase future answers and new devices preserve all chapters',async()=>{
  const course=withChapters(3),server=service(course),a=await device(server,course),task=course.tasks.at(-1);
  await a.sync.saveAnswer(task.id,task.questions[0].id,2);await a.sync.sync();
  const old=await device(server,base),first=base.tasks[0];
  await old.sync.saveAnswer(first.id,first.questions[0].id,3);await old.sync.sync();
  const fresh=await device(server,course);assert.equal(await fresh.sync.sync(),true);
  assert.deepEqual(await answers(fresh,task.id),{[task.questions[0].id]:2});
  assert.deepEqual(await answers(fresh,first.id),{[first.questions[0].id]:3});
});

test('client-supplied fields and unpublished tasks cannot expand the server catalog',()=>{
  const course=withChapters(3),task=course.tasks.at(-1);task.published=false;
  const server=service(course),field=`answer:${task.id}:${task.questions[0].id}`;
  const result=server.send({version:1,studentId:'fernando',knownFields:[field],catalog:{[field]:{kind:'answer'}},operations:[{id:'unknown-field-test',field,value:1,baseRevision:0,seed:false}]});
  assert.equal(result.ok,false);assert.deepEqual(server.properties,{});
  assert.equal(server.send({version:1,studentId:'__proto__',operations:[]}).ok,false);
  assert.equal(server.requests.length,1);
});

test('a source outage retains pending future answers and reports failure instead of an empty shared state',async()=>{
  const course=withChapters(3),server=service(course),a=await device(server,course),task=course.tasks.at(-1);
  await a.sync.saveAnswer(task.id,task.questions[0].id,2);await a.sync.sync();
  const before=structuredClone(server.properties);server.publisher.fail=true;server.cache.clear();
  await a.sync.saveAnswer(task.id,task.questions[1].id,4);assert.equal(await a.sync.sync(),false);
  assert.equal(a.statuses.at(-1).phase,'offline');assert.equal(a.statuses.at(-1).pending,1);
  assert.equal(server.read().ok,false);assert.deepEqual(server.properties,before);
  server.publisher.fail=false;assert.equal(await a.sync.sync(),true);
  const b=await device(server,course);await b.sync.sync();
  assert.deepEqual(await answers(b,task.id),{[task.questions[0].id]:2,[task.questions[1].id]:4});
});

test('cached future chapters remain available during a temporary source outage',async()=>{
  const course=withChapters(3),server=service(course),a=await device(server,course),task=course.tasks.at(-1);
  await a.sync.saveAnswer(task.id,task.questions[0].id,3);await a.sync.sync();
  server.age();server.publisher.fail=true;
  const b=await device(server,course);assert.equal(await b.sync.sync(),true);
  assert.deepEqual(await answers(b,task.id),{[task.questions[0].id]:3});
});

test('all 28 chapters fit the catalog cache and transport, keeping the same service',async()=>{
  const course=withChapters(28),server=service(course),a=await device(server,course),task=course.tasks.at(-1);
  await a.sync.saveAnswer(task.id,task.questions[0].id,4);assert.equal(await a.sync.sync(),true);
  const response=server.read();assert.equal(response.supportedFields.length,Object.keys(progressCatalog(course)).length);
  assert.equal(server.cache.size,1);assert.equal(server.requests.length,1);
  const b=await device(server,course);assert.equal(await b.sync.sync(),true);
  assert.deepEqual(await answers(b,task.id),{[task.questions[0].id]:4});
  const fields=Object.fromEntries(Object.entries(progressCatalog(course)).map(([key,spec],i)=>[key,{value:spec.kind==='topic'?true:0,revision:i+1,opId:`large-course-${i}`,updatedAt:'2026-09-24T15:00:00Z'}]));
  const body=JSON.stringify({ok:true,state:{version:1,studentId:'fernando',revision:Object.keys(fields).length,fields},accepted:[],conflicts:[],supportedFields:Object.keys(fields)});
  assert.ok(body.length>150000);
  const transport=appsScriptTransport('https://script.google.com/macros/s/test/exec',async()=>({ok:true,text:async()=>body}));
  assert.equal((await transport({})).state.revision,Object.keys(fields).length);
});

test('malformed published courses cannot redefine questions or acknowledge pending work',async()=>{
  const course=withChapters(3),server=service(course),a=await device(server,course),task=course.tasks.at(-1);
  server.publisher.course.tasks.at(-1).questions.push(structuredClone(task.questions[0]));
  await a.sync.saveAnswer(task.id,task.questions[0].id,1);assert.equal(await a.sync.sync(),false);
  assert.equal(a.statuses.at(-1).pending,1);assert.deepEqual(server.properties,{});
});
