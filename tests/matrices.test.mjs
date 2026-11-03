import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateMatrixCourse,cellsFor,matrixValue,parseMatrixNumber,checkMatrix,restoreMatrixWork} from '../docs/matrices.js';

const course=validateMatrixCourse(JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url))));
const exercises=course.matrixPractice.exercises;
// Independently calculated matrices, in reading order, including each branch.
const expected=[
  [[2,3],[3,4]],[[3,4,5],[5,6,7]],[[3,5],[4,6],[5,7]],[[0,-1,-2],[1,0,-1],[2,1,0]],
  [[2,1],[5,4]],[[1,2,3],[2,4,6]],[[2,3],[5,6],[10,11]],[[4,7,10],[6,9,12],[8,11,14]],
  [[1,0],[0,1]],[[2,3,4],[1,4,5]],[[0,-3],[3,0],[8,5]],[[-1,0,1],[0,2,4],[1,4,7]],
  [[1,3],[0,2]],[[2,5,10],[3,6,11]],[[1,-1],[-1,1],[1,-1]],[[2,3,4],[3,4,5],[4,5,6]],
  [[0,3],[1,0]],[[2,5,8],[3,8,13]],[[0,1],[1,0],[2,1]],[[1,1,1],[-1,4,4],[-1,-2,9]],
];
test('all twenty matrices match independent arithmetic, with rows and columns in the correct order',()=>{
  exercises.forEach((exercise,index)=>{
    assert.deepEqual(cellsFor(exercise).map(cell=>matrixValue(exercise,cell.i,cell.j)),expected[index].flat());
    const answers=Object.fromEntries(cellsFor(exercise).map(cell=>[cell.key,String(expected[index][cell.i-1][cell.j-1])]));
    assert.equal(checkMatrix(exercise,answers).solved,true);
    answers['1-1']=String(Number(answers['1-1'])+1);
    assert.equal(checkMatrix(exercise,answers).solved,false);
  });
});
test('empty cells never count as zero, and malformed or executable input is rejected',()=>{
  assert.equal(checkMatrix(exercises[3],{}).missing,9);
  assert.equal(checkMatrix(exercises[3],{}).correct,0);
  for(const value of ['', ' ', '1+2','Infinity','NaN','0x10','1e2','1/2','<img>','2,3,4','-'])assert.equal(parseMatrixNumber(value),null);
  assert.equal(parseMatrixNumber('0'),0);assert.equal(parseMatrixNumber('−2'),-2);
  assert.equal(parseMatrixNumber('  -2,5  '),-2.5);assert.equal(parseMatrixNumber('+3.0'),3);
});
test('saved drafts retain typed values but a saved success flag cannot bypass verification',()=>{
  const value={current:'matrices-p04',filter:'3x3',entries:{'matrices-p04':{answers:{'1-1':'0','1-2':'-1'},checked:true,solved:true,attempts:2},'removed':{solved:true}}};
  const restored=restoreMatrixWork(value,exercises);
  assert.equal(restored.current,'matrices-p04');assert.equal(restored.filter,'3x3');
  assert.equal(restored.entries['matrices-p04'].answers['1-1'],'0');
  assert.equal(restored.entries['matrices-p04'].solved,false);
  assert.equal(restored.entries.removed,undefined);
});
test('course validation rejects oversized matrices, unknown rules and mismatched progress IDs',()=>{
  for(const change of [value=>value.matrixPractice.exercises[0].rows=4,value=>value.matrixPractice.exercises[0].columns=1,value=>value.matrixPractice.exercises[0].rule='__proto__',value=>value.lesson.topics[0].id='other']) {
    const clone=structuredClone(course);change(clone);assert.throws(()=>validateMatrixCourse(clone));
  }
});
