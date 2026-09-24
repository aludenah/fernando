/** Read only the owner's published course. Clients never define valid questions. */
const PROGRESS_COURSE_URLS={
  fernando:'https://raw.githubusercontent.com/aludenah/fernando/main/docs/data/course.json',
  josue:'https://raw.githubusercontent.com/aludenah/fernando/main/docs/data/josue-course.json'
};
function progressCourseCatalog_(course) {
  var identifier=function(value){return typeof value==='string'&&/^[-a-zA-Z0-9_]{1,100}$/.test(value);};
  if(!course||course.schemaVersion!==2||!course.lesson||!Array.isArray(course.tasks)||course.tasks.length>500||
    (course.additionalLessons!==undefined&&!Array.isArray(course.additionalLessons)))throw new Error('Curso no válido.');
  var lessons=[course.lesson].concat(course.additionalLessons||[]),lessonIds=new Set(),taskIds=new Set(),topicIds=new Set();
  if(lessons.length>100)throw new Error('Demasiados capítulos.');
  for(var lesson of lessons){
    if(!identifier(lesson.id)||lessonIds.has(lesson.id)||!Array.isArray(lesson.topics)||lesson.topics.length>100)throw new Error('Capítulo no válido.');
    lessonIds.add(lesson.id);
    for(var topic of lesson.topics){
      if(!identifier(topic.id)||topicIds.has(topic.id))throw new Error('Tema no válido.');
      topicIds.add(topic.id);
    }
  }
  for(var task of course.tasks){
    if(!task.published)continue;
    if(!identifier(task.id)||taskIds.has(task.id)||!lessonIds.has(task.chapterId)||!Array.isArray(task.questions)||!task.questions.length||task.questions.length>100)throw new Error('Tarea no válida.');
    taskIds.add(task.id);
    var questionIds=new Set();
    for(var question of task.questions){
      if(!identifier(question.id)||questionIds.has(question.id)||!Array.isArray(question.options)||question.options.length<2||question.options.length>10)throw new Error('Pregunta no válida.');
      questionIds.add(question.id);
    }
  }
  var catalog=progressCatalog(course);
  if(!Object.keys(catalog).length||Object.keys(catalog).length>5000)throw new Error('Catálogo demasiado grande.');
  return catalog;
}
function progressPackCatalog_(catalog) {
  var tasks=new Map(),topics=[];
  for(var field of Object.keys(catalog)){
    var spec=catalog[field];
    if(spec.kind==='topic'){topics.push(spec.topicId);continue;}
    if(!tasks.has(spec.taskId))tasks.set(spec.taskId,[]);
    tasks.get(spec.taskId).push([spec.questionId,spec.choices,spec.previous?spec.previous.split(':')[2]:null]);
  }
  return {tasks:Array.from(tasks.entries()),topics:topics};
}
function progressUnpackCatalog_(packed) {
  var catalog={},identifier=function(value){return typeof value==='string'&&/^[-a-zA-Z0-9_]{1,100}$/.test(value);};
  for(var task of packed.tasks){
    if(!identifier(task[0]))throw new Error('Caché no válida.');
    for(var q of task[1]){
      if(!identifier(q[0])||!Number.isInteger(q[1])||q[1]<2||q[1]>10||(q[2]!==null&&!identifier(q[2])))throw new Error('Caché no válida.');
      catalog['answer:'+task[0]+':'+q[0]]={kind:'answer',taskId:task[0],questionId:q[0],choices:q[1],previous:q[2]===null?null:'answer:'+task[0]+':'+q[2]};
    }
  }
  for(var topic of packed.topics){
    if(!identifier(topic))throw new Error('Caché no válida.');
    catalog['topic:'+topic]={kind:'topic',topicId:topic};
  }
  if(!Object.keys(catalog).length||Object.keys(catalog).length>5000)throw new Error('Caché no válida.');
  return catalog;
}
function progressPublishedCatalog_(studentId,known) {
  var fallback=SYNC_CATALOGS[studentId],cache=null,cached=null,key='published-catalog-v1:'+studentId;
  try{
    cache=CacheService.getScriptCache();
    var text=cache.get(key);
    if(text){
      cached=JSON.parse(text);
      if(!cached||!Number.isFinite(cached.fetchedAt))cached=null;
      else cached.catalog=progressUnpackCatalog_(cached.packed);
    }
  }catch(error){cached=null;}
  var now=Date.now(),age=cached?now-cached.fetchedAt:Infinity;
  // A new chapter can refresh a cached catalogue early; ordinary reads reuse it.
  var missing=cached&&known&&known.some(function(field){return !Object.prototype.hasOwnProperty.call(cached.catalog,field);});
  if(cached&&age<60000&&(!missing||age<15000))return {catalog:cached.catalog,unavailable:false,source:'cache'};
  try{
    var response=UrlFetchApp.fetch(PROGRESS_COURSE_URLS[studentId],{method:'get',followRedirects:false,muteHttpExceptions:true});
    if(response.getResponseCode()!==200)throw new Error('No se pudo consultar el curso.');
    var source=response.getContentText();
    if(source.length>4000000)throw new Error('Curso demasiado grande.');
    var catalog=Object.assign({},fallback,progressCourseCatalog_(JSON.parse(source)));
    var serialized=JSON.stringify({fetchedAt:now,packed:progressPackCatalog_(catalog)});
    // CacheService has a 100 KB limit per value. Skipping an oversized cache is safe.
    if(cache&&serialized.length<95000){try{cache.put(key,serialized,21600);}catch(error){}}
    return {catalog:catalog,unavailable:false,source:'published'};
  }catch(error){
    // An outage must not manufacture zero progress or remove any stored answer.
    return {catalog:cached?cached.catalog:fallback,unavailable:true,source:cached?'cache':'bundled'};
  }
}
