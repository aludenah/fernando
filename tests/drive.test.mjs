import {test} from 'node:test';
import assert from 'node:assert/strict';
import {uploadEndpoint,validateReceipt} from '../docs/drive.js';

const pending={questionId:'alg-uni-c1-b01',answer:2,nonce:'12345678-1234-4234-8234-123456789012'};
const event=()=>({origin:'https://example-script.googleusercontent.com',data:{type:'fernando-drive-upload',...pending,fileId:'example_file_1234',name:'P01.pdf',fileUrl:'https://drive.google.com/file/d/example_file_1234/view',uploadedAt:'2026-09-16T00:00:00.000Z'}});

test('only an HTTPS deployed Apps Script URL can be configured',()=>{
  assert.equal(uploadEndpoint(''),'');
  assert.equal(uploadEndpoint('https://script.google.com/macros/s/example/exec'),'https://script.google.com/macros/s/example/exec');
  for(const url of ['https://example.com/exec','javascript:alert(1)','https://script.google.com/macros/s/example/dev','https://script.google.com/macros/s/example/exec?key=x'])assert.throws(()=>uploadEndpoint(url));
});
test('receipts match the Google origin, exact problem, selected answer and pending attempt',()=>{
  assert.equal(validateReceipt(event(),pending).questionId,pending.questionId);
  assert.equal(validateReceipt(event(),null),null);
  const badOrigin=event();badOrigin.origin='https://attacker.example';assert.equal(validateReceipt(badOrigin,pending),null);
  for(const [field,value] of [['questionId','alg-uni-c1-b02'],['answer',3],['nonce','other'],['fileUrl','https://example.com/'],['fileUrl','not a url'],['uploadedAt','invalid']]){
    const altered=event();altered.data[field]=value;assert.equal(validateReceipt(altered,pending),null,field);
  }
});
