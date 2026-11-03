import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {mountMatrixApp} from '../docs/matrices-app.js';
import {expected} from './report-fixture.mjs';
const html=await readFile(new URL('../docs/index.html',import.meta.url),'utf8');
async function open({route='matrices',search='?alumno=fernando',share=false,pdfMaker=async()=>new Uint8Array([37,80,68,70,45,49])}={}){
 const dom=new JSDOM(html,{url:`https://aula.example/${search}#${route}`,pretendToBeVisual:true}),doc=dom.window.document,win=dom.window;
 const requests=[],reports=[],downloads=[],shares=[];let clock=0;
 for(const name of ['indexedDB','localStorage','sessionStorage'])Object.defineProperty(win,name,{get(){throw new Error('Storage must not be accessed.');},configurable:true});
 win.URL.createObjectURL=()=> 'blob:test-report';win.URL.revokeObjectURL=()=>{};
 doc.addEventListener('click',event=>{const target=event.target.closest('a[download]');if(target){downloads.push({name:target.download,url:target.href});event.preventDefault();}});
 if(share){Object.defineProperty(win.navigator,'canShare',{value:()=>true});Object.defineProperty(win.navigator,'share',{value:async data=>{shares.push(data);}});}
 const app=await mountMatrixApp({doc,win,random:()=>.99,now:()=>new Date(Date.parse('2026-11-03T00:00:00Z')+clock++*1000),fetcher:async(url,options={})=>{
  requests.push({url:String(url),method:options.method||'GET'});assert.equal(options.body,undefined);assert.equal(options.method,undefined);
  assert.match(String(url),/\/data\/course.json$/);return new Response(await readFile(new URL(url)));
 },makePdf:async report=>{reports.push(report);return pdfMaker(report);}});
 return {app,doc,win,requests,reports,downloads,shares,close(){app.destroy();win.close();}};
}
async function until(check){for(let count=0;count<100;count++){if(check())return;await new Promise(resolve=>setTimeout(resolve,5));}throw new Error('The interface did not reach the expected state.');}
function fill(ui,values){for(const [index,value]of values.entries()){const field=ui.doc.querySelectorAll('[data-mx-input]')[index];field.value=String(value);field.dispatchEvent(new ui.win.Event('input',{bubbles:true}));}}
function submit(ui){ui.doc.querySelector('#mx-form').dispatchEvent(new ui.win.Event('submit',{bubbles:true,cancelable:true}));}
function finish(ui,{startAt=0}={}){
 for(let problem=startAt;problem<5;problem++){
  for(const field of ui.doc.querySelectorAll('[data-mx-input]')){field.value=String(expected[problem][Number(field.dataset.i)-1][Number(field.dataset.j)-1]);field.dispatchEvent(new ui.win.Event('input',{bubbles:true}));}
  submit(ui);if(problem<4)ui.doc.querySelector('.mx-next').click();
 }
}

test('Fernando is the only access; his catalog opens the matrix application as an icon',async()=>{
 const ui=await open({route:'inicio',search:''});
 try{
  assert.deepEqual([...ui.doc.querySelectorAll('.access-card h2')].map(node=>node.textContent),['Fernando']);
  assert.match(ui.doc.querySelector('.access-card').href,/alumno=fernando#actividades/);
  assert.doesNotMatch(ui.doc.body.textContent,/Padres|Josué|avance|progreso/i);
  ui.win.location.hash='actividades';await until(()=>ui.doc.querySelector('.activity-card'));
  assert.equal(ui.doc.querySelectorAll('.activity-card').length,1);assert.ok(ui.doc.querySelector('.activity-icon svg'));
  ui.doc.querySelector('.activity-card').click();await until(()=>ui.doc.querySelector('#mx-form'));
  assert.equal(ui.doc.querySelectorAll('[data-mx-input]').length,4);
  assert.equal(ui.doc.querySelectorAll('progress,#sync-status,#mx-order,#mx-cell-help,.mx-cell-index').length,0);
 }finally{ui.close();}
});
test('removed profile URLs show only the current landing page',async()=>{
 for(const options of [{route:'padres'},{route:'cursos',search:'?alumno=josue'}]){
  const ui=await open(options);try{assert.equal(ui.doc.querySelectorAll('.access-card').length,1);assert.doesNotMatch(ui.doc.body.textContent,/Padres|Josué|avance|progreso/i);}finally{ui.close();}
 }
});
test('blank cells and errors must be corrected before advancing, without positioning aids',async()=>{
 const ui=await open();try{
  submit(ui);assert.ok(ui.doc.querySelector('.mx-feedback.is-warning'));assert.equal(ui.doc.querySelector('.mx-next').disabled,true);
  fill(ui,[2,-1,1,99]);submit(ui);assert.match(ui.doc.querySelector('#mx-feedback').textContent,/3 de 4/);
  assert.equal(ui.doc.querySelectorAll('.mx-cell[data-result="incorrect"]').length,1);
  fill(ui,[2,-1,1,4]);submit(ui);assert.ok(ui.doc.querySelector('.mx-feedback.is-success'));
  assert.equal(ui.doc.querySelectorAll('input[readonly]').length,4);
  ui.doc.querySelector('.mx-next').click();assert.match(ui.doc.querySelector('.mx-instructions h2').textContent,/Problema 2/);
  assert.equal(ui.doc.querySelectorAll('[data-mx-input]').length,6);assert.equal(ui.reports.length,0);
  finish(ui,{startAt:1});await until(()=>ui.doc.querySelector('[data-mx-action="download-report"]'));
  assert.equal(ui.reports[0].results[0].attempts,2);assert.equal(ui.reports[0].results[0].firstCorrect,3);
 }finally{ui.close();}
});
test('finishing five matrices automatically prepares a downloadable PDF and offers native sharing when supported',async()=>{
 const ui=await open({share:true});try{
  assert.equal(ui.doc.querySelector('[data-mx-action="download-report"]'),null);finish(ui);
  await until(()=>ui.doc.querySelector('[data-mx-action="download-report"]'));
  assert.match(ui.doc.querySelector('h1').textContent,/Actividad terminada/);assert.equal(ui.reports.length,1);assert.equal(ui.reports[0].results.length,5);
  assert.equal(ui.doc.querySelectorAll('.receipt-answer').length,5);assert.equal(ui.doc.querySelector('#mx-form'),null);
  ui.doc.querySelector('[data-mx-action="download-report"]').click();assert.equal(ui.downloads.length,1);assert.match(ui.downloads[0].name,/Fernando_Matrices_.*\.pdf$/);
  ui.doc.querySelector('[data-mx-action="share-report"]').click();await until(()=>ui.shares.length===1);
  assert.equal(ui.shares[0].files[0].type,'application/pdf');assert.equal(ui.shares[0].files[0].name,ui.downloads[0].name);
  assert.equal(ui.requests.length,1);assert.doesNotMatch(ui.doc.body.textContent,/enviado al profesor|entrega confirmada/i);
 }finally{ui.close();}
});
test('activity answers are memory-only; a fresh page never restores earlier work',async()=>{
 const first=await open();fill(first,[2,-1,1,4]);submit(first);first.close();
 const second=await open();try{assert.ok([...second.doc.querySelectorAll('[data-mx-input]')].every(field=>field.value===''));assert.equal(second.requests.length,1);assert.equal(second.doc.querySelector('.mx-next').disabled,true);}finally{second.close();}
});
test('PDF generation can be retried without losing the completed activity',async()=>{
 let fail=true;const ui=await open({pdfMaker:async()=>{if(fail)throw new Error('offline');return new Uint8Array([37,80,68,70,45]);}});
 try{finish(ui);await until(()=>ui.doc.querySelector('[data-mx-action="retry-report"]'));assert.equal(ui.doc.querySelectorAll('.receipt-answer').length,5);fail=false;ui.doc.querySelector('[data-mx-action="retry-report"]').click();await until(()=>ui.doc.querySelector('[data-mx-action="download-report"]'));assert.equal(ui.doc.querySelector('[data-mx-action="share-report"]'),null);}finally{ui.close();}
});
