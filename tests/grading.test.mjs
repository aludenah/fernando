import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeTask,publicCourse} from '../docs/model.js';
import {gradeTask} from '../docs/grading.js';
import {gradeSummary,answerReview,workedExamples} from '../docs/grading-views.js';
import {createProgressReport} from '../docs/progress.js';
import {parentsView} from '../docs/family-views.js';
import {progressCatalog} from '../docs/sync-protocol.js';

const course=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url)));
const josue=JSON.parse(await readFile(new URL('../docs/data/josue-course.json',import.meta.url)));
const keys=[[1,3,0,4,2,0,2,1,4,3],[4,1,3,0,2,4,0,3,1,2],[2,0,4,1,3,1,4,2,3,0],[1,3,0,4,2,0,2,1,4,3],[4,1,3,0,2,4,0,3,1,2],[2,0,4,1,3,1,4,2,3,0]];
const answersFor=(task,indices)=>Object.fromEntries(task.questions.map((q,i)=>[q.id,indices[i]]));

test('independently solved keys match all sixty published questions',()=>{
  assert.deepEqual(course.tasks.map(t=>t.questions.map(q=>q.grading.correctIndex)),keys);
  for(const [i,task] of course.tasks.entries()){
    assert.equal(gradeTask(normalizeTask(task),answersFor(task,keys[i])).score,20);
    const wrong=answersFor(task,keys[i].map(x=>(x+1)%5));
    assert.equal(gradeTask(task,wrong).score,0);
    assert.equal(gradeTask(task,wrong).incorrect,10);
  }
});
test('unfinished tasks never expose grade or correctness, including invalid final answers',()=>{
  const task=course.tasks[0],all=answersFor(task,keys[0]),last=task.questions.at(-1).id;
  for(const invalid of [undefined,null,'3',-1,5,1.5]){
    const answers={...all,[last]:invalid};
    assert.equal(gradeTask(task,answers),null);
    assert.equal(gradeSummary(task,answers),'');
  }
  assert.equal(gradeTask(josue.tasks[0],Object.fromEntries(josue.tasks[0].questions.map(q=>[q.id,0]))),null);
});
test('mixed answers receive an exact score, errors and the matching worked solutions',()=>{
  const task=course.tasks[0],answers=answersFor(task,keys[0]);
  answers[task.questions[0].id]=0;answers[task.questions[9].id]=0;
  const grade=gradeTask(task,answers);
  assert.deepEqual([grade.correct,grade.incorrect,grade.percent,grade.score],[8,2,80,16]);
  assert.deepEqual(grade.results.filter(q=>!q.correct).map(q=>q.number),[1,10]);
  const summary=gradeSummary(task,answers);
  assert.match(summary,/Pregunta 1<\/button>/);assert.match(summary,/Pregunta 10<\/button>/);
  const review=answerReview(task.questions[0],0);
  assert.match(review,/Respuesta incorrecta/);assert.match(review,/Respuesta correcta: B/);
  assert.match(review,/Qué repasar/);assert.match(review,/solucionario paso a paso/);
  assert.match(review,/href="#curso\/uni-c1-mapa"/);
});
test('grading survives public content and parent-report normalization without changing stored keys',()=>{
  const normalized=publicCourse(course,course.tasks);
  assert.deepEqual(progressCatalog(normalized),progressCatalog(course));
  const task=normalized.tasks[0],answers=answersFor(task,keys[0]);
  answers[task.questions[0].id]=0;
  const report=createProgressReport(normalized,normalized.tasks,[{id:task.id,answers}],[]);
  const view=parentsView(report);
  assert.match(view,/Nota: 18\/20/);assert.match(view,/Respuesta incorrecta/);
  assert.doesNotMatch(view,/Drive|Subir|type="radio"/);
  assert.equal(gradeTask(report.tasks[0].task,report.tasks[0].answers).score,18);
  const incomplete=parentsView(createProgressReport(normalized,normalized.tasks,[],[]));
  assert.doesNotMatch(incomplete,/Respuesta correcta:|data-result=|class="solution"/);
});
test('grading requires a valid key and a complete explanation before a task can be published',()=>{
  for(const change of [q=>delete q.grading,q=>q.grading.correctIndex=5,q=>q.grading.correctIndex='1',q=>q.grading.steps=[],q=>q.grading.hint='']){
    const task=structuredClone(course.tasks[0]);change(task.questions[0]);
    assert.throws(()=>normalizeTask(task));
  }
});
test('thirty different worked examples cover every question topic and escape imported prose',()=>{
  assert.equal(course.lesson.topics.reduce((n,t)=>n+t.examples.length,0),30);
  const prompts=new Set(course.tasks.flatMap(t=>t.questions.map(q=>q.text)));
  for(const topic of course.lesson.topics){
    assert.ok(topic.examples.length);
    for(const example of topic.examples){assert.ok(!prompts.has(example.statement));assert.ok(example.steps.length>=2);}
    assert.doesNotMatch(workedExamples(topic),/math-fallback/);
  }
  const q=structuredClone(course.tasks[0].questions[0]);q.grading.hint='<img src=x onerror=alert(1)>';
  assert.doesNotMatch(answerReview(q,0),/<img src=x/);
});
