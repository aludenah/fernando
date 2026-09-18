import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {IDBFactory} from 'fake-indexeddb';
import {createStudentStore} from '../docs/store.js';
import {createProgressSync,appsScriptTransport} from '../docs/sync.js';
import {createProgressReport,summarizeProgress} from '../docs/progress.js';
import {parentsView} from '../docs/family-views.js';
import {questionSequence} from '../docs/sequence.js';

const courses={};
for(const [id,file] of [['fernando','course'],['josue','josue-course']])courses[id]=JSON.parse(await readFile(new URL(`../docs/data/${file}.json`,import.meta.url),'utf8'));
const code=await readFile(new URL('../integrations/progress/Code.gs',import.meta.url),'utf8');
const core=await readFile(new URL('../integrations/progress/Core.gs',import.meta.url),'utf8');
const fTask=courses.fernando.tasks[0],fQuestions=fTask.questions;
const answerField=(index=0)=>`answer:${fTask.id}:${fQuestions[index].id}`;
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};

function server(){
  const properties={};let locked=false;
  const context=vm.createContext({
    PropertiesService:{getScriptProperties:()=>({getProperties:()=>({...properties}),setProperties:(values,remove)=>{
      assert.equal(locked,true);assert.equal(remove,false);
      for(const [key,value] of Object.entries(values)){assert.ok(value.length<9000);properties[key]=value;}
    }})},
    LockService:{getScriptLock:()=>({waitLock:()=>{assert.equal(locked,false);locked=true;},releaseLock:()=>{locked=false;}})},
    ContentService:{MimeType:{JSON:'application/json'},createTextOutput:text=>({text,setMimeType(){return this;}})}
  });
  vm.runInContext(core+'\n'+code,context);
  const send=payload=>JSON.parse(context.doPost({postData:{contents:JSON.stringify(payload)}}).text);
  const read=studentId=>JSON.parse(context.doGet({parameter:{studentId}}).text).state;
  return {send,read,properties,context};
}
async function device(service,id='fernando',options={}){
  const store=options.store||createStudentStore(id,new IDBFactory());
  const statuses=[],changes=[];
  const sync=createProgressSync({studentId:id,course:courses[id],store,transport:options.transport|| (async payload=>service.send(payload)),onStatus:value=>statuses.push(value),onChange:value=>changes.push(value)});
  await sync.initialize();
  return {store,sync,statuses,changes};
}
async function answers(device,taskId=fTask.id){return (await device.store.all('drafts')).find(d=>d.id===taskId)?.answers||{};}
async function record(device){return (await device.store.all('settings')).find(item=>item.id==='cloud-sync-v1');}

test('two independent devices and the parent report share actual answers and reviewed theory',async()=>{
  const service=server(),a=await device(service),b=await device(service);
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,3);
  await a.sync.saveAnswer(fTask.id,fQuestions[1].id,0);
  await a.sync.saveTopic(courses.fernando.lesson.topics[0].id,true);
  assert.equal(await a.sync.sync(),true);assert.equal(await b.sync.sync(),true);
  assert.deepEqual(await answers(b),{[fQuestions[0].id]:3,[fQuestions[1].id]:0});
  const learned=(await b.store.all('settings')).find(item=>item.id==='learned');
  const report=createProgressReport(courses.fernando,courses.fernando.tasks,await b.store.all('drafts'),learned.topics,learned.updatedAt);
  assert.equal(summarizeProgress(report).answered,2);assert.equal(summarizeProgress(report).learned,1);
  assert.equal(questionSequence(fTask,await answers(b)).resumeAt,2);
  assert.match(parentsView(report,{sync:b.statuses.at(-1)}),/Avance compartido/);
});

test('new devices never erase existing progress, and old local answers only fill missing fields',async()=>{
  const service=server(),a=await device(service);
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,4);await a.sync.sync();
  const old=createStudentStore('fernando',new IDBFactory());
  await old.put('drafts',{id:fTask.id,answers:{[fQuestions[0].id]:1,[fQuestions[1].id]:2},note:'Comentario conservado'});
  const legacy=await device(service,'fernando',{store:old});await legacy.sync.sync();
  assert.deepEqual(await answers(legacy),{[fQuestions[0].id]:4,[fQuestions[1].id]:2});
  assert.equal((await legacy.store.all('drafts'))[0].note,'Comentario conservado');
  const empty=await device(service);await empty.sync.sync();
  assert.deepEqual(await answers(empty),await answers(legacy));
  assert.equal(service.read('fernando').revision,2);
});

test('offline edits survive closing and reopening the local database and sync after reconnection',async()=>{
  const service=server(),a=await device(service,'fernando',{transport:async()=>{throw new Error('offline');}});
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,0);assert.equal(await a.sync.sync(),false);
  assert.equal(a.statuses.at(-1).phase,'offline');assert.equal(a.statuses.at(-1).pending,1);
  assert.equal(Object.keys(service.read('fernando').fields).length,0);
  const reopened=await device(service,'fernando',{store:a.store});await reopened.sync.sync();
  assert.equal(service.read('fernando').fields[answerField()].value,0);
  assert.equal(reopened.statuses.at(-1).pending,0);
});

test('different questions edited on two devices merge; stale edits to one question retain the confirmed answer',async()=>{
  const service=server(),a=await device(service),b=await device(service);
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,0);await a.sync.sync();await b.sync.sync();
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,1);
  await b.sync.saveAnswer(fTask.id,fQuestions[0].id,2);
  await b.sync.saveAnswer(fTask.id,fQuestions[1].id,4);
  await a.sync.sync();await b.sync.sync();await a.sync.sync();
  assert.deepEqual(await answers(a),{[fQuestions[0].id]:1,[fQuestions[1].id]:4});
  assert.deepEqual(await answers(b),await answers(a));
  assert.equal(b.changes.at(-1).conflicts,1);
  const backup=(await b.store.all('settings')).find(item=>item.id==='cloud-conflicts-v1');
  assert.equal(backup.changes[0].value,2);assert.equal(backup.changes[0].sharedValue,1);
});

test('a lost acknowledgement can be retried without duplicating or losing a newer local selection',async()=>{
  const service=server();let fail=true;
  const a=await device(service,'fernando',{transport:async payload=>{
    const result=service.send(payload);if(fail){fail=false;throw new Error('lost response');}return result;
  }});
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,0);await a.sync.sync();
  assert.equal(service.read('fernando').revision,1);
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,3);await a.sync.sync();
  assert.equal(service.read('fernando').fields[answerField()].value,3);
  assert.equal(a.changes.at(-1).conflicts,0);
  const revision=service.read('fernando').revision;await a.sync.sync();
  assert.equal(service.read('fernando').revision,revision);
});

test('editing an answer while its request is in flight drains the newer durable change',async()=>{
  const service=server(),started=deferred(),finish=deferred();let first=true;
  const a=await device(service,'fernando',{transport:async payload=>{
    const response=service.send(payload);
    if(first){first=false;started.resolve();await finish.promise;}return response;
  }});
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,0);
  const syncing=a.sync.sync();await started.promise;
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,2);
  finish.resolve();assert.equal(await syncing,true);
  assert.equal(service.read('fernando').fields[answerField()].value,2);
  assert.equal(Object.keys((await record(a)).outbox).length,0);
});

test('two tabs sharing IndexedDB do not lose each other’s edits or apply out-of-order snapshots',async()=>{
  const service=server(),factory=new IDBFactory(),started=deferred(),finish=deferred();let delay=true;
  const a=await device(service,'fernando',{store:createStudentStore('fernando',factory),transport:async payload=>{
    const result=service.send(payload);if(delay){delay=false;started.resolve();await finish.promise;}return result;
  }});
  const b=await device(service,'fernando',{store:createStudentStore('fernando',factory)});
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,0);
  const slow=a.sync.sync();await started.promise;
  await b.sync.saveAnswer(fTask.id,fQuestions[1].id,1);await b.sync.sync();
  finish.resolve();await slow;
  assert.deepEqual(await answers(a),{[fQuestions[0].id]:0,[fQuestions[1].id]:1});
  assert.equal((await record(a)).remote.revision,2);
});

test('theory can be unchecked and stays unchecked when an older device migrates',async()=>{
  const service=server(),topic=courses.fernando.lesson.topics[0].id,a=await device(service),b=await device(service);
  await a.sync.saveTopic(topic,true);await a.sync.sync();await b.sync.sync();
  await b.sync.saveTopic(topic,false);await b.sync.sync();await a.sync.sync();
  assert.deepEqual((await a.store.all('settings')).find(item=>item.id==='learned').topics,[]);
  const old=createStudentStore('fernando',new IDBFactory());await old.put('settings',{id:'learned',topics:[topic]});
  const c=await device(service,'fernando',{store:old});await c.sync.sync();
  assert.deepEqual((await c.store.all('settings')).find(item=>item.id==='learned').topics,[]);
});

test('Fernando and Josué stay isolated on server and on each independent device',async()=>{
  const service=server(),f=await device(service),j=await device(service,'josue');
  await f.sync.saveAnswer(fTask.id,fQuestions[0].id,4);await f.sync.sync();await j.sync.sync();
  assert.deepEqual(await j.store.all('drafts'),[]);
  const jTask=courses.josue.tasks[0];await j.sync.saveAnswer(jTask.id,jTask.questions[0].id,1);await j.sync.sync();
  assert.equal(Object.keys(service.read('fernando').fields).length,1);
  assert.equal(Object.keys(service.read('josue').fields).length,1);
  await assert.rejects(j.sync.saveAnswer(fTask.id,fQuestions[0].id,0));
});

test('invalid server batches cannot partially write or inflate progress, and sequence is enforced',()=>{
  const service=server(),good={id:'operation-0001',field:answerField(),value:0,baseRevision:0,seed:false};
  const send=operations=>service.send({version:1,studentId:'fernando',operations});
  assert.equal(send([good,{...good,id:'operation-0002',field:answerField(1),value:99}]).ok,false);
  assert.deepEqual(service.read('fernando').fields,{});
  const skipped=send([{...good,field:answerField(2)}]);assert.equal(skipped.conflicts.length,1);
  assert.deepEqual(service.read('fernando').fields,{});
  assert.equal(send([good,good]).ok,false);
  assert.equal(service.send({version:1,studentId:'__proto__',operations:[]}).ok,false);
  assert.equal(JSON.parse(service.context.doPost({postData:{contents:'x'.repeat(60001)}}).text).ok,false);
});

test('malformed or wrong-student server responses never acknowledge pending local answers',async()=>{
  const service=server(),a=await device(service,'fernando',{transport:async()=>({ok:true,state:service.read('josue'),accepted:[],conflicts:[]})});
  await a.sync.saveAnswer(fTask.id,fQuestions[0].id,2);assert.equal(await a.sync.sync(),false);
  assert.equal(Object.keys((await record(a)).outbox).length,1);
  assert.equal((await answers(a))[fQuestions[0].id],2);
  assert.notEqual(a.statuses.at(-1).phase,'synced');
});

test('failed local transactions cannot acknowledge or unlock unsaved answers',async()=>{
  const store=createStudentStore('fernando',new IDBFactory());
  await assert.rejects(store.update(['drafts'],()=>({operations:[{store:'drafts',value:{id:fTask.id,answers:{q:1}}},{store:'settings',value:{id:'bad'}}]})));
  assert.deepEqual(await store.all('drafts'),[]);
});

test('transport uses readable simple POST, follows Apps Script redirects, and fails closed on HTML',async()=>{
  let request;
  const transport=appsScriptTransport('https://script.google.com/macros/s/example-deployment/exec',async(url,options)=>{
    request={url,...options};return {ok:true,text:async()=>JSON.stringify({ok:true})};
  });
  await transport({studentId:'fernando'});
  assert.equal(request.credentials,'omit');assert.equal(request.redirect,'follow');
  assert.equal(request.headers['Content-Type'],'text/plain;charset=UTF-8');assert.notEqual(request.mode,'no-cors');
  assert.throws(()=>appsScriptTransport('https://untrusted.example/exec'));
  const broken=appsScriptTransport('https://script.google.com/macros/s/example/exec',async()=>({ok:true,text:async()=>'<html>Login</html>'}));
  await assert.rejects(broken({}),/permite guardar/);
});

test('unconfigured service is honest and keeps local editing; parent loading never presents fresh zeros as actual progress',async()=>{
  const store=createStudentStore('fernando',new IDBFactory()),statuses=[];
  const sync=createProgressSync({studentId:'fernando',course:courses.fernando,store,onStatus:value=>statuses.push(value)});
  await sync.initialize();await sync.saveAnswer(fTask.id,fQuestions[0].id,0);
  assert.equal(await sync.sync(),false);assert.equal(statuses.at(-1).phase,'unconfigured');
  assert.equal((await store.all('drafts'))[0].answers[fQuestions[0].id],0);
  const report=createProgressReport(courses.fernando,courses.fernando.tasks,[],[]);
  const parent=parentsView(report,{sync:{enabled:true,phase:'syncing',lastSyncedAt:null}});
  assert.match(parent,/consultando su avance/);assert.doesNotMatch(parent,/parent-answered/);
});
