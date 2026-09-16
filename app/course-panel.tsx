'use client';
import { ArrowRight,BookOpen,CheckCircle2,GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion,AccordionItem,AccordionTrigger,AccordionContent } from '@/components/ui/accordion';
import type { Chapter } from '@/lib/course-types';
type CourseTask={id?:string,title:string,questions:{id:string}[],published:boolean};
export default function CoursePanel({lesson,tasks,onOpen,isTeacher}:{lesson:Chapter,tasks:CourseTask[],onOpen:(id:string)=>void,isTeacher:boolean}) {
 const ordered=lesson.taskIds.map(id=>tasks.find(t=>t.id===id)).filter((t):t is CourseTask=>!!t);
 return <section className="course-panel">
  <div className="chapter-heading"><div><p className="eyebrow">{lesson.subject.toUpperCase()} · CAPÍTULO {lesson.chapter}</p><h2>{lesson.title}</h2><p>Comprende los números y opera con seguridad, paso a paso.</p></div>{ordered[0]&&<Button size="lg" onClick={()=>onOpen(ordered[0].id!)}><BookOpen/>Abrir primera tarea</Button>}</div>
  <div className="course-layout"><div><section className="panel course-objectives"><h3>Lo que aprenderemos</h3><ul>{lesson.objectives.map(v=><li key={v}><CheckCircle2 size={18}/><span>{v}</span></li>)}</ul><p className="course-convention">{lesson.convention}</p></section>
  <section className="panel chapter-guide"><div className="section-heading"><h2>Guía para la clase</h2><span>{lesson.topics.length} apartados</span></div><Accordion type="multiple" defaultValue={[lesson.topics[0]?.id||'']}>
   {lesson.topics.map(t=><AccordionItem value={t.id} key={t.id}><AccordionTrigger>{t.title}</AccordionTrigger><AccordionContent><p className="topic-concept">{t.concept}</p><ul className="formula-list">{t.formulas.map(f=><li key={f}>{f}</li>)}</ul><div className="worked-example"><strong>Veámoslo paso a paso</strong><p className="prewrap">{t.example}</p></div><p className="topic-tip"><strong>Recuerda:</strong> {t.tip}</p><p className="source-note">{t.pages}</p></AccordionContent></AccordionItem>)}
  </Accordion></section></div>
  <aside className="course-sequence"><section className="panel"><p className="eyebrow">DEL CONCEPTO A LA PRÁCTICA</p><h2>Tareas del capítulo</h2><p>Resuelve una tarea a la vez. Explica cómo llegaste a cada respuesta.</p><div>{ordered.map((t,i)=><button className="chapter-task" key={t.id} onClick={()=>onOpen(t.id!)}><span className="chapter-step">{i+1}</span><span><strong>{t.title.replace(/^\d+ · /,'')}</strong><small>{t.questions.length} preguntas · {!t.published?'Borrador':i===0?'Inicio':i===1?'Práctica':'Integración'}</small></span><ArrowRight size={17}/></button>)}</div>{isTeacher&&<div className="teacher-course-note"><GraduationCap size={20}/><p>Abre una tarea para consultar la clave y el solucionario de cada pregunta. Puedes editarla antes de que Fernando empiece.</p></div>}</section><p className="source-note">{lesson.source}</p><p className="source-note">Guía resumida y actividades adaptadas. Las referencias al libro y al archivo PDF usan numeraciones distintas.</p></aside></div>
 </section>;
}
