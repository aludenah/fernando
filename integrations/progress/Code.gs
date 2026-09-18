/** Shared progress only. No Drive files, email, OAuth tokens, or credentials. */
function progressJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function progressRequest_(input) {
  if(input.version!==1||!Object.prototype.hasOwnProperty.call(SYNC_CATALOGS,input.studentId))throw new Error('Alumno o versión no válidos.');
  var catalog=SYNC_CATALOGS[input.studentId];
  validateOperations(input.operations,catalog); // Reject the entire invalid batch before any write.
  var lock=LockService.getScriptLock();
  lock.waitLock(10000);
  try{
    var properties=PropertiesService.getScriptProperties();
    var prefix='progress-v1:'+input.studentId+':',saved=properties.getProperties();
    var state=emptyProgress(input.studentId);
    for(var field of Object.keys(catalog)){
      var serialized=saved[prefix+field];
      if(serialized){
        var entry=JSON.parse(serialized);state.fields[field]=entry;
        state.revision=Math.max(state.revision,entry.revision);
      }
    }
    var result=mergeProgress(state,input.operations,catalog,new Date().toISOString());
    var changed={};
    for(var key of Object.keys(result.state.fields)){
      var value=JSON.stringify(result.state.fields[key]);
      if(saved[prefix+key]!==value)changed[prefix+key]=value;
    }
    // Each small field stays far below the per-property storage limit.
    if(Object.keys(changed).length)properties.setProperties(changed,false);
    return result;
  }finally{lock.releaseLock();}
}
function doPost(event) {
  try{
    var body=event&&event.postData&&event.postData.contents;
    if(typeof body!=='string'||body.length>60000)throw new Error('Petición no válida.');
    return progressJson_(progressRequest_(JSON.parse(body)));
  }catch(error){return progressJson_({ok:false,error:'No se pudo confirmar el avance. Reintenta en unos momentos.'});}
}
function doGet(event) {
  try{
    var studentId=event&&event.parameter&&event.parameter.studentId;
    if(!studentId)return progressJson_({ok:true,service:'aula-progress',version:1});
    return progressJson_(progressRequest_({version:1,studentId:studentId,operations:[]}));
  }catch(error){return progressJson_({ok:false,error:'No se pudo consultar el avance.'});}
}
