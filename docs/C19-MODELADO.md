# C19 · cuadra 29 · edificios 103–111 · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según la única foto disponible, la aérea; mismo ciclo que [C14](C14-MODELADO.md), [C09](C09-MODELADO.md) y [C15](C15-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Fuentes

- Aérea Esri World Imagery, zoom 19, mosaico `calco/referencia.webp` (georreferenciado; 0.26 m/píxel) y recorte `ajuste-visual/C19.jpg`.
- Registros de inventario `evidence/C2-09…C2-12` y `evidence/D2-11…D2-15/20261006-01-cierre.json` (plantas ±3 m, trazadas sobre otra imagen satelital de fecha no verificada).
- Banqueta de C19 (`ajuste-visual/cuadras.json`): define la línea de fachada para detectar las caras a la calle.
- Sin foto de calle en el repositorio (ni panorama del recorrido dentro de C19); el levantamiento desde la nube no alcanza Street View.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 103/C2-09 esquina Sufragio Efectivo–Juan Álvarez; 104/C2-10 y 105/C2-11 frente de Sufragio Efectivo; 106/C2-12 conjunto de Sufragio Efectivo a Garmendia; 107/D2-11, 108/D2-12, 109/D2-13 y 110/D2-14 sobre Juan Álvarez; 111/D2-15 anexo interior detrás de 110. Sólo aérea; sin foto de calle. |
| 2. Forma | En los frentes de Sufragio Efectivo y de Juan Álvarez la planta de inventario difiere 2–5 m de la aérea: cubría el jardín (104), el carril de estacionamiento con autos (105) y los patios de 106, y dejaba fuera azoteas (103 hacia el oriente, el tramo de 107 junto a la esquina, el bloque oriental de 108). Esos seis registros pasan a secciones trazadas a ±1 m sobre la aérea (como 94/D2-20): 103 en una, 104 y 105 en la franja de muros de Sufragio, 106 en once cuerpos alrededor del patio central, 107 en tres y 108 en dos. Patio central, patio oscuro, pozo de luz, carril de estacionamiento, jardín y explanada sur quedan abiertos. 109, 110 y 111 coinciden con la aérea dentro de ±3 m y conservan su planta. Las plantas de inventario quedan como registro. |
| 3. Alturas | Tipológicas: 4.0 m en todas las secciones (mediana de los frentes de un nivel del centro con Street View; ningún registro dice «cuerpo bajo»); ±0.7 m. |
| 4. Fachada | Casa de un nivel en las caras a la calle (detectadas contra la banqueta: Sufragio Efectivo, Juan Álvarez y Garmendia); barda con portón en 105 y donde la lámina gris de 106 llega a Garmendia; casa de un nivel en las caras visibles desde un espacio abierto (106 hacia el carril de estacionamiento; cara sur de 110 y 111 hacia el estacionamiento). Caras a patios y jardines, lisas. 60 vanos. |
| 5. Material y azotea | Color de techo mediano medido por sección: azoteas blancas en #e6e2d6 como en C09, C14 y C15; 104 #9a967a (moteado), 105 #403929 (oscuro), techo rojo #dda390, ala oriente #dadad1, lámina gris verdosa #a0b1a1, lámina azulada #cfd6ce, nave suroeste #deddcf, cubierta gris de 107 #c3bdab, 109 #c5c6b8, 110 #7e8074 y 111 #e1dcd0. Color de muro estimado; pretiles en las azoteas planas (no en techo rojo, láminas ni el cuarto del patio); 19 tinacos en los puntos oscuros vistos (15 en 106, 1 en 107, 3 en 108). |
| 6. Conjunto y ligero | Secciones dentro del lote y sin enciman; vecinos idénticos (firmas por edificio); 60 vanos alcanzados desde fuera; anclas de los nueve registros sobre cubierta; vista ligera con LOD. |

Ficha con fuentes, trazado, frentes, equipos, anclas, límites y hashes: [ficha.json](../public/levantamiento/evidence/C19/20261110-modelado/ficha.json).

## Anclas de etiqueta

El ancla de inventario de 104/C2-10 caía sobre el jardín y la de 105/C2-11 sobre un auto estacionado en el carril. Para que la etiqueta quede sobre su cubierta, `anclas-geometria-actual.json` registra para esos dos IDs el centroide de su sección (mecanismo de «geometría vigente por ID»); la asignación a la cuadra no cambia. `scripts/pruebas-identificacion.mjs` lo comprueba.

## Vista ligera

Con C19, la vista ligera queda en 916,400 bytes / 303,199 gzip (antes 891,460 / 293,480), dentro del techo de 1 MB / 325 KB.

## Límites

- Sin foto de calle: vanos, puertas, colores de muro y alturas son tipológicos, no observaciones.
- Contornos a ±1 m. En 104 y 105 la aérea muestra muros con divisiones; no distingue si el interior es losa o patio techado: se modela cubierta continua con el color medido.
- Las secciones de 106, 107 y 108 se asignan a su registro por contigüidad con su planta de inventario; no se afirma propiedad ni división predial.
- En esta aérea el sol viene del este: las bandas oscuras sobre Sufragio Efectivo son asfalto y arbolado y no se usan como sombra.
- La aérea muestra un cobertizo en el jardín, al oriente de 108–109, y bardas en el terreno abierto al sur de 106, fuera del inventario de octubre: se mantienen fuera del conteo de 139.

## Siguiente paso de evidencia

Con una toma de calle de Sufragio Efectivo, Juan Álvarez y Garmendia se sustituye la tipología por los vanos reales sin tocar volúmenes; una vista de 104 y 105 confirmaría si su interior está techado.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c19.json C19
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c19.json /tmp/vistas-c19 public/levantamiento/evidence/C19/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c19.json public/levantamiento/evidence/C19/20261110-modelado/camaras-blender.json /tmp/blender-c19
```
