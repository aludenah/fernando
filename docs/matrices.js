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
  byEquality: {tex: '\\begin{cases}i+j,&i=j\\\\i-j,&i\\ne j\\end{cases}', value: (i,j) => i===j?i+j:i-j, at: (i,j) => i===j?`${i}+${j}`:`${i}-${j}`},
  signedTriangle: {tex: '\\begin{cases}i+j,&i<j\\\\0,&i=j\\\\i-j,&i>j\\end{cases}', value: (i,j) => i<j?i+j:i===j?0:i-j, at: (i,j) => i<j?`${i}<${j}\\;\\Rightarrow\\;${i}+${j}`:i===j?`${i}=${j}\\;\\Rightarrow\\;0`:`${i}>${j}\\;\\Rightarrow\\;${i}-${j}`},
  combined: {tex: '2ij-i+j', value: (i,j) => 2*i*j-i+j, at: (i,j) => `2(${i})(${j})-${i}+${j}`},
  distance: {tex: '|i-j|', value: (i,j) => Math.abs(i-j), at: (i,j) => `|${i}-${j}|`},
  last: {tex: '\\begin{cases}i^2,&i\\le j\\\\-j,&i>j\\end{cases}', value: (i,j) => i<=j?i*i:-j, at: (i,j) => i<=j?`${i}\\le${j}\\;\\Rightarrow\\;${i}^2`:`${i}>${j}\\;\\Rightarrow\\;-(${j})`},
});

export function validateMatrixCourse(course) {
  const exercises=course?.matrixPractice?.exercises;
  if(course?.schemaVersion!==2 || course.lesson?.id!=='matrices' || !Array.isArray(course.tasks) || course.tasks.length || course.matrixPractice?.practiceSize!==5 || !Array.isArray(exercises) || exercises.length!==20) throw new Error('No se pudo leer la práctica de matrices.');
  const ids=new Set();
  for(const exercise of exercises) {
    if(!Number.isInteger(exercise.problem)||exercise.problem<1||exercise.problem>5||exercise.id!==`matrices-r2-p${exercise.problem}-${exercise.rows}x${exercise.columns}`||ids.has(exercise.id)||![2,3].includes(exercise.rows)||![2,3].includes(exercise.columns)||!Object.hasOwn(matrixRules,exercise.rule)) throw new Error('Hay un ejercicio de matrices no válido.');
    ids.add(exercise.id);
  }
  for(let problem=1;problem<=5;problem++){
    const variants=exercises.filter(exercise=>exercise.problem===problem);
    if(variants.length!==4||new Set(variants.map(exercise=>exercise.rule)).size!==1)throw new Error('Cada problema necesita sus cuatro tamaños.');
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

// A practice has five problems. Shuffle the four sizes, then draw the fifth;
// its chosen sizes are kept with the draft, never re-rolled on reload.
export function chooseMatrixPractice(bank,random=Math.random) {
  const orders=['2x2','2x3','3x2','3x3'];
  for(let i=orders.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[orders[i],orders[j]]=[orders[j],orders[i]];}
  return Array.from({length:5},(_,index)=>{
    const order=orders[index]||orders[Math.floor(random()*orders.length)];
    return bank.find(exercise=>exercise.problem===index+1&&`${exercise.rows}x${exercise.columns}`===order);
  });
}

export function restoreMatrixWork(value,bank,random=Math.random) {
  const saved=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const selection=Array.isArray(saved.exerciseIds)&&saved.exerciseIds.length===5?saved.exerciseIds.map(id=>bank.find(exercise=>exercise.id===id)):[];
  const selected=selection.length===5&&selection.every((exercise,index)=>exercise?.problem===index+1)?selection:chooseMatrixPractice(bank,random);
  const work={id:'matrices-practice-v2',exerciseIds:selected.map(exercise=>exercise.id),current:selected[0].id,entries:{}};
  if(work.exerciseIds.includes(saved.current))work.current=saved.current;
  for(const exercise of bank) {
    const entry=saved.entries?.[exercise.id];
    if(!entry||typeof entry!=='object')continue;
    const answers={};
    for(const cell of cellsFor(exercise)) {
      const raw=entry.answers?.[cell.key];
      if(typeof raw==='string'&&raw.length<=24)answers[cell.key]=raw;
    }
    const checked=entry.checked===true;
    work.entries[exercise.id]={answers,checked,attempts:Number.isSafeInteger(entry.attempts)&&entry.attempts>=0?entry.attempts:0,solved:checked&&checkMatrix(exercise,answers).solved};
  }
  return work;
}

// Completion identifies the exact rule and size, so another device displays
// the matrix actually completed rather than treating a different size as done.
export function reconcileMatrixPractice(work,bank,completed) {
  const currentProblem=bank.find(exercise=>exercise.id===work.current)?.problem||1;
  work.exerciseIds=work.exerciseIds.map(id=>{
    if(completed.has(id))return id;
    const problem=bank.find(exercise=>exercise.id===id).problem;
    return bank.find(exercise=>exercise.problem===problem&&completed.has(exercise.id))?.id||id;
  });
  work.current=work.exerciseIds[currentProblem-1];
  return work.exerciseIds.map(id=>bank.find(exercise=>exercise.id===id));
}
