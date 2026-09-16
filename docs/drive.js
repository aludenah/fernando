export function uploadEndpoint(value) {
  if(!value)return '';
  const url=new URL(value);
  if(url.origin!=='https://script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)||url.search||url.hash)throw new Error('Usa la URL de implementación de Google Apps Script que termina en /exec.');
  return url.href;
}
export function makeUploadUrl(endpoint, context) {
  const url=new URL(uploadEndpoint(endpoint));
  url.searchParams.set('question',context.questionId);
  url.searchParams.set('answer',String(context.answer));
  url.searchParams.set('nonce',context.nonce);
  url.searchParams.set('origin',location.origin);
  return url.href;
}
export function validateReceipt(event, pending) {
  if(!pending)return null;
  if(event.origin!=='https://script.google.com'&&!/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(event.origin))return null;
  const data=event.data;
  if(!data||data.type!=='fernando-drive-upload'||data.nonce!==pending.nonce||data.questionId!==pending.questionId||data.answer!==pending.answer)return null;
  if(typeof data.fileId!=='string'||!/^[A-Za-z0-9_-]{10,150}$/.test(data.fileId)||typeof data.name!=='string'||data.name.length>240)return null;
  let url;try{url=new URL(data.fileUrl);}catch{return null;}
  if(url.origin!=='https://drive.google.com'||url.pathname!==`/file/d/${data.fileId}/view`||url.search||url.hash)return null;
  if(typeof data.uploadedAt!=='string'||Number.isNaN(Date.parse(data.uploadedAt)))return null;
  return {id:data.fileId,questionId:data.questionId,answer:data.answer,name:data.name,fileUrl:url.href,uploadedAt:data.uploadedAt};
}
