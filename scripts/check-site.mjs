import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {allLessons,lessonFor} from '../docs/lessons.js';
import {publicCourse} from '../docs/model.js';
import {math,mathExpressions} from '../docs/math.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../docs');
const content=JSON.parse(await readFile(resolve(root,'data/course.json'),'utf8'));
publicCourse(content,content.tasks);
await access(resolve(root,'.nojekyll'));
const html=await readFile(resolve(root,'index.html'),'utf8');
for(const [,path] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) await access(resolve(root,path.split('?')[0]));
for(const filename of await readdir(root)) {
  if(!filename.endsWith('.js'))continue;
  const source=await readFile(resolve(root,filename),'utf8');
  for(const [,path] of source.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)) await access(resolve(root,path.split('?')[0]));
  assert.doesNotMatch(source,/chatgpt\.site|cloudflare:|TEACHER_EMAIL|ALGEBRA_CH1_|appgprj_|fetch\(['"]\/api\//,filename);
}
assert.match(html,/<html lang="es">/);
assert.doesNotMatch(JSON.stringify(content),/@gmail\.com|appgprj_/);
assert.ok(content.tasks.every(task=>task.autoGrade));
for(const lesson of allLessons(content))assert.equal(lesson.topics.reduce((n,topic)=>n+topic.examples.length,0),30);
for(const task of content.tasks){
 assert.doesNotMatch(task.instructions,/Drive/);
 for(const q of task.questions)assert.ok(lessonFor(content,task.chapterId).topics.some(topic=>topic.id===q.grading.topicId));
}
const drive=JSON.parse(await readFile(resolve(root,'data/drive.json'),'utf8'));
const questions=content.tasks.flatMap(t=>t.questions);
assert.equal(questions.length,60);
assert.equal(content.courses[0].chapters.length,28);
const legacyQuestions=content.tasks.filter(t=>t.chapterId===content.lesson.id).flatMap(t=>t.questions);
assert.equal(new Set(legacyQuestions.map(q=>drive.problems[q.id].folderId)).size,30);
for(const q of legacyQuestions)assert.equal(drive.problems[q.id].folderUrl,'https://drive.google.com/drive/folders/'+drive.problems[q.id].folderId);
let expressions=0;
function validateMath(value) {
  if(typeof value==='string') {
    const parsed=mathExpressions(value);
    expressions+=parsed.length;
    math(value,{strict:true});
    let prose=value;
    for(const expression of parsed)prose=prose.replace(expression.source,'');
    assert.doesNotMatch(prose,/\\[()[\]]/,'Hay delimitadores de LaTeX sin cerrar.');
  } else if(value&&typeof value==='object')for(const child of Object.values(value))validateMath(child);
}
validateMath(content);
const josue=JSON.parse(await readFile(resolve(root,'data/josue-course.json'),'utf8'));
publicCourse(josue,josue.tasks);
validateMath(josue);
assert.equal(josue.courses[0].chapters.length,9);
assert.equal(josue.lesson.topics.length,10);
assert.deepEqual(josue.tasks.map(task=>task.questions.length),[10,10,10]);
assert.deepEqual(josue.tasks.map(task=>task.level),['basico','intermedio','avanzado']);
const allQuestionIds=new Set(questions.map(q=>q.id));
const allFolders=new Set(Object.values(drive.problems).map(folder=>folder.folderId));
const josueDrive=JSON.parse(await readFile(resolve(root,'data/josue-drive.json'),'utf8'));
for(const task of josue.tasks)for(const q of task.questions){
 assert.ok(!allQuestionIds.has(q.id),'Different students must not share question IDs.');allQuestionIds.add(q.id);
 assert.equal(q.options.length,5);assert.equal(new Set(q.options).size,5);
 const folder=josueDrive.problems[q.id];assert.ok(folder);
 assert.ok(!allFolders.has(folder.folderId),'Every problem must own its Drive folder.');allFolders.add(folder.folderId);
 assert.equal(folder.folderUrl,'https://drive.google.com/drive/folders/'+folder.folderId);
}
assert.doesNotMatch(JSON.stringify(josue),/"correct"|"solution"|@gmail\.com|appgprj_/);

const css=await readFile(resolve(root,'vendor/katex/katex.min.css'),'utf8');
for(const [,font] of css.matchAll(/url\(([^)]+)\)/g))await access(resolve(root,'vendor/katex',font));
console.log(`Sitio comprobado: 2 alumnos, 90 problemas, 60 solucionarios de Fernando, 60 ejemplos resueltos, ${expressions} expresiones LaTeX válidas y sus fuentes locales.`);
