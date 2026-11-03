# Profesor Alex Ludeña · Aplicaciones de matemáticas

Web publicada en [GitHub Pages](https://aludenah.github.io/fernando/), desde `main` y `/docs`.

## Acceso y aplicaciones

La portada tiene una sola entrada: **Fernando**. Al pulsarla se abre su catálogo de aplicaciones. El primer icono es **Construcción de matrices**; nuevas aplicaciones se incorporan al registro de `docs/activities.js`.

Los accesos de Padres y Josué y sus materiales se han retirado de la web. También se han retirado los paneles de avance, el guardado de respuestas, la sincronización y la conexión con Apps Script. La aplicación no utiliza IndexedDB, almacenamiento local, cookies de sesión ni solicitudes para registrar resultados. La selección y las respuestas permanecen únicamente en memoria mientras la página está abierta; una recarga inicia una actividad nueva.

El acceso por nombre es libre; no constituye una cuenta autenticada.

## Construcción de matrices

- Cinco problemas por actividad. Los tamaños se seleccionan al azar entre 2 × 2, 2 × 3, 3 × 2 y 3 × 3.
- Reglas simples y por condiciones, con `i = j`, `i ≠ j` y comparaciones entre índices. El primer problema ya incluye casos.
- Sin selector de tamaño, etiquetas de posiciones, sustituciones ni recuadros adicionales al seleccionar las casillas.
- Fernando completa las casillas y pulsa **Verificar matriz**. Debe corregir los errores antes de avanzar. Los ceros y los valores negativos se comprueban correctamente.
- La interfaz conserva el botón de pantalla completa en navegadores compatibles y se adapta a celulares y tabletas.

## Comprobante de actividad

Al verificar correctamente las cinco matrices, la aplicación prepara un PDF con el nombre de Fernando, la actividad, las fechas de inicio y finalización, las reglas y respuestas de cada problema, sus intentos y el resultado de su primera verificación completa.

El botón **Descargar PDF** permite guardar el archivo y adjuntarlo manualmente a un mensaje de WhatsApp o correo. Cuando el dispositivo admite compartir archivos, aparece **Compartir PDF**, que abre su menú nativo. Ninguna opción envía mensajes automáticamente ni asegura que el profesor los haya recibido.

El comprobante se genera desde las respuestas verificadas de esa sesión; no es un documento firmado ni acredita la identidad de quien resolvió. Un futuro panel docente con entregas centralizadas requerirá autenticación del alumno y del profesor y validación en un servidor.

`docs/activity-report.js` valida los resultados completos. `docs/report-pdf.js` compone el documento. El generador y su fuente están alojados en el propio sitio, con sus licencias; no se envían respuestas a un servicio externo para crear el PDF.

## Desarrollo y comprobación

Con Node 22 o superior y Python 3:

```sh
npm ci
npm test
npm run check
npm start
```

La web estática se sirve en `http://localhost:4173`. No requiere servidor de aplicación ni compilación. Cada cambio en `main` ejecuta las pruebas y actualiza GitHub Pages.

Las pruebas verifican las reglas con resultados calculados de forma independiente, el límite de cinco matrices, la navegación, la corrección de errores, la ausencia de almacenamiento y seguimiento y la generación, descarga y disponibilidad del menú para compartir el PDF. Los mensajes y las funciones para compartir se prueban con simulaciones, sin enviar nada a personas reales.

El generador PDF es `jspdf@4.2.1`, fijado en `package-lock.json`; su distribución UMD y licencia se conservan en `docs/vendor/jspdf`. La fuente AulaSans es un subconjunto de DejaVu Sans para los caracteres utilizados en el comprobante. Las expresiones de la web siguen utilizando KaTeX con sus fuentes locales.
