/** Aula de Fernando: recepción privada de solucionarios por problema. */
const PROBLEMS = {
  "alg-uni-c1-b01": {
    "folderId": "1-UwOoGXcaCMvuBBWRxIPHu_IUBdfHL7L",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 1,
    "text": "Entre \\(\\mathbb{N}\\), \\(\\mathbb{Z}\\), \\(\\mathbb{Q}\\), \\(\\mathbb{R}\\) y \\(\\mathbb{C}\\), ¿cuál es el conjunto más pequeño que contiene a \\(-11\\)?",
    "options": [
      "\\(\\mathbb{N}\\)",
      "\\(\\mathbb{Z}\\)",
      "\\(\\mathbb{Q}\\)",
      "\\(\\mathbb{R}\\)",
      "\\(\\mathbb{C}\\)"
    ]
  },
  "alg-uni-c1-b02": {
    "folderId": "1SZU8IgOwGaTAbasll_yw37OlxB7wx2A2",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 2,
    "text": "Si \\(\\mathbb{N}=\\{1;\\,2;\\,3;\\,\\ldots\\}\\) y \\(\\mathbb{N}_0=\\{0;\\,1;\\,2;\\,3;\\,\\ldots\\}\\), ¿cuál de las siguientes afirmaciones es verdadera?",
    "options": [
      "\\(\\sqrt{2}\\in\\mathbb{Q}\\)",
      "\\(0\\in\\mathbb{N}\\)",
      "\\(-3\\in\\mathbb{N}\\)",
      "\\(0\\in\\mathbb{N}_0\\)",
      "\\(\\dfrac{1}{2}\\in\\mathbb{Z}\\)"
    ]
  },
  "alg-uni-c1-b03": {
    "folderId": "1PrDOtEBEni_L1a5L_c1Szbp5nkjko789",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 3,
    "text": "¿Cuál es el inverso aditivo (opuesto) de \\(-9\\)?",
    "options": [
      "\\(9\\)",
      "\\(-\\dfrac{1}{9}\\)",
      "\\(0\\)",
      "\\(-9\\)",
      "\\(\\dfrac{1}{9}\\)"
    ]
  },
  "alg-uni-c1-b04": {
    "folderId": "1eKIvavp06BzCknqZmmAP8HkK83AWXYKr",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 4,
    "text": "¿Cuál es el inverso multiplicativo de \\(-\\dfrac{5}{8}\\)?",
    "options": [
      "\\(-\\dfrac{3}{8}\\)",
      "\\(\\dfrac{5}{8}\\)",
      "\\(\\dfrac{8}{5}\\)",
      "\\(-\\dfrac{5}{8}\\)",
      "\\(-\\dfrac{8}{5}\\)"
    ]
  },
  "alg-uni-c1-b05": {
    "folderId": "1_v9wmbJIjfrpG-vYWZ9F6TrUW2tll1Uy",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 5,
    "text": "Calcula:\\[7-3(2-5)\\]",
    "options": [
      "\\(4\\)",
      "\\(10\\)",
      "\\(16\\)",
      "\\(-16\\)",
      "\\(-2\\)"
    ]
  },
  "alg-uni-c1-b06": {
    "folderId": "15E67-8-yi8RElptpdtZYZSpdLO9tOlCt",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 6,
    "text": "Calcula y expresa el resultado en su forma irreductible:\\[\\frac{2}{3}+\\frac{1}{6}\\]",
    "options": [
      "\\(\\dfrac{5}{6}\\)",
      "\\(\\dfrac{3}{2}\\)",
      "\\(\\dfrac{7}{6}\\)",
      "\\(\\dfrac{1}{3}\\)",
      "\\(\\dfrac{1}{2}\\)"
    ]
  },
  "alg-uni-c1-b07": {
    "folderId": "1Nf1kdAmTAtgvC-Yrzy9Zm1vrXmNSifST",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 7,
    "text": "Calcula:\\[\\frac{7}{8}-\\frac{1}{4}\\]",
    "options": [
      "\\(\\dfrac{7}{4}\\)",
      "\\(\\dfrac{3}{8}\\)",
      "\\(\\dfrac{5}{8}\\)",
      "\\(\\dfrac{3}{4}\\)",
      "\\(\\dfrac{1}{2}\\)"
    ]
  },
  "alg-uni-c1-b08": {
    "folderId": "1LGPH9y9uZ6L7ziP7YZPlE5nVLKrNvRe0",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 8,
    "text": "Calcula:\\[\\left(-\\frac{3}{5}\\right)\\times\\frac{10}{9}\\]",
    "options": [
      "\\(-\\dfrac{6}{5}\\)",
      "\\(-\\dfrac{2}{3}\\)",
      "\\(\\dfrac{2}{3}\\)",
      "\\(-\\dfrac{3}{2}\\)",
      "\\(-\\dfrac{1}{3}\\)"
    ]
  },
  "alg-uni-c1-b09": {
    "folderId": "1k-MXuM2XgwR9_0T8HU1kMu5SFePrDCP-",
    "course": "algebra",
    "chapter": 1,
    "level": "basico",
    "number": 9,
    "text": "Expresa el decimal exacto \\(0{,}375\\) como una fracción irreductible.",
    "options": [
      "\\(\\dfrac{5}{8}\\)",
      "\\(\\dfrac{7}{20}\\)",
      "\\(\\dfrac{1}{4}\\)",
      "\\(\\dfrac{3}{4}\\)",
      "\\(\\dfrac{3}{8}\\)"
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
      "\\(-4+0i\\)",
      "\\(0+0i\\)",
      "\\(3+2i\\)",
      "\\(0-6i\\)",
      "\\(7+0i\\)"
    ]
  },
  "alg-uni-c1-i01": {
    "folderId": "1PSXhh6E3jjMF7jv6WnZWcXGr4al8KQFu",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 1,
    "text": "¿Cuántos de los siguientes números son racionales?\\[-3;\\quad0;\\quad2;\\quad\\frac{3}{4};\\quad\\sqrt{9};\\quad\\sqrt{5};\\quad0{,}\\overline{12}\\]El bloque \\(12\\) se repite indefinidamente.",
    "options": [
      "\\(7\\)",
      "\\(3\\)",
      "\\(4\\)",
      "\\(5\\)",
      "\\(6\\)"
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
      "\\(\\mathrm{VVF}\\)",
      "\\(\\mathrm{FVF}\\)",
      "\\(\\mathrm{VFF}\\)",
      "\\(\\mathrm{FFV}\\)",
      "\\(\\mathrm{FFF}\\)"
    ]
  },
  "alg-uni-c1-i03": {
    "folderId": "1Lw2oLeRhOwk_hPvBv2qGBMEaOpq02hs2",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 3,
    "text": "Convierte a fracción irreductible \\(0{,}2\\overline{6}\\); solo el dígito \\(6\\) se repite indefinidamente.",
    "options": [
      "\\(\\dfrac{8}{25}\\)",
      "\\(\\dfrac{1}{3}\\)",
      "\\(\\dfrac{2}{9}\\)",
      "\\(\\dfrac{4}{15}\\)",
      "\\(\\dfrac{13}{45}\\)"
    ]
  },
  "alg-uni-c1-i04": {
    "folderId": "1OIiGWnvbXmjFuCwynu_0XqP_kaAne3Ha",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 4,
    "text": "Calcula:\\[\\left(\\frac{3}{4}-\\frac{1}{6}\\right)\\div\\left(\\frac{7}{8}+\\frac{1}{4}\\right)\\]",
    "options": [
      "\\(\\dfrac{14}{27}\\)",
      "\\(\\dfrac{27}{14}\\)",
      "\\(\\dfrac{7}{12}\\)",
      "\\(\\dfrac{2}{3}\\)",
      "\\(\\dfrac{7}{27}\\)"
    ]
  },
  "alg-uni-c1-i05": {
    "folderId": "1lP6oNZ1pnEB1DDCHWYRFWOQczgX0s44c",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 5,
    "text": "Calcula:\\[2-\\frac{1}{1-\\dfrac{1}{2-\\frac{1}{2}}}\\]",
    "options": [
      "\\(3\\)",
      "\\(-3\\)",
      "\\(-1\\)",
      "\\(1\\)",
      "\\(2\\)"
    ]
  },
  "alg-uni-c1-i06": {
    "folderId": "1mVua6YtnS2f4wGAFtsucEX9S5w2RqJN5",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 6,
    "text": "Calcula:\\[\\left(\\frac{1}{2}+\\frac{1}{3}\\right)\\div\\left(\\frac{1}{2}-\\frac{1}{3}\\right)\\]",
    "options": [
      "\\(6\\)",
      "\\(\\dfrac{1}{5}\\)",
      "\\(2\\)",
      "\\(3\\)",
      "\\(5\\)"
    ]
  },
  "alg-uni-c1-i07": {
    "folderId": "1-bNjOYBwTHD4xDmMf7D8xgOuoibbIO-r",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 7,
    "text": "Calcula:\\[S=\\frac{1}{1\\times2}+\\frac{1}{2\\times3}+\\frac{1}{3\\times4}+\\frac{1}{4\\times5}+\\frac{1}{5\\times6}\\]",
    "options": [
      "\\(\\dfrac{5}{6}\\)",
      "\\(\\dfrac{1}{6}\\)",
      "\\(\\dfrac{2}{3}\\)",
      "\\(\\dfrac{3}{4}\\)",
      "\\(\\dfrac{4}{5}\\)"
    ]
  },
  "alg-uni-c1-i08": {
    "folderId": "1YCFp5fMCN67esck7kUO0qPfOY7JTF_NJ",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 8,
    "text": "Se define \\(S_n=1+2+\\cdots+n\\). Calcula:\\[S_1+S_2+S_3+S_4+S_5\\]",
    "options": [
      "\\(15\\)",
      "\\(25\\)",
      "\\(30\\)",
      "\\(35\\)",
      "\\(40\\)"
    ]
  },
  "alg-uni-c1-i09": {
    "folderId": "1blfzjpbGVnLzcdhYzbH0CppMW6VhD1-g",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 9,
    "text": "¿Qué expresión equivale a\\[4(2x-3)-3(x-5)\\]para todo número real \\(x\\)?",
    "options": [
      "\\(11x-27\\)",
      "\\(5x+3\\)",
      "\\(5x-27\\)",
      "\\(11x+3\\)",
      "\\(5x-3\\)"
    ]
  },
  "alg-uni-c1-i10": {
    "folderId": "1b7qsRIAouRZANA_wLWfposzPcS3nOEGZ",
    "course": "algebra",
    "chapter": 1,
    "level": "intermedio",
    "number": 10,
    "text": "Sea \\(z=(t-2)+(t+1)i\\), con \\(t\\) real. ¿Qué valor de \\(t\\) hace que \\(z\\) sea un número real?",
    "options": [
      "\\(2\\)",
      "\\(-2\\)",
      "\\(-1\\)",
      "\\(0\\)",
      "\\(1\\)"
    ]
  },
  "alg-uni-c1-a01": {
    "folderId": "1rcStX9Jpl_xKYdVqcuU8THutkIex_9IL",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 1,
    "text": "Calcula:\\[E=3-\\frac{1}{2-\\left[\\left(\\frac{1}{2}-\\frac{1}{3}\\right)\\div\\left(\\frac{3}{4}+\\frac{1}{6}\\right)\\right]}\\]",
    "options": [
      "\\(\\dfrac{29}{20}\\)",
      "\\(\\dfrac{5}{2}\\)",
      "\\(\\dfrac{49}{20}\\)",
      "\\(\\dfrac{51}{20}\\)",
      "\\(\\dfrac{20}{49}\\)"
    ]
  },
  "alg-uni-c1-a02": {
    "folderId": "1boVE4PuYdPxnwYivNOhchKO5HqwlCBEw",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 2,
    "text": "Calcula:\\[\\left(0{,}8\\overline{3}-0{,}125\\right)\\div\\left(0{,}1\\overline{6}+0{,}25\\right)\\]En los decimales periódicos se repiten, respectivamente, solo \\(3\\) y solo \\(6\\).",
    "options": [
      "\\(\\dfrac{17}{10}\\)",
      "\\(\\dfrac{19}{10}\\)",
      "\\(\\dfrac{3}{2}\\)",
      "\\(\\dfrac{7}{10}\\)",
      "\\(\\dfrac{10}{17}\\)"
    ]
  },
  "alg-uni-c1-a03": {
    "folderId": "151BJxNpJhIdztdWBKmrGfe2bMp8LLiYD",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 3,
    "text": "Calcula:\\[S=\\frac{1}{1\\times3}+\\frac{1}{3\\times5}+\\frac{1}{5\\times7}+\\cdots+\\frac{1}{15\\times17}\\]",
    "options": [
      "\\(\\dfrac{16}{17}\\)",
      "\\(\\dfrac{8}{15}\\)",
      "\\(\\dfrac{17}{8}\\)",
      "\\(\\dfrac{4}{17}\\)",
      "\\(\\dfrac{8}{17}\\)"
    ]
  },
  "alg-uni-c1-a04": {
    "folderId": "1zkzZvmRefZetkRcDx6Ehi2_3OkAnj5Sy",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 4,
    "text": "Si \\(S_n=1+2+\\cdots+n\\), calcula:\\[S_1+S_2+\\cdots+S_{12}\\]",
    "options": [
      "\\(312\\)",
      "\\(364\\)",
      "\\(650\\)",
      "\\(78\\)",
      "\\(286\\)"
    ]
  },
  "alg-uni-c1-a05": {
    "folderId": "1Eal9Dl4Lxi-hJKWtT2-vUoKA6KeZienx",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 5,
    "text": "Simplifica:\\[E=\\left[3+\\frac{1}{x-2}\\right]\\div\\left[1-\\frac{4}{3x-1}\\right]\\]Para \\(x\\ne2\\), \\(x\\ne\\dfrac{1}{3}\\) y \\(x\\ne\\dfrac{5}{3}\\).",
    "options": [
      "\\(\\dfrac{3x-5}{x-2}\\)",
      "\\(\\dfrac{3x+1}{x-2}\\)",
      "\\(\\dfrac{3x-1}{x+2}\\)",
      "\\(\\dfrac{3x-1}{x-2}\\)",
      "\\(\\dfrac{x-2}{3x-1}\\)"
    ]
  },
  "alg-uni-c1-a06": {
    "folderId": "1nL2LduzHbFPFeMlZV79GrxRu0p9dzRrl",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 6,
    "text": "Sean\\[\\begin{aligned}P&=4-\\frac{3}{x}\\\\[6pt]Q&=\\frac{x}{4x-3}+\\frac{2x}{4x-3}+\\frac{4x}{4x-3}\\end{aligned}\\]con \\(x\\ne0\\) y \\(x\\ne\\dfrac{3}{4}\\). Calcula \\(P\\cdot Q\\).",
    "options": [
      "\\(4\\)",
      "\\(7\\)",
      "\\(7x\\)",
      "\\(4x-3\\)",
      "\\(1\\)"
    ]
  },
  "alg-uni-c1-a07": {
    "folderId": "1of-3a9GwCUKW-Px9cqMuR9WY-tRagdsk",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 7,
    "text": "Resuelve:\\[3x-2\\left[1-(3-x)+\\frac{x}{2}\\right]=2(x-1)+5\\]Luego calcula \\(6x+1\\).",
    "options": [
      "\\(5\\)",
      "\\(1\\)",
      "\\(2\\)",
      "\\(3\\)",
      "\\(4\\)"
    ]
  },
  "alg-uni-c1-a08": {
    "folderId": "1RGTbp3RURNsr_evkUTwucRDvVcUZwqn0",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 8,
    "text": "Despeja \\(x\\) en\\[\\frac{x-a}{b}=\\frac{x+b}{a}\\]Supón \\(a\\ne0\\), \\(b\\ne0\\) y \\(a\\ne b\\).",
    "options": [
      "\\(a-b\\)",
      "\\(a+b\\)",
      "\\(\\dfrac{a^2+b^2}{a-b}\\)",
      "\\(\\dfrac{a^2-b^2}{a-b}\\)",
      "\\(\\dfrac{a^2+b^2}{a+b}\\)"
    ]
  },
  "alg-uni-c1-a09": {
    "folderId": "12zknkHNQBTBLOyA18d-Am1txUBTXYRF8",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 9,
    "text": "Dos resistencias en paralelo cumplen\\[\\frac{1}{R}=\\frac{1}{R_1}+\\frac{1}{R_2}\\]Para \\(R_1=4\\,\\Omega\\) y \\(R_2=12\\,\\Omega\\), elige el despeje correcto junto con el valor de \\(R\\).",
    "options": [
      "\\(R=R_1+R_2;\\quad R=16\\,\\Omega\\)",
      "\\(R=R_1R_2;\\quad R=48\\,\\Omega\\)",
      "\\(R=\\dfrac{R_1+R_2}{R_1R_2};\\quad R=\\dfrac{1}{3}\\,\\Omega\\)",
      "\\(R=\\dfrac{R_1R_2}{R_1+R_2};\\quad R=3\\,\\Omega\\)",
      "\\(R=\\dfrac{R_1R_2}{R_2-R_1};\\quad R=6\\,\\Omega\\)"
    ]
  },
  "alg-uni-c1-a10": {
    "folderId": "1Lb10yvMx_avR7-BqugmjBj50xccb-hC_",
    "course": "algebra",
    "chapter": 1,
    "level": "avanzado",
    "number": 10,
    "text": "Sea \\(z=(m^2-9)+(m+3)i\\), con \\(m\\) real. ¿Qué valor de \\(m\\) hace que \\(z\\) sea un imaginario puro no nulo?",
    "options": [
      "\\(3\\)",
      "\\(9\\)",
      "\\(-9\\)",
      "\\(-3\\)",
      "\\(0\\)"
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
