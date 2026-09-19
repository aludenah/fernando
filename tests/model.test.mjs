import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeTask,normalizeAnswers,answerCount,isReady,validateFiles,matchesSignature,validateSubmission,publicCourse,html,MAX_FILE_SIZE,MAX_TOTAL_SIZE} from '../docs/model.js';

const course=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url),'utf8'));
const task=course.tasks[0];
const pdf=Buffer.from('%PDF-1.4\nExample exercise solution\n%%EOF\n');
const file={name:'solucionario.pdf',type:'application/pdf',size:pdf.length,data:pdf.toString('base64')};
const answers=Object.fromEntries(task.questions.map(q=>[q.id,0]));
const submission=()=>({format:'fernando-entrega',version:1,id:'test-submission',createdAt:'2026-09-16T00:00:00Z',task,answers,note:'Necesito revisar los signos.',files:[file]});

test('course preserves the chapter, 28 chapters, ten theory sections and thirty levelled questions',()=>{
  assert.equal(course.lesson.title,'Introducción al álgebra');
  assert.equal(course.courses[0].chapters.length,28);
  assert.equal(course.courses[0].chapters.filter(c=>c.status==='active').length,1);
  assert.equal(course.courses.length,4);
  assert.equal(course.lesson.topics.length,10);
  assert.match(course.lesson.convention,/empieza en 1/);
  assert.equal(course.tasks.length,3);
  assert.equal(course.tasks.flatMap(t=>t.questions).length,30);
  assert.deepEqual(course.lesson.taskIds,course.tasks.map(t=>t.id));
  for(const task of course.tasks) assert.equal(normalizeTask(task).questions.length,10);
});
test('public content keeps the grading schema while omitting arbitrary private input fields',()=>{
  const input=structuredClone(task);
  input.email='private@example.invalid';
  input.questions[0].correct=1;
  input.questions[0].solution='private solution';
  const json=JSON.stringify(publicCourse(course,[input]));
  assert.doesNotMatch(json,/"correct"|"solution"|private@example/);
  assert.equal(publicCourse(course,[input]).tasks[0].autoGrade,true);
  assert.deepEqual(publicCourse(course,[input]).tasks[0].questions[0].grading,input.questions[0].grading);
});
test('only current, in-range integer answers count',()=>{
  const normalized=normalizeAnswers(task,{...answers,'removed-question':2});
  assert.equal(Object.keys(normalized).length,10);
  assert.equal(answerCount(task,normalized),10);
  assert.equal(answerCount(task,{[task.questions[0].id]:99}),0);
  for(const invalid of [-1,5,0.5,'1',null]) assert.throws(()=>normalizeAnswers(task,{[task.questions[0].id]:invalid}));
});
test('a downloadable submission requires all answers plus a solution file',()=>{
  assert.equal(isReady(task,{answers},task.questions.map(q=>({...file,questionId:q.id}))),true);
  assert.equal(isReady(task,{answers},[{...file,questionId:task.questions[0].id}]),false);
  assert.equal(isReady(task,{answers},[]),false);
  assert.equal(isReady(task,{answers:{}},[file]),false);
});
test('files have bounded formats, individual size, total size and count',()=>{
  assert.doesNotThrow(()=>validateFiles([file]));
  assert.throws(()=>validateFiles([{...file,type:'text/html'}]));
  assert.throws(()=>validateFiles([{...file,size:0}]));
  assert.throws(()=>validateFiles([{...file,size:MAX_FILE_SIZE+1}]));
  assert.throws(()=>validateFiles(Array(11).fill(file)));
  assert.throws(()=>validateFiles(Array(5).fill({...file,size:MAX_TOTAL_SIZE/4})));
});
test('extension or MIME cannot disguise executable content as a supported file',()=>{
  assert.equal(matchesSignature(pdf,'application/pdf'),true);
  assert.equal(matchesSignature(Buffer.from('<html>'),'application/pdf'),false);
  assert.equal(matchesSignature(Uint8Array.from([137,80,78,71,13,10,26,10]),'image/png'),true);
  assert.equal(matchesSignature(Uint8Array.from([255,216,255]),'image/jpeg'),true);
  assert.equal(matchesSignature(Buffer.from('RIFF1234WEBP'),'image/webp'),true);
  assert.equal(matchesSignature(pdf,'image/png'),false);
});
test('submission round-trip preserves answers, comments and file bytes',()=>{
  const result=validateSubmission(JSON.parse(JSON.stringify(submission())));
  assert.deepEqual({...result.answers},answers);
  assert.equal(result.note,'Necesito revisar los signos.');
  assert.deepEqual(Buffer.from(result.files[0].data,'base64'),pdf);
});
test('version two requires a valid solution association for every problem',()=>{
  const input={...submission(),version:2,files:task.questions.map(q=>({...file,questionId:q.id}))};
  const result=validateSubmission(input);
  assert.deepEqual(result.files.map(f=>f.questionId),task.questions.map(q=>q.id));
  assert.throws(()=>validateSubmission({...input,files:input.files.slice(1)}),/Falta el solucionario/);
  assert.throws(()=>validateSubmission({...input,files:[...input.files,{...file,questionId:'other-problem'}]}),/ningún problema/);
  assert.throws(()=>validateSubmission({...input,files:[...input.files,...Array(10).fill(input.files[0])]}),/10 archivos/);
});
test('import rejects incomplete, oversized, malformed and mismatched files',()=>{
  assert.throws(()=>validateSubmission({}));
  assert.throws(()=>validateSubmission({...submission(),answers:{}}));
  assert.throws(()=>validateSubmission({...submission(),files:[]}));
  assert.throws(()=>validateSubmission({...submission(),files:[{...file,data:'AAAA'}]}));
  assert.throws(()=>validateSubmission({...submission(),files:[{...file,type:'image/png'}]}));
  assert.throws(()=>validateSubmission({...submission(),createdAt:'invalid'}));
  assert.throws(()=>validateSubmission({...submission(),note:'x'.repeat(4001)}));
  assert.throws(()=>validateSubmission({...submission(),files:[{...file,size:MAX_FILE_SIZE+1}]}));
});
test('large supported files import without regex recursion failures',()=>{
  const bytes=Buffer.concat([pdf,Buffer.alloc(1024*1024,32)]);
  const input={...submission(),files:[{...file,size:bytes.length,data:bytes.toString('base64')}]};
  assert.equal(validateSubmission(input).files[0].size,bytes.length);
});
test('task authoring rejects invalid dates, empty options and repeated questions',()=>{
  assert.throws(()=>normalizeTask({...task,title:' '}));
  assert.throws(()=>normalizeTask({...task,due:'yesterday'}));
  assert.throws(()=>normalizeTask({...task,due:'2026-02-30'}));
  assert.throws(()=>normalizeTask({...task,questions:[task.questions[0],task.questions[0]]}));
  assert.throws(()=>normalizeTask({...task,questions:[{...task.questions[0],options:['A','']}]}));
  assert.throws(()=>publicCourse(course,[task,task]));
});
test('imported text is escaped before HTML rendering',()=>{
  assert.equal(html('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(html("'&"),'&#39;&amp;');
});
