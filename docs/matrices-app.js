import {html as h} from './html.js';
import {math as m} from './math.js';
import {landingView,activitiesView} from './activities.js?v=activities-3';
import {matrixRules,validateMatrixCourse,cellsFor,cellKey,matrixValue,checkMatrix,createMatrixSession} from './matrices.js?v=activities-3';
import {createCompletionReport,reportFilename} from './activity-report.js?v=activities-3';
import {prepareCompletionPdf} from './report-pdf.js?v=activities-3';

const tex=value=>m(`\\(${value}\\)`);
const orderName=exercise=>`${exercise.rows} × ${exercise.columns}`;
export async function mountMatrixApp({doc=document,win=window,fetcher=globalThis.fetch,random=Math.random,now=()=>new Date(),makePdf}={}) {
  const root=doc.querySelector('#app'),message=doc.querySelector('#message'),disposers=[];
  const listen=(target,type,handler)=>{target.addEventListener(type,handler);disposers.push(()=>target.removeEventListener(type,handler));};
  let bank,session,exercises,report,destroyed=false,active={i:1,j:1},generation=0;
  let artifact={phase:'idle',file:null,url:null};
  const stamp=()=>new Date(now()).toISOString();
  const current=()=>exercises.find(exercise=>exercise.id===session.current);
  const entryFor=exercise=>session.entries[exercise.id]||(session.entries[exercise.id]={answers:{},checked:false,attempts:0,firstCorrect:null,solved:false,verifiedAt:null});
  const solved=exercise=>entryFor(exercise).solved;
  const allDone=()=>exercises?.every(solved);
  const view=()=>{
    if(new URLSearchParams(win.location.search).get('alumno')&&new URLSearchParams(win.location.search).get('alumno')!=='fernando')return 'inicio';
    const route=win.location.hash.slice(1).split('/')[0];
    if(route==='matrices')return 'matrices';
    if(['actividades','aplicaciones','cursos'].includes(route))return 'actividades';
    if(!route&&new URLSearchParams(win.location.search).get('alumno')==='fernando')return 'actividades';
    return 'inicio';
  };
  function notify(text,error=false) {message.textContent=text;message.className=text?`message ${error?'error':'success'}`:'';message.setAttribute('role',error?'alert':'status');}
  function start() {
    generation++;if(artifact.url)win.URL.revokeObjectURL(artifact.url);
    artifact={phase:'idle',file:null,url:null};report=null;
    session=createMatrixSession(bank,{random,startedAt:stamp()});exercises=session.exerciseIds.map(id=>bank.find(exercise=>exercise.id===id));
  }
  const audience=()=>'<div class="audience-bar"><a href="#actividades">← Mis aplicaciones</a><span class="audience-badge">FERNANDO</span></div>';
  function feedbackFor(exercise) {
    const entry=entryFor(exercise);
    if(entry.solved)return '<div class="mx-feedback is-success"><strong>✓ ¡Matriz correcta!</strong><p>Todos los elementos cumplen la regla. Ya puedes pasar al siguiente problema.</p></div>';
    if(!entry.checked)return '<p class="mx-feedback-idle">Completa la matriz y pulsa «Verificar matriz».</p>';
    const result=checkMatrix(exercise,entry.answers);
    if(!result.complete)return `<div class="mx-feedback is-warning"><strong>${result.missing?`Falta completar ${result.missing===1?'una casilla':`${result.missing} casillas`}.`:'Revisa cómo escribiste los números.'}</strong><p>Escribe un número en cada casilla.</p></div>`;
    return `<div class="mx-feedback is-error"><strong>${result.correct} de ${result.total} elementos correctos.</strong><p>Revisa las casillas con ×. Las que tienen ✓ ya están bien. Vuelve a verificar después de corregir.</p></div>`;
  }
  function cellMarkup(exercise,cell) {
    const entry=entryFor(exercise);
    return `<label class="mx-cell" data-cell="${cell.key}"><span class="sr-only">Casilla ${(cell.i-1)*exercise.columns+cell.j}</span><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" maxlength="24" data-mx-input="${cell.key}" data-i="${cell.i}" data-j="${cell.j}" value="${h(entry.answers[cell.key]||'')}" aria-describedby="mx-feedback" ${entry.solved?'readonly':''}><span class="mx-cell-status" aria-hidden="true"></span></label>`;
  }
  function practiceView() {
    const exercise=current(),index=exercises.indexOf(exercise),done=solved(exercise);active={i:1,j:1};
    return `${audience()}<section class="matrix-app"><header class="mx-heading"><div><p class="eyebrow">APLICACIÓN DE MATEMÁTICAS</p><h1>Construye la matriz.</h1><p>Una regla. Cada posición. Tu respuesta.</p></div>${doc.fullscreenEnabled!==false&&typeof doc.documentElement.requestFullscreen==='function'?'<button type="button" class="button secondary mx-fullscreen" data-mx-action="fullscreen" aria-label="Abrir o salir de pantalla completa">⛶ <span>Pantalla completa</span></button>':''}</header>
      <div class="mx-layout"><aside class="mx-instructions panel"><span class="mx-step-label">01 · LEE LA INDICACIÓN</span><h2>Problema ${index+1}</h2><p>Construye la matriz ${tex(`A=(a_{ij})_{${exercise.rows}\\times${exercise.columns}}`)} definida por:</p><div class="mx-rule" data-rule>${tex(`a_{ij}=${matrixRules[exercise.rule].tex}`)}</div><div class="mx-dimensions"><strong>${orderName(exercise)}</strong><span>${exercise.rows} filas y ${exercise.columns} columnas</span></div></aside>
      <section class="mx-work panel" aria-labelledby="mx-work-heading"><div class="mx-work-heading"><div><span class="mx-step-label">02 · COMPLETA Y COMPRUEBA</span><h2 id="mx-work-heading" tabindex="-1">Completa cada casilla.</h2></div><span class="mx-order-badge">${orderName(exercise)}</span></div><form id="mx-form" novalidate><div class="mx-matrix-space"><span class="mx-matrix-letter" aria-hidden="true">A =</span><div class="mx-grid" style="--mx-columns:${exercise.columns}">${cellsFor(exercise).map(cell=>cellMarkup(exercise,cell)).join('')}</div></div>
      <div class="mx-input-note"><span>Puedes escribir números negativos.</span><button type="button" class="mx-sign-button" data-mx-action="negative" ${done?'disabled':''} aria-label="Cambiar el signo de la casilla seleccionada">− / +</button></div><div id="mx-feedback" role="status" aria-live="polite" aria-atomic="true">${feedbackFor(exercise)}</div><div class="mx-actions"><button class="button mx-verify" type="submit" ${done?'disabled':''}>Verificar matriz <span aria-hidden="true">✓</span></button><button class="button secondary mx-next" type="button" data-mx-action="next" ${!done?'disabled':''}>Siguiente problema <span aria-hidden="true">→</span></button></div></form><div class="mx-work-bottom"><button type="button" data-mx-action="previous" ${index<=0?'disabled':''}>← Anterior</button><span>Problema ${index+1} de 5</span></div></section></div></section>`;
  }
  function canShare() {
    try{return artifact.phase==='ready'&&Boolean(win.navigator.share&&win.navigator.canShare?.({files:[artifact.file]}));}catch{return false;}
  }
  function reportControls() {
    if(artifact.phase==='ready')return `<div class="button-row"><a class="button" data-mx-action="download-report" href="${h(artifact.url)}" download="${h(artifact.file.name)}">Descargar PDF ↓</a>${canShare()?'<button type="button" class="button secondary" data-mx-action="share-report">Compartir PDF ↗</button>':''}</div><p class="receipt-delivery-note">Guarda el PDF antes de cerrar esta página. Adjúntalo a un mensaje de WhatsApp o a un correo para tu profesor.</p>`;
    if(artifact.phase==='error')return '<p class="receipt-error">No se pudo preparar el PDF. Tus respuestas siguen aquí.</p><button type="button" class="button" data-mx-action="retry-report">Intentar de nuevo</button>';
    return '<p class="receipt-loading" role="status">Preparando tu comprobante PDF…</p>';
  }
  function completionView() {
    return `${audience()}<section class="matrix-app receipt-view"><header class="mx-heading"><div><p class="eyebrow">CONSTRUCCIÓN DE MATRICES</p><h1>¡Actividad terminada!</h1><p>Las cinco matrices están correctas, Fernando.</p></div><span class="receipt-check" aria-hidden="true">✓</span></header><section class="panel receipt-panel"><span class="mx-step-label">TU COMPROBANTE</span><h2>Listo para entregarlo a tu profesor.</h2><p>El reporte incluye las reglas, tus cinco matrices, la fecha y los intentos de verificación.</p><div id="receipt-controls">${reportControls()}</div></section><details class="panel receipt-review"><summary>Ver mis respuestas</summary>${exercises.map(exercise=>`<article class="receipt-answer"><div><h2>Problema ${exercise.problem} · ${orderName(exercise)}</h2><p>${tex(`a_{ij}=${matrixRules[exercise.rule].tex}`)}</p><small>${entryFor(exercise).attempts} ${entryFor(exercise).attempts===1?'intento':'intentos'}</small></div><div class="receipt-matrix" style="--mx-columns:${exercise.columns}" aria-label="Tu matriz del problema ${exercise.problem}">${cellsFor(exercise).map(cell=>`<span>${h(entryFor(exercise).answers[cell.key])}</span>`).join('')}</div></article>`).join('')}</details><div class="receipt-bottom"><a href="#actividades">← Mis aplicaciones</a><button type="button" data-mx-action="restart">Comenzar una práctica nueva</button></div></section>`;
  }
  function decorate() {
    const exercise=current(),entry=entryFor(exercise),result=checkMatrix(exercise,entry.answers);
    for(const input of root.querySelectorAll('[data-mx-input]')){
      const cell=result.cells.find(value=>value.key===input.dataset.mxInput);
      const status=entry.solved?'correct':entry.checked?(result.complete?(cell.correct?'correct':'incorrect'):!cell.valid?'missing':''):'';
      input.closest('.mx-cell').dataset.result=status;input.setAttribute('aria-invalid',String(status==='incorrect'||status==='missing'));
      input.closest('.mx-cell').querySelector('.mx-cell-status').textContent=status==='correct'?'✓':status==='incorrect'?'×':status==='missing'?'!':'';
    }
  }
  function render(focus=false) {
    if(destroyed)return;
    const page=view();
    if(page==='matrices'&&!session)start();
    root.innerHTML=page==='inicio'?landingView(win.location.search):page==='actividades'?activitiesView():allDone()?completionView():practiceView();
    if(page==='matrices'&&!allDone())decorate();
    if(focus){const heading=root.querySelector('#mx-work-heading,h1');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
  }
  async function prepareReport() {
    const token=generation;artifact.phase='preparing';
    const controls=root.querySelector('#receipt-controls');if(controls)controls.innerHTML=reportControls();
    try{
      const bytes=await (makePdf?makePdf(report):prepareCompletionPdf(report,{doc,fetcher}));
      if(destroyed||token!==generation)return;
      const file=new win.File([bytes],reportFilename(report),{type:'application/pdf'});
      artifact={phase:'ready',file,url:win.URL.createObjectURL(file)};
    }catch{if(destroyed||token!==generation)return;artifact.phase='error';}
    const target=root.querySelector('#receipt-controls');if(target)target.innerHTML=reportControls();
  }
  function verify(event) {
    event.preventDefault();const exercise=current(),entry=entryFor(exercise);if(entry.solved)return;
    const result=checkMatrix(exercise,entry.answers);entry.checked=true;
    if(result.complete){entry.attempts++;if(entry.firstCorrect===null)entry.firstCorrect=result.correct;}
    if(result.solved){entry.solved=true;entry.verifiedAt=stamp();}
    if(allDone()){
      session.finishedAt=stamp();report=createCompletionReport(session,exercises);artifact.phase='preparing';render(true);void prepareReport();return;
    }
    render();
    if(result.solved)root.querySelector('.mx-next')?.focus();
    else {const cell=result.cells.find(value=>result.complete?!value.correct:!value.valid);root.querySelector(`[data-mx-input="${cell.key}"]`)?.focus();}
  }
  function editInput(input) {
    const entry=entryFor(current());if(entry.solved)return;
    entry.answers[input.dataset.mxInput]=input.value;entry.checked=false;
    root.querySelector('#mx-feedback').innerHTML=feedbackFor(current());decorate();
  }
  async function action(event) {
    const button=event.target.closest('[data-mx-action]');if(!button||button.disabled)return;
    const name=button.dataset.mxAction;
    if(name==='fullscreen'){
      try{if(doc.fullscreenElement)await doc.exitFullscreen();else await doc.querySelector('#main').requestFullscreen();}catch{notify('No se pudo abrir la pantalla completa en este navegador.',true);}return;
    }
    if(name==='retry-report'){if(report&&artifact.phase==='error')void prepareReport();return;}
    if(name==='download-report'){
      if(artifact.phase!=='ready')return;
      notify('El PDF está listo para adjuntarlo a tu mensaje de WhatsApp o correo.');return;
    }
    if(name==='share-report'){
      if(!canShare())return;
      try{await win.navigator.share({files:[artifact.file],title:'Actividad de Fernando - Matrices',text:'Comprobante de la actividad Construcción de matrices.'});}
      catch(error){if(error.name!=='AbortError')notify('No se pudo abrir la opción de compartir. Descarga el PDF y adjúntalo a tu mensaje.',true);}return;
    }
    if(name==='restart'){start();notify('');render(true);return;}
    if(name==='negative'){
      const input=root.querySelector(`[data-mx-input="${cellKey(active.i,active.j)}"]`);if(!input||input.readOnly)return;
      input.value=input.value.startsWith('-')?input.value.slice(1):'-'+input.value.replace(/^\+/,'');editInput(input);input.focus();return;
    }
    const index=exercises.indexOf(current());
    if(name==='previous'&&index>0)session.current=exercises[index-1].id;
    else if(name==='next'&&solved(current())&&index<4)session.current=exercises[index+1].id;
    else return;
    render(true);
  }
  try{
    const response=await fetcher(new URL('./data/course.json',import.meta.url),{cache:'no-cache'});
    if(!response.ok)throw new Error('No se pudo cargar la aplicación.');
    bank=validateMatrixCourse(await response.json()).matrixPractice.exercises;
    listen(root,'click',event=>{void action(event);});
    listen(root,'submit',event=>{if(event.target.id==='mx-form')verify(event);});
    listen(root,'input',event=>{if(event.target.matches('[data-mx-input]'))editInput(event.target);});
    listen(root,'focusin',event=>{if(event.target.matches('[data-mx-input]'))active={i:Number(event.target.dataset.i),j:Number(event.target.dataset.j)};});
    listen(root,'keydown',event=>{
      if(!event.target.matches('[data-mx-input]')||!['ArrowUp','ArrowDown','Enter'].includes(event.key))return;
      const inputs=[...root.querySelectorAll('[data-mx-input]')],index=inputs.indexOf(event.target);
      const next=event.key==='ArrowUp'?index-current().columns:event.key==='ArrowDown'?index+current().columns:index+1;
      if(inputs[next]){event.preventDefault();inputs[next].focus();}
    });
    listen(win,'hashchange',()=>{notify('');render(true);});
    listen(doc,'fullscreenchange',()=>{const label=root.querySelector('.mx-fullscreen span');if(label)label.textContent=doc.fullscreenElement?'Salir de pantalla completa':'Pantalla completa';});
    render();
  }catch(error){root.innerHTML='<section class="panel"><h1>No pudimos abrir el aula.</h1><p>Comprueba tu conexión y vuelve a cargar la página.</p></section>';notify(error.message,true);}
  return {destroy(){destroyed=true;generation++;for(const dispose of disposers)dispose();if(artifact.url)win.URL.revokeObjectURL(artifact.url);}};
}
