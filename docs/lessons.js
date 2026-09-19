// Keep the original lesson as the default so old links and saved reports still work.
export const allLessons = course => [course.lesson,...(course.additionalLessons||[])];
export const lessonFor = (course,id) => allLessons(course).find(lesson=>lesson.id===id||lesson.topics.some(topic=>topic.id===id))||course.lesson;
export const lessonTasks = (tasks,lesson) => tasks.filter(task=>task.chapterId===lesson.id);
