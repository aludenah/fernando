import {math as m} from './math.js';
import {html as h} from './model.js';
import {gradeTask} from './grading.js';

export const scoreText=value=>value.toLocaleString('es-PE',{maximumFractionDigits:1});
const letters='ABCDE';

export function gradeSummary(task,answers,{interactive=true}={}) {
  const grade=gradeTask(task,answers);
  if(!grade)return '';
  const mistakes=grade.results.filter(q=>!q.correct);
  return `<section class="panel grade-summary" data-grade-task="${h(task.id)}" aria-labelledby="grade-heading-${h(task.id)}"><div class="grade-header"><div><p class="eyebrow">TAREA CALIFICADA</p><h2 id="grade-heading-${h(task.id)}" class="grade-heading" tabindex="-1">${grade.incorrect?'Revisa y aprende de tus respuestas.':'¡Todas tus respuestas son correctas!'}</h2></div><div class="grade-score" aria-label="Nota: ${scoreText(grade.score)} de 20"><strong>${scoreText(grade.score)}</strong><span>/ 20</span></div></div><div class="grade-stats"><span><strong>${grade.correct} de ${grade.total}</strong> correctas</span><span><strong>${grade.incorrect}</strong> por repasar</span><span><strong>${grade.percent}%</strong> de aciertos</span></div>${mistakes.length?`<p><strong>Preguntas por repasar:</strong> ${mistakes.map(q=>interactive?`<button type="button" class="review-question-link" data-action="question-go" data-id="${q.number-1}">Pregunta ${q.number}</button>`:h(q.number)).join(interactive?' ':', ')}.</p>`:'<p>Ya puedes consultar el desarrollo de cada problema y compararlo con tu procedimiento.</p>'}<p class="source-note">${interactive?'Las respuestas de esta tarea quedan cerradas. Recorre las preguntas para ver tu respuesta, la correcta y el solucionario.':'Calificación automática de las alternativas marcadas al completar esta tarea.'}</p></section>`;
}

// Call only after gradeTask confirms that the entire task is complete.
export function answerReview(question,selected,{open=false}={}) {
  const grading=question.grading,correct=selected===grading.correctIndex;
  return `<section class="answer-review ${correct?'is-correct':'is-incorrect'}" data-result="${correct?'correct':'incorrect'}"><h3>${correct?'✓ Respuesta correcta':'× Respuesta incorrecta'}</h3><p><strong>Respuesta marcada: ${letters[selected]}.</strong> ${m(question.options[selected])}</p>${!correct?`<p><strong>Respuesta correcta: ${letters[grading.correctIndex]}.</strong> ${m(question.options[grading.correctIndex])}</p><p class="review-hint"><strong>Qué repasar:</strong> ${m(grading.hint)}</p>`:''}<details class="solution" ${open?'open':''}><summary>Ver solucionario paso a paso</summary><ol class="solution-steps">${grading.steps.map(step=>`<li>${m(step)}</li>`).join('')}</ol>${grading.topicId?`<a class="solution-theory" href="#curso/${h(grading.topicId)}">Repasar la teoría con ejemplos similares →</a>`:''}</details></section>`;
}

export function workedExamples(topic) {
  if(!topic.examples?.length)return `<div class="worked-example"><strong>Veámoslo paso a paso</strong><p class="prewrap">${m(topic.example)}</p></div>`;
  return `<div class="worked-examples"><h3>Ejemplos resueltos para preparar la tarea</h3>${topic.examples.map(example=>`<article class="worked-example"><div class="example-heading"><h4>${h(example.title)}</h4><span class="badge">${h(example.level)}</span></div><p>${m(example.statement)}</p><ol class="solution-steps">${example.steps.map(step=>`<li>${m(step)}</li>`).join('')}</ol></article>`).join('')}</div>`;
}
