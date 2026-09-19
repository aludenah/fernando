export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 40 * 1024 * 1024;
export const MAX_FILES = 10;
export const MAX_PACKAGE_SIZE = 60 * 1024 * 1024;
const MIME = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const ID = /^[a-zA-Z0-9_-]{1,100}$/;
const object = v => v && typeof v === 'object' && !Array.isArray(v);
const text = (v, max, label) => {
  if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error(`${label}: texto vacío o demasiado largo.`);
  return v.trim();
};
const identifier = v => {
  if (typeof v !== 'string' || !ID.test(v)) throw new Error('Identificador no válido.');
  return v;
};
export function normalizeTask(input) {
  if (!object(input) || !Array.isArray(input.questions) || !input.questions.length || input.questions.length > 30) throw new Error('Cada tarea necesita entre 1 y 30 preguntas.');
  const ids = new Set();
  const questions = input.questions.map((q, index) => {
    if (!object(q) || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 5) throw new Error('Cada pregunta necesita de 2 a 5 alternativas.');
    const id = identifier(q.id);
    if (ids.has(id)) throw new Error('Hay preguntas repetidas.');
    ids.add(id);
    let grading;
    if(input.autoGrade === true) {
      if(!object(q.grading) || !Number.isInteger(q.grading.correctIndex) || q.grading.correctIndex < 0 || q.grading.correctIndex >= q.options.length) throw new Error('Cada pregunta necesita una alternativa correcta válida.');
      if(!Array.isArray(q.grading.steps) || q.grading.steps.length < 2 || q.grading.steps.length > 15) throw new Error('Cada pregunta necesita un solucionario con 2 a 15 pasos.');
      grading = {correctIndex:q.grading.correctIndex,steps:q.grading.steps.map(s=>text(s,3000,'Paso del solucionario')),hint:text(q.grading.hint,1200,'Orientación para repasar'),...(q.grading.topicId?{topicId:identifier(q.grading.topicId)}:{})};
    }
    return { id, number: index+1, topic: typeof q.topic==='string'?q.topic.slice(0,120):'', text: text(q.text, 3000, 'Pregunta'), options: q.options.map(o => text(o, 800, 'Alternativa')), ...(grading?{grading}:{}) };
  });
  const due = input.due || '';
  if (typeof due !== 'string' || (due && (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(Date.parse(`${due}T12:00:00Z`)) || new Date(`${due}T12:00:00Z`).toISOString().slice(0,10) !== due))) throw new Error('Fecha no válida.');
  return {
    id: identifier(input.id), title: text(input.title, 160, 'Título'),
    courseId: identifier(input.courseId || 'algebra'), chapterId: identifier(input.chapterId || 'algebra-uni-c1'),
    level: ['basico','intermedio','avanzado'].includes(input.level)?input.level:'personalizado',
    subject: text(input.subject || 'Álgebra · Capítulo 1', 120, 'Curso'),
    instructions: text(input.instructions, 6000, 'Indicaciones'), due, published: input.published !== false,
    questions, ...(input.autoGrade===true?{autoGrade:true}:{}),
  };
}
export function normalizeAnswers(task, input = {}) {
  if (!object(input)) throw new Error('Las respuestas no tienen un formato válido.');
  const result = Object.create(null);
  for (const question of task.questions) {
    if (!Object.hasOwn(input, question.id)) continue;
    const answer = input[question.id];
    if (!Number.isInteger(answer) || answer < 0 || answer >= question.options.length) throw new Error('Una alternativa no es válida para esta tarea.');
    result[question.id] = answer;
  }
  return result;
}
export const answerCount = (task, answers = {}) => task.questions.filter(q => Number.isInteger(answers[q.id]) && answers[q.id] >= 0 && answers[q.id] < q.options.length).length;
export const isReady = (task, draft, files) => answerCount(task, draft?.answers) === task.questions.length && task.questions.every(q=>files.some(f=>f.questionId===q.id));
export function validateFiles(files) {
  if (files.length > MAX_FILES) throw new Error('Puedes adjuntar hasta 10 archivos por problema.');
  let total = 0;
  for (const file of files) {
    if (typeof file.name !== 'string' || !file.name.trim() || file.name.length > 240) throw new Error('El nombre del archivo no es válido.');
    if (!MIME.has(file.type)) throw new Error(`${file.name}: selecciona un PDF o una imagen JPG, PNG o WEBP.`);
    if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_FILE_SIZE) throw new Error(`${file.name}: el archivo debe tener contenido y pesar hasta 10 MB.`);
    total += file.size;
  }
  if (total > MAX_TOTAL_SIZE) throw new Error('Los archivos de una tarea no pueden superar 40 MB en total.');
}
export function matchesSignature(bytes, type) {
  const starts = signature => signature.every((n, i) => bytes[i] === n);
  if (type === 'application/pdf') return starts([37, 80, 68, 70, 45]);
  if (type === 'image/png') return starts([137, 80, 78, 71, 13, 10, 26, 10]);
  if (type === 'image/jpeg') return starts([255, 216, 255]);
  return type === 'image/webp' && starts([82, 73, 70, 70]) && [87, 69, 66, 80].every((n, i) => bytes[i + 8] === n);
}
export function validateSubmission(input,expectedStudentId='fernando') {
  if((input?.studentId||'fernando')!==expectedStudentId)throw new Error('Esta entrega pertenece a otro estudiante.');
  if (!object(input) || input.format !== 'fernando-entrega' || ![1,2,3].includes(input.version)) throw new Error('Este archivo no es una entrega de Fernando.');
  const task = normalizeTask(input.task);
  const answers = normalizeAnswers(task, input.answers);
  if (answerCount(task, answers) !== task.questions.length) throw new Error('La entrega tiene preguntas sin responder.');
  if (!Array.isArray(input.files) || (input.files.length === 0 && input.version !== 3)) throw new Error('La entrega no incluye el solucionario.');
  if(input.version>=2) {
    if(input.files.length>task.questions.length*10)throw new Error('La entrega tiene demasiados archivos.');
    if(input.files.reduce((total,f)=>total+f.size,0)>MAX_TOTAL_SIZE)throw new Error('La copia supera 40 MB; conserva los adjuntos más pesados en Drive.');
    for(const q of task.questions)validateFiles(input.files.filter(f=>f.questionId===q.id));
    if(input.files.some(f=>!task.questions.some(q=>q.id===f.questionId)))throw new Error('Un adjunto no corresponde a ningún problema.');
    if(input.version===2&&!task.questions.every(q=>input.files.some(f=>f.questionId===q.id)))throw new Error('Falta el solucionario de algún problema.');
  } else validateFiles(input.files);
  const files = input.files.map(file => {
    if (typeof file.data !== 'string' || file.data.length !== 4 * Math.ceil(file.size / 3) || /[^A-Za-z0-9+/=]/.test(file.data)) throw new Error('Un adjunto está dañado.');
    let decoded;
    try { decoded = atob(file.data); } catch { throw new Error('Un adjunto está dañado.'); }
    const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
    if (bytes.length !== file.size || !matchesSignature(bytes, file.type)) throw new Error('El contenido de un adjunto no coincide con su tipo.');
    return { name: file.name, type: file.type, size: file.size, data: file.data, ...(input.version>=2?{questionId:file.questionId}:{}) };
  });
  if (typeof input.createdAt !== 'string' || Number.isNaN(Date.parse(input.createdAt))) throw new Error('Fecha de entrega no válida.');
  if (input.note != null && (typeof input.note !== 'string' || input.note.length > 4000)) throw new Error('El comentario es demasiado largo.');
  return {format: 'fernando-entrega', version: input.version, id: identifier(input.id), createdAt: input.createdAt, task, answers, note: input.note || '', files};
}
export function publicCourse(course, tasks) {
  if (!Array.isArray(tasks) || tasks.length > 100) throw new Error('El curso admite hasta 100 tareas.');
  const normalized = tasks.map(normalizeTask);
  if (new Set(normalized.map(t => t.id)).size !== normalized.length) throw new Error('Hay tareas repetidas.');
  return {schemaVersion: 2, courses: Array.isArray(course.courses)?course.courses:[], lesson: course.lesson, tasks: normalized,...(object(course.preparation)?{preparation:course.preparation}:{})};
}
export function html(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
