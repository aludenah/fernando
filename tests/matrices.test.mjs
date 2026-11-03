import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateMatrixCourse,cellsFor,matrixValue,parseMatrixNumber,checkMatrix,createMatrixSession,chooseMatrixPractice} from '../docs/matrices.js';

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
test('a new activity creates a fresh session without recovering earlier answers',()=>{
  const first=createMatrixSession(bank,{random:()=>0.99});
  first.entries[first.current]={answers:{'1-1':'2'},solved:true};
  const second=createMatrixSession(bank,{random:()=>0});
  assert.equal(second.exerciseIds.length,5);assert.deepEqual(second.entries,{});
  assert.equal(second.finishedAt,null);assert.notDeepEqual(first.exerciseIds,second.exerciseIds);
});
test('course validation rejects oversized matrices, unknown rules and invalid round sizes',()=>{
  for(const change of [value=>value.matrixPractice.exercises[0].rows=4,value=>value.matrixPractice.practiceSize=20,value=>value.matrixPractice.exercises[0].rule='__proto__',value=>value.matrixPractice.exercises[0].problem=6]) {
    const clone=structuredClone(course);change(clone);assert.throws(()=>validateMatrixCourse(clone));
  }
});
