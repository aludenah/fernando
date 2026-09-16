# Fernando · Aula de Álgebra

Web para las clases particulares de Fernando, preparada para **GitHub Pages**. No utiliza Sites ni requiere una cuenta de ChatGPT. No se ha configurado correo ni inicio de sesión.

## Publicación en GitHub Pages

1. Abre [Settings → Pages](https://github.com/aludenah/fernando/settings/pages).
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. Selecciona **main** y **/docs**, y pulsa **Save**.

GitHub publicará la web en `https://aludenah.github.io/fernando/`. La activación inicial necesita un administrador del repositorio; añadir los archivos no la activa automáticamente. El proceso de publicación se puede consultar en la pestaña **Actions**. Cada cambio confirmado en `docs/` actualizará la web.

El sitio usa rutas relativas y navegación por fragmentos, por lo que funciona en `/fernando/` y permite recargar una tarea sin errores 404. No hay instalación ni compilación para publicarlo.

## Contenido del capítulo 1

El capítulo **Conjuntos numéricos** sigue el PDF de Álgebra, Colección Esencial, Lumbreras Editores, proporcionado para las clases:

- 7 apartados: naturales, enteros, racionales, irracionales, reales, propiedades e inversos, y aplicaciones.
- 3 tareas iniciales, con 5 preguntas cada una y alternativas A–E.
- Referencias a las páginas del libro y del PDF. Se respeta la convención del libro: los naturales empiezan en 1.

La guía resume y adapta el contenido. No se publica el PDF completo ni las claves o soluciones privadas del profesor.

## Qué funciona en esta etapa

- Leer la guía, marcar temas repasados y seleccionar respuestas.
- Adjuntar PDF, JPG, PNG y WEBP: hasta 10 MB por archivo, 10 archivos y 40 MB por tarea.
- Conservar respuestas, comentarios y archivos en IndexedDB del navegador.
- Descargar una copia `.json` que contiene la tarea, las respuestas y todos los adjuntos. Se requiere responder todas las preguntas y adjuntar al menos un archivo.
- Importar esa copia desde **Preparar clase**, descargar los adjuntos, guardar una nota sobre 20 y comentarios, y descargar la revisión como texto.
- Crear o editar tareas localmente y descargar el contenido actualizado.

**Las descargas no son entregas en línea.** El profesor no recibe automáticamente lo que Fernando hace en otro dispositivo. La página lo indica junto al formulario y al botón de descarga. El inicio de sesión, el envío remoto y el almacenamiento compartido se implementarán en una etapa posterior con un servicio de backend: GitHub Pages sirve archivos estáticos y no ofrece una base de datos ni recepción de archivos.

El almacenamiento pertenece a este navegador y dispositivo. No se sincroniza entre equipos; borrar los datos del navegador elimina el trabajo local. Las descargas permiten conservar una copia. Las herramientas del profesor son un editor local, no una zona privada autenticada. Publicar en GitHub requiere los permisos de la cuenta del repositorio.

## Crear y publicar tareas

1. Abre **Preparar clase → Nueva tarea** o **Editar tarea** desde una actividad.
2. Guarda los cambios en el dispositivo.
3. En **Preparar clase**, descarga `course.json`.
4. Usa **Abrir carpeta en GitHub** para subir ese archivo a `docs/data`, sustituyendo el existente, y confirma el cambio.

Las tareas y los borradores de `course.json` son públicos en el repositorio. La marca `published` solo controla su aparición en la lista del alumno: no protege contenido. No incluyas información personal, entregas del alumno o claves de respuestas en ese archivo. El exportador conserva solo los campos públicos definidos de cada tarea.

Las claves y soluciones privadas de la versión previa no se han trasladado al sitio público. El trabajo anterior se conserva en la rama `archive/before-github-pages`.

## Desarrollo y comprobaciones

Con Node 22 o superior y Python 3:

```sh
npm test
npm run check
npm start
```

Abre `http://localhost:4173`. La aplicación no tiene dependencias de paquetes ni carga scripts externos.

```text
docs/index.html          Página inicial
docs/styles.css          Diseño adaptable
docs/app.js              Curso, tareas, editor y revisiones
docs/model.js            Validaciones y formato público de los datos
docs/store.js            Almacenamiento local transaccional
docs/data/course.json    Capítulo 1 y tareas publicadas
tests/                   Comprobaciones de datos y archivos
```

Para entregas remotas, el siguiente paso es elegir y conectar autenticación, una base de datos y almacenamiento privado de archivos. No se deben añadir tokens de GitHub, credenciales o claves de servicio a los archivos públicos de esta web.
