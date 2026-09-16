# Activar las subidas de solucionarios a Google Drive

Las carpetas de los 30 problemas ya existen en tu Drive. El código de esta carpeta permite que Fernando suba un archivo por problema desde la web de GitHub Pages, sin pedirle un correo ni una cuenta de Google. Para entrar al formulario usará un **código de entrega** que tú elegirás. Los archivos de Drive conservan sus permisos privados.

**Estado actual:** preparado, pendiente de autorización e implementación en tu cuenta de Google. Crear carpetas no autoriza a la página de GitHub a escribir en Drive. La conexión disponible en esta conversación permite gestionar archivos y carpetas, pero no crear ni desplegar proyectos de Apps Script.

## Activación inicial

1. Abre [Google Apps Script](https://script.google.com/) con la misma cuenta donde se creó «Fernando - Aula de Matemáticas» y pulsa **Nuevo proyecto**. Llámalo **Fernando - Solucionarios**.
2. Abre [Code.gs de este repositorio](https://github.com/aludenah/fernando/blob/main/integrations/google-drive/Code.gs), copia su contenido completo y reemplaza el contenido del archivo `Código.gs` del proyecto. Guarda. Es un solo archivo; los identificadores de las carpetas ya están incluidos.
3. En **Configuración del proyecto → Propiedades de la secuencia de comandos**, añade una propiedad llamada `UPLOAD_CODE`. Como valor, elige un código privado de entre **12 y 128 caracteres** que solo tú y Fernando conozcan. No uses una contraseña de tu cuenta. No pegues el código en GitHub ni en esta conversación.
4. Pulsa **Implementar → Nueva implementación → Aplicación web**. Configura **Ejecutar como: Yo** y **Quién tiene acceso: Cualquier persona**. Esto permite abrir el formulario sin correo; cada envío seguirá requiriendo el código privado. Autoriza al proyecto para guardar archivos en tu Drive. No cambies la carpeta de Drive a acceso público.
5. Copia la URL que termina en `/exec`. En la web, abre **Preparar clase → Solucionarios en Google Drive**, pega esa URL y guarda. Esto permite probarla en tu dispositivo.
6. Para habilitarla también en el equipo de Fernando, pulsa **Descargar drive.json para publicar** y reemplaza `docs/data/drive.json` en GitHub. También puedes compartir aquí solo la URL `/exec` para que la conectemos; no compartas el código de entrega.

## Comprobación

Abre un problema, marca una alternativa y pulsa **Subir a Drive**. Introduce el código, selecciona una foto o un PDF y envía. Debe aparecer «Solucionario y respuesta enviados a Google Drive» y el archivo debe estar en la carpeta exacta del problema. No consideres un archivo entregado si aparece un error o no hay confirmación.

El formulario admite PDF, JPG, PNG y WEBP de hasta 10 MB por envío. Puedes volver a abrirlo para añadir otra foto. Por cada subida, guarda el archivo y un registro JSON con el enunciado, la alternativa marcada, el comentario y la fecha. El registro permite revisar desde Drive aunque Fernando cambie de equipo.

Las alternativas elegidas y los borradores se guardan localmente hasta el envío. Si la respuesta cambia después de subir un archivo, la web indica que debe enviarse de nuevo. Las copias locales pueden descargarse por nivel cuando todos sus problemas tengan una respuesta y un adjunto local.

## Organización

- Fernando - Aula de Matemáticas
  - Álgebra
    - 01 - Introducción al álgebra
      - 01 - Básico → Problema 01 … Problema 10
      - 02 - Intermedio → Problema 01 … Problema 10
      - 03 - Avanzado → Problema 01 … Problema 10
      - Material del profesor
  - Aritmética
  - Geometría
  - Trigonometría

## Detalles de la conexión

- La web permanece alojada en GitHub Pages. Apps Script se usa únicamente para recibir los archivos y guardarlos en Google Drive.
- El servidor resuelve la carpeta a partir de un identificador de problema autorizado. No acepta carpetas arbitrarias del navegador.
- Comprueba el código en el servidor, el tamaño real del archivo y su firma PDF/JPEG/PNG/WEBP.
- Nunca envía al navegador tokens de Google ni el código configurado.
- Un identificador de entrega evita duplicar el mismo envío al reintentarlo. El límite inicial es de 120 archivos y 300 MB al día para todo el aula.
- Los enlaces a las carpetas o archivos requieren los permisos habituales de Drive. Poder subir con el código no permite listar, borrar ni leer los archivos privados del profesor.
- Para revocar el acceso de subida, cambia `UPLOAD_CODE` o desactiva la implementación.
- Si se añaden nuevos cursos, capítulos o problemas, hay que ampliar el mapa `PROBLEMS`, crear sus carpetas y publicar una nueva versión del proyecto. Nunca renombres identificadores existentes para reutilizarlos en otra pregunta.

Documentación oficial: [aplicaciones web de Apps Script](https://developers.google.com/apps-script/guides/web) y [formularios con archivos](https://developers.google.com/apps-script/guides/html/communication#forms).
