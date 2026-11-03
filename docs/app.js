// Keep each classroom's runtime and saved work independent.
const student = new URLSearchParams(location.search).get('alumno');
if (student === 'josue') {
  await import('./classroom.js?v=matrices-2');
} else {
  const {mountMatrixApp} = await import('./matrices-app.js?v=matrices-2');
  await mountMatrixApp();
}
