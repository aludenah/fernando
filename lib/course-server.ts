import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { db } from './classroom-server';
import { taskSchema } from './task-schema';
import type { Chapter } from './course-types';

const topicSchema=z.object({id:z.string(),title:z.string(),pages:z.string(),concept:z.string(),formulas:z.array(z.string()),example:z.string(),tip:z.string()});
const chapterSchema=z.object({id:z.string(),title:z.string(),subject:z.string(),chapter:z.number().int(),source:z.string(),convention:z.string(),objectives:z.array(z.string()),taskIds:z.array(z.string().uuid())});
export function configuredChapter():{lesson:Chapter,tasks:z.infer<typeof taskSchema>[]} | null {
  const config=env as unknown as Record<string,string|undefined>;
  if(!config.ALGEBRA_CH1_META)return null;
  const read=(key:string)=>{const value=config[key];if(!value)throw new Error('Incomplete chapter configuration: '+key);return JSON.parse(value);};
  const meta=chapterSchema.parse(read('ALGEBRA_CH1_META'));
  const topics=z.array(topicSchema).parse([...read('ALGEBRA_CH1_TOPICS_A'),...read('ALGEBRA_CH1_TOPICS_B')]);
  const tasks=[1,2,3].map(n=>taskSchema.parse(read('ALGEBRA_CH1_TASK_'+n)));
  if(tasks.some((t,i)=>!t.id||meta.taskIds[i]!==t.id)||new Set(meta.taskIds).size!==3)throw new Error('Invalid chapter task identifiers');
  return {lesson:{...meta,topics},tasks};
}
export async function ensureChapterTasks(tasks:z.infer<typeof taskSchema>[]) {
  const now=Date.now();
  // Stable identifiers make initialization repeatable without replacing teacher edits.
  await db().batch(tasks.map((t,i)=>db().prepare('INSERT INTO tasks (id,title,subject,instructions,due,questions,published,created) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(t.id!,t.title,t.subject,t.instructions,t.due,JSON.stringify(t.questions),+t.published,new Date(now-i*1000).toISOString())));
}
