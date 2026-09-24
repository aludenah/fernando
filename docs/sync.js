import {emptyProgress,progressCatalog,validateRemote,validValue} from './sync-protocol.js?v=chapters-2';

const RECORD='cloud-sync-v1';
const stamp=()=>new Date().toISOString();
export function createProgressSync({studentId,course,store,transport=null,onStatus=()=>{},onChange=()=>{},uuid=()=>crypto.randomUUID()}) {
  const catalog=progressCatalog(course);
  const knownFields=Object.keys(catalog);
  // The original deployment only knows the first lesson. Never send new fields
  // until the service advertises them; otherwise it rejects the whole batch.
  const legacy=progressCatalog({...course,additionalLessons:[],tasks:course.tasks.filter(task=>task.chapterId===course.lesson.id)});
  let supported=new Set(Object.keys(legacy));
  let catalogChecked=false;
  let flight=null;
  const enabled=Boolean(transport);
  const status=(phase,record,extra={})=>onStatus({enabled,phase,pending:Object.keys(record?.outbox||{}).length,lastSyncedAt:record?.lastSyncedAt||null,catalogChecked,unsupportedFields:knownFields.filter(field=>!supported.has(field)),...extra});
  const getRecord=snapshot=>snapshot.settings.find(item=>item.id===RECORD);
  const operation=(field,value,record,seed=false)=>({id:uuid(),field,value,baseRevision:record.remote.fields[field]?.revision||0,seed,queuedAt:stamp(),supersedes:record.outbox[field]?[record.outbox[field].id,...(record.outbox[field].supersedes||[])].slice(0,20):[]});
  async function initialize(){
    const record=await store.update(['settings','drafts','tasks'],snapshot=>{
      const existing=getRecord(snapshot);if(existing)return {operations:[],result:existing};
      const record={id:RECORD,remote:emptyProgress(studentId),outbox:{},lastSyncedAt:null};
      for(const draft of snapshot.drafts.filter(draft=>!snapshot.tasks.some(task=>task.id===draft.id)))for(const [questionId,value] of Object.entries(draft.answers||{})){
        const field=`answer:${draft.id}:${questionId}`;
        if(Object.hasOwn(catalog,field)&&validValue(catalog[field],value))record.outbox[field]=operation(field,value,record,true);
      }
      for(const id of snapshot.settings.find(item=>item.id==='learned')?.topics||[]){
        const field=`topic:${id}`;
        if(Object.hasOwn(catalog,field))record.outbox[field]=operation(field,true,record,true);
      }
      return {operations:[{store:'settings',value:record}],result:record};
    });
    status(enabled?'pending':'unconfigured',record);
  }
  function materialize(snapshot,record){
    const drafts=new Map(snapshot.drafts.map(draft=>[draft.id,structuredClone(draft)]));
    const learned=structuredClone(snapshot.settings.find(item=>item.id==='learned')||{id:'learned',topics:[],updatedAt:null});
    const topics=new Set(learned.topics),changedTasks=new Set();
    let theoryChanged=false;
    const fields={...record.remote.fields,...Object.fromEntries(Object.entries(record.outbox).map(([key,op])=>[key,{value:op.value,updatedAt:op.queuedAt}]))};
    for(const [field,spec] of Object.entries(catalog)){
      const entry=fields[field];
      if(spec.kind==='topic'){
        entry?.value?topics.add(spec.topicId):topics.delete(spec.topicId);theoryChanged=true;
        if(entry&&(!learned.updatedAt||entry.updatedAt>learned.updatedAt))learned.updatedAt=entry.updatedAt;
      }else{
        if(snapshot.tasks.some(task=>task.id===spec.taskId))continue;
        if(!entry&&!drafts.has(spec.taskId))continue;
        const draft=drafts.get(spec.taskId)||{id:spec.taskId,answers:{},note:''};
        draft.answers={...draft.answers};
        if(entry)draft.answers[spec.questionId]=entry.value;else delete draft.answers[spec.questionId];
        draft.preparedAt=null;
        if(entry&&(!draft.updatedAt||entry.updatedAt>draft.updatedAt))draft.updatedAt=entry.updatedAt;
        drafts.set(draft.id,draft);changedTasks.add(draft.id);
      }
    }
    learned.topics=[...topics];
    return [...[...changedTasks].map(id=>({store:'drafts',value:drafts.get(id)})),...(theoryChanged?[{store:'settings',value:learned}]:[])];
  }
  async function save(field,value){
    if(!Object.hasOwn(catalog,field)||!validValue(catalog[field],value))throw new Error('Respuesta no válida para este alumno.');
    const record=await store.update(['settings','drafts','tasks'],snapshot=>{
      const record=getRecord(snapshot);if(!record)throw new Error('El guardado todavía no está preparado.');
      record.outbox[field]=operation(field,value,record);
      return {operations:[...materialize(snapshot,record),{store:'settings',value:record}],result:record};
    });
    status(enabled?'pending':'unconfigured',record);
  }
  async function accept(response,sent){
    if(response?.ok!==true)throw new Error(response?.error||'No se pudo confirmar el guardado compartido.');
    const remote=validateRemote(response.state,studentId,catalog);
    const advertised=response.supportedFields;
    if(advertised!==undefined&&(!Array.isArray(advertised)||advertised.length>5000||advertised.some(field=>typeof field!=='string'||field.length>250)||new Set(advertised).size!==advertised.length))throw new Error('El catálogo del servicio no es válido.');
    const replies=[...(response.accepted||[]),...(response.conflicts||[]).map(item=>item.id)];
    if(!Array.isArray(response.accepted)||!Array.isArray(response.conflicts)||replies.length!==sent.length||new Set(replies).size!==sent.length||sent.some(op=>!replies.includes(op.id))||response.conflicts.some(item=>!sent.some(op=>op.id===item.id&&op.field===item.field)))throw new Error('Falta la confirmación de algunos cambios.');
    supported=new Set((advertised||Object.keys(legacy)).filter(field=>Object.hasOwn(catalog,field)));
    catalogChecked=true;
    return store.update(['settings','drafts','tasks'],snapshot=>{
      const record=getRecord(snapshot),conflictIds=new Set(response.conflicts.map(item=>item.id));
      // A slower request from another tab must never roll back a newer snapshot.
      if(remote.revision>=record.remote.revision)record.remote={...remote,fields:{...record.remote.fields,...remote.fields}};
      const lost=[];
      for(const op of sent){
        const pending=record.outbox[op.field];if(!pending)continue;
        if(pending.id===op.id){
          if(conflictIds.has(op.id))lost.push({...op,sharedValue:record.remote.fields[op.field]?.value??null});
          delete record.outbox[op.field];
        }else if(!conflictIds.has(op.id)&&pending.baseRevision===op.baseRevision){
          // The user changed the same answer while its previous write was in flight.
          pending.baseRevision=record.remote.fields[op.field]?.revision||0;
        }
      }
      record.lastSyncedAt=stamp();
      const changes=[...materialize(snapshot,record),{store:'settings',value:record}];
      if(lost.length){
        const previous=snapshot.settings.find(item=>item.id==='cloud-conflicts-v1')?.changes||[];
        changes.push({store:'settings',value:{id:'cloud-conflicts-v1',changes:[...previous,...lost].slice(-100)}});
      }
      return {operations:changes,result:{record,conflicts:lost.length}};
    });
  }
  async function run(){
    if(!enabled)return false;
    let record;
    try{
      // Drain edits made during a request too. Bounds prevent an endless busy loop.
      for(let round=0;round<5;round++){
        record=(await store.all('settings')).find(item=>item.id===RECORD);
        status('syncing',record);
        const sent=Object.values(record.outbox).filter(op=>supported.has(op.field)).slice(0,100);
        const response=await transport({version:1,studentId,knownFields,operations:sent.map(({queuedAt,...op})=>op)});
        const firstSync=!record.lastSyncedAt;
        const result=await accept(response,sent);record=result.record;
        const pending=Object.values(record.outbox),ready=pending.some(op=>supported.has(op.field));
        status(pending.length?(ready?'pending':'activation-required'):'synced',record);
        await onChange({conflicts:result.conflicts,firstSync});
        if(!pending.length)return true;
        if(!ready)return false;
      }
      status('pending',record);return false;
    }catch(error){status('offline',record,{error:error.message});return false;}
  }
  function sync(){if(!flight)flight=run().finally(()=>{flight=null;});return flight;}
  return {enabled,initialize,sync,saveAnswer:(taskId,questionId,value)=>save(`answer:${taskId}:${questionId}`,value),saveTopic:(id,value)=>save(`topic:${id}`,value)};
}

export function appsScriptTransport(endpoint,fetcher=globalThis.fetch,timeoutMs=15000){
  const url=new URL(endpoint);
  if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)||url.search||url.hash)throw new Error('La dirección del guardado compartido no es válida.');
  return async payload=>{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await fetcher(url.href,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),redirect:'follow',cache:'no-store',credentials:'omit',signal:controller.signal});
      if(!response.ok)throw new Error('El servicio de guardado no está disponible.');
      const text=await response.text();
      if(text.length>2500000)throw new Error('La respuesta del servicio es demasiado grande.');
      try{return JSON.parse(text);}catch{throw new Error('El servicio aún no permite guardar el avance.');}
    }finally{clearTimeout(timer);}
  };
}
