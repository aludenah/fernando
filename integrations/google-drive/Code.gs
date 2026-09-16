/** Aula de Fernando: recepción privada de solucionarios por problema. */
const PROBLEMS = {
  "alg-uni-c1-b01": {
    "folderId": "1-UwOoGXcaCMvuBBWRxIPHu_IUBdfHL7L",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 1,
    "text": "Entre ℕ, ℤ, ℚ, ℝ y ℂ, ¿cuál es el conjunto más pequeño que contiene a −11?",
    "options": [
      "ℕ",
      "ℤ",
      "ℚ",
      "ℝ",
      "ℂ"
    ]
  },
  "alg-uni-c1-b02": {
    "folderId": "1SZU8IgOwGaTAbasll_yw37OlxB7wx2A2",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 2,
    "text": "Usando la convención del libro, ¿cuál de las siguientes afirmaciones es verdadera?",
    "options": [
      "√2 ∈ ℚ",
      "0 ∈ ℕ",
      "−3 ∈ ℕ",
      "0 ∈ ℕ₀",
      "1/2 ∈ ℤ"
    ]
  },
  "alg-uni-c1-b03": {
    "folderId": "1PrDOtEBEni_L1a5L_c1Szbp5nkjko789",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 3,
    "text": "¿Cuál es el inverso aditivo (opuesto) de −9?",
    "options": [
      "9",
      "-1/9",
      "0",
      "-9",
      "1/9"
    ]
  },
  "alg-uni-c1-b04": {
    "folderId": "1eKIvavp06BzCknqZmmAP8HkK83AWXYKr",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 4,
    "text": "¿Cuál es el inverso multiplicativo de −5/8?",
    "options": [
      "-3/8",
      "5/8",
      "8/5",
      "-5/8",
      "-8/5"
    ]
  },
  "alg-uni-c1-b05": {
    "folderId": "1_v9wmbJIjfrpG-vYWZ9F6TrUW2tll1Uy",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 5,
    "text": "Calcula 7 − 3(2 − 5).",
    "options": [
      "4",
      "10",
      "16",
      "-16",
      "-2"
    ]
  },
  "alg-uni-c1-b06": {
    "folderId": "15E67-8-yi8RElptpdtZYZSpdLO9tOlCt",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 6,
    "text": "Calcula 2/3 + 1/6 y expresa el resultado en su forma irreductible.",
    "options": [
      "5/6",
      "3/2",
      "7/6",
      "1/3",
      "1/2"
    ]
  },
  "alg-uni-c1-b07": {
    "folderId": "1Nf1kdAmTAtgvC-Yrzy9Zm1vrXmNSifST",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 7,
    "text": "Calcula 7/8 − 1/4.",
    "options": [
      "7/4",
      "3/8",
      "5/8",
      "3/4",
      "1/2"
    ]
  },
  "alg-uni-c1-b08": {
    "folderId": "1LGPH9y9uZ6L7ziP7YZPlE5nVLKrNvRe0",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 8,
    "text": "Calcula (−3/5) × (10/9).",
    "options": [
      "-6/5",
      "-2/3",
      "2/3",
      "-3/2",
      "-1/3"
    ]
  },
  "alg-uni-c1-b09": {
    "folderId": "1k-MXuM2XgwR9_0T8HU1kMu5SFePrDCP-",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 9,
    "text": "Expresa el decimal exacto 0,375 como una fracción irreductible.",
    "options": [
      "5/8",
      "7/20",
      "1/4",
      "3/4",
      "3/8"
    ]
  },
  "alg-uni-c1-b10": {
    "folderId": "1Pjy2riZ6_Z1aXpJzJ_t8SHI7wRz3s63q",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 10,
    "text": "¿Cuál de estos números es un imaginario puro no nulo?",
    "options": [
      "−4 + 0i",
      "0 + 0i",
      "3 + 2i",
      "0 − 6i",
      "7 + 0i"
    ]
  },
  "alg-uni-c1-i01": {
    "folderId": "1PSXhh6E3jjMF7jv6WnZWcXGr4al8KQFu",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 1,
    "text": "¿Cuántos de los siguientes números son racionales? −3; 0; 2; 3/4; √9; √5; 0,121212… (el bloque 12 se repite indefinidamente).",
    "options": [
      "7",
      "3",
      "4",
      "5",
      "6"
    ]
  },
  "alg-uni-c1-i02": {
    "folderId": "1uSQ6yYDu3Amc51I364DdTnsOu00RWOlU",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 2,
    "text": "Indica la secuencia V/F. I. El producto de dos irracionales siempre es irracional. II. El producto de un racional no nulo y un irracional es irracional. III. Todo real es racional.",
    "options": [
      "VVF",
      "FVF",
      "VFF",
      "FFV",
      "FFF"
    ]
  },
  "alg-uni-c1-i03": {
    "folderId": "1Lw2oLeRhOwk_hPvBv2qGBMEaOpq02hs2",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 3,
    "text": "Convierte a fracción irreductible 0,26666…; solo el dígito 6 se repite indefinidamente.",
    "options": [
      "8/25",
      "1/3",
      "2/9",
      "4/15",
      "13/45"
    ]
  },
  "alg-uni-c1-i04": {
    "folderId": "1OIiGWnvbXmjFuCwynu_0XqP_kaAne3Ha",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 4,
    "text": "Calcula (3/4 − 1/6) ÷ (7/8 + 1/4).",
    "options": [
      "14/27",
      "27/14",
      "7/12",
      "2/3",
      "7/27"
    ]
  },
  "alg-uni-c1-i05": {
    "folderId": "1lP6oNZ1pnEB1DDCHWYRFWOQczgX0s44c",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 5,
    "text": "Calcula 2 − 1 / [1 − 1 / (2 − 1/2)].",
    "options": [
      "3",
      "-3",
      "-1",
      "1",
      "2"
    ]
  },
  "alg-uni-c1-i06": {
    "folderId": "1mVua6YtnS2f4wGAFtsucEX9S5w2RqJN5",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 6,
    "text": "Calcula (1/2 + 1/3) ÷ (1/2 − 1/3).",
    "options": [
      "6",
      "1/5",
      "2",
      "3",
      "5"
    ]
  },
  "alg-uni-c1-i07": {
    "folderId": "1-bNjOYBwTHD4xDmMf7D8xgOuoibbIO-r",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 7,
    "text": "Calcula S = 1/(1×2) + 1/(2×3) + 1/(3×4) + 1/(4×5) + 1/(5×6).",
    "options": [
      "5/6",
      "1/6",
      "2/3",
      "3/4",
      "4/5"
    ]
  },
  "alg-uni-c1-i08": {
    "folderId": "1YCFp5fMCN67esck7kUO0qPfOY7JTF_NJ",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 8,
    "text": "Se define Sₙ = 1 + 2 + … + n. Calcula S₁ + S₂ + S₃ + S₄ + S₅.",
    "options": [
      "15",
      "25",
      "30",
      "35",
      "40"
    ]
  },
  "alg-uni-c1-i09": {
    "folderId": "1blfzjpbGVnLzcdhYzbH0CppMW6VhD1-g",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 9,
    "text": "¿Qué expresión equivale a 4(2x − 3) − 3(x − 5) para todo número real x?",
    "options": [
      "11·x - 27",
      "5·x + 3",
      "5·x - 27",
      "11·x + 3",
      "5·x - 3"
    ]
  },
  "alg-uni-c1-i10": {
    "folderId": "1b7qsRIAouRZANA_wLWfposzPcS3nOEGZ",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 10,
    "text": "Sea z = (t − 2) + (t + 1)i, con t real. ¿Qué valor de t hace que z sea un número real?",
    "options": [
      "2",
      "-2",
      "-1",
      "0",
      "1"
    ]
  },
  "alg-uni-c1-a01": {
    "folderId": "1rcStX9Jpl_xKYdVqcuU8THutkIex_9IL",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 1,
    "text": "Calcula E = 3 − 1 / {2 − [(1/2 − 1/3) ÷ (3/4 + 1/6)]}.",
    "options": [
      "29/20",
      "5/2",
      "49/20",
      "51/20",
      "20/49"
    ]
  },
  "alg-uni-c1-a02": {
    "folderId": "1boVE4PuYdPxnwYivNOhchKO5HqwlCBEw",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 2,
    "text": "Calcula (0,83333… − 0,125) ÷ (0,16666… + 0,25). En los decimales periódicos se repiten, respectivamente, solo 3 y solo 6.",
    "options": [
      "17/10",
      "19/10",
      "3/2",
      "7/10",
      "10/17"
    ]
  },
  "alg-uni-c1-a03": {
    "folderId": "151BJxNpJhIdztdWBKmrGfe2bMp8LLiYD",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 3,
    "text": "Calcula S = 1/(1×3) + 1/(3×5) + 1/(5×7) + … + 1/(15×17).",
    "options": [
      "16/17",
      "8/15",
      "17/8",
      "4/17",
      "8/17"
    ]
  },
  "alg-uni-c1-a04": {
    "folderId": "1zkzZvmRefZetkRcDx6Ehi2_3OkAnj5Sy",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 4,
    "text": "Si Sₙ = 1 + 2 + … + n, calcula S₁ + S₂ + … + S₁₂.",
    "options": [
      "312",
      "364",
      "650",
      "78",
      "286"
    ]
  },
  "alg-uni-c1-a05": {
    "folderId": "1Eal9Dl4Lxi-hJKWtT2-vUoKA6KeZienx",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 5,
    "text": "Simplifica E = [3 + 1/(x − 2)] ÷ [1 − 4/(3x − 1)], para x ≠ 2, x ≠ 1/3 y x ≠ 5/3.",
    "options": [
      "(3·x - 5)/(x - 2)",
      "(3·x + 1)/(x - 2)",
      "(3·x - 1)/(x + 2)",
      "(3·x - 1)/(x - 2)",
      "(x - 2)/(3·x - 1)"
    ]
  },
  "alg-uni-c1-a06": {
    "folderId": "1nL2LduzHbFPFeMlZV79GrxRu0p9dzRrl",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 6,
    "text": "Sean P = 4 − 3/x y Q = x/(4x − 3) + 2x/(4x − 3) + 4x/(4x − 3), con x ≠ 0 y x ≠ 3/4. Calcula P·Q.",
    "options": [
      "4",
      "7",
      "7·x",
      "4·x - 3",
      "1"
    ]
  },
  "alg-uni-c1-a07": {
    "folderId": "1of-3a9GwCUKW-Px9cqMuR9WY-tRagdsk",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 7,
    "text": "Resuelve 3x − 2[1 − (3 − x) + x/2] = 2(x − 1) + 5. Luego calcula 6x + 1.",
    "options": [
      "5",
      "1",
      "2",
      "3",
      "4"
    ]
  },
  "alg-uni-c1-a08": {
    "folderId": "1RGTbp3RURNsr_evkUTwucRDvVcUZwqn0",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 8,
    "text": "Despeja x en (x − a)/b = (x + b)/a. Supón a ≠ 0, b ≠ 0 y a ≠ b.",
    "options": [
      "a - b",
      "a + b",
      "(a² + b²)/(a - b)",
      "(a² - b²)/(a - b)",
      "(a² + b²)/(a + b)"
    ]
  },
  "alg-uni-c1-a09": {
    "folderId": "12zknkHNQBTBLOyA18d-Am1txUBTXYRF8",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 9,
    "text": "Dos resistencias en paralelo cumplen 1/R = 1/R₁ + 1/R₂. Para R₁ = 4 Ω y R₂ = 12 Ω, elige el despeje correcto junto con el valor de R.",
    "options": [
      "R = R₁ + R₂; R = 16 Ω",
      "R = R₁R₂; R = 48 Ω",
      "R = (R₁ + R₂)/(R₁R₂); R = 1/3 Ω",
      "R = R₁R₂/(R₁ + R₂); R = 3 Ω",
      "R = R₁R₂/(R₂ − R₁); R = 6 Ω"
    ]
  },
  "alg-uni-c1-a10": {
    "folderId": "1Lb10yvMx_avR7-BqugmjBj50xccb-hC_",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 10,
    "text": "Sea z = (m² − 9) + (m + 3)i, con m real. ¿Qué valor de m hace que z sea un imaginario puro no nulo?",
    "options": [
      "3",
      "9",
      "-9",
      "-3",
      "0"
    ]
  }
};
const CLASSROOM_ORIGIN = "https://aludenah.github.io";

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, function (c) {return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}

function doGet(e) {
  const params = e && e.parameter || {};
  const question = String(params.question || '');
  const problem = Object.prototype.hasOwnProperty.call(PROBLEMS, question) ? PROBLEMS[question] : null;
  const answer = Number(params.answer);
  const nonce = String(params.nonce || '');
  const ready = String(PropertiesService.getScriptProperties().getProperty('UPLOAD_CODE') || '').length >= 12;
  if (!problem || !/^[A-Za-z0-9-]{20,80}$/.test(nonce) || !/^[0-4]$/.test(String(params.answer)) || answer >= problem.options.length || params.origin !== CLASSROOM_ORIGIN) {
    return HtmlService.createHtmlOutput('<html lang="es"><meta name="viewport" content="width=device-width, initial-scale=1"><body style="font-family:Arial;padding:24px"><h2>Aula de Fernando</h2><p>' + (ready ? 'La recepción está configurada. Abre un problema desde el aula para enviar su solucionario.' : 'Falta configurar UPLOAD_CODE en las propiedades del proyecto.') + '</p></body></html>');
  }
  const context = JSON.stringify({question:question,answer:answer,nonce:nonce,origin:CLASSROOM_ORIGIN}).replace(/</g, '\\u003c');
  const html = `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
  *{box-sizing:border-box}body{font:16px/1.5 Arial,sans-serif;color:#21304b;background:#fff;padding:16px;margin:0}label{display:block;margin:13px 0;font-weight:600;font-size:14px}input,textarea,button{font:inherit;max-width:100%;border-radius:8px}input,textarea{display:block;width:100%;border:1px solid #cad4e8;padding:11px;margin-top:6px}input[type=file]{font-size:13px}button{width:100%;background:#314fdb;color:white;border:0;padding:13px;cursor:pointer;margin-top:8px}button:disabled{opacity:.5}small{color:#617391;font-size:12px}.status{padding:12px 0;color:#245f45;font-size:14px;overflow-wrap:anywhere}.error{color:#a33b2d}.context{padding:10px 14px;background:#eef3ff;border-radius:8px;font-size:14px}
  </style></head><body><p class="context">Álgebra · Capítulo 1 · ${escapeHtml_(problem.level)} · Problema ${problem.number}<br>Respuesta que se enviará: <strong>${'ABCDE'[answer]}</strong></p>
  <form id="upload"><input type="hidden" name="question" value="${escapeHtml_(question)}"><input type="hidden" name="answer" value="${answer}"><input type="hidden" name="nonce" value="${escapeHtml_(nonce)}">
  <label>Código de entrega<input type="password" name="code" minlength="12" maxlength="128" autocomplete="off" required ${ready?'':'disabled'}></label>
  <label>Foto o PDF del desarrollo<input type="file" name="solution" accept=".pdf,.jpg,.jpeg,.png,.webp" required ${ready?'':'disabled'}></label><small>Un archivo por envío · hasta 10 MB. Puedes repetir el envío para añadir otra foto.</small>
  <label>Comentario (opcional)<textarea name="note" rows="2" maxlength="2000"></textarea></label><button type="submit" ${ready?'':'disabled'}>Enviar a Google Drive</button></form>
  <p id="status" class="status" role="status">${ready?'El archivo quedará en la carpeta de este problema.':'El profesor debe activar el código de entrega.'}</p>
  <script>const context=${context};const form=document.getElementById('upload'),status=document.getElementById('status'),button=form.querySelector('button');
  form.addEventListener('submit',function(event){event.preventDefault();const file=form.solution.files[0];if(!file)return;if(file.size>10*1024*1024){status.className='status error';status.textContent='El máximo es 10 MB por archivo.';return;}button.disabled=true;status.className='status';status.textContent='Subiendo… Espera la confirmación.';
  google.script.run.withSuccessHandler(function(receipt){form.code.value='';status.className='status';status.textContent='Solucionario y respuesta guardados correctamente en Google Drive.';window.top.postMessage(Object.assign({type:'fernando-drive-upload',nonce:context.nonce,questionId:context.question,answer:context.answer},receipt),context.origin);}).withFailureHandler(function(error){button.disabled=false;status.className='status error';status.textContent=error.message||'No se pudo enviar. Intenta de nuevo.';}).uploadSolution(form);});</script></body></html>`;
  return HtmlService.createHtmlOutput(html).setTitle('Solucionario · Fernando').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function validFile_(bytes, type) {
  const data=bytes.map(function(n){return (n+256)%256;});
  const starts=function(values,offset){return values.every(function(n,i){return data[(offset||0)+i]===n;});};
  if(type==='application/pdf')return starts([37,80,68,70,45]);
  if(type==='image/jpeg')return starts([255,216,255]);
  if(type==='image/png')return starts([137,80,78,71,13,10,26,10]);
  return type==='image/webp'&&starts([82,73,70,70])&&starts([87,69,66,80],8);
}

function codeMatches_(entered,expected) {
  if(typeof entered!=='string'||entered.length<12||entered.length>128||expected.length<12||expected.length>128)return false;
  const one=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,entered);
  const two=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,expected);
  let difference=0;for(let i=0;i<one.length;i++)difference|=one[i]^two[i];
  return difference===0;
}

/** Called only by the upload form. Folder IDs are resolved on the server. */
function uploadSolution(form) {
  const props=PropertiesService.getScriptProperties();
  if(!form||!codeMatches_(form.code,String(props.getProperty('UPLOAD_CODE')||'')))throw new Error('El código de entrega no es correcto o todavía no está activado.');
  const question=String(form.question||'');
  if(!Object.prototype.hasOwnProperty.call(PROBLEMS,question))throw new Error('Problema no autorizado.');
  const problem=PROBLEMS[question],answer=Number(form.answer),nonce=String(form.nonce||'');
  if(!/^[A-Za-z0-9-]{20,80}$/.test(nonce)||!/^[0-4]$/.test(String(form.answer))||answer>=problem.options.length)throw new Error('La respuesta o el identificador de entrega no son válidos.');
  const note=String(form.note||'');if(note.length>2000)throw new Error('El comentario es demasiado largo.');
  if(!form.solution||typeof form.solution.getBytes!=='function')throw new Error('Selecciona un archivo.');
  const blob=form.solution,bytes=blob.getBytes(),type=blob.getContentType();
  if(!bytes.length||bytes.length>10*1024*1024)throw new Error('El archivo debe tener contenido y pesar hasta 10 MB.');
  if(!validFile_(bytes,type))throw new Error('Solo se admiten archivos PDF, JPG, PNG o WEBP válidos.');
  const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw new Error('Hay otro envío en curso. Vuelve a intentarlo.');
  try {
    const folder=DriveApp.getFolderById(problem.folderId);
    const recordName='respuesta_'+nonce+'.json';
    const previous=folder.getFilesByName(recordName);
    if(previous.hasNext()) {
      const record=JSON.parse(previous.next().getBlob().getDataAsString());
      if(record.answer!==answer)throw new Error('Esta ventana ya envió otra respuesta. Ciérrala y vuelve a abrir la subida.');
      return record.receipt;
    }
    const day=Utilities.formatDate(new Date(),'America/Lima','yyyy-MM-dd');
    let usage={day:day,count:0,bytes:0};
    try{const saved=JSON.parse(props.getProperty('DAILY_USAGE')||'null');if(saved&&saved.day===day)usage=saved;}catch(e){}
    if(usage.count>=120||usage.bytes+bytes.length>300*1024*1024)throw new Error('Se alcanzó el límite de entregas de hoy. Conserva una copia e informa al profesor.');
    const stamp=Utilities.formatDate(new Date(),'America/Lima','yyyyMMdd_HHmmss');
    const extension={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[type];
    const name='P'+String(problem.number).padStart(2,'0')+'_'+stamp+'_'+nonce.slice(0,8)+'.'+extension;
    const file=folder.createFile(blob.copyBlob().setName(name));
    const receipt={fileId:file.getId(),fileUrl:'https://drive.google.com/file/d/'+file.getId()+'/view',name:name,uploadedAt:new Date().toISOString()};
    const record={version:1,course:problem.course,chapter:problem.chapter,level:problem.level,questionId:question,number:problem.number,question:problem.text,options:problem.options,answer:answer,letter:'ABCDE'[answer],selectedText:problem.options[answer],note:note,receipt:receipt};
    try{folder.createFile(recordName,JSON.stringify(record,null,2),MimeType.PLAIN_TEXT);}catch(error){file.setTrashed(true);throw new Error('No se pudo registrar la respuesta. Intenta nuevamente.');}
    props.setProperty('DAILY_USAGE',JSON.stringify({day:day,count:usage.count+1,bytes:usage.bytes+bytes.length}));
    return receipt;
  } finally {lock.releaseLock();}
}
