import {all, put, write, openDatabase} from './store.js';
import {hasAnswer, questionSequence, canOpenQuestion} from './sequence.js';
import {html as h, normalizeTask, answerCount, validateSubmission, publicCourse, MAX_PACKAGE_SIZE} from './model.js';
import {courseCatalog, courseOutline} from './course-views.js';
import {accessView,parentsView,studentReportPanel} from './family-views.js';
import {createProgressReport,validateProgressReport,MAX_PROGRESS_FILE_SIZE} from './progress.js';

const app = document.querySelector('#app');
const message = document.querySelector('#message');
const letters = ['A', 'B', 'C', 'D', 'E'];
const state = {activeTask:null,questionIndex:0,role:null,pendingRoute:null,parentReport:null,parentSource:'local',theoryUpdatedAt:null,course: null, drive:{problems:{}}, tasks: [], localTasks: [], drafts: [], files: [], reviews: [], learned: [], storage: true, pending: 0, editor: null, review: null};
const icons = {
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  arrow: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M3 16v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M3 17v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
const icon = (name, size = 20) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.book}</svg>`;
const draftFor = id => state.drafts.find(d => d.id === id) || {id, answers: {}, note: ''};
const filesFor = (id,questionId) => state.files.filter(f => f.taskId === id && (!questionId||f.questionId===questionId));
const answersReady = (task,draft) => answerCount(task,draft?.answers) === task.questions.length;
const taskFor = id => state.tasks.find(t => t.id === id);
const isLocal = id => state.localTasks.some(t => t.id === id);
const formatDate = date => date ? new Date(`${date}T12:00:00`).toLocaleDateString('es-PE', {day:'numeric', month:'short', year:'numeric'}) : 'Sin fecha límite';
const formatTime = date => new Date(date).toLocaleString('es-PE', {dateStyle:'medium', timeStyle:'short'});
const taskName = task => task.title.replace(/^\d+ · /, '');
const status = task => {
  const draft = draftFor(task.id);
  if (answersReady(task,draft)) return ['prepared', 'Respondida'];
  return answerCount(task, draft.answers) || filesFor(task.id).length ? ['progress', 'En progreso'] : ['', 'Pendiente'];
};
function notify(text, error = false) {
  message.className = text ? `message ${error ? 'error' : 'success'}` : '';
  message.setAttribute('role', error ? 'alert' : 'status');
  message.textContent = text;
}
function storageNote() {
  return `<div class="local-note">${icon('file',18)}<p>Marca tus respuestas aquí. Para entregar el desarrollo, pulsa <strong>Subir al Drive</strong> en cada problema y añade el archivo a su carpeta. Las respuestas se conservan en este dispositivo.</p></div>`;
}
function nav(tab) {
  return `<nav class="tabs" aria-label="Secciones del aula">${[['cursos','Mis cursos'],['temario/algebra','Temario'],['curso','Capítulo 1'],['tareas','Práctica']].map(([id,label]) => `<a href="#${id}" ${tab === id ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}
function heading() {
  const tasks = state.tasks.filter(t => t.published);
  const answered = tasks.reduce((n, t) => n + answerCount(t, draftFor(t.id).answers), 0);
  return `<div class="page-heading"><div><p class="eyebrow">CLASES PARTICULARES · ÁLGEBRA</p><h1>El aula de Fernando.</h1><p>Entiende la idea. Practica con calma. Explica tu solución.</p></div><span class="chapter-badge">CAPÍTULO <strong>01</strong></span></div>
  <div class="stats"><div><span class="stat-icon blue">${icon('book')}</span><div><strong>${state.course.lesson.topics.length}</strong><span>Temas para aprender</span></div></div><div><span class="stat-icon amber">${icon('clock')}</span><div><strong>${tasks.length}</strong><span>Tareas de práctica</span></div></div><div><span class="stat-icon green">${icon('check')}</span><div><strong>${answered}<small> / ${tasks.reduce((n,t)=>n+t.questions.length,0)}</small></strong><span>Respuestas marcadas</span></div></div></div>`;
}
function taskCard(task, index, teacher = false) {
  const [cls, label] = status(task), sequence = questionSequence(task,draftFor(task.id).answers);
  return `<a class="task-card" href="#tarea/${h(task.id)}"><span class="task-index">${String(index + 1).padStart(2, '0')}</span><div class="task-content"><div class="task-tags"><span class="subject">${h(task.subject)}</span><span class="badge ${cls}">${h(label)}</span>${isLocal(task.id) ? '<span class="badge">Cambios locales</span>' : ''}${!task.published ? '<span class="badge">Borrador</span>':''}</div><h3>${h(task.title)}</h3><div class="task-meta"><span>${task.questions.length} preguntas</span><span>${h(formatDate(task.due))}</span>${teacher ? '<span>Ver y editar</span>' : ''}</div><div class="task-card-progress"><span>${sequence.answered} de ${sequence.total} respuestas · ${sequence.percent}%</span><span>${sequence.complete?'Revisar respuestas':`Continuar en la pregunta ${sequence.resumeAt+1}`}</span><progress max="${sequence.total}" value="${sequence.answered}" aria-label="Avance de ${h(task.title)}"></progress></div></div>${icon('arrow')}</a>`;
}
function renderCourse() {
  const lesson = state.course.lesson;
  const first = state.tasks.find(t => t.published);
  return `${heading()}${nav('curso')}
  <section class="chapter-heading"><div><p class="eyebrow">TU PRIMER CAPÍTULO</p><h2>${h(lesson.title)}</h2><p>Comprende los números y opera con seguridad, paso a paso.</p></div>${first ? `<a class="button" href="#tarea/${h(first.id)}">Empezar a practicar ${icon('arrow',18)}</a>`:''}</section>
  <div class="course-layout"><div><section class="panel course-objectives"><h2>Lo que aprenderemos</h2><ul>${lesson.objectives.map(o => `<li>${icon('check',18)}<span>${h(o)}</span></li>`).join('')}</ul><p class="course-convention">${h(lesson.convention)}</p></section>
  <section class="panel chapter-guide"><div class="section-heading"><h2>Guía para la clase</h2><span>${state.learned.length} / ${lesson.topics.length} repasados</span></div>${lesson.topics.map((topic, i) => `<details class="topic" ${i === 0 ? 'open':''}><summary><span>${h(topic.title)}</span>${state.learned.includes(topic.id) ? `<span class="topic-check">${icon('check',17)}<span class="sr-only">Repasado</span></span>`:''}</summary><div class="topic-body"><p class="topic-concept">${h(topic.concept)}</p><ul class="formula-list">${topic.formulas.map(f=>`<li>${h(f)}</li>`).join('')}</ul><div class="worked-example"><strong>Veámoslo paso a paso</strong><p class="prewrap">${h(topic.example)}</p></div><p class="topic-tip"><strong>Recuerda:</strong> ${h(topic.tip)}</p><div class="topic-footer"><label class="learned"><input type="checkbox" data-topic="${h(topic.id)}" ${state.learned.includes(topic.id)?'checked':''} ${!state.storage?'disabled':''}>Tema repasado</label></div></div></details>`).join('')}</section></div>
  <aside class="course-sequence"><section class="panel"><p class="eyebrow">DEL CONCEPTO A LA PRÁCTICA</p><h2>Tareas del capítulo</h2><p>Resuelve una tarea a la vez. Muestra cómo llegaste a cada respuesta.</p>${state.tasks.filter(t=>t.published).map((task,i)=>`<a class="chapter-task" href="#tarea/${h(task.id)}"><span class="chapter-step">${i+1}</span><span><strong>${h(taskName(task))}</strong><small>${task.questions.length} preguntas · ${h(status(task)[1])}</small></span>${icon('arrow',17)}</a>`).join('')}</section><div class="study-note"><span>UNA BUENA COSTUMBRE</span><h2>El desarrollo<br>también cuenta.</h2><p>Escribe cada paso, revisa los signos y comprueba tu resultado.</p><div class="math-mark" aria-hidden="true">ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ</div></div></aside></div>${storageNote()}`;
}
function renderTasks() {
  const tasks = state.tasks.filter(t=>t.published);
  return `${heading()}${nav('tareas')}<div class="section-heading"><h2>Un paso más en cada tarea</h2><span>${tasks.length} tareas</span></div>${tasks.map((t,i)=>taskCard(t,i)).join('')}${studentReportPanel(state.storage)}${storageNote()}`;
}
function attachmentRows(files, review = false) {
  if (!files.length) return '<p class="muted">Esta copia contiene las respuestas. Revisa los solucionarios en las carpetas de Drive de cada problema.</p>';
  return files.map((file, index)=>`<div class="file-row">${icon('file')}<span class="file-name"><strong>${h(file.name)}</strong><small>${review&&file.questionId?`Problema ${state.review?.task.questions.findIndex(q=>q.id===file.questionId)+1} · `:''}${(file.size/1024/1024).toFixed(2)} MB</small></span><button class="icon-button" data-action="${review?'review-file':'download-file'}" data-id="${review?index:h(file.id)}" aria-label="Descargar ${h(file.name)}">${icon('download',18)}</button>${!review?`<button class="icon-button remove-file" data-action="remove-file" data-id="${h(file.id)}" aria-label="Quitar ${h(file.name)}">×</button>`:''}</div>`).join('');
}
function questionWork(task,question) {
  const folder=state.drive.problems[question.id];
  return `<div class="problem-work">${folder?`<a class="button" href="${h(folder.folderUrl)}" target="_blank" rel="noopener noreferrer">Subir al Drive</a>`:'<button class="button" disabled title="El profesor debe asignar una carpeta a este problema.">Subir al Drive</button>'}</div>`;
}
function questionSteps(task) {
  const draft=draftFor(task.id);
  return task.questions.map((question,index)=>{
    const available=canOpenQuestion(task,draft.answers,index),answered=hasAnswer(question,draft.answers),current=index===state.questionIndex;
    const label=`Pregunta ${index+1}${!available?', bloqueada: responde las anteriores':answered?', respondida':', pendiente'}`;
    return `<button type="button" class="question-step ${answered?'answered':''}" data-action="question-go" data-id="${index}" aria-label="${h(label)}" title="${h(label)}" ${current?'aria-current="step"':''} ${!available?'disabled':''}>${index+1}${answered?'<span aria-hidden="true">✓</span>':''}</button>`;
  }).join('');
}
function questionNavigation(task) {
  const index=state.questionIndex, draft=draftFor(task.id),last=index===task.questions.length-1;
  return `<button class="button secondary" data-action="question-go" data-id="${index-1}" ${index===0?'disabled':''}>← Anterior</button>${last?`<a class="button" href="#tareas">Ver mis tareas</a>`:`<button class="button" data-action="question-go" data-id="${index+1}" ${!canOpenQuestion(task,draft.answers,index+1)?'disabled':''}>Siguiente pregunta →</button>`}`;
}
function questionSaveText(task) {
  if(!state.storage)return 'No se puede guardar el avance en este navegador.';
  const draft=draftFor(task.id),question=task.questions[state.questionIndex];
  if(hasAnswer(question,draft.answers))return answersReady(task,draft)?'Todas tus respuestas están guardadas. Puedes revisarlas cuando quieras.':'Respuesta guardada. Ya puedes pasar a la siguiente pregunta.';
  return state.questionIndex===task.questions.length-1?'Marca una alternativa para completar la tarea.':'Marca una alternativa para habilitar la siguiente pregunta.';
}
function renderQuestionStage(task) {
  const index=state.questionIndex,question=task.questions[index],draft=draftFor(task.id);
  return `<section class="panel sequence-panel"><div class="section-heading"><h2 id="question-heading" tabindex="-1">Pregunta ${index+1} de ${task.questions.length}</h2><span>PASO A PASO</span></div><p>Marca una respuesta para continuar. Puedes volver a las preguntas anteriores y revisarlas.</p><nav id="question-steps" class="question-steps" aria-label="Preguntas de la tarea">${questionSteps(task)}</nav></section>
  <fieldset class="panel question-card" id="problem-${h(question.id)}"><legend><span class="question-number">${String(index+1).padStart(2,'0')}</span><span>${h(question.text)}</span></legend><div class="options">${question.options.map((option,i)=>`<label class="answer-option ${draft.answers[question.id]===i?'selected':''}"><input type="radio" name="${h(question.id)}" value="${i}" data-answer="${h(question.id)}" data-task="${h(task.id)}" ${draft.answers[question.id]===i?'checked':''} ${!state.storage?'disabled':''}><span class="option-letter">${letters[i]}</span><span>${h(option)}</span></label>`).join('')}</div><div id="work-${h(question.id)}">${questionWork(task,question)}</div><p id="question-save-status" class="save-status" aria-live="polite">${questionSaveText(task)}</p></fieldset>
  <div class="question-navigation" id="question-navigation">${questionNavigation(task)}</div>`;
}
function updateQuestionControls(task) {
  if(!document.querySelector('#question-stage'))return;
  document.querySelector('#question-steps').innerHTML=questionSteps(task);
  document.querySelector('#question-navigation').innerHTML=questionNavigation(task);
  document.querySelector('#question-save-status').textContent=questionSaveText(task);
}
function renderTask(task) {
  const draft = draftFor(task.id), sequence=questionSequence(task,draft.answers),count=sequence.answered;
  if(state.activeTask!==task.id){state.activeTask=task.id;state.questionIndex=sequence.resumeAt;}
  if(!canOpenQuestion(task,draft.answers,state.questionIndex))state.questionIndex=sequence.resumeAt;
  return `<a class="back" href="#tareas">← Volver a mis tareas</a><div class="page-heading"><div><p class="eyebrow">${h(task.subject)}</p><h1>${h(taskName(task))}</h1><p>${task.questions.length} preguntas · ${h(formatDate(task.due))}</p></div>${state.role==='parent'?`<button class="button secondary" data-action="edit-task" data-id="${h(task.id)}">Editar tarea</button>`:''}</div>${isLocal(task.id)?'<p class="local-edit-notice">Esta versión tiene cambios guardados únicamente en este dispositivo.</p>':''}
  <div class="detail-layout"><div><details class="panel task-instructions"><summary>Indicaciones de la tarea</summary><p class="prewrap instructions">${h(task.instructions)}</p></details>
  <div id="question-stage">${renderQuestionStage(task)}</div>
  </div>
  <aside class="detail-aside"><section class="panel progress-panel"><p class="eyebrow">TU AVANCE</p><h2>Tu tarea, paso a paso</h2><div class="progress-count"><strong id="answer-count">${count}</strong><span>de ${task.questions.length} respuestas</span></div><div class="progress-caption"><strong id="answer-percent">${sequence.percent}%</strong><span id="task-progress-state">${sequence.complete?'Todas las preguntas respondidas':`${sequence.total-count} preguntas pendientes`}</span></div><progress id="answer-progress" max="${task.questions.length}" value="${count}" aria-label="Preguntas respondidas"></progress><p id="last-saved" class="save-status">${draft.updatedAt?`Último avance guardado: ${h(formatTime(draft.updatedAt))}`:'Tu avance se guardará al marcar una respuesta.'}</p><p class="resume-note">Al volver a esta tarea, continuarás desde la primera pregunta pendiente.</p><div class="delivery-note"><strong>Entrega en la carpeta del problema.</strong><p>Usa «Subir al Drive» y añade tu foto o PDF en la carpeta. Esta página no verifica los archivos subidos a Drive.</p></div></section></aside></div>`;
}
function renderTeacher() {
  return `<div class="page-heading"><div><p class="eyebrow">HERRAMIENTAS DEL PROFESOR</p><h1>Prepara la próxima clase.</h1><p>Crea tareas y revisa copias de trabajo desde este dispositivo.</p></div><button class="button" data-action="new-task" ${!state.storage?'disabled':''}>${icon('plus',18)} Nueva tarea</button></div>${nav('profesor')}
  <div class="local-note"><p><strong>Este editor guarda cambios locales.</strong> Para compartir las tareas con Fernando, descarga el contenido y actualízalo en tu repositorio. El acceso privado se configurará después.</p></div>
  ${renderDriveSettings()}<div class="teacher-grid"><section class="panel"><h2>Publicar las tareas</h2><p>La web carga sus tareas desde tu repositorio de GitHub.</p><ol class="steps"><li>Prepara y guarda las tareas aquí.</li><li>Descarga <strong>course.json</strong>.</li><li>Súbelo a <strong>docs/data</strong> en GitHub y confirma el cambio.</li></ol><div class="button-row"><button class="button" data-action="export-course">${icon('download',18)} Descargar contenido</button><a class="button secondary" href="https://github.com/aludenah/fernando/upload/main/docs/data" target="_blank" rel="noopener noreferrer">Abrir carpeta en GitHub ↗</a></div><p class="source-note">Las tareas marcadas como borrador también se incluyen en el archivo público. Guárdalo solo cuando estén listas para compartirse; no añadas datos privados ni claves de respuestas.</p></section>
  <section class="panel"><h2>Revisar una copia de trabajo</h2><p>Puedes abrir el archivo que Fernando descargó desde una tarea. Se leerá en este dispositivo.</p><label class="upload-box compact">${icon('file',24)}<strong>Importar trabajo para revisar</strong><span>Archivo .json generado por el aula</span><input type="file" id="import-review" accept=".json,application/json" aria-label="Importar trabajo para revisar" ${!state.storage?'disabled':''}></label><p class="source-note">Los archivos y las notas de revisión permanecen en este navegador.</p></section></div>
  <div class="section-heading"><h2>Tareas preparadas</h2><span>${state.tasks.length} tareas · ${state.localTasks.length} con cambios locales</span></div>${state.tasks.map((t,i)=>taskCard(t,i,true)).join('')}
  <section class="panel"><h2>Trabajos importados</h2>${state.reviews.length?state.reviews.map(r=>`<button class="review-row" data-action="open-review" data-id="${h(r.id)}"><span><strong>${h(r.task.title)}</strong><small>${h(formatTime(r.createdAt))}</small></span><span class="badge ${r.score!=null?'prepared':''}">${r.score!=null?`${r.score}/20`:'Por revisar'}</span>${icon('arrow',18)}</button>`).join(''):'<p class="muted">Aún no has importado trabajos para revisar.</p>'}</section>`;
}
function renderDriveSettings() {
  return `<section class="panel drive-settings"><h2>Solucionarios en Google Drive</h2><p>Cada botón «Subir al Drive» abre la carpeta de su problema en una pestaña nueva.</p><a class="button secondary" href="${h(state.drive.rootFolderUrl)}" target="_blank" rel="noopener noreferrer">Abrir carpetas del aula ↗</a><h3>Permisos de las carpetas</h3><p>En la carpeta principal, selecciona Compartir → Acceso general → Cualquier persona con el enlace → Editor. Los permisos se aplican a sus subcarpetas.</p><p class="source-note">El permiso Editor permite subir, modificar y eliminar archivos. Para subir archivos, Fernando debe iniciar sesión en Google. El material del profesor se guarda por separado.</p></section>`;
}
function editorQuestion(question, index) {
  return `<fieldset class="panel edit-question" data-question="${h(question.id)}"><legend>Pregunta ${index+1}</legend><label class="field-label">Enunciado<textarea data-field="text" rows="2" required maxlength="3000">${h(question.text)}</textarea></label><div class="edit-options">${question.options.map((option,i)=>`<label><span>${letters[i]}</span><input data-option="${i}" aria-label="Pregunta ${index+1}, alternativa ${letters[i]}" value="${h(option)}" required maxlength="800"></label>`).join('')}</div><button class="text-button" type="button" data-action="remove-question" data-id="${h(question.id)}">Quitar pregunta</button></fieldset>`;
}
function renderEditor() {
  const task = state.editor;
  return `<a class="back" href="#profesor">← Volver a preparar clase</a><div class="page-heading"><div><p class="eyebrow">PREPARACIÓN DE TAREAS</p><h1>${taskFor(task.id)?'Editar tarea':'Nueva tarea'}</h1><p>Los cambios se guardan aquí; luego puedes publicarlos en GitHub.</p></div></div><form id="task-editor"><div class="editor-layout"><div><section class="panel"><h2>Datos de la tarea</h2><label class="field-label">Título<input name="title" value="${h(task.title)}" required maxlength="160" placeholder="Ejemplo: Practicamos con fracciones"></label><div class="form-grid"><label class="field-label">Curso<input name="subject" value="${h(task.subject)}" required maxlength="120"></label><label class="field-label">Fecha límite (opcional)<input type="date" name="due" value="${h(task.due)}"></label></div><label class="field-label">Indicaciones<textarea name="instructions" rows="4" required maxlength="6000">${h(task.instructions)}</textarea></label><label class="checkbox-label"><input type="checkbox" name="published" ${task.published?'checked':''}>Mostrar en la lista de tareas</label></section><div id="editor-questions">${task.questions.map(editorQuestion).join('')}</div><button class="button secondary" type="button" data-action="add-question">${icon('plus',18)} Añadir pregunta</button></div><aside class="panel editor-summary"><h2>Lista para practicar</h2><p>Revisa que cada pregunta tenga enunciado y alternativas claras.</p><button type="submit" class="button full" ${!state.storage?'disabled':''}>Guardar en este dispositivo</button><a class="button secondary full" href="#profesor">Cancelar</a><p class="source-note">Publicar el contenido requiere confirmar el cambio desde tu cuenta de GitHub.</p></aside></div></form>`;
}
function renderReview(review) {
  return `<a class="back" href="#profesor">← Volver a preparar clase</a><div class="page-heading"><div><p class="eyebrow">REVISIÓN LOCAL</p><h1>${h(taskName(review.task))}</h1><p>Copia preparada el ${h(formatTime(review.createdAt))}</p></div></div><div class="detail-layout"><div>${review.task.questions.map((q,i)=>`<section class="panel"><p class="eyebrow">PREGUNTA ${i+1}</p><h2>${h(q.text)}</h2><p class="review-answer"><strong>Respuesta marcada: ${letters[review.answers[q.id]]}</strong> · ${h(q.options[review.answers[q.id]])}</p></section>`).join('')}<section class="panel"><h2>Solucionario adjunto</h2>${attachmentRows(review.files,true)}${review.note?`<h3>Comentario de Fernando</h3><p class="prewrap">${h(review.note)}</p>`:''}</section></div><aside class="panel detail-aside"><h2>Tu revisión</h2><form id="review-form" data-id="${h(review.id)}"><label class="field-label">Nota sobre 20<input name="score" type="number" min="0" max="20" step="0.1" value="${review.score??''}" required></label><label class="field-label">Comentarios<textarea name="feedback" rows="6" maxlength="6000">${h(review.feedback||'')}</textarea></label><button class="button full" type="submit">Guardar revisión</button></form><button class="button secondary full" data-action="export-review" data-id="${h(review.id)}">${icon('download',18)} Descargar comentarios</button><p class="source-note">La revisión se guarda aquí. No se envía automáticamente a Fernando.</p></aside></div>`;
}
function currentProgress() {
  return createProgressReport(state.course,state.tasks,state.drafts,state.learned,state.theoryUpdatedAt);
}
function renderParents() {
  const source=state.parentSource==='report'&&state.parentReport?'report':'local';
  return parentsView(source==='report'?state.parentReport:currentProgress(),{source,hasReport:Boolean(state.parentReport),drive:state.drive,storage:state.storage});
}
function audienceBar() {
  return `<div class="audience-bar"><span class="audience-badge">${state.role==='parent'?'ACCESO A PADRES':'ACCESO A ESTUDIANTE'}</span><a href="#inicio">Cambiar de acceso</a></div>`;
}
function route(focus = false) {
  if (!state.course) return;
  const [tab,id] = location.hash.slice(1).split('/');
  if(tab!=='tarea'||id!==state.activeTask)state.activeTask=null;
  if(tab==='inicio'||!tab) {state.role=null;state.pendingRoute=null;}
  else if(tab==='padres') {state.role='parent';state.pendingRoute=null;}
  else if(tab==='estudiante') {
    state.role='student';
    if(state.pendingRoute){const target=state.pendingRoute;state.pendingRoute=null;location.hash=target;return;}
  }
  if (tab !== 'editar') state.editor = null;
  if (tab !== 'revision') state.review = null;
  if(!state.role) {
    if(['curso','cursos','temario','tarea','tareas'].includes(tab))state.pendingRoute=location.hash;
    app.innerHTML=accessView();
  }
  else if(tab==='padres')app.innerHTML=renderParents();
  else {
    let content;
    if (tab === 'tarea' && taskFor(id)) content = renderTask(taskFor(id));
    else if (tab === 'tareas') content = renderTasks();
    else if (tab === 'profesor') content = renderTeacher();
    else if (tab === 'editar' && state.editor) content = renderEditor();
    else if (tab === 'revision' && state.reviews.some(r=>r.id===id)) {state.review=state.reviews.find(r=>r.id===id);content=renderReview(state.review);}
    else if(tab==='curso')content=renderCourse();
    else if(tab==='temario')content=nav('temario/algebra')+courseOutline(state.course.courses.find(c=>c.id===id));
    else content=nav('cursos')+courseCatalog(state.course.courses)+studentReportPanel(state.storage);
    app.innerHTML=audienceBar()+content;
  }
  const account=document.querySelector('.account>span:first-child');
  if(account)account.textContent=state.role==='parent'?'Acompañando a Fernando.':state.role==='student'?'Un paso a la vez.':'Aprender en familia.';
  if (focus) {document.querySelector('#main').focus({preventScroll:true}); window.scrollTo({top:0});}
}
async function refresh() {
  [state.drafts,state.files,state.localTasks,state.reviews] = await Promise.all(['drafts','files','tasks','reviews'].map(all));
  const settings = await all('settings');
  const received=settings.find(item=>item.id==='parent-report')?.report;
  try{state.parentReport=received?validateProgressReport(received):null;}catch{state.parentReport=null;}
  state.theoryUpdatedAt=settings.find(item=>item.id==='learned')?.updatedAt||null;
  state.learned = (settings.find(s=>s.id==='learned')?.topics||[]).filter(id=>state.course.lesson.topics.some(t=>t.id===id));
  const merged = new Map(state.course.tasks.map(t=>[t.id,t]));
  for (const task of state.localTasks) merged.set(task.id,normalizeTask(task));
  state.tasks = [...merged.values()];
}
function storageError(error) {
  return error?.name === 'QuotaExceededError' ? 'No queda espacio en el navegador. Descarga tus trabajos y libera espacio antes de adjuntar más archivos.' : (error?.message || 'No se pudo guardar. Vuelve a intentarlo.');
}
let queue = Promise.resolve();
function enqueue(action) {
  state.pending++;
  queue = queue.then(action).catch(error=>notify(storageError(error),true)).finally(()=>{state.pending--;});
  return queue;
}
async function saveDraft(taskId, changes) {
  const draft = {...draftFor(taskId),...changes,preparedAt:null,updatedAt:new Date().toISOString()};
  await put('drafts',draft);
  state.drafts = [...state.drafts.filter(d=>d.id!==taskId),draft];
  if(message.classList.contains('error'))notify('');
  updateProgress(taskId);
  if(location.hash===`#tarea/${taskId}`)updateProblemControls(taskId);
  signalProgress();
}
function updateProgress(id) {
  if(location.hash!==`#tarea/${id}`)return;
  const task=taskFor(id),draft=draftFor(id);
  if(!task||!document.querySelector('#answer-count')) return;
  const sequence=questionSequence(task,draft.answers);
  document.querySelector('#answer-count').textContent=sequence.answered;
  document.querySelector('#answer-percent').textContent=`${sequence.percent}%`;
  document.querySelector('#task-progress-state').textContent=sequence.complete?'Todas las preguntas respondidas':`${sequence.total-sequence.answered} preguntas pendientes`;
  document.querySelector('#last-saved').textContent=draft.updatedAt?`Último avance guardado: ${formatTime(draft.updatedAt)}`:'Tu avance se guardará al marcar una respuesta.';
  updateQuestionControls(task);
  document.querySelector('#answer-progress').value=answerCount(task,draft.answers);

}
function updateProblemControls(taskId) {
  if(location.hash!==`#tarea/${taskId}`)return;
  const task=taskFor(taskId);if(!task)return;
  for(const question of task.questions) {
    const target=document.getElementById(`work-${question.id}`);
    if(target)target.innerHTML=questionWork(task,question);
  }
}
function download(blob,name) {
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
const downloadJSON=(data,name)=>download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),name);
function captureEditor() {
  const form=document.querySelector('#task-editor');
  if(!form||!state.editor) return;
  const fields=new FormData(form);
  state.editor={...state.editor,title:fields.get('title'),subject:fields.get('subject'),due:fields.get('due'),instructions:fields.get('instructions'),published:fields.has('published'),questions:[...form.querySelectorAll('.edit-question')].map(q=>({id:q.dataset.question,topic:state.editor.questions.find(item=>item.id===q.dataset.question)?.topic||'',text:q.querySelector('[data-field="text"]').value,options:[...q.querySelectorAll('[data-option]')].map(o=>o.value)}))};
}
const blankQuestion=()=>({id:crypto.randomUUID(),text:'',options:['','','','','']});
async function action(name,id) {
  if(name==='question-go') {
    const [tab,taskId]=location.hash.slice(1).split('/'),task=taskFor(taskId),index=Number(id);
    if(tab!=='tarea'||!task||!canOpenQuestion(task,draftFor(taskId).answers,index))throw new Error('Marca las respuestas anteriores antes de continuar.');
    state.questionIndex=index;
    document.querySelector('#question-stage').innerHTML=renderQuestionStage(task);
    const heading=document.querySelector('#question-heading');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});
    return;
  }
  if(name==='export-progress') {
    await refresh();const report=currentProgress();
    downloadJSON(report,`fernando-avance-${report.generatedAt.slice(0,10)}.json`);
    notify('Informe descargado. En otro dispositivo, entra a Padres y selecciona «Abrir informe del estudiante».');return;
  }
  if(name==='refresh-parents'){await refresh();route();notify(state.parentSource==='report'?'Se muestra la copia recibida. Abre un informe nuevo para consultar cambios posteriores.':'Avance actualizado desde este navegador.');return;}
  if(name==='parent-local'){state.parentSource='local';await refresh();route();return;}
  if(name==='parent-report'&&state.parentReport){state.parentSource='report';route();return;}

  if(name==='new-task'||name==='edit-task') {
    state.editor=name==='edit-task'?structuredClone(taskFor(id)):{id:crypto.randomUUID(),title:'',subject:'Álgebra · Capítulo 1',instructions:'Resuelve cada pregunta, marca una alternativa y usa «Subir al Drive» para entregar tu desarrollo en la carpeta del problema.',due:'',published:true,questions:[blankQuestion()]};
    location.hash='editar';route(true);return;
  }
  if(name==='add-question') {captureEditor();if(state.editor.questions.length>=30) throw new Error('El máximo es 30 preguntas.');state.editor.questions.push(blankQuestion());document.querySelector('#editor-questions').innerHTML=state.editor.questions.map(editorQuestion).join('');document.querySelector('.edit-question:last-child textarea').focus();return;}
  if(name==='remove-question') {captureEditor();if(state.editor.questions.length===1) throw new Error('La tarea necesita al menos una pregunta.');state.editor.questions=state.editor.questions.filter(q=>q.id!==id);document.querySelector('#editor-questions').innerHTML=state.editor.questions.map(editorQuestion).join('');return;}
  if(name==='download-file') {const file=state.files.find(f=>f.id===id);if(file) download(file.blob,file.name);return;}
  if(name==='remove-file') {
    const file=state.files.find(f=>f.id===id);if(!file)return;
    await write([{store:'files',id,remove:true},{store:'drafts',value:{...draftFor(file.taskId),preparedAt:null}}]);await refresh();
    if(location.hash===`#tarea/${file.taskId}`){updateProblemControls(file.taskId);updateProgress(file.taskId);}return;
  }
  if(name==='export-course') {downloadJSON(publicCourse(state.course,state.tasks),'course.json');notify('Contenido descargado. Súbelo a docs/data en GitHub y confirma el cambio para actualizar la web.');return;}
  if(name==='open-review') {location.hash=`revision/${id}`;return;}
  if(name==='review-file') {
    const file=state.review?.files[Number(id)];if(!file)return;
    download(new Blob([Uint8Array.from(atob(file.data),c=>c.charCodeAt(0))],{type:file.type}),file.name);return;
  }
  if(name==='export-review') {
    const review=state.reviews.find(r=>r.id===id);
    const body=`REVISIÓN · ${review.task.title}\nCopia de trabajo: ${formatTime(review.createdAt)}\nNota: ${review.score??'Pendiente'}/20\n\nComentarios del profesor\n${review.feedback||'Sin comentarios.'}\n`;
    download(new Blob([body],{type:'text/plain;charset=utf-8'}),`revision-${id}.txt`);return;
  }
}
app.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const {action:name,id}=button.dataset;
  enqueue(async()=>{button.disabled=true;try{await action(name,id);}finally{button.disabled=false;const [,taskId]=location.hash.slice(1).split('/');if(taskId)updateProgress(taskId);}});
});
app.addEventListener('change',event=>{
  const target=event.target;
  if(target.matches('[data-answer]')) {
    const {task:id,answer:questionId}=target.dataset, selected=Number(target.value);
    target.closest('.options').querySelectorAll('label').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked));
    document.querySelector('#question-save-status').textContent='Guardando respuesta…';
    enqueue(async()=>{try{
      const task=taskFor(id),index=task?.questions.findIndex(q=>q.id===questionId),question=task?.questions[index];
      if(!question||!canOpenQuestion(task,draftFor(id).answers,index)||!Number.isInteger(selected)||selected<0||selected>=question.options.length)throw new Error('Responde las preguntas en orden.');
      await saveDraft(id,{answers:{...draftFor(id).answers,[questionId]:selected}});
    }catch(error){if(location.hash===`#tarea/${id}`)route();throw error;}});
  }
  if(target.matches('[data-topic]')) {
    const id=target.dataset.topic,checked=target.checked;
    enqueue(async()=>{
      const learned=checked?[...new Set([...state.learned,id])]:state.learned.filter(t=>t!==id);
      try{const updatedAt=new Date().toISOString();await put('settings',{id:'learned',topics:learned,updatedAt});state.learned=learned;state.theoryUpdatedAt=updatedAt;signalProgress();const counter=document.querySelector('.chapter-guide .section-heading span');if(counter)counter.textContent=`${learned.length} / ${state.course.lesson.topics.length} repasados`;}catch(error){target.checked=!checked;throw error;}
    });
  }
  if(target.id==='import-progress') {
    const file=target.files[0];target.value='';if(!file)return;
    enqueue(async()=>{
      if(file.size>MAX_PROGRESS_FILE_SIZE)throw new Error('El informe de avance debe pesar hasta 2 MB.');
      let parsed;try{parsed=JSON.parse(await file.text());}catch{throw new Error('No se pudo leer el informe. Selecciona el archivo JSON descargado desde Estudiante.');}
      const report=validateProgressReport(parsed);
      await put('settings',{id:'parent-report',report});state.parentReport=report;state.parentSource='report';
      route();notify('Informe abierto. Estás viendo una copia del avance guardado en la fecha indicada.');
    });
  }
  if(target.id==='import-review') {
    const file=target.files[0];target.value='';if(!file)return;
    enqueue(async()=>{
      if(file.size>MAX_PACKAGE_SIZE)throw new Error('El archivo de entrega supera los 60 MB.');
      let input;try{input=JSON.parse(await file.text());}catch{throw new Error('No se pudo leer el archivo JSON.');}
      const data=validateSubmission(input);
      const existing=state.reviews.find(r=>r.id===data.id);
      if(existing) {notify('Este trabajo ya estaba importado. Se conserva tu revisión.');location.hash=`revision/${data.id}`;return;}
      await put('reviews',data);await refresh();location.hash=`revision/${data.id}`;notify('Trabajo importado. Puedes descargar los adjuntos y guardar tu revisión aquí.');
    });
  }
});
app.addEventListener('submit',event=>{
  event.preventDefault();const form=event.target;
  if(form.id==='task-editor') {
    captureEditor();const input=structuredClone(state.editor);
    enqueue(async()=>{
      const task=normalizeTask(input),previous=taskFor(task.id),draft=draftFor(task.id);
      const unchanged=task.questions.filter(q=>{
        const before=previous?.questions.find(p=>p.id===q.id);
        return before&&before.text===q.text&&JSON.stringify(before.options)===JSON.stringify(q.options);
      });
      const answers=Object.fromEntries(unchanged.filter(q=>Object.hasOwn(draft.answers,q.id)).map(q=>[q.id,draft.answers[q.id]]));
      await write([{store:'tasks',value:task},{store:'drafts',value:{...draft,answers,preparedAt:null}}]);
      await refresh();signalProgress();state.editor=null;location.hash='profesor';notify('Tarea guardada en este dispositivo. Descarga el contenido y actualízalo en GitHub para compartirla.');
    });
  }
  if(form.id==='review-form') {
    const values=new FormData(form),score=Number(values.get('score')),feedback=String(values.get('feedback')||''),id=form.dataset.id;
    enqueue(async()=>{if(!Number.isFinite(score)||score<0||score>20)throw new Error('La nota debe estar entre 0 y 20.');const review={...state.reviews.find(r=>r.id===id),score,feedback};await put('reviews',review);await refresh();state.review=review;notify('Revisión guardada en este dispositivo.');});
  }
});
let progressChannel;
try{if(typeof BroadcastChannel==='function')progressChannel=new BroadcastChannel('fernando-progress');}catch{}
function signalProgress(){try{progressChannel?.postMessage({type:'progress-updated'});}catch{}}
function refreshParentsFromStorage(){
  if(location.hash!=='#padres'||!state.storage)return;
  enqueue(async()=>{
    await refresh();if(location.hash!=='#padres')return;
    const opened=[...app.querySelectorAll('[data-parent-task][open]')].map(element=>element.dataset.parentTask);
    route();for(const element of app.querySelectorAll('[data-parent-task]'))element.open=opened.includes(element.dataset.parentTask);
  });
}
progressChannel?.addEventListener('message',event=>{if(event.data?.type==='progress-updated')refreshParentsFromStorage();});
window.addEventListener('focus',refreshParentsFromStorage);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshParentsFromStorage();});
window.addEventListener('hashchange',()=>enqueue(async()=>{if(location.hash==='#padres'&&state.storage)await refresh();route(true);}));
window.addEventListener('beforeunload',event=>{if(state.editor||state.pending){event.preventDefault();event.returnValue='';}});
async function init() {
  try {
    const response=await fetch(new URL('./data/course.json',import.meta.url),{cache:'no-cache'});
    if(!response.ok)throw new Error('No se pudo cargar el curso. Vuelve a cargar la página.');
    const content=await response.json();
    const driveResponse=await fetch(new URL('./data/drive.json',import.meta.url),{cache:'no-cache'});
    if(!driveResponse.ok)throw new Error('No se pudo cargar la configuración de Drive.');
    state.drive=await driveResponse.json();
    state.course=publicCourse(content,content.tasks);state.tasks=state.course.tasks;
    try{await openDatabase();await refresh();}catch(error){state.storage=false;notify(`Puedes leer el curso, pero no guardar respuestas o archivos. ${storageError(error)}`,true);}
    route();
  }catch(error){app.innerHTML='<section class="panel"><h1>No pudimos abrir el aula.</h1><p>Comprueba tu conexión y vuelve a cargar esta página.</p></section>';notify(storageError(error),true);}
}
init();
