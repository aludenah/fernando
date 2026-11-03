import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {jsPDF} from 'jspdf';
import {createCompletionReport,validateCompletionReport,reportFilename} from '../docs/activity-report.js';
import {renderCompletionPdf} from '../docs/report-pdf.js';
import {finishedSession} from './report-fixture.mjs';

test('the receipt contains actual responses, order, verification attempts and session dates',()=>{
 const {session,exercises}=finishedSession(),report=createCompletionReport(session,exercises);
 assert.equal(report.student,'Fernando');assert.equal(report.results.length,5);
 assert.equal(report.results[0].answers['1-2'],'-1');assert.equal(report.results[0].attempts,2);assert.equal(report.results[0].firstCorrect,3);
 assert.equal(reportFilename(report),'Fernando_Matrices_2026-11-02_1905.pdf');
 report.results[0].answers['1-2']='999';assert.equal(session.entries[exercises[0].id].answers['1-2'],'-1');
 assert.throws(()=>validateCompletionReport(report));
});
test('unfinished work, missing verification and incorrect matrices cannot produce a receipt',()=>{
 for(const change of [value=>value.session.finishedAt=null,value=>value.session.entries[value.exercises[2].id].solved=false,value=>value.session.entries[value.exercises[3].id].answers['1-1']='100']){
  const value=finishedSession();change(value);assert.throws(()=>createCompletionReport(value.session,value.exercises));
 }
});
test('the actual PDF engine creates a three-page PDF with no executable actions',async()=>{
 const {session,exercises}=finishedSession(),report=createCompletionReport(session,exercises);
 const fontBytes=new Uint8Array(await readFile(new URL('../docs/vendor/report-font/AulaSans.ttf',import.meta.url)));
 const bytes=renderCompletionPdf(report,{jsPDF,fontBytes});
 const binary=Buffer.from(bytes).toString('latin1');assert.match(binary,/^%PDF-/);
 assert.equal((binary.match(/\/Type \/Page\b/g)||[]).length,3);
 assert.doesNotMatch(binary,/\/S\s*\/(?:JavaScript|Launch)\b/);
 assert.ok(bytes.length>10000&&bytes.length<250000);
});
