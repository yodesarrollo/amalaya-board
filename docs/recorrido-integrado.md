# Amalaya · recorrido integrado

**Estado vigente:** publicación visual autorizada. Véase «Actualización pública autorizada» al final; las secciones de entrega local documentan la revisión anterior.

Propuesta del 30 de septiembre de 2026: **Caminar Amalaya antes de construirlo.**

Entrar al board abre el territorio modelado, colocado sobre la cartografía de la ciudad. Acercarse, escoger un punto y pasar a caminar o al panorama 360 mantiene la selección. Actual y Amalaya comparten anclas: el cambio permite evaluar una intervención desde el mismo lugar.

## Entrega local

- Portal integrado como primera sección del board; el mapa de trabajo, finanzas y demás módulos conservan su acceso y permisos.
- Vista de conjunto MapLibre con calles vectoriales OSM debajo del levantamiento Three.js. El origen y la escala se derivan de WGS84; no se coloca una ilustración arbitraria sobre el mapa.
- Cuatro rutas y 37 waypoints con IDs originales de panoramas. Los 128 puntos de observación se ofrecen por separado: no se inventa su correspondencia con fotografías.
- Caminar carga el visor del levantamiento solo al entrar. Puntos 360 usa el visor existente y sus imágenes/render disponibles; no se generaron ni copiaron nuevas fotografías al modelo.
- Selector Actual / Amalaya. Amalaya muestra **únicamente un ensayo conceptual de dos estancias con sombra en Plaza Hidalgo**, no una transformación aprobada de todo el polígono. En 360 activa el render disponible; si falta, conserva el actual y el aviso existente. No presenta una foto actual como render futuro.
- Panel de presentación y plan de mejoras accesible dentro del portal.

## Para visualizar juntos

Con el proyecto Hidalgo3D en el directorio hermano:

```sh
# En Hidalgo3D
corepack pnpm build
corepack pnpm exec vite build --config vite.world.config.ts
# En amalaya-board
npm ci
npm run preparar:3d
npm run dev -- --host 127.0.0.1 --port 5174
```

Revisión sin datos de negocio: `http://127.0.0.1:5174/amalaya-board/preview-recorrido.html`.
Board con sus permisos habituales: `http://127.0.0.1:5174/amalaya-board/`.

La revisión independiente no pide sesión porque solo carga recursos locales del recorrido; no consulta el Sheet ni evita autenticación del board. El visor existente conserva su propio comportamiento.

## Siguiente plan, acotado a Amalaya

| Orden | Trabajo | Condición para aceptarlo |
| --- | --- | --- |
| 1 | Medir Chihuahua Abasolo–Garmendia y después Garmendia de R-002/R-003 | Cruces verificables, anchos por lado e incertidumbre; comparación plan/bloque/pie |
| 2 | Definir el proyecto Amalaya con diseño aprobado | Plano de intervención, cotas y versión; sustituir el ensayo conceptual |
| 3 | Producir pares 360 por punto | Fotografía propia/autorizada, mismo centro óptico y rumbo, render ligado a ID y revisión; comenzar por una cuadra |
| 4 | Afinar fachadas y materiales | Huecos, sombras y escala comparables; separar observación de hipótesis |
| 5 | Mejorar recorrido y acceso móvil | Controles táctiles de caminar, trayecto guiado, recuperación de cámara, navegación con teclado y estados de carga verificables |
| 6 | Reducir carga | Agrupación de mallas, instancias, niveles de detalle y carga por cercanía; medir dispositivos reales y fijar presupuesto de memoria/fotogramas |

## Integración y privacidad

El repositorio `yodesarrollo/amalaya-board` es público y despliega Pages al hacer push a main. El levantamiento debe seguir privado: **no se ha hecho push ni despliegue**. `public/levantamiento/`, `dist/` y las capturas de revisión están ignorados por Git; no deben subirse a Pages. El script local materializa builds de Hidalgo3D, sin cambiar su remoto ni copiar su historial al repositorio público.

Para llevar esta experiencia a producción habrá que servir el levantamiento desde un destino privado con control de acceso real, no confiar en ocultar una URL. El acceso del board no protege por sí solo los archivos estáticos de Pages. La arquitectura final y la autorización de publicación privada se resuelven después de revisar esta versión local.

La primera carga usa el contexto vectorial OSM ya disponible (sin dependencia de imagery). El mapa está acotado al entorno de Amalaya; el detalle nuevo propuesto se limita a PH-01. Los mensajes entre el board y sus visores comprueban origen y ventana emisora.

## Rendimiento y comprobaciones de esta revisión

La vista de conjunto agrupa geometría estática en 149 mallas, simplifica las 6,713 losas biseladas a cajas y usa materiales ligeros: pasa de aproximadamente 1.48 millones a 0.43 millones de vértices instanciados. El mapa se destruye al entrar a caminar/360 y se reconstruye al volver, para no mantener dos escenas activas. El visor a pie embebido conserva materiales y geometría del levantamiento, limita la densidad de píxel, desactiva la sombra dinámica de 4096 px y solo renderiza al cambiar cámara, tamaño o escena. El visor independiente conserva sus sombras.

El motor Three.js del 360 se sirve localmente con su licencia MIT; no depende del CDN externo. El modelo territorial y el visor a pie se cargan bajo demanda. Sigue pendiente medir FPS y memoria en teléfonos reales: las pruebas con Chromium por software en el entorno disponible mostraron lentitud, y no se presenta esta revisión como benchmark de rendimiento móvil.

Verificación de código: 65/65 pruebas del levantamiento con `pnpm test --maxWorkers=1`, TypeScript, build y smoke correctos. Una corrida concurrente anterior agotó el límite de 5 s de una prueba; la repetición secuencial pasó. Las suites del board (finanzas, careta, avance, MOAC, recorrido y modelos), más las pruebas nuevas de IDs/rumbos/mensajes del portal, pasan. El build mantiene avisos de tamaño de chunks, registrados como deuda de carga.

Referencia de implementación: [capa Three.js sobre MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/add-a-3d-model-using-threejs/). Se conserva la API de MapLibre 4.7 instalada en este board.

## Actualización pública autorizada · 30 de septiembre de 2026

La instrucción posterior del usuario autoriza publicar el modelo y el recorrido para acceso desde cualquier dispositivo. Sustituye la restricción de entrega exclusivamente local descrita arriba. Se publica **el paquete visual compilado**, no el repositorio ni el historial de Hidalgo3D. El remoto del levantamiento no cambia. Los datos de operación, finanzas y acceso siguen en su backend con sus controles existentes.

Entrada pública: `https://yodesarrollo.github.io/amalaya-board/explorar.html`. El acceso principal al board incorpora un enlace visible al recorrido. La URL pública abre sin cuenta y no importa el proveedor de datos del negocio. `preview-recorrido.html` permanece como alias compatible.

Incluye portada editorial, ruta activa y punto seleccionado destacados, progreso del recorrido, regreso al punto, enlaces compartibles con ruta/punto/vista/versión, controles táctiles para caminar y estados de carga. El panel «Propuesta y próximos pasos» presenta el plan por etapas. La intención de identidad es sonorense, cultural y musical; no se afirma respaldo personal de ningún artista.

### Resultados y criterios de evolución

1. **Acceso:** abrir desde HTTPS sin servidor local. Verificar HTML, rutas, módulo 3D y panorama desde la URL publicada.
2. **Comprensión:** distinguir levantamiento provisional, concepto de sombra y futuro diseño aprobado. No sugerir que el proyecto completo está modelado.
3. **Recorrido:** mantener selección al alternar modos; compartir una estación concreta. El enlace restaura la estación y el rumbo de ruta, no una cámara libre arbitraria.
4. **Móvil:** controles de 44 px o más, giro táctil, botones de movimiento con cancelación y liberación al perder foco. Pendiente evaluación de FPS/memoria en teléfonos físicos.
5. **Siguiente cuadra:** Chihuahua entre Abasolo y Garmendia. Medición independiente por lado y evidencia antes de afinar fachadas.
6. **Transformación:** recibir diseño aprobado, modelar por cuadra, producir pares 360 en el mismo punto y comparar con geometría actual.

Antes de desplegar, `npm run verificar:publicacion` comprueba el paquete visual y detecta credenciales de formatos conocidos; complementa la revisión de contenido, no sustituye una auditoría de seguridad. Pages sirve esos activos públicamente por autorización expresa.

## Integración con el tablero de trabajo

La entrada de personal vuelve a ser el board principal, en `https://yodesarrollo.github.io/amalaya-board/`, después de iniciar sesión. La sección **Territorio** abre `Mapa`, cuyo lienzo principal es ahora el levantamiento inmersivo. Se elimina la pestaña separada que dejaba las fichas en otro mapa.

- Pines y buscador reciben exclusivamente `Espacios` entregados por la sesión. Abren el mismo `FichaEspacio`, con fotos, documentos, factores, conocimientos, tareas e historial según los datos y permisos existentes. No se crea una segunda ficha ni otro mecanismo de guardado.
- Los pines conservan la vinculación por ID/zona de `territorio.js`; los espacios libres usan la misma calibración `mapa_geo` del plano anterior. Las ubicaciones de la lámina siguen siendo hipótesis, no medidas nuevas.
- Las capas «Espacios» y «Puntos de recorrido» se alternan para evitar mezclar gestión y presentación. El buscador sigue disponible en Caminar 3D y Puntos 360.
- «Plano y herramientas» conserva la vista anterior, sus módulos, calibración y edición de rutas/paradas. Mover espacios mantiene Aplicar/Cancelar. Reporte, Finanzas, escenarios financieros y Plan conservan sus módulos.
- La experiencia pública `explorar.html` no recibe filas de espacios ni permisos. Compartir recorrido desde el board genera ese enlace público con ruta, punto, vista y versión, sin nombres ni datos de las fichas.
- No se cambia el contrato de roles: el inversionista conserva su Reporte; los promotores pueden presentar el recorrido público. No se incorporan tres propuestas arquitectónicas sin definirlas: se conservan los tres modos de navegación y los escenarios existentes.

Esta actualización es de UX e integración. No corrige la volumetría ni valida las fachadas del levantamiento.

Prueba de navegador reproducible con el Apps Script interceptado y datos de demostración: `npm --prefix herramientas/simulador ci`, servir el build y ejecutar `REVIEW_URL=http://localhost:5180/amalaya-board/ node herramientas/simulador/prueba-territorio.cjs`. Comprueba el pin y la ficha, el parche al ID original, documentos, navegación 360/3D, el visor sin edición y el acceso acotado del inversionista. No realiza escrituras al backend real.
