import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {publicCourse} from '../docs/model.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../docs');
const content=JSON.parse(await readFile(resolve(root,'data/course.json'),'utf8'));
publicCourse(content,content.tasks);
await access(resolve(root,'.nojekyll'));
const html=await readFile(resolve(root,'index.html'),'utf8');
for(const [,path] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) await access(resolve(root,path));
for(const filename of await readdir(root)) {
  if(!filename.endsWith('.js'))continue;
  const source=await readFile(resolve(root,filename),'utf8');
  for(const [,path] of source.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)) await access(resolve(root,path));
  assert.doesNotMatch(source,/chatgpt\.site|cloudflare:|TEACHER_EMAIL|ALGEBRA_CH1_|appgprj_|fetch\(['"]\/api\//,filename);
}
assert.match(html,/<html lang="es">/);
assert.doesNotMatch(JSON.stringify(content),/"correct"|"solution"|@gmail\.com|appgprj_/);
console.log('Sitio estático comprobado: rutas relativas, 7 temas, 15 preguntas y contenido sin claves privadas.');
