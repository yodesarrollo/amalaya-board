# Amalaya · recorrido integrado para revisión

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
