import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
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
assert.doesNotMatch(JSON.stringify(content),/"correct"|"solution"|@gmail\.com|appgprj_/);
const drive=JSON.parse(await readFile(resolve(root,'data/drive.json'),'utf8'));
const questions=content.tasks.flatMap(t=>t.questions);
assert.equal(questions.length,30);
assert.equal(content.courses[0].chapters.length,28);
assert.equal(new Set(questions.map(q=>drive.problems[q.id].folderId)).size,30);
for(const q of questions)assert.equal(drive.problems[q.id].folderUrl,'https://drive.google.com/drive/folders/'+drive.problems[q.id].folderId);
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
const css=await readFile(resolve(root,'vendor/katex/katex.min.css'),'utf8');
for(const [,font] of css.matchAll(/url\(([^)]+)\)/g))await access(resolve(root,'vendor/katex',font));
console.log(`Sitio comprobado: 28 capítulos, 30 problemas, 30 carpetas, ${expressions} expresiones LaTeX válidas y sus fuentes locales.`);
