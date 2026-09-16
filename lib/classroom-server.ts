import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export function db():D1Database { const v=(env as unknown as {DB?:D1Database}).DB;if(!v)throw new Error('DB unavailable');return v; }
export function bucket():R2Bucket { const v=(env as unknown as {BUCKET?:R2Bucket}).BUCKET;if(!v)throw new Error('Storage unavailable');return v; }
export class AppError extends Error { constructor(message:string,public status=400){super(message);} }
export async function context() {
 const user=await getChatGPTUser();if(!user)throw new AppError('Inicia sesión para entrar al aula.',401);
 let room=await db().prepare('SELECT * FROM classroom WHERE id=?').bind('main').first<any>();
 if(!room){const expected=(env as unknown as {TEACHER_EMAIL?:string}).TEACHER_EMAIL?.toLowerCase();if(!expected)throw new AppError('El acceso del profesor no está configurado.',503);if(user.email.toLowerCase()!==expected)throw new AppError('El profesor debe activar el aula primero.',403);await db().prepare('INSERT INTO classroom (id,teacher,teacher_email,student_email) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING').bind('main',user.userId,user.email,'').run();room=await db().prepare('SELECT * FROM classroom WHERE id=?').bind('main').first<any>();if(!room)throw new AppError('No se pudo iniciar el aula.',503);}
 if(room.teacher===user.userId)return {user,room,role:'teacher'};
 if(room.student===user.userId)return {user,room,role:'student'};
 if(!room.student&&room.student_email&&room.student_email===user.email.toLowerCase()){
  await db().prepare('UPDATE classroom SET student=? WHERE id=? AND student IS NULL AND student_email=?').bind(user.userId,'main',user.email.toLowerCase()).run();
  const fresh=await db().prepare('SELECT student FROM classroom WHERE id=?').bind('main').first<any>();
  if(fresh?.student===user.userId)return {user,room,role:'student'};
 }
 throw new AppError('Esta cuenta no tiene acceso al aula de Fernando. Pide al profesor que revise el correo autorizado.',403);
}
export function teacher(role:string){if(role!=='teacher')throw new AppError('Solo el profesor puede realizar esta acción.',403);}
export function secureWrite(request:Request){const origin=request.headers.get('origin');if(request.headers.get('sec-fetch-site')==='cross-site'||(origin&&new URL(origin).host!==new URL(request.url).host))throw new AppError('Solicitud no permitida.',403);}
export function errorResponse(e:unknown){if(e instanceof AppError)return Response.json({error:e.message},{status:e.status,headers:{'Cache-Control':'no-store'}});console.error('Classroom request failed',e);return Response.json({error:'No se pudo completar la operación. Conserva tus respuestas y vuelve a intentarlo.'},{status:503,headers:{'Cache-Control':'no-store'}});}
