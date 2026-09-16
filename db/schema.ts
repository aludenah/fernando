import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
export const classroom = sqliteTable('classroom', {
 id:text('id').primaryKey(),teacher:text('teacher').notNull(),teacherEmail:text('teacher_email').notNull(),studentEmail:text('student_email').notNull().default(''),student:text('student'),
});
export const tasks = sqliteTable('tasks', {
 id:text('id').primaryKey(),title:text('title').notNull(),subject:text('subject').notNull(),instructions:text('instructions').notNull(),due:text('due').notNull(),questions:text('questions').notNull(),published:integer('published').notNull().default(0),created:text('created').notNull(),
});
export const submissions = sqliteTable('submissions', {
 task:text('task').primaryKey().references(()=>tasks.id),student:text('student').notNull(),answers:text('answers').notNull().default('{}'),state:text('state').notNull().default('draft'),submitted:text('submitted'),score:real('score'),feedback:text('feedback').notNull().default(''),
});
export const files = sqliteTable('files', {
 id:text('id').primaryKey(),task:text('task').notNull().references(()=>tasks.id),owner:text('owner').notNull(),kind:text('kind').notNull(),name:text('name').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),
},t=>[index('idx_files_task').on(t.task)]);
