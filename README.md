# Fernando · Aula de Matemáticas

Web de clases particulares publicada en **[GitHub Pages](https://aludenah.github.io/fernando/)**, desde `main` y la carpeta `/docs`. No requiere correo ni inicio de sesión. Los accesos privados se incorporarán más adelante.

## Acceso de padres y estudiante

La portada permite elegir **Padres** o **Estudiante**, ambos libres y sin correo ni contraseña. Son vistas de la misma aula; no constituyen autenticación ni protección de acceso.

- Estudiante conserva la teoría, los 30 problemas, el guardado de respuestas y los botones **Subir al Drive**.
- Padres muestra el avance real de Fernando: respuestas marcadas y pendientes, tareas respondidas, temas repasados, última actividad, comentarios y detalle de cada pregunta. Marcar una alternativa no significa que sea correcta ni que el solucionario esté entregado.
- En el mismo navegador, ambas vistas usan los mismos datos. El panel recibe cambios entre pestañas y vuelve a consultar el avance al recuperar el foco o pulsar **Actualizar vista**.
- Desde otro dispositivo se utiliza **Informe para mis padres**, disponible en Estudiante incluso con tareas incompletas. El padre importa ese JSON con **Abrir informe del estudiante**. El informe indica su fecha y no se actualiza automáticamente; no sustituye las respuestas locales del alumno.
- La sincronización automática entre dispositivos requiere un servicio de almacenamiento compartido que esta versión estática no tiene. No se publican respuestas ni informes personales en GitHub.

Las instrucciones y los enunciados son autónomos: no remiten al libro ni al PDF para resolver los problemas.

## Curso y contenido

La referencia actual es **ALGEBRA.pdf · Colección Compendios Académicos UNI · Lumbreras Editores**. El temario conserva sus **28 capítulos**, con referencias a la página impresa y a la página del PDF. Solo está desarrollado el capítulo 1, **Introducción al álgebra**: libro pp. 9–18, PDF pp. 4–13.

- Diez apartados teóricos con explicaciones, fórmulas, ejemplos resueltos y recomendaciones: conjuntos numéricos, inversos, decimales, números complejos, operaciones, sumas telescópicas y despejes.
- **30 problemas originales adaptados al contenido**: 10 básicos, 10 intermedios y 10 avanzados, con cinco alternativas por pregunta.
- Fernando marca una respuesta en la página y puede adjuntar un desarrollo independiente a cada problema.
- Aritmética, Geometría y Trigonometría tienen espacios preparados para incorporar sus cursos más adelante.

Los naturales empiezan en 1, según la convención del libro; ℕ₀ incluye el cero. No se publica el PDF completo ni las claves de respuestas. El solucionario del profesor está en la carpeta privada **Material del profesor** de Google Drive.

## Solucionarios en Google Drive

Cada problema muestra un único botón **Subir al Drive**, que abre su carpeta específica en una pestaña nueva. Fernando añade allí la foto o PDF mediante **Nuevo → Subir archivo**. No se requiere Apps Script, URL de implementación ni código de entrega.

Las 30 carpetas ya existen, organizadas por curso, capítulo, nivel y problema. Sus enlaces están en `docs/data/drive.json`.

**Los permisos públicos deben configurarse en Drive.** La conexión disponible permite organizar carpetas, pero no activar «Cualquier persona con el enlace» para carpetas. [Pasos para compartir todas desde la carpeta principal](integrations/google-drive/README.md).

El material del profesor está separado de las entregas, en la carpeta privada **Fernando - Material del profesor** de Mi unidad. Así no hereda los permisos de la carpeta del aula.

## Respuestas y revisión

- Las alternativas y comentarios se guardan en el navegador de Fernando.
- **Descargar mis respuestas** permite conservar una copia cuando estén respondidas las diez preguntas del nivel. No exige adjuntar archivos locales.
- La copia JSON versión 3 puede incluir archivos locales conservados de versiones anteriores. El profesor puede importarla desde **Preparar clase** para revisar las respuestas, puntuar sobre 20 y descargar sus comentarios.
- Las copias de trabajo de las versiones 1 y 2 siguen siendo compatibles.
- Los solucionarios se suben dentro de Drive. Abrir una carpeta no confirma una entrega; la página no consulta sus archivos ni registra una subida automática.
- Las herramientas del profesor son un editor local; no son una zona autenticada. Las claves privadas no se incluyen en la web.

## Añadir y publicar contenido

1. En **Preparar clase**, crea o edita una tarea y guárdala en el dispositivo.
2. Descarga `course.json` y reemplaza `docs/data/course.json` en GitHub, confirmando el cambio.
3. Para habilitar envíos en preguntas nuevas o modificadas, crea sus carpetas y añade los enlaces correspondientes a `drive.json`.

Los borradores también forman parte del archivo público. No incluyas datos privados ni claves de respuestas. Los cursos y capítulos tienen identificadores propios, para ampliar la colección sin mezclar entregas. Las preguntas modificadas deben recibir un identificador nuevo si cambia su significado o sus alternativas.

Cada confirmación en `main` ejecuta las comprobaciones y actualiza GitHub Pages. El historial conserva las versiones anteriores; el proyecto previo al traslado a Pages está en `archive/before-github-pages`.

## Desarrollo

Con Node 22 o superior y Python 3:

```sh
npm test
npm run check
npm start
```

Abre `http://localhost:4173`. La aplicación estática no tiene dependencias de paquetes ni necesita compilación. Las pruebas comprueban el contenido público y la compatibilidad de las copias de respuestas. El código y las pruebas de la antigua recepción con Apps Script se conservan como referencia, pero ya no se utilizan desde la web.

| Ruta | Contenido |
| --- | --- |
| `docs/data/course.json` | Catálogo, 28 capítulos, teoría y 30 problemas |
| `docs/data/drive.json` | Enlace a la carpeta de cada problema |
| `docs/app.js` | Respuestas, archivos, editor y revisión |
| `docs/course-views.js` | Catálogo de cursos y temario |
| `docs/family-views.js`, `docs/progress.js` | Entradas, panel de padres e informes de avance |
| `docs/drive.js` | Utilidades de la integración anterior, sin uso en la web |
| `docs/model.js`, `docs/store.js` | Validaciones y almacenamiento local |
| `integrations/google-drive/` | Guía de permisos y receptor anterior conservado |
| `tests/` | Pruebas automáticas |
