import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {IDBFactory} from 'fake-indexeddb';
import {createStudentStore} from '../docs/store.js';
import {studentProfile,studentLink} from '../docs/students.js';
import {createProgressReport,validateProgressReport,summarizeProgress} from '../docs/progress.js';
import {accessView,parentsView} from '../docs/family-views.js';

const fernando=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url),'utf8'));
const josue=JSON.parse(await readFile(new URL('../docs/data/josue-course.json',import.meta.url),'utf8'));
const stamp='2026-09-16T18:00:00.000Z';
const report=(course,id,drafts=[])=>createProgressReport(course,course.tasks,drafts,[],null,stamp,id);

test('existing Fernando answers and theory survive; identical record keys stay separate for Josué',async()=>{
 const factory=new IDBFactory();
 const oldDb=await new Promise((resolve,reject)=>{
  const request=factory.open('fernando-aula-github-v1',1);
  request.onupgradeneeded=()=>{for(const name of ['drafts','files','tasks','reviews','settings'])request.result.createObjectStore(name,{keyPath:'id'});};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
 await new Promise((resolve,reject)=>{
  const tx=oldDb.transaction(['drafts','settings'],'readwrite');
  tx.objectStore('drafts').put({id:'same-task',answers:{q1:2}});
  tx.objectStore('settings').put({id:'learned',topics:['fernando-topic']});
  tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);
 });
 oldDb.close();
 const f=createStudentStore('fernando',factory),j=createStudentStore('josue',factory);
 assert.deepEqual((await f.all('drafts'))[0].answers,{q1:2});
 assert.deepEqual(await j.all('drafts'),[]);
 assert.deepEqual(await j.all('settings'),[]);
 await j.write([{store:'drafts',value:{id:'same-task',answers:{q1:4}}},{store:'settings',value:{id:'learned',topics:['josue-topic']}}]);
 for(const store of ['files','tasks','reviews']){
  await f.put(store,{id:'same-id',owner:'fernando'});await j.put(store,{id:'same-id',owner:'josue'});
  assert.equal((await f.all(store))[0].owner,'fernando');assert.equal((await j.all(store))[0].owner,'josue');
 }
 assert.deepEqual((await f.all('drafts'))[0].answers,{q1:2});
 assert.deepEqual((await f.all('settings'))[0].topics,['fernando-topic']);
 const reopened=createStudentStore('josue',factory);
 assert.deepEqual((await reopened.all('drafts'))[0].answers,{q1:4});
 assert.deepEqual((await reopened.all('settings'))[0].topics,['josue-topic']);
 for(const store of [f,j,reopened])(await store.openDatabase()).close();
});

test('old Fernando reports remain compatible; a report for another student is rejected before saving',()=>{
 const old={...report(fernando,'fernando'),format:'fernando-avance',version:1};
 assert.equal(validateProgressReport(old,'fernando').studentId,'fernando');
 const id=josue.tasks[0].questions[0].id;
 const j=report(josue,'josue',[{id:josue.tasks[0].id,answers:{[id]:1},updatedAt:stamp}]);
 assert.equal(summarizeProgress(validateProgressReport(j,'josue')).answered,1);
 assert.equal(summarizeProgress(report(fernando,'fernando')).answered,0);
 assert.throws(()=>validateProgressReport(j,'fernando'),/Josué/);
 assert.throws(()=>validateProgressReport(old,'josue'),/Fernando/);
 assert.throws(()=>validateProgressReport({...j,studentId:'unknown'}));
});

test('entry links select a named classroom; parent headings and switcher follow the selected student',()=>{
 const landing=accessView('?v=students-1');
 assert.match(landing,/<h2>Fernando<\/h2>/);assert.match(landing,/<h2>Josué<\/h2>/);
 assert.doesNotMatch(landing,/<h2>Estudiante<\/h2>/);
 assert.equal(studentLink('josue','padres','?v=students-1'),'?v=students-1&alumno=josue#padres');
 const parent=parentsView(report(josue,'josue'),{drive:{problems:{}}});
 assert.match(parent,/El avance de Josué/);assert.match(parent,/Marcados por Josué/);
 assert.match(parent,/alumno=fernando#padres/);assert.match(parent,/alumno=josue#padres/);
 assert.doesNotMatch(parent,/El avance de Fernando|Marcados por Fernando/);
 assert.throws(()=>studentProfile('__proto__'));assert.throws(()=>createStudentStore('unknown',new IDBFactory()));
});
