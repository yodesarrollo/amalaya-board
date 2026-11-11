# C14 · cuadra 27 · edificios 90–94 · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según lo que muestra la única foto disponible, la aérea. Medidas visuales, no métricas.

## Criterio del propietario

Alejandro Puebla (10-nov-2026, 18:36 HMO): «más que genérico, sea una versión aceptable a la realidad según las fotos, lo que muestre»; aprueba además el modelo ligero para celular. Para C14 no hay foto de calle en el repositorio y el levantamiento desde la nube no alcanza Street View: se modela lo que la aérea muestra y las fachadas se estiman por tipología, declarándolo en cada registro.

## Fuentes

- Aérea Esri World Imagery, zoom 19, mosaico `calco/referencia.webp` (georreferenciado; 0.26 m/píxel) y recorte `ajuste-visual/C14.jpg`.
- Registros de inventario `evidence/D2-16…D2-20/20261006-01-cierre.json` (plantas ±3 m).
- Banqueta de C14 (`ajuste-visual/cuadras.json`): define la línea de fachada para detectar las caras a la calle.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 90/D2-16 esquina Felipe Salido–Mina; 91/D2-17 y 92/D2-18 frente de Felipe Salido; 93/D2-19 esquina Felipe Salido–Juan Álvarez; 94/D2-20 conjunto de Mina a Juan Álvarez sobre Bavispe. Sólo aérea; sin foto de calle. |
| 2. Forma | 90–93 conservan su planta de inventario. 94 pasa de un contorno que cubría el jardín arbolado a diez secciones trazadas a ±1 m sobre la aérea: techo rojo, ala noroeste en L, cuerpo suroeste, dos naves sobre Bavispe, cuerpo gris, bloque sureste, esquina sureste y dos cuerpos bajos hacia Juan Álvarez. El jardín y los patios quedan abiertos. |
| 3. Alturas | Sombra sobre Felipe Salido calibrada con la del 89 (6.0–6.75 m de sombra para 6.2 m) en la misma imagen: 90 = 4.8 m, 91 y 92 = 4.2 m, 93 = 3.8 m. En 94: 4.4 m por defecto; naves 4.2 y 5.2 m (escalón de ~1 m en la sombra); cuerpos bajos de 3.0 y 2.8 m (sombras de 2–3 m). Incertidumbre ±0.8–1 m. |
| 4. Fachada | Fábrica de fachadas, tipología «casa de un nivel»: puerta de madera, ventanas con reja frontal y marco, remate y zoclo, sobre cada cara a la calle (detectadas contra la banqueta) y las caras visibles detrás de jardines. Las caras al jardín quedan lisas. 46 vanos. |
| 5. Material y azotea | Color de techo mediano medido en la aérea por sección (blancos, techo rojo, gris); color de muro estimado (sin foto). Pretiles, tinacos, ventilas y un calentador solar en las posiciones vistas en la aérea. Superficie mate. |
| 6. Conjunto y ligero | Colisiones por sección; vecinos idénticos (firmas por edificio); 46 vanos alcanzados desde la calle; vista ligera con LOD (muros y vanos planos, tapa de cubierta, sin losas ocultas). |

Ficha con fuentes, mediciones de sombra, límites y hashes: [ficha.json](../public/levantamiento/evidence/C14/20261110-modelado/ficha.json).

## Límites

- Sin foto de calle: vanos, puertas y colores de muro son estimaciones tipológicas, no observaciones.
- La aérea muestra cubiertas fuera del inventario (entre 91 y 92 y al sur de 92). Se mantienen fuera del conteo de 139, igual que en el inventario de octubre.
- Alturas por sombra: dependen de la calibración con el 89, que también es estimada.
- Contornos de 94 a ±1 m; la planta de inventario de D2-20 se conserva como registro.

## Siguiente paso de evidencia

Con una toma de calle de Felipe Salido, Mina, Bavispe y Juan Álvarez (Hermes, Codex o un recorrido a pie) se sustituye la tipología por los vanos reales sin tocar volúmenes.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c14.json C14
python3 herramientas/blender/render-revision.py /tmp/escena-c14.json public/levantamiento/evidence/C14/20261110-modelado/camaras.json /tmp/vistas-c14
```
