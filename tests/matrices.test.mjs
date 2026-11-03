import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateMatrixCourse,cellsFor,matrixValue,parseMatrixNumber,checkMatrix,restoreMatrixWork,chooseMatrixPractice,reconcileMatrixPractice} from '../docs/matrices.js';

const course=validateMatrixCourse(JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url))));
const bank=course.matrixPractice.exercises;
// Independent calculations for each rule on the largest supported matrix.
const expected=[
  [[2,-1,-2],[1,4,-1],[2,1,6]],
  [[2,3,4],[3,4,5],[4,5,6]],
  [[2,3,4],[1,4,5],[2,1,6]],
  [[1,0,0],[0,1,0],[0,0,1]],
  [[0,3,4],[1,0,5],[2,1,0]],
];
test('every size of the five rules matches independent arithmetic, including equality and inequality branches',()=>{
  for(const exercise of bank){
    const values=expected[exercise.problem-1].slice(0,exercise.rows).map(row=>row.slice(0,exercise.columns)).flat();
    assert.deepEqual(cellsFor(exercise).map(cell=>matrixValue(exercise,cell.i,cell.j)),values);
    const answers=Object.fromEntries(cellsFor(exercise).map((cell,index)=>[cell.key,String(values[index])]));
    assert.equal(checkMatrix(exercise,answers).solved,true);
    answers['1-1']=String(Number(answers['1-1'])+1);
    assert.equal(checkMatrix(exercise,answers).solved,false);
  }
});
test('a round contains exactly five problems, varies their sizes, and includes conditional rules from the first problem',()=>{
  const a=chooseMatrixPractice(bank,()=>0.99),b=chooseMatrixPractice(bank,()=>0);
  assert.deepEqual(a.map(exercise=>exercise.problem),[1,2,3,4,5]);
  assert.equal(new Set(a.map(exercise=>`${exercise.rows}x${exercise.columns}`)).size,4);
  assert.notDeepEqual(a.map(exercise=>exercise.id),b.map(exercise=>exercise.id));
  assert.equal(a[0].rule,'byEquality');
  assert.equal(a.filter(exercise=>['byEquality','triangle','identity','signedTriangle'].includes(exercise.rule)).length,4);
});
test('empty cells never count as zero, and malformed or executable input is rejected',()=>{
  const exercise=bank.find(exercise=>exercise.problem===5&&exercise.rows===3&&exercise.columns===3);
  assert.equal(checkMatrix(exercise,{}).missing,9);assert.equal(checkMatrix(exercise,{}).correct,0);
  for(const value of ['', ' ', '1+2','Infinity','NaN','0x10','1e2','1/2','<img>','2,3,4','-'])assert.equal(parseMatrixNumber(value),null);
  assert.equal(parseMatrixNumber('0'),0);assert.equal(parseMatrixNumber('−2'),-2);
  assert.equal(parseMatrixNumber('  -2,5  '),-2.5);assert.equal(parseMatrixNumber('+3.0'),3);
});
test('random sizes and drafts survive reloads; a saved success flag cannot bypass verification',()=>{
  const work=restoreMatrixWork(null,bank,()=>0.99),exercise=bank.find(exercise=>exercise.id===work.current);
  work.entries[exercise.id]={answers:{'1-1':'2','1-2':'-1'},checked:true,solved:true,attempts:2};
  const restored=restoreMatrixWork(work,bank,()=>0);
  assert.deepEqual(restored.exerciseIds,work.exerciseIds);assert.equal(restored.current,work.current);
  assert.equal(restored.entries[exercise.id].answers['1-2'],'-1');
  assert.equal(restored.entries[exercise.id].solved,false);
});
test('a shared result adopts its actual size on a second device and still counts as one of five problems',()=>{
  const a=restoreMatrixWork(null,bank,()=>0.99),b=restoreMatrixWork(null,bank,()=>0);
  assert.notEqual(a.current,b.current);
  const exercises=reconcileMatrixPractice(b,bank,new Set([a.current]));
  assert.equal(exercises.length,5);assert.equal(b.current,a.current);
  assert.equal(exercises[0].id,a.current);
});
test('course validation rejects oversized matrices, unknown rules and invalid round sizes',()=>{
  for(const change of [value=>value.matrixPractice.exercises[0].rows=4,value=>value.matrixPractice.practiceSize=20,value=>value.matrixPractice.exercises[0].rule='__proto__',value=>value.lesson.topics[0].id='other']) {
    const clone=structuredClone(course);change(clone);assert.throws(()=>validateMatrixCourse(clone));
  }
});
