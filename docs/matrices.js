// Data, arithmetic and validation are shared by the interface and its tests.
// No expression from the page or the course file is evaluated as JavaScript.
export const matrixRules = Object.freeze({
  sum: {tex: 'i+j', value: (i,j) => i+j, at: (i,j) => `${i}+${j}`},
  twiceRow: {tex: '2i+j', value: (i,j) => 2*i+j, at: (i,j) => `2(${i})+${j}`},
  twiceColumn: {tex: 'i+2j', value: (i,j) => i+2*j, at: (i,j) => `${i}+2(${j})`},
  difference: {tex: 'i-j', value: (i,j) => i-j, at: (i,j) => `${i}-${j}`},
  tripleRow: {tex: '3i-j', value: (i,j) => 3*i-j, at: (i,j) => `3(${i})-${j}`},
  product: {tex: 'ij', value: (i,j) => i*j, at: (i,j) => `${i}\\cdot${j}`},
  squareRow: {tex: 'i^2+j', value: (i,j) => i*i+j, at: (i,j) => `${i}^2+${j}`},
  linear: {tex: '2i+3j-1', value: (i,j) => 2*i+3*j-1, at: (i,j) => `2(${i})+3(${j})-1`},
  identity: {tex: '\\begin{cases}1,&i=j\\\\0,&i\\ne j\\end{cases}', value: (i,j) => i===j?1:0, at: (i,j) => i===j?`${i}=${j}\\;\\Rightarrow\\;1`:`${i}\\ne${j}\\;\\Rightarrow\\;0`},
  triangle: {tex: '\\begin{cases}i+j,&i\\le j\\\\i-j,&i>j\\end{cases}', value: (i,j) => i<=j?i+j:i-j, at: (i,j) => i<=j?`${i}\\le${j}\\;\\Rightarrow\\;${i}+${j}`:`${i}>${j}\\;\\Rightarrow\\;${i}-${j}`},
  squares: {tex: 'i^2-j^2', value: (i,j) => i*i-j*j, at: (i,j) => `${i}^2-${j}^2`},
  shiftedProduct: {tex: 'ij-2', value: (i,j) => i*j-2, at: (i,j) => `${i}\\cdot${j}-2`},
  columnMinusRow: {tex: '2j-i', value: (i,j) => 2*j-i, at: (i,j) => `2(${j})-${i}`},
  squareColumn: {tex: 'i+j^2', value: (i,j) => i+j*j, at: (i,j) => `${i}+${j}^2`},
  parity: {tex: '(-1)^{i+j}', value: (i,j) => (-1)**(i+j), at: (i,j) => `(-1)^{${i}+${j}}`},
  diagonal: {tex: '\\begin{cases}2i,&i=j\\\\i+j,&i\\ne j\\end{cases}', value: (i,j) => i===j?2*i:i+j, at: (i,j) => i===j?`${i}=${j}\\;\\Rightarrow\\;2(${i})`:`${i}\\ne${j}\\;\\Rightarrow\\;${i}+${j}`},
  signedTriangle: {tex: '\\begin{cases}i+j,&i<j\\\\0,&i=j\\\\i-j,&i>j\\end{cases}', value: (i,j) => i<j?i+j:i===j?0:i-j, at: (i,j) => i<j?`${i}<${j}\\;\\Rightarrow\\;${i}+${j}`:i===j?`${i}=${j}\\;\\Rightarrow\\;0`:`${i}>${j}\\;\\Rightarrow\\;${i}-${j}`},
  combined: {tex: '2ij-i+j', value: (i,j) => 2*i*j-i+j, at: (i,j) => `2(${i})(${j})-${i}+${j}`},
  distance: {tex: '|i-j|', value: (i,j) => Math.abs(i-j), at: (i,j) => `|${i}-${j}|`},
  last: {tex: '\\begin{cases}i^2,&i\\le j\\\\-j,&i>j\\end{cases}', value: (i,j) => i<=j?i*i:-j, at: (i,j) => i<=j?`${i}\\le${j}\\;\\Rightarrow\\;${i}^2`:`${i}>${j}\\;\\Rightarrow\\;-(${j})`},
});

export function validateMatrixCourse(course) {
  const exercises=course?.matrixPractice?.exercises;
  if(course?.schemaVersion!==2 || course.lesson?.id!=='matrices' || !Array.isArray(course.tasks) || course.tasks.length || !Array.isArray(exercises) || !exercises.length || exercises.length>100) throw new Error('No se pudo leer la práctica de matrices.');
  const ids=new Set();
  for(const exercise of exercises) {
    if(!/^matrices-p\d{2,3}$/.test(exercise.id)||ids.has(exercise.id)||![2,3].includes(exercise.rows)||![2,3].includes(exercise.columns)||!Object.hasOwn(matrixRules,exercise.rule)) throw new Error('Hay un ejercicio de matrices no válido.');
    ids.add(exercise.id);
  }
  if(!Array.isArray(course.lesson.topics)||course.lesson.topics.length!==exercises.length||course.lesson.topics.some((topic,index)=>topic.id!==exercises[index].id)) throw new Error('El catálogo de avance no corresponde a los ejercicios.');
  return course;
}

export const cellKey = (i,j) => `${i}-${j}`;
export const cellsFor = exercise => Array.from({length:exercise.rows},(_,row)=>Array.from({length:exercise.columns},(_,column)=>({i:row+1,j:column+1,key:cellKey(row+1,column+1)}))).flat();
export const matrixValue = (exercise,i,j) => matrixRules[exercise.rule].value(i,j);
export function parseMatrixNumber(raw) {
  const value=String(raw??'').trim().replace(/\u2212/g,'-');
  if(!/^[+-]?\d+(?:[.,]\d+)?$/.test(value))return null;
  const number=Number(value.replace(',','.'));
  return Number.isFinite(number)?number:null;
}
export function checkMatrix(exercise,answers={}) {
  const cells=cellsFor(exercise).map(cell=>{
    const raw=String(answers[cell.key]??'');
    const value=parseMatrixNumber(raw);
    return {...cell,raw,value,missing:!raw.trim(),valid:value!==null,correct:value!==null&&value===matrixValue(exercise,cell.i,cell.j)};
  });
  const missing=cells.filter(cell=>cell.missing).length,invalid=cells.filter(cell=>!cell.missing&&!cell.valid).length,correct=cells.filter(cell=>cell.correct).length;
  return {cells,total:cells.length,missing,invalid,correct,complete:!missing&&!invalid,solved:correct===cells.length};
}

export function restoreMatrixWork(value,exercises) {
  const work={id:'matrices-practice-v1',current:exercises[0].id,filter:'all',entries:{}};
  if(!value||typeof value!=='object'||Array.isArray(value))return work;
  if(exercises.some(exercise=>exercise.id===value.current))work.current=value.current;
  if(['all','2x2','2x3','3x2','3x3'].includes(value.filter))work.filter=value.filter;
  for(const exercise of exercises) {
    const saved=value.entries?.[exercise.id];
    if(!saved||typeof saved!=='object')continue;
    const answers={};
    for(const cell of cellsFor(exercise)) {
      const raw=saved.answers?.[cell.key];
      if(typeof raw==='string'&&raw.length<=24)answers[cell.key]=raw;
    }
    const checked=saved.checked===true;
    work.entries[exercise.id]={answers,checked,attempts:Number.isSafeInteger(saved.attempts)&&saved.attempts>=0?saved.attempts:0,solved:checked&&checkMatrix(exercise,answers).solved};
  }
  return work;
}
