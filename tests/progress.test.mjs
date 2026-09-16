import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createProgressReport,validateProgressReport,summarizeProgress} from '../docs/progress.js';
import {parentsView} from '../docs/family-views.js';

const course=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url),'utf8'));
const time='2026-09-16T06:00:00.000Z';
const report=(drafts=[],learned=[])=>createProgressReport(course,course.tasks,drafts,learned,null,time);

test('new students have zero actual progress and no invented activity date',()=>{
  const summary=summarizeProgress(report());
  assert.equal(summary.answered,0);assert.equal(summary.total,30);assert.equal(summary.pending,30);
  assert.equal(summary.completed,0);assert.equal(summary.percent,0);assert.equal(summary.lastActivity,null);
});
test('partial and complete work count separately, independent of correctness or Drive uploads',()=>{
  const [basic,middle]=course.tasks;
  const snapshot=report([
    {id:basic.id,answers:{[basic.questions[0].id]:0,[basic.questions[1].id]:4,'obsolete-question':2},updatedAt:'2026-09-16T05:00:00Z'},
    {id:middle.id,answers:Object.fromEntries(middle.questions.map(q=>[q.id,0])),updatedAt:time}
  ],[course.lesson.topics[0].id]);
  const summary=summarizeProgress(snapshot);
  assert.equal(summary.answered,12);assert.equal(summary.pending,18);assert.equal(summary.percent,40);
  assert.equal(summary.completed,1);assert.equal(summary.learned,1);assert.equal(summary.lastActivity,time);
  assert.deepEqual(summary.tasks.map(t=>t.status),['En progreso','Respondida','Pendiente']);
  assert.equal(Object.hasOwn(summary,'correct'),false);assert.equal(Object.hasOwn(summary,'uploads'),false);
});
test('snapshot round-trip supports unfinished work without files and does not share mutable drafts',()=>{
  const id=course.tasks[0].questions[0].id,draft={id:course.tasks[0].id,answers:{[id]:2},note:'Necesito ayuda con los signos.',updatedAt:time};
  const snapshot=validateProgressReport(JSON.parse(JSON.stringify(report([draft]))));
  assert.equal(snapshot.tasks[0].note,draft.note);assert.equal(snapshot.tasks[0].answers[id],2);
  snapshot.tasks[0].answers[id]=1;assert.equal(draft.answers[id],2);
  assert.ok(snapshot.tasks.every(entry=>!Object.hasOwn(entry,'files')));
});
test('malformed imports cannot inflate totals or inject unsupported student records',()=>{
  const empty=report();
  assert.throws(()=>validateProgressReport({...empty,studentId:'another-student'}));
  assert.throws(()=>validateProgressReport({...empty,generatedAt:'yesterday'}));
  assert.throws(()=>validateProgressReport({...empty,tasks:[empty.tasks[0],empty.tasks[0]]}));
  assert.throws(()=>validateProgressReport({...empty,learned:['unknown-topic']}));
  const bad=structuredClone(empty);bad.tasks[0].answers[course.tasks[0].questions[0].id]=5;
  assert.throws(()=>validateProgressReport(bad));
});
test('parent report text is escaped and imported progress is clearly dated',()=>{
  const snapshot=report([{id:course.tasks[0].id,answers:{},note:'<img src=x onerror=alert(1)>',updatedAt:time}]);
  const html=parentsView(snapshot,{source:'report',drive:{problems:{}}});
  assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img src=x/);
  assert.match(html,/Informe recibido/);assert.match(html,/Copia generada/);
  assert.doesNotMatch(html,/type="radio"|data-answer/);
});
