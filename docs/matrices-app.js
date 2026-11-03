import {html as h} from './model.js';
import {math as m} from './math.js';
import {accessView} from './family-views.js?v=matrices-1';
import {studentLink} from './students.js';
import {createStudentStore} from './store.js?v=sync-1';
import {createProgressSync,appsScriptTransport} from './sync.js?v=matrices-1';
import {matrixRules,validateMatrixCourse,cellsFor,cellKey,matrixValue,checkMatrix,restoreMatrixWork} from './matrices.js';

const tex = value => m(`\\(${value}\\)`);
const orders = ['2x2','2x3','3x2','3x3'];
const orderName = exercise => `${exercise.rows} × ${exercise.columns}`;

export async function mountMatrixApp({doc=document,win=window,store=createStudentStore('fernando'),fetcher=globalThis.fetch}={}) {
  const root=doc.querySelector('#app'),message=doc.querySelector('#message'),syncBox=doc.querySelector('#sync-status');
  const disposers=[];
  const listen=(target,type,handler)=>{target.addEventListener(type,handler);disposers.push(()=>target.removeEventListener(type,handler));};
  let course,exercises,work,shared,storage=true,busy=false,started=false,destroyed=false,channel;
  let learned=new Set(),active={i:1,j:1},saveQueue=Promise.resolve();
  let syncStatus={enabled:false,phase:'loading',pending:0,lastSyncedAt:null};
  function notify(text) {message.textContent=text;message.className=text?'message error':'';message.setAttribute('role','alert');}
  const current=()=>exercises.find(exercise=>exercise.id===work.current)||exercises[0];
  const entryFor=exercise=>work.entries[exercise.id]||(work.entries[exercise.id]={answers:{},attempts:0,checked:false,solved:false});
  const solved=exercise=>learned.has(exercise.id)||entryFor(exercise).solved;
  const completed=()=>exercises.filter(solved).length;
  const filtered=()=>exercises.filter(exercise=>work.filter==='all'||`${exercise.rows}x${exercise.columns}`===work.filter);
  const isParent=()=>win.location.hash.slice(1).split('/')[0]==='padres';
  const isHome=()=>['inicio',''].includes(win.location.hash.slice(1))&&!(!win.location.hash&&new URLSearchParams(win.location.search).get('alumno')==='fernando');

  async function readLearned() {
    const settings=await store.all('settings');
    learned=new Set((settings.find(value=>value.id==='learned')?.topics||[]).filter(id=>exercises.some(exercise=>exercise.id===id)));
  }
  function saveWork() {
    if(!storage)return Promise.resolve();
    const snapshot=structuredClone(work);
    saveQueue=saveQueue.then(()=>store.update(['settings'],settings=>{
      const previous=restoreMatrixWork(settings.settings.find(value=>value.id===snapshot.id),exercises);
      const value={...snapshot,entries:{...previous.entries,...snapshot.entries}};
      return {operations:[{store:'settings',value}],result:null};
    })).catch(()=>{storage=false;notify('No se pudo guardar en este navegador. Puedes seguir practicando; mantén esta pestaña abierta.');updateSync();});
    return saveQueue;
  }
  function updateSync() {
    if(destroyed||!syncBox)return;
    syncBox.hidden=isHome();
    const needsActivation=syncStatus.catalogChecked&&(syncStatus.unsupportedFields||[]).length>0;
    const labels={loading:'Preparando el guardado…',unconfigured:'Tu práctica se guarda en este dispositivo.',pending:'Avance guardado en este dispositivo · Pendiente de sincronizar.',syncing:'Sincronizando las matrices resueltas…',synced:'Matrices resueltas sincronizadas. Las casillas pendientes se conservan en este dispositivo.',offline:'Sin conexión con el avance compartido. Puedes seguir practicando en este dispositivo.','activation-required':'Las matrices se guardan en este dispositivo. Su sincronización está pendiente de activación.'};
    const phase=!storage?'offline':needsActivation&&['synced','activation-required'].includes(syncStatus.phase)?'activation-required':syncStatus.phase;
    syncBox.dataset.phase=phase;
    syncBox.querySelector('span').textContent=!storage?'Puedes practicar; el guardado en este navegador no está disponible.':labels[phase]||labels.loading;
    syncBox.querySelector('button').hidden=!shared?.enabled||!storage;
    const footer=doc.querySelector('#storage-footer');
    if(footer)footer.textContent='Fernando · Construcción de matrices';
  }
  function audience(parent=false) {
    return `<div class="audience-bar"><span class="audience-badge">${parent?'ACCESO A PADRES':'ACCESO DE FERNANDO'}</span><a href="#inicio">Cambiar de acceso</a></div>`;
  }
  function progressMarkup() {
    return `<div class="mx-progress-copy"><span>Tu recorrido</span><strong data-mx-counter>${completed()} de ${exercises.length} matrices resueltas</strong></div><progress data-mx-progress value="${completed()}" max="${exercises.length}" aria-label="Matrices resueltas"></progress>`;
  }
  function updateCounters() {
    const count=root.querySelector('[data-mx-counter]');if(count)count.textContent=`${completed()} de ${exercises.length} matrices resueltas`;
    const progress=root.querySelector('[data-mx-progress]');if(progress)progress.value=completed();
  }
  function feedbackFor(exercise) {
    const entry=entryFor(exercise);
    if(solved(exercise))return '<div class="mx-feedback is-success"><strong>✓ ¡Matriz correcta!</strong><p>Todos los elementos cumplen la regla. Ya puedes pasar al siguiente problema.</p></div>';
    if(!entry.checked)return '<p class="mx-feedback-idle">Completa la matriz y pulsa «Verificar matriz».</p>';
    const result=checkMatrix(exercise,entry.answers);
    if(!result.complete)return `<div class="mx-feedback is-warning"><strong>${result.missing?`Falta completar ${result.missing===1?'una casilla':`${result.missing} casillas`}.`:'Revisa cómo escribiste los números.'}</strong><p>Escribe un número en cada casilla. Puedes usar el signo menos para los valores negativos.</p></div>`;
    return `<div class="mx-feedback is-error"><strong>${result.correct} de ${result.total} elementos correctos.</strong><p>Revisa las casillas con ×. Las que tienen ✓ ya están bien. Vuelve a verificar después de corregir.</p></div>`;
  }
  function cellMarkup(exercise,cell) {
    const entry=entryFor(exercise),done=solved(exercise);
    const value=done?String(matrixValue(exercise,cell.i,cell.j)):entry.answers[cell.key]||'';
    return `<label class="mx-cell" data-cell="${cell.key}"><span class="sr-only">Elemento a${cell.i}${cell.j}. Fila ${cell.i}, columna ${cell.j}</span><span class="mx-cell-index" aria-hidden="true">a<sub>${cell.i}${cell.j}</sub></span><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" maxlength="24" data-mx-input="${cell.key}" data-i="${cell.i}" data-j="${cell.j}" value="${h(value)}" aria-describedby="mx-cell-help mx-feedback" ${done?'readonly':''}><span class="mx-cell-status" aria-hidden="true"></span></label>`;
  }
  function practiceView() {
    const exercise=current(),list=filtered(),index=list.findIndex(value=>value.id===exercise.id),done=solved(exercise),rule=matrixRules[exercise.rule];
    active={i:1,j:1};
    return `${audience()}<section class="matrix-app"><header class="mx-heading"><div><p class="eyebrow">EL AULA DE FERNANDO · ÁLGEBRA</p><h1>Construye la matriz.</h1><p>Una regla. Cada posición. Tu respuesta.</p></div>${doc.fullscreenEnabled!==false&&typeof doc.documentElement.requestFullscreen==='function'?'<button type="button" class="button secondary mx-fullscreen" data-mx-action="fullscreen" aria-label="Abrir o salir de pantalla completa">⛶ <span>Pantalla completa</span></button>':''}</header>
      <div class="mx-progress">${progressMarkup()}</div>
      <div class="mx-layout"><aside class="mx-instructions panel"><span class="mx-step-label">01 · LEE LA INDICACIÓN</span><h2>Problema ${exercises.indexOf(exercise)+1}</h2><p>Construye la matriz ${tex(`A=(a_{ij})_{${exercise.rows}\\times${exercise.columns}}`)} definida por:</p><div class="mx-rule" data-rule>${tex(`a_{ij}=${rule.tex}`)}</div><div class="mx-dimensions"><strong>${orderName(exercise)}</strong><span>${exercise.rows} filas y ${exercise.columns} columnas</span></div><div class="mx-index-guide"><p><span class="mx-i">i</span><span>Indica la <strong>fila</strong>, de 1 a ${exercise.rows}.</span></p><p><span class="mx-j">j</span><span>Indica la <strong>columna</strong>, de 1 a ${exercise.columns}.</span></p></div><p class="mx-reminder">En cada casilla, reemplaza ${tex('i')} y ${tex('j')} por su posición y calcula.</p><label class="mx-order-label" for="mx-order">Tamaño para practicar</label><select id="mx-order">${[['all','Todos los tamaños'],...orders.map(value=>[value,value.replace('x',' × ')])].map(([value,label])=>`<option value="${value}" ${work.filter===value?'selected':''}>${label}</option>`).join('')}</select></aside>
      <section class="mx-work panel" aria-labelledby="mx-work-heading"><div class="mx-work-heading"><div><span class="mx-step-label">02 · COMPLETA Y COMPRUEBA</span><h2 id="mx-work-heading" tabindex="-1">Completa cada casilla.</h2></div><span class="mx-order-badge">${orderName(exercise)}</span></div><form id="mx-form" novalidate><div class="mx-matrix-space"><span class="mx-matrix-letter" aria-hidden="true">A =</span><div class="mx-grid" style="--mx-columns:${exercise.columns}"><span class="mx-grid-corner" aria-hidden="true">i ↓ · j →</span>${Array.from({length:exercise.columns},(_,j)=>`<span class="mx-column-label" data-mx-column="${j+1}">j = ${j+1}</span>`).join('')}${Array.from({length:exercise.rows},(_,row)=>`<span class="mx-row-label" data-mx-row="${row+1}">i = ${row+1}</span>${cellsFor(exercise).filter(cell=>cell.i===row+1).map(cell=>cellMarkup(exercise,cell)).join('')}`).join('')}</div></div>
      <div id="mx-cell-help" class="mx-cell-help"><div class="mx-position"></div><p class="mx-substitution"></p></div><div class="mx-input-note"><span>Puedes escribir números negativos.</span><button type="button" class="mx-sign-button" data-mx-action="negative" ${done?'disabled':''} aria-label="Cambiar el signo de la casilla seleccionada">− / +</button></div><div id="mx-feedback" role="status" aria-live="polite" aria-atomic="true">${feedbackFor(exercise)}</div><div class="mx-actions"><button class="button mx-verify" type="submit" ${done?'disabled':''}>Verificar matriz <span aria-hidden="true">✓</span></button><button class="button secondary mx-next" type="button" data-mx-action="next" ${!done||completed()===exercises.length&&index===list.length-1?'disabled':''}>${index===list.length-1&&work.filter!=='all'?'Otros tamaños':'Siguiente problema'} <span aria-hidden="true">→</span></button></div></form><div class="mx-work-bottom"><button type="button" data-mx-action="previous" ${index<=0?'disabled':''}>← Anterior</button><span>${index+1} de ${list.length} problemas${work.filter==='all'?'':` · ${work.filter.replace('x',' × ')}`}</span></div>${completed()===exercises.length?'<div class="mx-all-done"><strong>¡Completaste los 20 problemas!</strong><p>Recorre las matrices anteriores para repasar lo que construiste.</p></div>':''}</section></div></section>`;
  }
  function parentView() {
    const sharedText=shared?.enabled&&syncStatus.lastSyncedAt?'Las matrices resueltas se consultan en el avance compartido.':'Se muestra el avance disponible en este dispositivo.';
    return `${audience(true)}<nav class="profile-tabs" aria-label="Elegir hijo"><a href="${h(studentLink('fernando','padres',win.location.search))}" aria-current="page">Fernando</a><a href="${h(studentLink('josue','padres',win.location.search))}">Josué</a></nav><section class="matrix-app mx-parent"><div class="page-heading"><div><p class="eyebrow">ACOMPAÑANDO SU APRENDIZAJE</p><h1>Las matrices de Fernando.</h1><p>Construcción de matrices a partir de sus índices.</p></div></div><section class="panel mx-parent-summary"><div><span>Matrices resueltas correctamente</span><strong id="parent-matrices">${completed()} <small>/ ${exercises.length}</small></strong><p>${sharedText}</p></div><button type="button" class="button secondary" data-mx-action="refresh">Actualizar avance</button><div class="mx-progress">${progressMarkup()}</div></section><div class="mx-parent-orders">${orders.map(order=>{const list=exercises.filter(exercise=>`${exercise.rows}x${exercise.columns}`===order);return `<article class="panel"><h2>${order.replace('x',' × ')}</h2><strong>${list.filter(solved).length} / ${list.length}</strong><p>Matrices resueltas</p></article>`;}).join('')}</div><section class="panel"><div class="section-heading"><h2>Recorrido de práctica</h2><span>${exercises.length} problemas</span></div><div class="mx-parent-list">${exercises.map((exercise,index)=>`<div class="mx-parent-row"><span class="mx-parent-number">${String(index+1).padStart(2,'0')}</span><div><strong>Construir una matriz ${orderName(exercise)}</strong><span>${tex(`a_{ij}=${matrixRules[exercise.rule].tex}`)}</span></div><span class="mx-result-badge ${solved(exercise)?'is-solved':''}">${solved(exercise)?'✓ Resuelta':'Pendiente'}</span></div>`).join('')}</div></section></section>`;
  }
  function decorate() {
    const exercise=current(),entry=entryFor(exercise),result=checkMatrix(exercise,entry.answers),done=solved(exercise);
    for(const input of root.querySelectorAll('[data-mx-input]')) {
      const cell=result.cells.find(value=>value.key===input.dataset.mxInput);
      const status=done?'correct':entry.checked?(result.complete?(cell.correct?'correct':'incorrect'):!cell.valid?'missing':''):'';
      input.closest('.mx-cell').dataset.result=status;
      input.setAttribute('aria-invalid',String(status==='incorrect'||status==='missing'));
      input.closest('.mx-cell').querySelector('.mx-cell-status').textContent=status==='correct'?'✓':status==='incorrect'?'×':status==='missing'?'!':'';
    }
    updateHelp(active.i,active.j);
  }
  function updateHelp(i,j) {
    active={i,j};
    const help=root.querySelector('#mx-cell-help');if(!help)return;
    for(const label of root.querySelectorAll('[data-mx-row]'))label.classList.toggle('is-active',Number(label.dataset.mxRow)===i);
    for(const label of root.querySelectorAll('[data-mx-column]'))label.classList.toggle('is-active',Number(label.dataset.mxColumn)===j);
    for(const cell of root.querySelectorAll('.mx-cell'))cell.classList.toggle('is-active',cell.dataset.cell===cellKey(i,j));
    help.querySelector('.mx-position').innerHTML=`<strong>${tex(`a_{${i}${j}}`)}</strong><span class="mx-i-text">Fila i = ${i}</span><span class="mx-j-text">Columna j = ${j}</span>`;
    help.querySelector('.mx-substitution').innerHTML=tex(`a_{${i}${j}}:\\quad ${matrixRules[current().rule].at(i,j)}`);
    const sign=root.querySelector('[data-mx-action="negative"]');if(sign)sign.setAttribute('aria-label',`Cambiar el signo de a${i}${j}, fila ${i}, columna ${j}`);
  }
  function render(focus=false) {
    if(destroyed)return;
    const home=isHome();
    root.innerHTML=home?accessView(win.location.search):isParent()?parentView():practiceView();
    if(!home&&!isParent())decorate();
    updateSync();
    if(!home&&!started&&shared&&storage){started=true;void shared.sync();}
    if(focus){const heading=root.querySelector('#mx-work-heading,h1');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
  }
  async function verify(event) {
    event.preventDefault();if(busy||solved(current()))return;
    const exercise=current(),entry=entryFor(exercise),result=checkMatrix(exercise,entry.answers);
    entry.checked=true;
    if(result.complete)entry.attempts++;
    busy=true;const button=root.querySelector('.mx-verify');button.disabled=true;
    if(result.solved)entry.solved=true;
    await saveWork();
    if(result.solved&&shared&&storage) {
      try{await shared.saveTopic(exercise.id,true);await readLearned();channel?.postMessage({type:'matrices-updated'});void shared.sync();}
      catch{notify('La matriz está correcta. Su envío quedó pendiente; vuelve a sincronizar cuando recuperes la conexión.');}
    }
    busy=false;
    if(destroyed||isHome()||isParent())return;
    root.querySelector('#mx-feedback').innerHTML=feedbackFor(exercise);
    decorate();updateCounters();
    root.querySelector('.mx-verify').disabled=result.solved;
    root.querySelector('.mx-next').disabled=!result.solved||completed()===exercises.length&&filtered().at(-1)?.id===exercise.id;
    root.querySelector('[data-mx-action="negative"]').disabled=result.solved;
    for(const input of root.querySelectorAll('[data-mx-input]'))input.readOnly=result.solved;
    if(result.solved) {
      const next=root.querySelector('.mx-next');if(!next.disabled)next.focus();
      if(completed()===exercises.length&&!root.querySelector('.mx-all-done'))root.querySelector('.mx-work').insertAdjacentHTML('beforeend','<div class="mx-all-done"><strong>¡Completaste los 20 problemas!</strong><p>Recorre las matrices anteriores para repasar lo que construiste.</p></div>');
    } else {
      const cell=result.cells.find(value=>result.complete?!value.correct:!value.valid);
      root.querySelector(`[data-mx-input="${cell.key}"]`)?.focus();
    }
  }
  function editInput(input) {
    if(solved(current()))return;
    const entry=entryFor(current());
    entry.answers[input.dataset.mxInput]=input.value;entry.checked=false;
    root.querySelector('#mx-feedback').innerHTML=feedbackFor(current());
    decorate();void saveWork();
  }
  async function action(event) {
    const button=event.target.closest('[data-mx-action]');if(!button||button.disabled||busy)return;
    const name=button.dataset.mxAction;
    if(name==='fullscreen') {
      try{if(doc.fullscreenElement)await doc.exitFullscreen();else await doc.querySelector('#main').requestFullscreen();}
      catch{notify('No se pudo abrir la pantalla completa en este navegador.');}
      return;
    }
    if(name==='refresh'){if(storage){await saveQueue;await readLearned();render();if(shared)void shared.sync();}return;}
    if(name==='negative') {
      const input=root.querySelector(`[data-mx-input="${cellKey(active.i,active.j)}"]`);if(!input||input.readOnly)return;
      input.value=input.value.startsWith('-')?input.value.slice(1):'-'+input.value.replace(/^\+/,'');editInput(input);input.focus();return;
    }
    const list=filtered(),index=list.findIndex(exercise=>exercise.id===work.current);
    if(name==='previous'&&index>0)work.current=list[index-1].id;
    else if(name==='next'&&solved(current())) {
      if(index<list.length-1)work.current=list[index+1].id;
      else {work.filter='all';work.current=(exercises.find(exercise=>!solved(exercise))||exercises[0]).id;}
    } else return;
    await saveWork();render(true);
  }
  try {
    const response=await fetcher(new URL('./data/course.json',import.meta.url),{cache:'no-cache'});
    if(!response.ok)throw new Error('No se pudo cargar la práctica.');
    course=validateMatrixCourse(await response.json());exercises=course.matrixPractice.exercises;
    try{await store.openDatabase();const settings=await store.all('settings');work=restoreMatrixWork(settings.find(value=>value.id==='matrices-practice-v1'),exercises);await readLearned();}
    catch{storage=false;work=restoreMatrixWork(null,exercises);notify('El navegador no permite guardar. Puedes practicar mientras mantengas abierta esta pestaña.');}
    if(!filtered().some(exercise=>exercise.id===work.current))work.current=filtered()[0].id;
    let transport=null;
    try{const response=await fetcher(new URL('./data/sync.json',import.meta.url),{cache:'no-store'});if(response.ok){const config=await response.json();if(config.endpoint)transport=appsScriptTransport(config.endpoint,fetcher);}}catch{}
    if(storage) {
      shared=createProgressSync({studentId:'fernando',course,store,transport,recordId:'matrices-cloud-sync-v1',uuid:()=>win.crypto?.randomUUID?.()||`matrix-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,onStatus:value=>{syncStatus=value;updateSync();},onChange:async()=>{
        if(destroyed)return;
        const wasSolved=learned.has(work.current);await readLearned();if(destroyed)return;
        // A background read must not replace the matrix or steal a typing focus.
        if(isParent()||!busy&&!wasSolved&&learned.has(work.current))render();else updateCounters();
      }});
      await shared.initialize();
      for(const exercise of exercises.filter(value=>entryFor(value).solved&&!learned.has(value.id)))await shared.saveTopic(exercise.id,true);
      try{if(typeof win.BroadcastChannel==='function'){channel=new win.BroadcastChannel('fernando-matrices');listen(channel,'message',async()=>{await readLearned();if(isParent())render();else updateCounters();});}}catch{}
    } else syncStatus={enabled:false,phase:'unconfigured'};
    listen(root,'click',event=>{void action(event);});
    listen(root,'submit',event=>{if(event.target.id==='mx-form')void verify(event);});
    listen(root,'input',event=>{if(event.target.matches('[data-mx-input]'))editInput(event.target);});
    listen(root,'focusin',event=>{if(event.target.matches('[data-mx-input]'))updateHelp(Number(event.target.dataset.i),Number(event.target.dataset.j));});
    listen(root,'keydown',event=>{
      if(!event.target.matches('[data-mx-input]')||!['ArrowUp','ArrowDown','Enter'].includes(event.key))return;
      const inputs=[...root.querySelectorAll('[data-mx-input]')],index=inputs.indexOf(event.target);
      const next=event.key==='ArrowUp'?index-current().columns:event.key==='ArrowDown'?index+current().columns:index+1;
      if(inputs[next]){event.preventDefault();inputs[next].focus();}
    });
    listen(root,'change',event=>{if(event.target.id==='mx-order'&&!busy){work.filter=event.target.value;work.current=(filtered().find(exercise=>!solved(exercise))||filtered()[0]).id;void saveWork();render(true);}});
    listen(win,'hashchange',()=>render(true));
    const refresh=()=>{if(!isHome()&&storage&&doc.visibilityState!=='hidden')void shared?.sync();};
    listen(win,'online',refresh);listen(win,'focus',refresh);listen(doc,'visibilitychange',refresh);
    const syncButton=syncBox?.querySelector('button');if(syncButton)listen(syncButton,'click',refresh);
    listen(doc,'fullscreenchange',()=>{const text=root.querySelector('.mx-fullscreen span');if(text)text.textContent=doc.fullscreenElement?'Salir de pantalla completa':'Pantalla completa';});
    const interval=win.setInterval(refresh,30000);disposers.push(()=>win.clearInterval(interval));
    render();
  } catch(error) {
    root.innerHTML='<section class="panel"><h1>No pudimos abrir la práctica.</h1><p>Comprueba tu conexión y vuelve a cargar la página.</p></section>';notify(error.message);
  }
  return {destroy(){destroyed=true;for(const dispose of disposers)dispose();channel?.close();},flush:()=>saveQueue};
}
