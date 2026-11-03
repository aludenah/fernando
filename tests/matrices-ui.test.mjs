import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {IDBFactory} from 'fake-indexeddb';
import {mountMatrixApp} from '../docs/matrices-app.js';
import {createStudentStore} from '../docs/store.js';
import {emptyProgress,progressCatalog,mergeProgress} from '../docs/sync-protocol.js';

const course=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url)));
const html=await readFile(new URL('../docs/index.html',import.meta.url),'utf8');
const catalog=progressCatalog(course);
function server(){let state=emptyProgress('fernando');return {state:()=>state,send(payload){const result=mergeProgress(state,payload.operations,catalog,new Date().toISOString());state=result.state;return {...result,supportedFields:Object.keys(catalog)};}};}
async function open({factory=new IDBFactory(),service=server(),route='matrices',student='fernando',offline=false}={}) {
  const dom=new JSDOM(html,{url:`https://aula.example/${student?'?alumno='+student:''}#${route}`,pretendToBeVisual:true});
  const store=createStudentStore('fernando',factory),requests=[];
  const fetcher=async(url,options={})=>{
    requests.push(String(url));
    if(String(url).startsWith('https://script.google.com/')){if(offline)throw new Error('Offline');return new Response(JSON.stringify(service.send(JSON.parse(options.body))));}
    return new Response(await readFile(new URL(url)));
  };
  const app=await mountMatrixApp({doc:dom.window.document,win:dom.window,store,fetcher});
  const doc=dom.window.document;
  return {app,doc,win:dom.window,service,store,factory,requests,close(){app.destroy();dom.window.close();}};
}
async function until(check) {for(let attempt=0;attempt<120;attempt++){if(check())return;await new Promise(resolve=>setTimeout(resolve,10));}throw new Error('Expected UI state was not reached.');}
function input(ui,key,value){const element=ui.doc.querySelector(`[data-mx-input="${key}"]`);assert.ok(element);element.value=value;element.dispatchEvent(new ui.win.Event('input',{bubbles:true}));}
function fill(ui,values){for(const [index,value] of values.entries()){const element=ui.doc.querySelectorAll('[data-mx-input]')[index];input(ui,element.dataset.mxInput,String(value));}}
function submit(ui){ui.doc.querySelector('#mx-form').dispatchEvent(new ui.win.Event('submit',{bubbles:true,cancelable:true}));}

test('home keeps all three accesses and Fernando opens only the matrix practice',async()=>{
  const ui=await open({student:'',route:'inicio'});
  try{
    const links=[...ui.doc.querySelectorAll('.access-card')];
    assert.deepEqual(links.map(link=>link.querySelector('h2').textContent),['Padres','Fernando','Josué']);
    assert.match(links[1].href,/alumno=fernando#matrices/);
    assert.match(links[2].href,/alumno=josue#cursos/);
    assert.doesNotMatch(ui.doc.body.textContent,/Introducción al álgebra|Exponentes y radicales|30 problemas/);
    ui.win.location.hash='matrices';await until(()=>ui.doc.querySelector('#mx-form'));
    assert.equal(ui.doc.querySelectorAll('[data-mx-input]').length,4);
    assert.doesNotMatch(ui.doc.body.textContent,/Mis cursos|Temario|Subir al Drive/);
  }finally{ui.close();}
});

test('incomplete matrices, errors, correction, next problem and saved progress follow the actual interaction',async()=>{
  const ui=await open();
  try{
    submit(ui);await until(()=>ui.doc.querySelector('.mx-feedback.is-warning'));
    assert.equal(ui.doc.querySelector('.mx-next').disabled,true);
    const selected=ui.doc.querySelector('[data-mx-input="2-1"]');selected.focus();
    assert.match(ui.doc.querySelector('.mx-position').textContent,/Fila i = 2.*Columna j = 1/);
    assert.ok(ui.doc.querySelector('[data-mx-row="2"]').classList.contains('is-active'));
    fill(ui,[2,3,3,99]);submit(ui);await until(()=>ui.doc.querySelector('.mx-feedback.is-error'));
    assert.match(ui.doc.querySelector('#mx-feedback').textContent,/3 de 4/);
    assert.equal(ui.doc.querySelectorAll('.mx-cell[data-result="incorrect"]').length,1);
    assert.equal(ui.doc.querySelector('.mx-next').disabled,true);
    assert.equal(ui.doc.activeElement.dataset.mxInput,'2-2');
    input(ui,'2-2','4');submit(ui);await until(()=>ui.doc.querySelector('.mx-feedback.is-success'));
    assert.equal(ui.doc.querySelectorAll('input[readonly]').length,4);
    assert.equal(ui.doc.querySelector('.mx-next').disabled,false);
    await until(()=>ui.service.state().fields['topic:matrices-p01']?.value===true);
    ui.doc.querySelector('.mx-next').click();await until(()=>ui.doc.querySelectorAll('[data-mx-input]').length===6);
    assert.match(ui.doc.querySelector('.mx-instructions').textContent,/Problema 2/);
    assert.equal(ui.doc.querySelectorAll('[data-mx-row]').length,2);
    assert.equal(ui.doc.querySelectorAll('[data-mx-column]').length,3);
    input(ui,'2-3','-4');await ui.app.flush();
    ui.win.dispatchEvent(new ui.win.Event('focus'));
    await until(()=>ui.doc.querySelector('#sync-status').dataset.phase==='synced');
    assert.equal(ui.doc.querySelector('[data-mx-input="2-3"]').value,'-4');
    ui.win.location.hash='padres';await until(()=>ui.doc.querySelector('#parent-matrices'));
    assert.match(ui.doc.querySelector('#parent-matrices').textContent,/1.*20/);
    assert.equal(ui.doc.querySelectorAll('.mx-result-badge.is-solved').length,1);
    assert.doesNotMatch(ui.doc.body.textContent,/Introducción al álgebra|Exponentes y radicales/);
    assert.ok(ui.doc.querySelector('a[href*="alumno=josue#padres"]'));
  }finally{ui.close();}
});

test('zeros, negatives, rectangular orientation and the four size filters are usable',async()=>{
  const ui=await open();
  try{
    const select=ui.doc.querySelector('#mx-order');select.value='3x3';select.dispatchEvent(new ui.win.Event('change',{bubbles:true}));
    assert.equal(ui.doc.querySelectorAll('[data-mx-input]').length,9);
    fill(ui,[0,-1,-2,1,0,-1,2,1,0]);submit(ui);await until(()=>ui.doc.querySelector('.mx-feedback.is-success'));
    for(const [order,rows,columns] of [['3x2',3,2],['2x3',2,3],['2x2',2,2]]){
      const select=ui.doc.querySelector('#mx-order');select.value=order;select.dispatchEvent(new ui.win.Event('change',{bubbles:true}));
      assert.equal(ui.doc.querySelectorAll('[data-mx-row]').length,rows);
      assert.equal(ui.doc.querySelectorAll('[data-mx-column]').length,columns);
      assert.equal(ui.doc.querySelectorAll('[data-mx-input]').length,rows*columns);
    }
    const cell=ui.doc.querySelector('[data-mx-input="1-1"]');cell.focus();
    ui.doc.querySelector('[data-mx-action="negative"]').click();assert.equal(cell.value,'-');
    input(ui,'1-1','-3');ui.doc.querySelector('[data-mx-action="negative"]').click();assert.equal(cell.value,'3');
    assert.equal(ui.doc.querySelectorAll('.math-fallback').length,0);
  }finally{await ui.app.flush();ui.close();}
});

test('drafts survive reloading offline and completed matrices reach a separate parent device',async()=>{
  const factory=new IDBFactory(),service=server();
  const first=await open({factory,service});
  fill(first,[2,3,3,4]);submit(first);await until(()=>service.state().fields['topic:matrices-p01']);
  first.doc.querySelector('.mx-next').click();await until(()=>first.doc.querySelectorAll('[data-mx-input]').length===6);
  input(first,'2-1','0');await first.app.flush();first.close();
  const offline=await open({factory,service,offline:true});
  try{assert.equal(offline.doc.querySelector('[data-mx-input="2-1"]').value,'0');assert.match(offline.doc.querySelector('.mx-instructions').textContent,/Problema 2/);}
  finally{offline.close();}
  const parent=await open({service,route:'padres'});
  try{await until(()=>parent.doc.querySelectorAll('.mx-result-badge.is-solved').length===1);assert.match(parent.doc.querySelector('#parent-matrices').textContent,/1.*20/);}
  finally{parent.close();}
});

test('retired algebra data cannot become matrix progress or block its new sync queue',async()=>{
  const factory=new IDBFactory(),store=createStudentStore('fernando',factory);
  await store.put('settings',{id:'learned',topics:['uni-c1-mapa']});
  await store.put('settings',{id:'cloud-sync-v1',remote:emptyProgress('fernando'),outbox:{'answer:old:question':{id:'old-pending-answer'}}});
  const ui=await open({factory});
  try{
    assert.match(ui.doc.querySelector('[data-mx-counter]').textContent,/0 de 20/);
    fill(ui,[2,3,3,4]);submit(ui);await until(()=>ui.service.state().fields['topic:matrices-p01']);
    const settings=await store.all('settings');
    assert.ok(settings.find(value=>value.id==='cloud-sync-v1').outbox['answer:old:question']);
    assert.ok(settings.find(value=>value.id==='matrices-cloud-sync-v1'));
    assert.ok(settings.find(value=>value.id==='learned').topics.includes('uni-c1-mapa'));
  }finally{ui.close();(await store.openDatabase()).close();}
});
