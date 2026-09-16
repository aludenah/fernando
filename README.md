# Fernando · Aula de Matemáticas

Web de clases particulares publicada en **[GitHub Pages](https://aludenah.github.io/fernando/)**, desde `main` y la carpeta `/docs`. No requiere correo ni inicio de sesión. Los accesos privados se incorporarán más adelante.

## Curso y contenido

La referencia actual es **ALGEBRA.pdf · Colección Compendios Académicos UNI · Lumbreras Editores**. El temario conserva sus **28 capítulos**, con referencias a la página impresa y a la página del PDF. Solo está desarrollado el capítulo 1, **Introducción al álgebra**: libro pp. 9–18, PDF pp. 4–13.

- Diez apartados teóricos con explicaciones, fórmulas, ejemplos resueltos y recomendaciones: conjuntos numéricos, inversos, decimales, números complejos, operaciones, sumas telescópicas y despejes.
- **30 problemas originales adaptados al contenido**: 10 básicos, 10 intermedios y 10 avanzados, con cinco alternativas por pregunta.
- Fernando marca una respuesta en la página y puede adjuntar un desarrollo independiente a cada problema.
- Aritmética, Geometría y Trigonometría tienen espacios preparados para incorporar sus cursos más adelante.

Los naturales empiezan en 1, según la convención del libro; ℕ₀ incluye el cero. No se publica el PDF completo ni las claves de respuestas. El solucionario del profesor está en la carpeta privada **Material del profesor** de Google Drive.

## Solucionarios en Google Drive

Las carpetas ya se crearon en el Drive del profesor, organizadas por curso, capítulo, nivel y problema. `docs/data/drive.json` contiene los enlaces exactos a las 30 carpetas de ejercicios.

**La subida directa está preparada, pendiente de la autorización y publicación inicial de Google Apps Script por el propietario de Drive.** Hasta esa activación, el botón de envío permanece deshabilitado y la web explica que los adjuntos solo se guardan en este dispositivo.

[Instrucciones y código para activar la recepción](integrations/google-drive/README.md). La implementación utiliza un código de entrega elegido por el profesor, sin pedir correo ni una cuenta de Google a Fernando. El código se configura en Google; nunca se publica en GitHub. Las carpetas mantienen sus permisos privados.

Tras activar la conexión, cada envío guarda el PDF o foto y un registro con el enunciado, la alternativa marcada, el comentario y la fecha. La página muestra **Enviado a Drive** únicamente al recibir una confirmación válida del servidor. Si la respuesta cambia, solicita un nuevo envío. Una copia local o una descarga no equivale a una entrega al profesor.

## Trabajo local y revisión

- Respuestas, comentarios, temas repasados y archivos locales se conservan en IndexedDB de este navegador. No se sincronizan entre dispositivos.
- Se aceptan PDF, JPG, PNG y WEBP, hasta 10 MB por archivo y 10 archivos por problema. La copia local de un nivel admite 40 MB en total.
- **Descargar mi trabajo** genera una copia JSON con las respuestas y los adjuntos, identificando a qué problema corresponde cada archivo. Requiere responder los diez problemas y adjuntar un archivo local para cada uno.
- **Preparar clase** permite importar esa copia, descargar sus adjuntos, anotar una calificación sobre 20 y exportar los comentarios del profesor. También admite las copias de la versión anterior.
- Las herramientas del profesor son un editor local; no son una zona autenticada. Las claves privadas no se incluyen en la web.

## Añadir y publicar contenido

1. En **Preparar clase**, crea o edita una tarea y guárdala en el dispositivo.
2. Descarga `course.json` y reemplaza `docs/data/course.json` en GitHub, confirmando el cambio.
3. Para habilitar envíos en preguntas nuevas o modificadas, actualiza también el mapa de problemas de Apps Script y `drive.json`, según las instrucciones de la integración.

Los borradores también forman parte del archivo público. No incluyas datos privados ni claves de respuestas. Los cursos y capítulos tienen identificadores propios, para ampliar la colección sin mezclar entregas. Las preguntas modificadas deben recibir un identificador nuevo si cambia su significado o sus alternativas.

Cada confirmación en `main` ejecuta las comprobaciones y actualiza GitHub Pages. El historial conserva las versiones anteriores; el proyecto previo al traslado a Pages está en `archive/before-github-pages`.

## Desarrollo

Con Node 22 o superior y Python 3:

```sh
npm test
npm run check
npm start
```

Abre `http://localhost:4173`. La aplicación estática no tiene dependencias de paquetes ni necesita compilación. Las pruebas comprueban el contenido público, los archivos por problema, las confirmaciones de envío y la validación del receptor de Apps Script con servicios simulados. Las pruebas locales no sustituyen la primera entrega real tras autorizar Google.

| Ruta | Contenido |
| --- | --- |
| `docs/data/course.json` | Catálogo, 28 capítulos, teoría y 30 problemas |
| `docs/data/drive.json` | Carpeta de cada problema y URL del receptor |
| `docs/app.js` | Respuestas, archivos, editor y revisión |
| `docs/course-views.js` | Catálogo de cursos y temario |
| `docs/drive.js` | Enlace de subida y comprobación de confirmaciones |
| `docs/model.js`, `docs/store.js` | Validaciones y almacenamiento local |
| `integrations/google-drive/` | Receptor de archivos y activación inicial |
| `tests/` | Pruebas automáticas |
