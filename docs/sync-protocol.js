// Shared, bounded data protocol. Also bundled for Google Apps Script.
export const SYNC_VERSION=1;
const owns=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
export function progressCatalog(course) {
  const catalog={};
  for(const task of course.tasks.filter(task=>task.published)){
    task.questions.forEach((question,index)=>{
      catalog[`answer:${task.id}:${question.id}`]={kind:'answer',taskId:task.id,questionId:question.id,choices:question.options.length,
        previous:index?`answer:${task.id}:${task.questions[index-1].id}`:null};
    });
  }
  for(const lesson of [course.lesson,...(course.additionalLessons||[])])for(const topic of lesson.topics)catalog[`topic:${topic.id}`]={kind:'topic',topicId:topic.id};
  return catalog;
}
export function emptyProgress(studentId) {
  if(!['fernando','josue'].includes(studentId))throw new Error('Alumno no válido.');
  return {version:SYNC_VERSION,studentId,revision:0,fields:{}};
}
export function validValue(spec,value) {
  return spec?.kind==='topic'?typeof value==='boolean':spec?.kind==='answer'&&Number.isInteger(value)&&value>=0&&value<spec.choices;
}
export function validateRemote(input,studentId,catalog) {
  if(input?.version!==SYNC_VERSION||input.studentId!==studentId||!Number.isSafeInteger(input.revision)||input.revision<0||!input.fields||Array.isArray(input.fields))throw new Error('El servicio devolvió un avance no válido.');
  const fields={};
  for(const [key,field] of Object.entries(input.fields)){
    if(!owns(catalog,key)||!validValue(catalog[key],field?.value)||!Number.isSafeInteger(field.revision)||field.revision<1||field.revision>input.revision||typeof field.opId!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(field.opId)||typeof field.updatedAt!=='string'||!Number.isFinite(Date.parse(field.updatedAt)))throw new Error('El servicio devolvió una respuesta no válida.');
    fields[key]={value:field.value,revision:field.revision,opId:field.opId,updatedAt:field.updatedAt};
  }
  return {version:SYNC_VERSION,studentId,revision:input.revision,fields};
}
export function validateOperations(operations,catalog) {
  if(!Array.isArray(operations)||operations.length>100)throw new Error('Demasiados cambios en una petición.');
  const fields=new Set(),ids=new Set();
  return operations.map(op=>{
    if(!op||!owns(catalog,op.field)||!validValue(catalog[op.field],op.value)||typeof op.id!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(op.id)||ids.has(op.id)||fields.has(op.field)||!Number.isSafeInteger(op.baseRevision)||op.baseRevision<0||typeof op.seed!=='boolean')throw new Error('Cambio de avance no válido.');
    const supersedes=op.supersedes||[];
    if(!Array.isArray(supersedes)||supersedes.length>20||supersedes.some(id=>typeof id!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(id)))throw new Error('Historial de cambio no válido.');
    fields.add(op.field);ids.add(op.id);
    return {id:op.id,field:op.field,value:op.value,baseRevision:op.baseRevision,seed:op.seed,supersedes};
  });
}
export function mergeProgress(current,operations,catalog,now) {
  const next=validateRemote(current,current.studentId,catalog),accepted=[],conflicts=[];
  const order=Object.keys(catalog);
  const changes=validateOperations(operations,catalog).sort((a,b)=>order.indexOf(a.field)-order.indexOf(b.field));
  for(const op of changes){
    const before=next.fields[op.field],spec=catalog[op.field];
    // Old devices only fill missing fields. They never overwrite shared answers.
    if((op.seed&&before)||before?.value===op.value){accepted.push(op.id);continue;}
    if(((before?.revision||0)!==op.baseRevision&&!op.supersedes.includes(before?.opId))||(!op.seed&&spec.previous&&!next.fields[spec.previous])){
      conflicts.push({id:op.id,field:op.field});continue;
    }
    next.revision++;
    next.fields[op.field]={value:op.value,revision:next.revision,opId:op.id,updatedAt:now};
    accepted.push(op.id);
  }
  return {ok:true,state:next,accepted,conflicts};
}
