# Profesor Alex Ludeña · Matemáticas y Física

Web de clases particulares publicada en **[GitHub Pages](https://aludenah.github.io/fernando/)**, desde `main` y la carpeta `/docs`. No requiere correo ni inicio de sesión. Los accesos privados se incorporarán más adelante.

## Accesos de Fernando, Josué y padres

La portada permite elegir **Padres**, **Fernando** o **Josué**, sin correo ni contraseña. Los perfiles separan los datos de trabajo; no son autenticación ni impiden que alguien abra el otro acceso.

- Fernando tiene 30 problemas autocorregibles y 30 ejemplos resueltos en la teoría. Al completar las diez preguntas de cada nivel, ve su nota sobre 20, las preguntas incorrectas y sus soluciones paso a paso. Ya no necesita entregar archivos en Drive.
- Padres permite elegir al alumno y muestra su avance real: respuestas marcadas y pendientes, tareas respondidas, temas repasados, última actividad, comentarios y detalle de cada pregunta. Para Fernando, cada tarea terminada muestra también su nota, sus aciertos y las soluciones. El porcentaje de avance cuenta respuestas, mientras que el porcentaje de aciertos mide la calificación.
- El guardado compartido está conectado a la implementación de Google Apps Script configurada en `docs/data/sync.json`. Se comprobó que la implementación responde a las consultas de ambos alumnos sin iniciar sesión. [Configuración y mantenimiento del servicio](integrations/progress/README.md).
- Respuestas y teoría se sincronizan por alumno al entrar, al recuperar la conexión, al volver a la pestaña y cada 30 segundos mientras el aula está visible. El panel de Padres consulta esos mismos datos. La web solo indica «Avance sincronizado» cuando recibe y guarda una confirmación válida del servidor.
- Las respuestas anteriores se conservan y se envían al abrir el dispositivo donde estaban guardadas. Una copia antigua solo completa campos ausentes en el servidor; no sustituye el avance compartido. Los cambios sin conexión quedan pendientes en IndexedDB hasta que se confirme su envío.
- **Informe para mis padres** sigue disponible como copia de respaldo. Los informes importados indican su fecha, no se actualizan automáticamente y no sustituyen respuestas. No se publican respuestas ni informes personales en GitHub.

Las instrucciones y los enunciados son autónomos: no remiten al libro ni al PDF para resolver los problemas.

## Josué · 4.º de primaria

Su espacio contiene una ruta de nueve unidades para preparar concursos, empezando por **Números, patrones y estrategias**. La unidad 1 incluye diez temas explicados y treinta problemas propios: diez básicos, diez intermedios y diez avanzados. Las demás unidades están identificadas como próximas. Las referencias y categorías se comprobaron en las páginas oficiales de [CONAMAT](https://www.conamat.edu.pe/concurso/descarga/25_Bases_y_Temarios_Conamat_2026_Web_2.0.pdf), [Canguro Matemático Perú](https://canmatperu.com/) y [CONEMATE](https://grupo-mate.com/iv-concurso-nacional-escolar-de-matematica-2026/). La web no inscribe a los alumnos en esos concursos.

- `docs/data/josue-course.json` contiene su plan, teoría y práctica.
- `docs/data/josue-drive.json` contiene sus treinta carpetas de solucionarios, separadas de las de Fernando. La carpeta principal requiere activar en Drive **Cualquier persona con el enlace → Editor**; `publicAccessPending` registra esta tarea pendiente.
- El parámetro `alumno=fernando` o `alumno=josue` selecciona el contenido y una base de datos independiente. Cada página conserva ese perfil durante todos sus guardados.
- Fernando sigue usando `fernando-aula-github-v1` sin migrar ni borrar sus respuestas anteriores; Josué usa `josue-aula-github-v1`. Se separan respuestas, teoría, tareas editadas, archivos, informes y revisiones.
- Los informes nuevos identifican al alumno con formato `aula-avance`, versión 2. Los informes antiguos `fernando-avance`, versión 1, siguen funcionando. Un informe de otro alumno se rechaza antes de guardarlo, indicando a qué perfil corresponde.

## Curso y contenido

La referencia actual es **ALGEBRA.pdf · Colección Compendios Académicos UNI · Lumbreras Editores**. El temario conserva sus **28 capítulos**. Las referencias bibliográficas se conservan en los datos del curso y no se muestran en la web. Solo está desarrollado el capítulo 1, **Introducción al álgebra**: libro pp. 9–18, PDF pp. 4–13.

- Diez apartados teóricos con explicaciones, fórmulas, **30 ejemplos resueltos similares a la tarea con datos diferentes** y recomendaciones: conjuntos numéricos, inversos, decimales, números complejos, operaciones, sumas telescópicas y despejes.
- **30 problemas originales adaptados al contenido**: 10 básicos, 10 intermedios y 10 avanzados, con cinco alternativas por pregunta.
- Fernando marca sus respuestas en la página. Tras la décima respuesta de cada nivel recibe la nota; puede navegar por todas las preguntas y abrir sus soluciones sin adjuntar archivos.
- Aritmética, Geometría y Trigonometría tienen espacios preparados para incorporar sus cursos más adelante.

Los naturales empiezan en 1, según la convención del libro; ℕ₀ incluye el cero. No se publica el PDF completo. Las claves y los desarrollos de las tareas autocorregibles sí forman parte del contenido estático público, aunque la interfaz solo los muestra al terminar cada tarea. Se trata de práctica formativa, no de una evaluación con claves confidenciales.

## Calificación y soluciones de Fernando

- `autoGrade: true` activa la calificación de una tarea. Cada pregunta incluye `grading.correctIndex` (índice desde cero), `steps`, `hint` y un `topicId` opcional para volver al ejemplo teórico.
- Una tarea incompleta no muestra nota, aciertos ni soluciones. Al guardar la última alternativa, la interfaz enfoca el resultado y cierra las respuestas. Durante la tarea se pueden revisar y corregir las anteriores.
- Todas las alternativas tienen el mismo peso: nota = 20 × aciertos / número de preguntas, sin descuento por errores. Las tres tareas actuales tienen 10 preguntas, por lo que cada acierto vale 2 puntos.
- La nota se calcula a partir de las respuestas ya guardadas, también las anteriores a esta actualización. No se modifican identificadores, alternativas, bases de datos ni el protocolo de sincronización; no hace falta volver a implementar Apps Script.
- Los botones de revisión indican correcta/incorrecta con texto y símbolos, además de color. Cada error muestra la respuesta marcada, la correcta y una orientación de repaso; todos los problemas tienen solución detallada en LaTeX.
- Padres ve la misma nota al recibir las respuestas sincronizadas. Una copia histórica importada conserva su contenido original.
- Fernando ya no carga la configuración ni ve enlaces de entrega a Drive. Las carpetas y archivos anteriores se conservan; no se eliminó contenido en la cuenta del profesor. Josué mantiene sus carpetas actuales, con la [guía de permisos](integrations/google-drive/README.md).

## Tareas en secuencia y avance

- Se muestra una pregunta a la vez. La siguiente solo se habilita después de guardar una alternativa de la actual; no se exige acertar ni subir un archivo para avanzar.
- Los botones numerados permiten revisar y cambiar respuestas anteriores mientras la tarea de Fernando no esté calificada; después sirven para consultar la corrección. Las preguntas posteriores al primer hueco quedan bloqueadas, incluso si había respuestas dispersas de una versión anterior; esas respuestas se conservan.
- Al volver a una tarea o recargar la web, se abre la primera pregunta pendiente. Si todas están respondidas, se abre la última para revisarlas.
- Cada alternativa se guarda automáticamente en IndexedDB. Las tarjetas y el detalle muestran cuántas preguntas están respondidas y su porcentaje; el panel de Padres utiliza esos mismos datos.
- Una pregunta solo desbloquea la siguiente cuando el guardado termina correctamente. Si falla, se conserva el estado anterior y se muestra el error.
- Se conservan las respuestas y comentarios previos. Las respuestas y los temas repasados se comparten cuando se activa el servicio; los comentarios antiguos, archivos locales y revisiones del profesor permanecen en el navegador.

## Respuestas y revisión

- Las alternativas se guardan primero en el navegador junto con su envío pendiente. El servicio compartido, cuando está activado, las confirma sin exigir correo ni contraseña. Los comentarios antiguos permanecen locales.
- La vista de cada tarea muestra las preguntas y el avance. Fernando recibe su calificación y solucionarios al terminar. Los accesos a Drive se mantienen solo para Josué. No incluye botones para descargar respuestas ni informes.
- Las copias JSON versión 3 descargadas anteriormente siguen siendo compatibles y pueden incluir archivos locales conservados de versiones anteriores. El profesor puede importarlas desde **Preparar clase** para revisar las respuestas, puntuar sobre 20 y descargar sus comentarios.
- Las copias de trabajo de las versiones 1 y 2 siguen siendo compatibles.
- Las entregas de Josué se realizan dentro de Drive; abrir una carpeta no confirma una entrega. Fernando consulta las soluciones en el aula y no sube archivos.
- Las herramientas del profesor son un editor local; no son una zona autenticada. El editor permite indicar la alternativa correcta, los pasos del solucionario y qué repasar para las tareas autocorregibles de Fernando.

## Añadir y publicar contenido

1. En **Preparar clase**, crea o edita una tarea y guárdala en el dispositivo.
2. Descarga `course.json` y reemplaza `docs/data/course.json` en GitHub, confirmando el cambio.
3. En Fernando, completa la clave y el solucionario de cada pregunta. Las carpetas de entrega solo son necesarias para las tareas de Josué.
4. Ejecuta `node scripts/build-progress-service.mjs`, actualiza `Core.gs` en Apps Script y publica una nueva versión de la implementación existente para sincronizar las preguntas nuevas.

Los borradores también forman parte del archivo público. No incluyas datos privados. Las claves de autocorrección serán públicas dentro de los datos del curso. Los cursos y capítulos tienen identificadores propios, para ampliar la colección sin mezclar entregas. Las preguntas modificadas deben recibir un identificador nuevo si cambia su significado o sus alternativas.

Cada confirmación en `main` ejecuta las comprobaciones y actualiza GitHub Pages. El historial conserva las versiones anteriores; el proyecto previo al traslado a Pages está en `archive/before-github-pages`.

## Expresiones matemáticas

La teoría, los enunciados, las alternativas y el detalle para Padres usan LaTeX. En `course.json` se escribe `\\(...\\)` para fórmulas dentro del texto y `\\[...\\]` para fórmulas separadas; JSON requiere duplicar las barras inversas. Los valores y el orden de las alternativas se conservan, al igual que los identificadores del avance guardado.

El renderizado usa [KaTeX 0.18.7](https://katex.org/docs/api.html), alojado en el propio repositorio, con sus fuentes WOFF2 y licencia MIT. Genera HTML y MathML para lectores de pantalla. Los textos se escapan y `trust: false` impide que las expresiones importadas inserten enlaces, imágenes o HTML. Las macros se aíslan entre expresiones.

Los archivos de `docs/vendor/katex` proceden del paquete oficial `katex@0.18.7`. La hoja de estilos conserva las fuentes WOFF2 y omite las alternativas WOFF/TTF. No se necesita un CDN para abrir las fórmulas. Al actualizar los módulos o estilos, debe actualizarse también su versión en las referencias de carga para evitar copias antiguas en caché.

## Desarrollo

Con Node 22 o superior y Python 3:

```sh
npm ci
npm test
npm run check
npm start
```

Abre `http://localhost:4173`. La aplicación estática no necesita compilación. Las pruebas de aislamiento usan `fake-indexeddb`; las de interacción usan `jsdom`, sin enviar respuestas de prueba al servicio real. Las pruebas comprueban el contenido público y la compatibilidad de las copias de respuestas. El código y las pruebas de la antigua recepción con Apps Script se conservan como referencia, pero ya no se utilizan desde la web.

| Ruta | Contenido |
| --- | --- |
| `docs/data/course.json` | Catálogo, 28 capítulos, teoría y 30 problemas |
| `docs/data/drive.json` | Enlaces históricos de Fernando, sin carga en su aula actual |
| `docs/app.js` | Respuestas, editor y navegación |
| `docs/grading.js`, `docs/grading-views.js` | Calificación, revisión de errores, soluciones y ejemplos |
| `docs/course-views.js` | Catálogo de cursos y temario |
| `docs/family-views.js`, `docs/progress.js` | Entradas, panel de padres e informes de avance |
| `docs/drive.js` | Utilidades de la integración anterior, sin uso en la web |
| `docs/model.js`, `docs/store.js` | Validaciones y almacenamiento local |
| `docs/sync.js`, `docs/sync-protocol.js` | Cola persistente y conciliación del avance compartido |
| `docs/data/sync.json` | URL de la implementación activa del avance compartido |
| `integrations/progress/` | Servicio, catálogo generado y pasos de activación |
| `integrations/google-drive/` | Guía de permisos y receptor anterior conservado |
| `tests/` | Pruebas automáticas |
