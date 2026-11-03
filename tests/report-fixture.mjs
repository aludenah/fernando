import {readFile} from 'node:fs/promises';
import {createMatrixSession} from '../docs/matrices.js';
export const course=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url)));
export const expected=[[[2,-1,-2],[1,4,-1],[2,1,6]],[[2,3,4],[3,4,5],[4,5,6]],[[2,3,4],[1,4,5],[2,1,6]],[[1,0,0],[0,1,0],[0,0,1]],[[0,3,4],[1,0,5],[2,1,0]]];
export function finishedSession(){
 const bank=course.matrixPractice.exercises,session=createMatrixSession(bank,{random:()=>.99,startedAt:'2026-11-03T00:00:00.000Z'});
 const exercises=session.exerciseIds.map(id=>bank.find(exercise=>exercise.id===id));
 for(const exercise of exercises){
  const answers={};for(let i=1;i<=exercise.rows;i++)for(let j=1;j<=exercise.columns;j++)answers[`${i}-${j}`]=String(expected[exercise.problem-1][i-1][j-1]);
  session.entries[exercise.id]={answers,checked:true,solved:true,attempts:exercise.problem===1?2:1,firstCorrect:exercise.problem===1?3:exercise.rows*exercise.columns,verifiedAt:`2026-11-03T00:0${exercise.problem}:00.000Z`};
 }
 session.finishedAt='2026-11-03T00:05:00.000Z';return {session,exercises};
}
