import {html as h,answerCount} from './model.js';

export function preparationOutline(course) {
  const chapters=course.courses[0].chapters;
  return `<section class="preparation-plan"><div class="section-heading"><h2>Tu ruta de preparación</h2><span>${chapters.length} unidades · 1 disponible</span></div><p class="plan-intro">Empezamos por una base sólida. Las siguientes unidades se incorporarán a medida que avancemos en clase.</p><div class="chapter-list">${chapters.map(chapter=>`<${chapter.status==='active'?'a':'div'} ${chapter.status==='active'?'href="#curso"':''} class="chapter-row ${chapter.status==='active'?'available':''}"><span class="chapter-number">${String(chapter.number).padStart(2,'0')}</span><div><h2>${h(chapter.title)}</h2><p>${h(chapter.description)}</p></div><span class="badge ${chapter.status==='active'?'prepared':''}">${chapter.status==='active'?'Teoría + 30 retos':'Próximamente'}</span></${chapter.status==='active'?'a':'div'}>`).join('')}</div></section>`;
}

export function competitionHome(course,drafts,learned) {
  const tasks=course.tasks.filter(t=>t.published),answers=tasks.reduce((sum,task)=>sum+answerCount(task,drafts.find(d=>d.id===task.id)?.answers),0);
  const total=tasks.reduce((sum,task)=>sum+task.questions.length,0),preparation=course.preparation;
  return `<div class="page-heading"><div><p class="eyebrow">4.º DE PRIMARIA · PREPARACIÓN PARA CONCURSOS</p><h1>Hola, Josué.</h1><p>Observa, piensa y descubre tu propia estrategia.</p></div></div>
  <section class="welcome-panel competition-welcome"><div><span class="eyebrow">TU PRIMER ENTRENAMIENTO</span><h2>Los grandes retos<br>empiezan paso a paso.</h2><p>Unidad 1 · ${h(course.lesson.title)}</p><div class="button-row"><a class="button" href="#curso">Repasar la teoría →</a><a class="button secondary" href="#tareas">Resolver mis retos</a></div></div><div class="grade-mark" aria-hidden="true"><strong>4.º</strong><span>PRIMARIA</span></div></section>
  <div class="preparation-stats"><div><strong>${answers} / ${total}</strong><span>Respuestas marcadas</span></div><div><strong>${learned.length} / ${course.lesson.topics.length}</strong><span>Temas repasados</span></div><div><strong>3 niveles</strong><span>Básico · Intermedio · Avanzado</span></div></div>
  <section class="panel"><h2>Una buena estrategia vale mucho.</h2><p>${h(preparation.intro)}</p><div class="practice-routine">${preparation.routine.map((step,i)=>`<div><span>${i+1}</span><h3>${h(step.title)}</h3><p>${h(step.text)}</p></div>`).join('')}</div></section>
  ${preparationOutline(course)}
  <section class="competition-references"><div class="section-heading"><h2>Concursos de referencia</h2><span>Perú · Primaria</span></div><p class="plan-intro">Practicaremos con problemas propios del aula. Consulta en cada organizador las bases y las próximas convocatorias.</p><div class="competition-cards">${preparation.competitions.map(competition=>{let url;try{url=new URL(competition.url);if(url.protocol!=='https:')return '';}catch{return '';}return `<article class="panel"><h3>${h(competition.name)}</h3><p class="competition-category">${h(competition.category)}</p><p>${h(competition.description)}</p><a href="${h(url.href)}" target="_blank" rel="noopener noreferrer">${h(competition.linkLabel)} ↗</a></article>`;}).join('')}</div></section>`;
}
