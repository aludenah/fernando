import {validateCompletionReport} from './activity-report.js?v=activities-3';

export const reportCases=Object.freeze({
  byEquality:[['i + j','si i = j'],['i − j','si i ≠ j']],
  sum:[['i + j','']],
  triangle:[['i + j','si i ≤ j'],['i − j','si i > j']],
  identity:[['1','si i = j'],['0','si i ≠ j']],
  signedTriangle:[['i + j','si i < j'],['0','si i = j'],['i − j','si i > j']],
});
function toBase64(bytes) {
  let binary='';for(let offset=0;offset<bytes.length;offset+=32768)binary+=String.fromCharCode(...bytes.subarray(offset,offset+32768));
  return btoa(binary);
}
const formatDate=value=>new Date(value).toLocaleString('es-PE',{timeZone:'America/Lima',dateStyle:'short',timeStyle:'short'});
export function renderCompletionPdf(input,{jsPDF,fontBytes}) {
  const report=validateCompletionReport(input);
  if(typeof jsPDF!=='function'||!fontBytes?.length)throw new Error('No se pudo preparar el archivo PDF.');
  const pdf=new jsPDF({unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});
  pdf.addFileToVFS('AulaSans.ttf',toBase64(fontBytes));
  pdf.addFont('AulaSans.ttf','AulaSans','normal');
  pdf.setProperties({title:'Fernando - Construcción de matrices',author:'Profesor Alex Ludeña',subject:'Comprobante de actividad terminada',creator:'Aula del profesor Alex'});
  const colors={ink:[27,43,69],muted:[98,114,139],blue:[49,79,219],green:[27,111,76],line:[219,227,240]};
  function text(value,x,y,size=11,color=colors.ink,bold=false,options={}) {
    pdf.setFont(bold?'helvetica':'AulaSans',bold?'bold':'normal');pdf.setFontSize(size);pdf.setTextColor(...color);pdf.text(String(value),x,y,options);
  }
  function header(page) {
    pdf.setFillColor(...colors.blue);pdf.roundedRect(44,35,27,27,6,6,'F');text('AL',50,53,11,[255,255,255],true);
    text('Profesor Alex Ludeña',82,47,10,colors.ink,true);text('COMPROBANTE DE ACTIVIDAD',82,62,8,colors.muted);
    text('Construcción de matrices',44,100,23,colors.ink,true);
    text('Estudiante: Fernando',44,125,11,colors.ink,true);
    text(`Finalizada: ${formatDate(report.finishedAt)}`,551,125,9,colors.muted,false,{align:'right'});
    pdf.setFillColor(237,248,242);pdf.roundedRect(44,143,507,29,7,7,'F');
    text('Actividad terminada: cinco matrices verificadas correctamente.',57,162,10,colors.green);
    text(`Inicio: ${formatDate(report.startedAt)}`,44,194,9,colors.muted);
    text(`Verificaciones realizadas: ${report.results.reduce((total,result)=>total+result.attempts,0)}`,551,194,9,colors.muted,false,{align:'right'});
    pdf.setDrawColor(...colors.line);pdf.line(44,778,551,778);
    text('Resultado de la práctica realizada en esta sesión.',44,795,8,colors.muted);
    text(`Página ${page} de 3`,551,795,8,colors.muted,false,{align:'right'});
  }
  function rule(result,x,y) {
    const cases=reportCases[result.rule];if(!cases)throw new Error('Regla no disponible para el comprobante.');
    text('a',x,y,15);text('ij',x+9,y+5,8);text('=',x+22,y,14);
    if(cases.length===1){text(cases[0][0],x+43,y,14);return;}
    const size=cases.length===3?70:52;
    text('{',x+34,y+size*.29,size,colors.blue);
    cases.forEach(([formula,condition],index)=>{
      const baseline=y+(index-(cases.length-1)/2)*21;
      text(formula,x+79,baseline,14);text(condition,x+143,baseline,11);
    });
  }
  function matrix(result,x,y) {
    const width=result.columns*34,height=result.rows*29,left=x-width/2,top=y-height/2;
    text('A =',left-37,y+5,14);
    pdf.setDrawColor(43,62,99);pdf.setLineWidth(1.4);
    for(const [edge,direction] of [[left-8,1],[left+width+8,-1]]){
      pdf.line(edge,top-5,edge,top+height+5);pdf.line(edge,top-5,edge+6*direction,top-5);pdf.line(edge,top+height+5,edge+6*direction,top+height+5);
    }
    for(let i=1;i<=result.rows;i++)for(let j=1;j<=result.columns;j++)text(result.answers[`${i}-${j}`],left+(j-.5)*34,top+(i-.5)*29+5,15,colors.ink,false,{align:'center'});
  }
  for(let page=0;page<3;page++) {
    if(page)pdf.addPage();header(page+1);
    report.results.slice(page*2,page*2+2).forEach((result,index)=>{
      const top=224+index*248;
      pdf.setFillColor(251,252,255);pdf.setDrawColor(...colors.line);pdf.setLineWidth(.65);pdf.roundedRect(44,top,507,232,10,10,'FD');
      text(`Problema ${result.problem}`,60,top+25,13,colors.ink,true);text(`Orden ${result.rows} × ${result.columns}`,535,top+25,10,colors.muted,false,{align:'right'});
      pdf.setFillColor(239,243,255);pdf.roundedRect(60,top+47,251,113,8,8,'F');
      rule(result,72,top+106);matrix(result,443,top+106);
      text('Matriz correcta',60,top+184,11,colors.green,true);
      text(`Intentos: ${result.attempts}`,535,top+184,10,colors.ink,false,{align:'right'});
      text(`Primera verificación: ${result.firstCorrect} de ${result.rows*result.columns} elementos correctos.`,60,top+207,9,colors.muted);
    });
    if(page===2){
      text('Para entregar tu actividad',44,516,14,colors.ink,true);
      text('Adjunta este PDF a un mensaje de WhatsApp o a un correo para tu profesor.',44,541,10,colors.muted);
      text('Conserva el archivo si deseas revisar las matrices que construiste.',44,560,10,colors.muted);
    }
  }
  return new Uint8Array(pdf.output('arraybuffer'));
}

let engine;
export async function prepareCompletionPdf(report,{doc,fetcher=globalThis.fetch}) {
  if(!doc.defaultView.jspdf?.jsPDF&&!engine)engine=new Promise((resolve,reject)=>{
    const script=doc.createElement('script');script.src=new URL('./vendor/jspdf/jspdf.umd.min.js',import.meta.url).href;
    script.onload=()=>resolve();script.onerror=()=>{engine=null;script.remove();reject(new Error('No se pudo cargar el generador de PDF.'));};doc.head.append(script);
  });
  if(!doc.defaultView.jspdf?.jsPDF)await engine;
  const response=await fetcher(new URL('./vendor/report-font/AulaSans.ttf',import.meta.url));
  if(!response.ok)throw new Error('No se pudo cargar la fuente del comprobante.');
  return renderCompletionPdf(report,{jsPDF:doc.defaultView.jspdf.jsPDF,fontBytes:new Uint8Array(await response.arrayBuffer())});
}
