import { z } from 'zod';
import { AppError,context,db,errorResponse,secureWrite,teacher } from '@/lib/classroom-server';
export const dynamic='force-dynamic';
import { taskSchema } from '@/lib/task-schema';
import { configuredChapter,ensureChapterTasks } from '@/lib/course-server';
export async function GET(){try{
 const c=await context();const course=configuredChapter();if(c.role==='teacher'&&course)await ensureChapterTasks(course.tasks);if(c.role==='setup')return Response.json({role:'setup',email:c.user.email,tasks:[],submissions:[],files:[]},{headers:{'Cache-Control':'no-store'}});
 const all=await db().prepare(c.role==='teacher'?'SELECT * FROM tasks ORDER BY created DESC':'SELECT * FROM tasks WHERE published=1 ORDER BY created DESC').all<any>();
 const subs=await db().prepare(c.role==='teacher'?'SELECT * FROM submissions':'SELECT s.* FROM submissions s JOIN tasks t ON t.id=s.task WHERE t.published=1 AND s.student=?').bind(...(c.role==='teacher'?[]:[c.user.userId])).all<any>();
 const attached=await db().prepare(c.role==='teacher'?'SELECT id,task,kind,name,mime,size FROM files':"SELECT f.id,f.task,f.kind,f.name,f.mime,f.size FROM files f JOIN tasks t ON t.id=f.task WHERE t.published=1 AND (f.kind='material' OR f.owner=?)").bind(...(c.role==='teacher'?[]:[c.user.userId])).all<any>();
 const tasks=all.results.map(t=>({...t,published:!!t.published,questions:JSON.parse(t.questions).map((q:any)=>{if(c.role==='teacher'||subs.results.some(s=>s.task===t.id&&s.state==='reviewed'))return q;const {correct,solution,...safe}=q;return safe;})}));
 return Response.json({lesson:course?.lesson||null,role:c.role,email:c.user.email,studentEmail:c.role==='teacher'?c.room.student_email:undefined,tasks,files:attached.results,submissions:subs.results.map(s=>({...s,answers:JSON.parse(s.answers)}))},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e);}}
export async function POST(request:Request){try{
 secureWrite(request);if(Number(request.headers.get('content-length')||0)>300000)throw new AppError('El contenido es demasiado grande.');const raw=await request.text();if(raw.length>300000)throw new AppError('El contenido es demasiado grande.');let b:any;try{b=JSON.parse(raw);}catch{throw new AppError('Datos no válidos.');}const c=await context();
 if(b.action==='setup'){
  if(c.role==='teacher')return Response.json({ok:true});
  if(c.role!=='setup')throw new AppError('El aula ya está configurada.',409);
  // Setup identity is checked against the owner email configured server-side.
  await db().prepare('INSERT INTO classroom (id,teacher,teacher_email,student_email) VALUES (?,?,?,?)').bind('main',c.user.userId,c.user.email,'').run();return Response.json({ok:true});
 }
 if(c.role==='setup')throw new AppError('Primero activa tu aula.');
 if(b.action==='student'){
  teacher(c.role);const email=z.string().trim().email().max(254).parse(b.email).toLowerCase();if(email===c.user.email.toLowerCase())throw new AppError('Usa el correo de Fernando, diferente al tuyo.');if(c.room.student&&email!==c.room.student_email)throw new AppError('Fernando ya está vinculado. Contacta al administrador para cambiar de cuenta sin mezclar entregas.');await db().prepare('UPDATE classroom SET student_email=? WHERE id=?').bind(email,'main').run();
 }else if(b.action==='saveTask'){
  teacher(c.role);const t=taskSchema.parse(b.task);const id=t.id||crypto.randomUUID();
  if(t.id){const old=await db().prepare('SELECT id FROM tasks WHERE id=?').bind(id).first();if(!old)throw new AppError('Tarea no encontrada.',404);const sub=await db().prepare('SELECT task FROM submissions WHERE task=?').bind(id).first();if(sub)throw new AppError('Esta tarea ya tiene respuestas. Crea otra para conservar la entrega original.',409);await db().prepare('UPDATE tasks SET title=?,subject=?,instructions=?,due=?,questions=?,published=? WHERE id=?').bind(t.title,t.subject,t.instructions,t.due,JSON.stringify(t.questions),+t.published,id).run();}
  else await db().prepare('INSERT INTO tasks (id,title,subject,instructions,due,questions,published,created) VALUES (?,?,?,?,?,?,?,?)').bind(id,t.title,t.subject,t.instructions,t.due,JSON.stringify(t.questions),+t.published,new Date().toISOString()).run();return Response.json({ok:true,id});
 }else if(b.action==='answers'){
  if(c.role!=='student')throw new AppError('Solo Fernando puede entregar respuestas.',403);const t=await db().prepare('SELECT * FROM tasks WHERE id=? AND published=1').bind(String(b.task)).first<any>();if(!t)throw new AppError('Tarea no encontrada.',404);const previous=await db().prepare('SELECT state FROM submissions WHERE task=?').bind(t.id).first<any>();if(previous&&previous.state!=='draft')throw new AppError('Esta tarea ya fue entregada. El profesor puede reabrirla.',409);
  const answers=z.record(z.number().int().min(0).max(4)).parse(b.answers);const qs=JSON.parse(t.questions);for(const key of Object.keys(answers)){const q=qs.find((v:any)=>v.id===key);if(!q||answers[key]>=q.options.length)throw new AppError('Hay una alternativa no válida.');}
  if(b.submit===true){if(qs.some((q:any)=>answers[q.id]===undefined))throw new AppError('Marca una alternativa en cada pregunta.');const f=await db().prepare("SELECT id FROM files WHERE task=? AND owner=? AND kind='solution' LIMIT 1").bind(t.id,c.user.userId).first();if(!f)throw new AppError('Adjunta por lo menos una foto o un PDF con tu desarrollo.');}
  await db().prepare("INSERT INTO submissions (task,student,answers,state,submitted) VALUES (?,?,?,?,?) ON CONFLICT(task) DO UPDATE SET answers=excluded.answers,state=excluded.state,submitted=excluded.submitted WHERE submissions.state='draft' AND submissions.student=excluded.student").bind(t.id,c.user.userId,JSON.stringify(answers),b.submit===true?'submitted':'draft',b.submit===true?new Date().toISOString():null).run();
 }else if(b.action==='review'){
  teacher(c.role);const score=z.number().min(0).max(20).parse(b.score);const feedback=z.string().trim().min(1).max(8000).parse(b.feedback);const r=await db().prepare("UPDATE submissions SET score=?,feedback=?,state='reviewed' WHERE task=? AND state IN ('submitted','reviewed')").bind(score,feedback,String(b.task)).run();if(!r.meta.changes)throw new AppError('No hay una entrega para revisar.');
 }else if(b.action==='reopen'){
  teacher(c.role);await db().prepare("UPDATE submissions SET state='draft',score=NULL,feedback='',submitted=NULL WHERE task=?").bind(String(b.task)).run();
 }else throw new AppError('Acción no válida.');return Response.json({ok:true});
}catch(e){if(e instanceof z.ZodError)return errorResponse(new AppError('Revisa los campos: completa título, curso, preguntas y alternativas válidas.'));return errorResponse(e);}}
