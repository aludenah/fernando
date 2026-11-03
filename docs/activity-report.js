import {cellsFor,checkMatrix,parseMatrixNumber} from './matrices.js?v=activities-3';

// This receipt describes a completed browser session. It is not an identity
// check or a signed server record.
export function createCompletionReport(session,exercises) {
  if(!session||exercises?.length!==5||new Set(exercises.map(exercise=>exercise.problem)).size!==5||!session.startedAt||!session.finishedAt)throw new Error('Termina los cinco problemas para generar el comprobante.');
  const results=exercises.map(exercise=>{
    const entry=session.entries[exercise.id];
    if(!entry?.solved||!entry.verifiedAt||!checkMatrix(exercise,entry.answers).solved)throw new Error('Hay una matriz pendiente o incorrecta.');
    return {id:exercise.id,problem:exercise.problem,rows:exercise.rows,columns:exercise.columns,rule:exercise.rule,
      answers:Object.fromEntries(cellsFor(exercise).map(cell=>[cell.key,String(parseMatrixNumber(entry.answers[cell.key]))])),
      attempts:entry.attempts,firstCorrect:entry.firstCorrect,verifiedAt:entry.verifiedAt};
  });
  return validateCompletionReport({format:'aula-actividad',version:1,student:'Fernando',activity:'Construcción de matrices',startedAt:session.startedAt,finishedAt:session.finishedAt,results});
}
export function validateCompletionReport(report) {
  if(report?.format!=='aula-actividad'||report.version!==1||report.student!=='Fernando'||report.activity!=='Construcción de matrices'||report.results?.length!==5)throw new Error('Comprobante de actividad no válido.');
  const start=Date.parse(report.startedAt),finish=Date.parse(report.finishedAt);
  if(!Number.isFinite(start)||!Number.isFinite(finish)||finish<start)throw new Error('Las fechas del comprobante no son válidas.');
  for(const [index,result] of report.results.entries()){
    if(result.problem!==index+1||![2,3].includes(result.rows)||![2,3].includes(result.columns)||!Number.isInteger(result.attempts)||result.attempts<1||!Number.isInteger(result.firstCorrect)||result.firstCorrect<0||result.firstCorrect>result.rows*result.columns||!Number.isFinite(Date.parse(result.verifiedAt))||!checkMatrix(result,result.answers).solved)throw new Error('El comprobante contiene un resultado no válido.');
  }
  return structuredClone(report);
}
export function reportFilename(report) {
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(report.finishedAt)).map(part=>[part.type,part.value]));
  return `Fernando_Matrices_${parts.year}-${parts.month}-${parts.day}_${parts.hour}${parts.minute}.pdf`;
}
