# Fernando · Aula particular

Aula para clases particulares: el profesor publica tareas con alternativas y Fernando entrega sus respuestas junto con su desarrollo en PDF o fotos.

## Uso

1. El profesor entra en el sitio con su cuenta de ChatGPT y el aula se inicializa al entrar. Solo la cuenta autorizada en el servidor puede inicializarla.
2. **Nueva tarea** permite escribir título, curso, fecha opcional, indicaciones y de 1 a 60 preguntas, con 2 a 5 alternativas por pregunta.
3. Se puede guardar un borrador, adjuntar material y publicar después. Una vez que hay respuestas, la tarea queda protegida contra cambios en las preguntas.
4. En **Acceso**, el profesor autoriza el correo de Fernando. También debe compartir el sitio con ese correo desde Sites. Ambos controles son necesarios y no se envían invitaciones desde el formulario del aula.
5. Fernando entra con su cuenta de ChatGPT, marca respuestas, guarda un borrador si desea continuar más tarde y adjunta su desarrollo antes de entregar.
6. El profesor revisa las alternativas y descarga los archivos. Escribe una nota sobre 20 y sus comentarios, o reabre la entrega para correcciones.

Los archivos admitidos son PDF, JPG, PNG y WEBP; máximo 10 MB por archivo y 10 archivos por participante y tarea. Las entregas se bloquean después de enviarse. Las claves correctas se devuelven al alumno solo después de la revisión; los archivos se descargan a través de rutas protegidas. No se publican datos, claves de tareas ni solucionarios en GitHub.

## Arquitectura y alojamiento

- React, TypeScript y Vinext; componentes accesibles Radix/Shadcn.
- Cloudflare D1 para aula, tareas, respuestas y metadatos.
- Cloudflare R2 para los archivos.
- Inicio de sesión administrado por Sites/ChatGPT; roles y permisos comprobados en el servidor.
- `TEACHER_EMAIL`: correo del propietario, configurado en el entorno del servidor. No está incluido en este repositorio. Sin este valor, la activación inicial falla de forma cerrada.
- El código se conserva en `aludenah/fernando`; la aplicación se aloja en Sites. GitHub Pages por sí solo no ejecuta esta aplicación con base de datos y archivos privados.
- No se usa almacenamiento del navegador como base de datos.

## Desarrollo

Requiere Node 22.13+ y la versión de pnpm declarada en `package.json`.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

El entorno portátil del starter simula una cuenta local únicamente en loopback. Ajustar `TEACHER_EMAIL` a la cuenta de desarrollo. La identidad productiva siempre la proporciona el alojamiento, nunca un selector de rol del cliente. Para crear otra instalación, registrar su propio proyecto y establecer los enlaces lógicos D1 `DB` y R2 `BUCKET`.

Los cambios de esquema se generan con `pnpm db:generate`; las migraciones de `drizzle/` se aplican por el alojamiento antes de la publicación. Las credenciales y `.env` no deben subirse a GitHub.

## Comprobaciones

```sh
pnpm exec tsc --noEmit
node scripts/check-flows.mjs
pnpm build
```

La prueba local usa D1 y R2 simulados por Miniflare y comprueba creación, guardado, envío, archivo, revisión, reapertura, claves ocultas y denegación de permisos. La identidad se simula exclusivamente dentro de la prueba; no valida el inicio de sesión real ni la invitación de Fernando.

Se incluyen herramientas WebMCP de consulta y navegación con detección de soporte. Su validación en un navegador compatible queda pendiente; no son necesarias para usar los formularios.

## Primer curso: Álgebra

La pestaña Álgebra incorpora la guía del capítulo 1, Conjuntos numéricos, basada en el PDF proporcionado por el profesor. Incluye naturales, enteros, racionales, irracionales, reales, propiedades y aplicaciones. Tres tareas de cinco preguntas siguen esa secuencia. Las actividades son adaptadas; no son una transcripción completa del banco del libro.

El contenido se configura en el servidor en las variables privadas `ALGEBRA_CH1_META`, `ALGEBRA_CH1_TOPICS_A`, `ALGEBRA_CH1_TOPICS_B` y `ALGEBRA_CH1_TASK_1` a `ALGEBRA_CH1_TASK_3`. Las tareas se incorporan a D1 al entrar el profesor. Los identificadores estables y la inserción sin sobrescritura preservan las ediciones y las entregas existentes. Las respuestas y los solucionarios no se incluyen en el repositorio público. Los solucionarios del profesor se ocultan en el servidor hasta que se revisa una entrega.

El acceso de Fernando queda pendiente de configuración; esta actualización no cambia la audiencia del sitio ni envía invitaciones.
