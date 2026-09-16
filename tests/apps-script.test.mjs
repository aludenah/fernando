import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createContext,runInContext} from 'node:vm';
import {createHash} from 'node:crypto';

const source=await readFile(new URL('../integrations/google-drive/Code.gs',import.meta.url),'utf8');
const course=JSON.parse(await readFile(new URL('../docs/data/course.json',import.meta.url),'utf8'));
const drive=JSON.parse(await readFile(new URL('../docs/data/drive.json',import.meta.url),'utf8'));
const code='test-only-delivery-code';
const nonce='12345678-1234-4234-8234-123456789012';
const bytes=Array.from(Buffer.from('%PDF-1.4\nTest file\n%%EOF'));
const blob=(content=bytes,type='application/pdf')=>({getBytes:()=>content,getContentType:()=>type,copyBlob(){return {...this}},setName(name){this.name=name;return this}});
function receiver(active=true,failRecord=false){
  const props=new Map(active?[['UPLOAD_CODE',code]]:[]),created=[],folders=[],records=new Map();
  let released=0;
  const ctx=createContext({
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v)})},
    Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,value)=>Array.from(createHash('sha256').update(value).digest()),formatDate:(_,zone,format)=>format==='yyyy-MM-dd'?'2026-09-16':'20260916_010203'},
    MimeType:{PLAIN_TEXT:'text/plain'},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released++})},
    DriveApp:{getFolderById:id=>{folders.push(id);return{
      getFilesByName:name=>({hasNext:()=>records.has(id+'/'+name),next:()=>({getBlob:()=>({getDataAsString:()=>records.get(id+'/'+name)})})}),
      createFile:(value,body)=>{
        if(typeof value==='string'){
          if(failRecord)throw new Error('simulated metadata error');
          records.set(id+'/'+value,body);return;
        }
        const file={name:value.name,id:'test_file_'+created.length,trashed:false,getId(){return this.id},setTrashed(v){this.trashed=v}};created.push(file);return file;
      }
    }}},
    HtmlService:{XFrameOptionsMode:{ALLOWALL:'allow'},createHtmlOutput:html=>({html,setTitle(){return this},setXFrameOptionsMode(){return this}})}
  });
  runInContext(source,ctx);
  return{ctx,props,created,folders,records,released:()=>released};
}
const form=()=>({code,question:'alg-uni-c1-b01',answer:'1',nonce,note:'Mi desarrollo',solution:blob()});

test('Apps Script rejects missing authorization, unknown problems and invalid answers before writing',()=>{
  const inactive=receiver(false);assert.throws(()=>inactive.ctx.uploadSolution(form()),/código de entrega/);assert.equal(inactive.created.length,0);
  const r=receiver();
  for(const patch of [{code:'wrong-code-12345'},{question:'unknown'},{answer:''},{answer:'5'},{answer:'1.5'},{nonce:'short'}])assert.throws(()=>r.ctx.uploadSolution({...form(),...patch}));
  assert.equal(r.created.length,0);
});
test('server problem mapping matches all thirty public questions and their real folders',()=>{
  const r=receiver(),mapping=runInContext('PROBLEMS',r.ctx);
  assert.equal(Object.keys(mapping).length,30);
  for(const question of course.tasks.flatMap(t=>t.questions)){
    assert.equal(mapping[question.id].folderId,drive.problems[question.id].folderId);
    assert.equal(mapping[question.id].text,question.text);
    assert.deepEqual(Array.from(mapping[question.id].options),question.options);
  }
});
test('upload saves the chosen alternative with the file in the server-selected problem folder',()=>{
  const r=receiver(),receipt=r.ctx.uploadSolution({...form(),folderId:'untrusted-folder'});
  assert.deepEqual(r.folders,[drive.problems['alg-uni-c1-b01'].folderId]);
  assert.equal(r.created.length,1);assert.equal(receipt.fileId,r.created[0].id);
  const record=JSON.parse([...r.records.values()][0]);
  assert.equal(record.questionId,'alg-uni-c1-b01');assert.equal(record.letter,'B');assert.equal(record.selectedText,'ℤ');assert.equal(record.note,'Mi desarrollo');
  assert.equal(r.released(),1);
  const repeated=r.ctx.uploadSolution(form());assert.equal(repeated.fileId,receipt.fileId);assert.equal(r.created.length,1);
  assert.throws(()=>r.ctx.uploadSolution({...form(),answer:'2'}),/otra respuesta/);
});
test('invalid files, daily limits and record failures cannot leave a falsely confirmed upload',()=>{
  const r=receiver();
  assert.throws(()=>r.ctx.uploadSolution({...form(),solution:blob([1,2,3])}),/válidos/);
  assert.throws(()=>r.ctx.uploadSolution({...form(),solution:blob([])}),/contenido/);
  r.props.set('DAILY_USAGE',JSON.stringify({day:'2026-09-16',count:120,bytes:0}));
  assert.throws(()=>r.ctx.uploadSolution(form()),/límite/);assert.equal(r.created.length,0);
  const broken=receiver(true,true);assert.throws(()=>broken.ctx.uploadSolution(form()),/registrar/);assert.equal(broken.created[0].trashed,true);assert.equal(broken.released(),1);
});
test('upload form accepts only a question context from this classroom and never embeds its delivery code',()=>{
  const r=receiver(),params={question:'alg-uni-c1-b01',answer:'1',nonce,origin:'https://aludenah.github.io'};
  const page=r.ctx.doGet({parameter:params}).html;assert.match(page,/google.script.run/);assert.ok(!page.includes(code));
  assert.doesNotMatch(r.ctx.doGet({parameter:{...params,origin:'https://example.com'}}).html,/google.script.run/);
  assert.doesNotMatch(r.ctx.doGet({parameter:{...params,answer:''}}).html,/google.script.run/);
});
