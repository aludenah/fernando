import {html as h} from './html.js';

export const student=Object.freeze({id:'fernando',name:'Fernando'});
export const activities=Object.freeze([
  Object.freeze({id:'matrices',title:'Construcción de matrices',description:'Interpreta la regla de correspondencia y construye cinco matrices.',detail:'Reglas simples y por condiciones',icon:'matrix'}),
]);
const matrixIcon=()=>`<svg width="78" height="70" viewBox="0 0 78 70" fill="none" aria-hidden="true"><path d="M14 8H7V62H14M64 8H71V62H64" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><rect x="21" y="17" width="13" height="13" rx="3" fill="currentColor" opacity=".9"/><rect x="44" y="17" width="13" height="13" rx="3" fill="currentColor" opacity=".25"/><rect x="21" y="40" width="13" height="13" rx="3" fill="currentColor" opacity=".25"/><rect x="44" y="40" width="13" height="13" rx="3" fill="currentColor" opacity=".9"/></svg>`;
export function landingView(search='') {
  const params=new URLSearchParams(search);params.set('alumno',student.id);
  return `<section class="access-intro"><span class="access-label">EL AULA DEL PROFESOR ALEX</span><h1>Una actividad.<br>Un nuevo reto.</h1><p>Elige tu nombre para ingresar.</p></section><div class="access-cards single-access"><a class="access-card student" href="?${h(params.toString())}#actividades"><span class="access-symbol student-letter" aria-hidden="true">F</span><span class="eyebrow">TU ESPACIO PARA APRENDER</span><h2>Fernando</h2><p>Entra a tus aplicaciones y aprende resolviendo.</p><span class="access-cta">Ingresar como Fernando <span aria-hidden="true">→</span></span></a></div>`;
}
export function activitiesView() {
  return `<div class="audience-bar"><span class="audience-badge">FERNANDO</span><a href="#inicio">Volver al inicio</a></div><section class="activities-home"><header class="page-heading"><div><p class="eyebrow">TU ESPACIO DE APRENDIZAJE</p><h1>Hola, Fernando.</h1><p>Elige una aplicación para empezar.</p></div></header><div class="activity-cards">${activities.map(activity=>`<a class="activity-card" href="#${h(activity.id)}"><span class="activity-icon">${matrixIcon()}</span><span class="eyebrow">MATEMÁTICAS</span><h2>${h(activity.title)}</h2><p>${h(activity.description)}</p><small>${h(activity.detail)}</small><span class="activity-open">Abrir aplicación <span aria-hidden="true">→</span></span></a>`).join('')}</div></section>`;
}
