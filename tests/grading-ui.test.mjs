import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {IDBFactory} from 'fake-indexeddb';
import {createStudentStore} from '../docs/store.js';
import {emptyProgress,progressCatalog,mergeProgress} from '../docs/sync-protocol.js';

const course=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url)));
const html=await readFile(new URL('../docs/index.html',import.meta.url),'utf8');
const task=course.tasks[0];
const catalog=progressCatalog(course);
const allCorrect=()=>Object.fromEntries(task.questions.map(q=>[q.id,q.grading.correctIndex]));

// Run the real app against isolated IndexedDB and an in-memory server only.
async function classroom({factory=new IDBFactory(),remote=emptyProgress('fernando'),route=`tarea/${task.id}`}={}) {
  const dom=new JSDOM(html,{url:`https://classroom.example/?alumno=fernando#${route}`,pretendToBeVisual:true});
  const requests=[],timers=[];
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,location:dom.window.location,indexedDB:factory,BroadcastChannel:undefined});
  dom.window.scrollTo=()=>{};dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
  const nativeInterval=globalThis.setInterval;
  globalThis.setInterval=(fn,ms)=>{const id=nativeInterval(fn,ms);timers.push(id);id.unref();return id;};
  globalThis.fetch=async(url,options={})=>{
    const path=String(url);requests.push({path,options});
    if(path.startsWith('https://script.google.com/')){
      const payload=JSON.parse(options.body);
      const result=mergeProgress(remote,payload.operations,catalog,new Date().toISOString());
      remote=result.state;
      return new Response(JSON.stringify(result));
    }
    if(path.includes('/data/'))return new Response(await readFile(new URL(path)));
    throw new Error('Unexpected external request: '+path);
  };
  await import(`../docs/app.js?ui-test=${crypto.randomUUID()}`);
  try{await until(()=>document.querySelector('#sync-status')?.dataset.phase==='synced'&&document.querySelector('#question-stage, .family-stats'));}catch(error){for(const id of timers)clearInterval(id);globalThis.setInterval=nativeInterval;dom.window.close();throw error;}
  // The sync callback queues the final DOM refresh after the status change.
  await settle();
  return {dom,factory,requests,server:()=>remote,close:()=>{for(const id of timers)clearInterval(id);globalThis.setInterval=nativeInterval;dom.window.close();}};
}
async function settle(){await new Promise(resolve=>setTimeout(resolve,30));}
async function until(check){for(let n=0;n<150;n++){if(check())return;await settle();}throw new Error('App did not reach expected state: '+document.body.textContent.slice(-1600));}
async function click(selector){const element=document.querySelector(selector);assert.ok(element,selector);element.click();await settle();}
async function mark(index){const element=document.querySelector(`input[data-answer][value="${index}"]`);assert.ok(element&&!element.disabled);element.checked=true;element.dispatchEvent(new window.Event('change',{bubbles:true}));await until(()=>document.querySelector('#question-save-status')?.textContent!=='Guardando respuesta…');await settle();}

test('real task flow grades only after the tenth saved choice, then reviews errors and stays closed',async()=>{
  const ui=await classroom();
  try{
    assert.equal(document.querySelectorAll('.question-step:disabled').length,9);
    assert.equal(document.querySelectorAll('.grade-summary,.solution,.answer-review').length,0);
    assert.ok(!ui.requests.some(r=>r.path.includes('drive.json')));
    assert.doesNotMatch(document.body.textContent,/Drive/);
    for(let index=0;index<10;index++){
      // One intentional error verifies the correction flow without touching live progress.
      await mark(index===0?0:task.questions[index].grading.correctIndex);
      if(index<9){
        assert.equal(document.querySelectorAll('.grade-summary,.solution,.answer-review').length,0);
        await click(`.question-navigation [data-action="question-go"][data-id="${index+1}"]`);
      }
    }
    assert.equal(document.querySelector('.grade-score strong').textContent,'18');
    assert.equal(document.querySelectorAll('input[data-answer]:disabled').length,5);
    assert.match(document.querySelector('.grade-summary').textContent,/9 de 10/);
    await click('.review-question-link[data-id="0"]');
    assert.equal(document.querySelector('.answer-review').dataset.result,'incorrect');
    assert.match(document.querySelector('.answer-review').textContent,/Respuesta correcta: B/);
    assert.ok(document.querySelector('.solution').open);
    assert.equal(document.querySelectorAll('.incorrect-option').length,1);
    assert.equal(document.querySelectorAll('.correct-option').length,1);
    assert.equal(document.querySelectorAll('.math-fallback').length,0);
    await click('.solution-theory');
    assert.equal(document.querySelector('[data-topic-section="uni-c1-mapa"]').open,true);
    assert.equal(document.querySelectorAll('.worked-example').length,30);
    assert.doesNotMatch(document.body.textContent,/Subir al Drive/);
    const saved=(await createStudentStore('fernando',ui.factory).all('drafts')).find(d=>d.id===task.id);
    assert.equal(saved.answers[task.questions[0].id],0);
    const before=ui.server().revision;
    location.hash='padres';await until(()=>document.querySelector('.family-stats'));
    assert.match(document.body.textContent,/Nota: 18\/20/);
    assert.equal(ui.server().revision,before);
  }finally{ui.close();}
});

test('completed legacy work is graded immediately, and a fresh parent device gets the same score',async()=>{
  const factory=new IDBFactory(),store=createStudentStore('fernando',factory);
  const answers=allCorrect();answers[task.questions[0].id]=0;answers[task.questions[1].id]=0;
  await store.put('drafts',{id:task.id,answers,updatedAt:'2026-09-17T23:00:00.000Z'});
  const student=await classroom({factory});let remote;
  try{
    assert.equal(document.querySelector('.grade-score strong').textContent,'16');
    assert.deepEqual((await store.all('drafts')).find(d=>d.id===task.id).answers,answers);
    remote=structuredClone(student.server());
  }finally{student.close();}
  const parent=await classroom({remote,route:'padres'});
  try{
    assert.match(document.body.textContent,/Nota: 16\/20/);
    assert.equal(document.querySelector('#parent-answered').textContent.trim(),'10 / 30');
    assert.doesNotMatch(document.body.textContent,/Drive/);
    assert.equal(parent.requests.filter(r=>r.path.startsWith('https://script.google.com/')).flatMap(r=>JSON.parse(r.options.body).operations).length,0);
  }finally{parent.close();(await store.openDatabase()).close();}
});
