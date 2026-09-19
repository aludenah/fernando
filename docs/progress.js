import {gradeTask} from './grading.js';
import {normalizeTask, normalizeAnswers, answerCount} from './model.js?v=chapters-2';
import {studentProfile} from './students.js';

export const MAX_PROGRESS_FILE_SIZE = 2 * 1024 * 1024;
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function boundedText(value, max, label) {
  if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error(`${label} no válido.`);
  return value.trim();
}
function identifier(value) {
  if(typeof value!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(value))throw new Error('Identificador de avance no válido.');
  return value;
}
function date(value, optional=false) {
  if(optional&&value==null)return null;
  if(typeof value!=='string'||value.length>64||Number.isNaN(Date.parse(value)))throw new Error('Fecha del informe no válida.');
  return new Date(value).toISOString();
}

// A report is a snapshot for parents. Importing it never changes student drafts.
export function validateProgressReport(input,expectedStudentId=null) {
  if(!object(input)||!((input.format==='fernando-avance'&&input.version===1&&input.studentId==='fernando')||(input.format==='aula-avance'&&input.version===2)))throw new Error('Selecciona un informe de avance del aula.');
  const student=studentProfile(input.studentId);
  if(expectedStudentId&&student.id!==expectedStudentId)throw new Error(`Este informe pertenece a ${student.name}. Selecciona su nombre en el acceso a padres.`);
  if(!object(input.lesson)||!Array.isArray(input.lesson.topics)||input.lesson.topics.length>500)throw new Error('El informe no contiene un capítulo válido.');
  const topicIds=new Set();
  const topics=input.lesson.topics.map(topic=>{
    if(!object(topic))throw new Error('Tema no válido.');
    const id=identifier(topic.id);if(topicIds.has(id))throw new Error('Hay temas repetidos en el informe.');topicIds.add(id);
    return {id,title:boundedText(topic.title,200,'Título del tema')};
  });
  if(!Array.isArray(input.learned)||input.learned.length>topics.length||input.learned.some(id=>!topicIds.has(id))||new Set(input.learned).size!==input.learned.length)throw new Error('Los temas repasados no corresponden al capítulo.');
  if(!Array.isArray(input.tasks)||input.tasks.length>100)throw new Error('El informe tiene demasiadas tareas.');
  const taskIds=new Set(),questionIds=new Set();
  const tasks=input.tasks.map(entry=>{
    if(!object(entry))throw new Error('Tarea del informe no válida.');
    const task=normalizeTask(entry.task);
    if(!task.published||taskIds.has(task.id))throw new Error('Hay tareas repetidas o sin publicar en el informe.');taskIds.add(task.id);
    for(const q of task.questions){if(questionIds.has(q.id))throw new Error('Hay problemas repetidos en el informe.');questionIds.add(q.id);}
    const answers=normalizeAnswers(task,entry.answers);
    if(entry.note!=null&&(typeof entry.note!=='string'||entry.note.length>4000))throw new Error('El comentario del estudiante es demasiado largo.');
    return {task,answers,note:entry.note||'',updatedAt:date(entry.updatedAt,true)};
  });
  return {format:input.format,version:input.version,studentId:student.id,generatedAt:date(input.generatedAt),lesson:{id:identifier(input.lesson.id),title:boundedText(input.lesson.title,200,'Título del capítulo'),topics},learned:[...input.learned],theoryUpdatedAt:date(input.theoryUpdatedAt,true),tasks};
}

export function createProgressReport(course,tasks,drafts,learned,theoryUpdatedAt=null,now=new Date().toISOString(),studentId='fernando') {
  const draftMap=new Map(drafts.map(d=>[d.id,d]));
  return validateProgressReport({format:'aula-avance',version:2,studentId,generatedAt:now,
    lesson:{id:course.lesson.id,title:course.lesson.title,topics:course.lesson.topics.map(({id,title})=>({id,title}))},
    learned:learned.filter(id=>course.lesson.topics.some(t=>t.id===id)),theoryUpdatedAt,
    tasks:tasks.filter(t=>t.published&&t.chapterId===course.lesson.id).map(task=>{const draft=draftMap.get(task.id);return {task,answers:draft?.answers||{},note:draft?.note||'',updatedAt:draft?.updatedAt||null};})
  });
}

export function summarizeProgress(report) {
  const tasks=report.tasks.map(entry=>{
    const answered=answerCount(entry.task,entry.answers),total=entry.task.questions.length;
    const grade=gradeTask(entry.task,entry.answers);
    return {...entry,answered,total,grade,percent:Math.round(answered/total*100),status:grade?'Calificada':answered===total?'Respondida':answered?'En progreso':'Pendiente'};
  });
  const total=tasks.reduce((sum,t)=>sum+t.total,0),answered=tasks.reduce((sum,t)=>sum+t.answered,0);
  const dates=[report.theoryUpdatedAt,...tasks.map(t=>t.updatedAt)].filter(Boolean).sort((a,b)=>Date.parse(b)-Date.parse(a));
  return {tasks,total,answered,pending:total-answered,percent:total?Math.round(answered/total*100):0,completed:tasks.filter(t=>t.answered===t.total).length,learned:report.learned.length,topicTotal:report.lesson.topics.length,lastActivity:dates[0]||null};
}
