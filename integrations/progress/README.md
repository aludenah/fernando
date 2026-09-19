# Avance compartido de Fernando y Josué

La web permanece en GitHub Pages. Este proyecto de Google Apps Script guarda solamente las alternativas y los temas repasados en propiedades del propio proyecto. No necesita leer Drive, Gmail ni otros archivos de la cuenta. Fernando consulta los solucionarios en la web; Josué conserva sus carpetas de Drive.

## Estado de activación

La implementación del propietario ya está configurada en `docs/data/sync.json`. Se verificaron el estado del servicio y consultas POST sin cambios para Fernando y Josué: las tres devolvieron JSON correcto, acceso anónimo y cabecera CORS. Las comprobaciones no añadieron respuestas de prueba a los alumnos.

Para incorporar respuestas de antes de la activación, abre una vez el aula en el navegador y dispositivo donde se guardaron. Espera a ver **Avance sincronizado** antes de continuar desde otro equipo. Los pendientes se conservan localmente cuando no hay conexión.

Si `endpoint` se deja vacío, la web vuelve a indicar que el avance solo está guardado en el dispositivo. Las siguientes instrucciones sirven para mantener la implementación o instalar una copia independiente.

## Actualizar el capítulo 2 sin perder el avance

El código de esta carpeta admite los capítulos 1 y 2 de Fernando y la unidad actual de Josué. La implementación existente debe publicar esta nueva versión para aceptar las preguntas añadidas. Guardar el código en el editor no actualiza por sí solo la aplicación web.

1. Abre **Aula Alex Ludeña — Avance**, el proyecto que ya usas en Google Apps Script.
2. Copia todo [Instalar.gs](Instalar.gs) con **Copy raw file** y reemplaza el contenido de **Code.gs** (o **Código.gs**) del mismo proyecto. Guarda. Si tu instalación usa archivos separados, actualiza **Core.gs y Code.gs** en vez de pegar el instalador único.
3. Pulsa **Implementar → Administrar implementaciones**. Elige la aplicación web actual y pulsa el lápiz para editarla.
4. En **Versión**, selecciona **Nueva versión** y pulsa **Implementar**. Conserva «Ejecutar como: Yo», «Cualquier persona» y la misma URL terminada en `/exec`.
5. Vuelve al aula, abre el capítulo 2 y pulsa **Sincronizar ahora**. El aviso de actualización pendiente debe desaparecer. Si ya hay respuestas locales, abre también el dispositivo donde se marcaron para enviarlas.

Usa el mismo proyecto: sus propiedades contienen las respuestas anteriores. No borres propiedades ni crees una implementación independiente para esta actualización. No se requieren permisos nuevos de Drive o correo.

La respuesta del servicio actualizado anuncia `supportedFields`; para Fernando contiene 80 campos (60 respuestas y 20 temas). Las consultas de páginas antiguas reciben solo los campos del capítulo 1, aunque el servicio conserve ambos capítulos. Una consulta GET con `studentId=fernando` permite comprobar el catálogo y el avance sin escribir datos.

## Activar una vez, como propietario

### Instalación sencilla desde el navegador habitual

1. Abre Google Apps Script con tu cuenta y selecciona **Nuevo proyecto**. Ponle el nombre **Aula Alex Ludeña — Avance**.
2. Abre [Instalar.gs](Instalar.gs) en GitHub y usa **Copy raw file** (icono de copiar junto a Raw) para copiar todo el contenido.
3. En Apps Script, reemplaza el contenido inicial de **Code.gs** por el código copiado y guarda. Este archivo único ya contiene el catálogo y el servicio completos.
4. Pulsa **Implementar → Nueva implementación**. En el engranaje, elige **Aplicación web**. Selecciona **Ejecutar como: Yo** y **Quién tiene acceso: Cualquier persona**. Implementa.
5. Copia la **URL de la aplicación web**, que termina en `/exec`. Esa dirección es la que se debe configurar en `docs/data/sync.json`. La sincronización no queda activa con solo guardar el código.

Esta instalación utiliza únicamente el archivo `Instalar.gs` pegado en `Code.gs`. La ruta de desarrollo que sigue utiliza los dos archivos por separado; elige una sola de las dos rutas en cada proyecto.

### Instalación para desarrollo (archivos separados)

1. En Google Apps Script, crea un proyecto llamado **Aula Alex Ludeña — Avance**.
2. Pega `Code.gs` y añade un archivo `Core.gs` con el contenido de esta carpeta. En Configuración activa la visualización del manifiesto y reemplaza `appsscript.json` por el incluido. No añadas permisos de Drive ni correo.
3. Implementar → Nueva implementación → Aplicación web. Ejecutar como **Yo**; acceso **Cualquier persona**, incluso sin iniciar sesión. Publica y copia la URL que termina en `/exec`.
4. Coloca esa URL en `endpoint`, en `docs/data/sync.json`, y confirma el cambio en GitHub. El sitio carga esta configuración sin caché.
5. Comprueba que el GET sin parámetros devuelve `aula-progress`. Comprueba desde GitHub Pages una consulta POST sin operaciones para cada alumno: debe responder JSON legible por el navegador. Si Google exige iniciar sesión, corrige el acceso de la implementación; no uses `mode: no-cors`, porque ocultaría fallos de guardado.
6. Abre el aula en el dispositivo que ya tiene respuestas para subir su avance anterior. Después comprueba ese avance desde otro dispositivo, sin marcar respuestas de prueba en los perfiles reales.

No solicita correo ni contraseña al alumno. En esta modalidad abierta, quien pueda abrir la web puede consultar y cambiar los perfiles. El enlace de implementación no es una contraseña. No almacenes calificaciones, documentos personales ni secretos aquí; el control de acceso se incorporará en una etapa posterior.

## Qué conserva

- IndexedDB mantiene exactamente las bases anteriores. No se borra ni reinicia ningún avance.
- El primer envío del avance antiguo solo completa respuestas ausentes en el servidor; una copia antigua nunca sustituye una respuesta compartida.
- Cada respuesta y su cambio pendiente se guardan en una única transacción. Los pendientes sobreviven al cierre de la página y se reintentan al volver a abrirla, recuperar conexión o volver a la pestaña.
- Las modificaciones se concilian por pregunta/tema, con revisiones del servidor. Los cambios en campos distintos se combinan. Si dos equipos cambian el mismo campo desde la misma revisión, se conserva el primero confirmado; el otro muestra un aviso y conserva el cambio descartado en `cloud-conflicts-v1` del navegador para revisarlo.
- El servidor valida alumno, preguntas, opciones, tamaño y secuencia. Un bloqueo de Apps Script serializa las peticiones. Los reintentos de una misma respuesta no duplican el avance.
- El panel de Padres consulta el mismo estado compartido; los informes importados siguen siendo copias identificadas por su fecha.
- Solo se sincronizan las tareas publicadas en los JSON del repositorio. El editor del profesor, notas de revisión y archivos locales siguen siendo locales.

## Mantener el servicio

Al publicar preguntas nuevas, ejecuta `node scripts/build-progress-service.mjs`, actualiza `Instalar.gs` en el mismo proyecto (o los dos archivos `Core.gs` y `Code.gs` en una instalación separada) y edita la implementación existente para usar la nueva versión. Conserva la misma URL y las propiedades del proyecto. No crees otro proyecto para cada actualización, porque perderías el acceso al estado anterior.

Las propiedades de Apps Script tienen límites de almacenamiento y peticiones. Esta implementación está acotada a los campos publicados de dos alumnos y usa un registro pequeño por campo. Al ampliar a muchas aulas, debe migrarse a una base de datos con autenticación y copias de seguridad.

Referencias oficiales: [aplicaciones web](https://developers.google.com/apps-script/guides/web), [propiedades](https://developers.google.com/apps-script/guides/properties), [cuotas](https://developers.google.com/apps-script/guides/services/quotas).
