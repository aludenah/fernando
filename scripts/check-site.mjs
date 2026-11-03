import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {publicCourse} from '../docs/model.js';
import {math,mathExpressions} from '../docs/math.js';
import {validateMatrixCourse,matrixRules,cellsFor,matrixValue} from '../docs/matrices.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../docs');
const content=validateMatrixCourse(JSON.parse(await readFile(resolve(root,'data/course.json'),'utf8')));
await access(resolve(root,'.nojekyll'));
const html=await readFile(resolve(root,'index.html'),'utf8');
for(const [,path] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))await access(resolve(root,path.split('?')[0]));
for(const filename of await readdir(root)) {
  if(!filename.endsWith('.js'))continue;
  const source=await readFile(resolve(root,filename),'utf8');
  for(const [,path] of source.matchAll(/(?:from\s*|import\s*\()['"](\.\/[^'"]+)['"]/g))await access(resolve(root,path.split('?')[0]));
  assert.doesNotMatch(source,/chatgpt\.site|cloudflare:|TEACHER_EMAIL|ALGEBRA_CH1_|appgprj_|fetch\(['"]\/api\//,filename);
}
assert.match(html,/<html lang="es">/);
assert.doesNotMatch(JSON.stringify(content),/Introducción al álgebra|Exponentes y radicales|alg-uni-c|@gmail\.com|appgprj_/);
assert.equal(content.matrixPractice.exercises.length,20);
const shapes={};
for(const exercise of content.matrixPractice.exercises) {
  const key=`${exercise.rows}x${exercise.columns}`;shapes[key]=(shapes[key]||0)+1;
  math(`\\(a_{ij}=${matrixRules[exercise.rule].tex}\\)`,{strict:true});
  for(const cell of cellsFor(exercise)) {
    assert.ok(Number.isSafeInteger(matrixValue(exercise,cell.i,cell.j)));
    math(`\\(a_{${cell.i}${cell.j}}: ${matrixRules[exercise.rule].at(cell.i,cell.j)}\\)`,{strict:true});
  }
}
assert.deepEqual(shapes,{'2x2':5,'2x3':5,'3x2':5,'3x3':5});
const josue=JSON.parse(await readFile(resolve(root,'data/josue-course.json'),'utf8'));
publicCourse(josue,josue.tasks);
let expressions=0;
function validateMath(value) {
  if(typeof value==='string') {
    const parsed=mathExpressions(value);expressions+=parsed.length;math(value,{strict:true});
    let prose=value;for(const expression of parsed)prose=prose.replace(expression.source,'');
    assert.doesNotMatch(prose,/\\[()[\]]/,'Hay delimitadores de LaTeX sin cerrar.');
  }else if(value&&typeof value==='object')for(const child of Object.values(value))validateMath(child);
}
validateMath(josue);
assert.equal(josue.courses[0].chapters.length,9);
assert.equal(josue.lesson.topics.length,10);
assert.deepEqual(josue.tasks.map(task=>task.questions.length),[10,10,10]);
const drive=JSON.parse(await readFile(resolve(root,'data/josue-drive.json'),'utf8'));
const folders=new Set();
for(const task of josue.tasks)for(const question of task.questions) {
  const folder=drive.problems[question.id];assert.ok(folder);
  assert.equal(question.options.length,5);assert.equal(new Set(question.options).size,5);
  assert.ok(!folders.has(folder.folderId));folders.add(folder.folderId);
  assert.equal(folder.folderUrl,'https://drive.google.com/drive/folders/'+folder.folderId);
}
const css=await readFile(resolve(root,'vendor/katex/katex.min.css'),'utf8');
for(const [,font] of css.matchAll(/url\(([^)]+)\)/g))await access(resolve(root,'vendor/katex',font));
console.log(`Sitio comprobado: 20 ejercicios de matrices, cuatro tamaños hasta 3 × 3; 30 problemas de Josué y ${expressions} expresiones LaTeX válidas.`);
