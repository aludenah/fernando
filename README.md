# Profesor Alex Ludeña · Matemáticas y Física

Web publicada en [GitHub Pages](https://aludenah.github.io/fernando/), desde `main` y `/docs`. La portada conserva los accesos de **Padres**, **Fernando** y **Josué**, sin correo ni contraseña.

## Fernando · Construcción de matrices

[Entrar a la práctica](https://aludenah.github.io/fernando/?alumno=fernando#matrices).

El contenido anterior de Álgebra se ha retirado de su aula. Fernando construye una matriz a partir de una regla para sus elementos `aᵢⱼ`: `i` indica la fila y `j`, la columna; ambos comienzan en 1.

- Veinte problemas: cinco matrices de cada tamaño, **2 × 2**, **2 × 3**, **3 × 2** y **3 × 3**. El selector permite practicar todos los tamaños o uno concreto.
- Reglas con sumas, restas, productos, potencias, valor absoluto y condiciones según los índices. Todas las respuestas son enteras; hay ceros y valores negativos.
- Al seleccionar una casilla se resaltan su fila y su columna y se muestra la sustitución de índices, sin resolver la operación.
- **Verificar matriz** distingue casillas correctas e incorrectas mediante símbolos y texto. Una matriz vacía nunca se interpreta como una matriz de ceros. La matriz debe estar completa y correcta para habilitar **Siguiente problema**.
- Las respuestas incompletas y la posición de trabajo se conservan en el navegador. Las matrices resueltas se registran aparte y pueden consultarse desde **Padres → Fernando**, también desde otro dispositivo cuando el servicio de avance las confirma.
- La práctica se adapta a celulares y tabletas y permite pantalla completa en navegadores compatibles. El botón **− / +** facilita escribir negativos con teclados móviles.

`docs/data/course.json` define los veinte problemas y sus identificadores de avance. Las reglas se implementan explícitamente en `docs/matrices.js`: no se evalúan expresiones de texto. `docs/matrices-app.js` presenta la práctica y el panel de Padres. `docs/matrices.css` contiene sus estilos. `docs/app.js` elige el aula según el perfil.

El guardado de matrices utiliza una cola independiente (`matrices-cloud-sync-v1`) dentro de la base original de Fernando. Los borradores antiguos no bloquean la práctica nueva. El servicio de Apps Script descubre los identificadores publicados mediante su catálogo automático. Si la implementación antigua no admite un identificador nuevo o no hay conexión, se conserva el pendiente local y se muestra el estado real; nunca se anuncia una sincronización sin confirmación. Las casillas incompletas permanecen en el dispositivo donde se escribieron.

## Padres y Josué

Padres conserva el selector de alumno. Para Fernando muestra las matrices resueltas y el avance por tamaño; para Josué mantiene el panel de sus tareas y teoría.

Josué conserva su preparación para concursos, sus nueve unidades previstas, la primera unidad desarrollada con diez temas y treinta problemas, y sus carpetas de solucionarios. Sus datos, estilos y ejercicios permanecen separados de los de Fernando. `docs/classroom.js` conserva ese funcionamiento; sus archivos están en `docs/data/josue-course.json` y `docs/data/josue-drive.json`.

## Desarrollo y comprobación

Con Node 22 o superior y Python 3:

```sh
npm ci
npm test
npm run check
node scripts/build-progress-service.mjs --check
npm start
```

La web estática se sirve en `http://localhost:4173`; no requiere compilación. Cada confirmación en `main` ejecuta las comprobaciones del repositorio y actualiza GitHub Pages.

Las pruebas verifican los veinte resultados con cálculos independientes, casillas vacías, ceros, negativos, correcciones, navegación, guardado, aislamiento de alumnos y sincronización con un servidor de prueba. No envían respuestas de prueba al servicio real.

Los materiales retirados solo se conservan como fixtures de compatibilidad en `tests/fixtures/`, fuera de `/docs`. Los identificadores históricos del servicio se mantienen en `integrations/progress/legacy-fernando.json` para conservar la lectura del avance anterior; no se muestran como contenido del aula actual. Al modificar el catálogo se regenera el servicio con `node scripts/build-progress-service.mjs`.

[Configuración del servicio de avance](integrations/progress/README.md).
