export const students = Object.freeze({
  fernando: Object.freeze({id:'fernando',name:'Fernando',courseFile:'course.json',driveFile:'drive.json',courseId:'algebra',unit:'Capítulo',subject:'Álgebra · Capítulo 1',description:'Comprende los números y opera con seguridad, paso a paso.'}),
  josue: Object.freeze({id:'josue',name:'Josué',courseFile:'josue-course.json',driveFile:'josue-drive.json',courseId:'concursos',unit:'Unidad',subject:'Concursos · 4.º de primaria',description:'Aprende a organizar datos, descubrir patrones y explicar cómo resolviste cada reto.'}),
});
export function studentProfile(id='fernando') {
  if(!Object.hasOwn(students,id))throw new Error('Estudiante no reconocido.');
  return students[id];
}
export function studentLink(id,route='cursos',search='') {
  studentProfile(id);
  const params=new URLSearchParams(search);
  params.set('alumno',id);
  return `?${params.toString()}#${route}`;
}
