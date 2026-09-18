# Avance compartido de Fernando y Josué

La web permanece en GitHub Pages. Este proyecto de Google Apps Script guarda solamente las alternativas y los temas repasados en propiedades del propio proyecto. No necesita leer Drive, Gmail ni otros archivos de la cuenta. Los solucionarios siguen usando las carpetas existentes de Drive.

## Estado de activación

El código está preparado, pero **no está activo mientras `docs/data/sync.json` tenga `endpoint` vacío**. La web lo indica como guardado únicamente en el dispositivo. No inventes una URL ni marques el servicio como sincronizado antes de desplegarlo y probarlo.

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

Al publicar preguntas nuevas, ejecuta `node scripts/build-progress-service.mjs`, actualiza `Core.gs` en el mismo proyecto y edita la implementación existente para usar la nueva versión. Conserva la misma URL y las propiedades del proyecto. No crees otro proyecto para cada actualización, porque perderías el acceso al estado anterior.

Las propiedades de Apps Script tienen límites de almacenamiento y peticiones. Esta implementación está acotada a los campos publicados de dos alumnos y usa un registro pequeño por campo. Al ampliar a muchas aulas, debe migrarse a una base de datos con autenticación y copias de seguridad.

Referencias oficiales: [aplicaciones web](https://developers.google.com/apps-script/guides/web), [propiedades](https://developers.google.com/apps-script/guides/properties), [cuotas](https://developers.google.com/apps-script/guides/services/quotas).
