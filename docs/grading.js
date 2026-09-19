import {hasAnswer} from './sequence.js';

// Results are derived from the saved answers, including work from other devices.
// Incomplete tasks expose neither a score nor which answers are correct.
export function gradeTask(task, answers = {}) {
  if(!task.autoGrade || !task.questions.length) return null;
  const complete=task.questions.every(q=>hasAnswer(q,answers));
  if(!complete) return null;
  if(!task.questions.every(q=>Number.isInteger(q.grading?.correctIndex) && q.grading.correctIndex>=0 && q.grading.correctIndex<q.options.length)) return null;
  const results=task.questions.map((q,index)=>({id:q.id,number:index+1,selected:answers[q.id],correctIndex:q.grading.correctIndex,correct:answers[q.id]===q.grading.correctIndex}));
  const total=results.length,correct=results.filter(q=>q.correct).length;
  return {total,correct,incorrect:total-correct,percent:Math.round(correct/total*100),score:Math.round(correct/total*200)/10,results};
}
