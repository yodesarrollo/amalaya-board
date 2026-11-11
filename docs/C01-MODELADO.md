# C01 · cuadra 3 · edificios 7–9 · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según la única foto disponible, la aérea; mismo ciclo que [C19](C19-MODELADO.md), [C18](C18-MODELADO.md), [C14](C14-MODELADO.md), [C09](C09-MODELADO.md) y [C15](C15-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Fuentes

- Aérea Esri World Imagery, zoom 19, mosaico `calco/referencia.webp` (georreferenciado; 0.26 m/píxel) y recorte `ajuste-visual/C01.jpg`.
- Registros de inventario `evidence/B1-05`, `evidence/B1-06` y `evidence/B1-07/20261006-01-cierre.json` (plantas ±3 m, trazadas sobre otra imagen satelital de fecha no verificada). B1-07 se inventarió como «cuerpo de gran cubierta con entrantes».
- Banqueta de C01 (`ajuste-visual/cuadras.json`): franja abierta, sin anillo interior, en Serdán, Yáñez y parte de Pino Suárez; sin banqueta trazada en Obregón.
- Sin foto de calle en el repositorio (ni panorama del recorrido dentro de C01); el levantamiento desde la nube no alcanza Street View.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 7/B1-05 cuerpo poniente del conjunto bancario de Serdán–Yáñez; 8/B1-06 cuerpo oriente en la esquina Serdán–Yáñez; 9/B1-07 estacionamiento de Yáñez–Obregón. Sólo aérea; sin foto de calle. |
| 2. Forma | Siete secciones trazadas a ±1 m sobre la aérea (como 94/D2-20). 7 en una: la planta de inventario se corría 3–4 m al poniente sobre la banda oscura junto al estacionamiento. 8 en dos: el cuerpo blanco y la cubierta gris verdosa entre los dos cuerpos del banco; su borde oriente se limita a la banqueta trazada (ver Límites). 9 en cuatro: la «gran cubierta» del inventario es, en la aérea vigente, un estacionamiento a cielo abierto con unos veinte autos; se modelan la barda norte (0.3 m de espesor) y tres casetas sobre el borde de Obregón (poniente, blanca y café, con el acceso entre ellas) y el piso queda abierto, como en EB-NE. La franja arbolada de Serdán y el patio entre el banco y el estacionamiento también quedan abiertos. Las plantas de inventario quedan como registro. |
| 3. Alturas | Tipológicas: 4.0 m en los cuerpos y las casetas (ningún registro dice «cuerpo bajo»); barda de 2.4 m; ±0.7 m. Las bandas oscuras al poniente y al norte de los cuerpos y de la barda se leen como sombra o arbolado y no se usan como medida. |
| 4. Fachada | Comercio de un nivel (cortinas) en las caras del banco a Serdán y a Yáñez (las dos de 8 detectadas contra la banqueta) y en la cara de 7 que mira a Serdán a través de la franja arbolada; casa con puerta en la cara poniente de 7 hacia el estacionamiento y en la cubierta gris; casa de un nivel en las caras de las casetas a Yáñez y a Obregón; barda lisa. 27 vanos. |
| 5. Material y azotea | Color de techo mediano medido por sección: azoteas blancas de 7, 8, caseta poniente y barda en #e6e2d6 como en C09, C14, C15 y C19; cubierta gris #8c998b, caseta blanca #dfddcd (medido #e5e3d3) y caseta café #87725b. Color de muro estimado; pretiles en las azoteas planas, no en la barda. 21 equipos en los puntos vistos: 8 condensadores de aire en 7; 6 ventilas, 2 equipos grandes y 2 condensadores en 8; 3 tinacos en las casetas de 9. |
| 6. Conjunto y ligero | Secciones dentro del lote, fuera de la franja de banqueta y sin enciman; 27 vanos alcanzados desde fuera; anclas de los tres registros sobre cubierta; vista ligera con LOD. |

Ficha con fuentes, trazado, banqueta, frentes, equipos, anclas, límites y hashes: [ficha.json](../public/levantamiento/evidence/C01/20261110-modelado/ficha.json).

## Banqueta en franja y prueba de la fábrica

La banqueta de C01 está trazada como franja abierta (sin anillo interior). Con el arreglo de C18 (#129), `scripts/frentes-calle-lib.mjs` toma el contorno de la franja como línea de fachada y el límite INEGI de `cuadras.json` como lote; con eso `scripts/pruebas-fabrica.mjs` pasa en C01 con frentes, vanos y colisiones. Antes de que ese arreglo entrara a main, C01 se verificó con una copia local de la prueba (no se sube) que además exige que ningún vértice quede dentro de la franja ni a menos de 0.15 m de ella; también pasa.

## Anclas de etiqueta

El ancla de inventario de 9/B1-07 caía en el piso abierto del estacionamiento. Para que la etiqueta quede sobre una cubierta, `anclas-geometria-actual.json` registra para B1-07 un punto en la caseta café (mecanismo de «geometría vigente por ID»); la asignación a la cuadra no cambia. `scripts/pruebas-identificacion.mjs` lo comprueba.

## Vista ligera

Con C01, la vista ligera queda en 965,760 bytes / 322,511 gzip (antes 955,600 / 319,430 con C18, C08 y C17), dentro del techo de 1 MB / 325 KB; quedan unos 2.5 KB gzip de margen. Los 21 equipos de azotea pesan unos 1,100 bytes gzip de la diferencia.

## Límites

- Sin foto de calle: vanos, puertas, colores de muro y alturas son tipológicos, no observaciones.
- Contornos a ±1 m. La azotea de 8/B1-06 rebasa 3–4 m al oriente la banqueta trazada de Yáñez y el límite INEGI: la banqueta oriente de C01 quedó trazada sobre la cubierta y, más al sur, sobre la franja oscura junto al estacionamiento. El cuerpo se modela hasta la banqueta trazada; corregir esa banqueta queda pendiente de la calle, fuera de esta cuadra.
- B1-07: la planta de inventario dibujaba una cubierta sobre el estacionamiento; la aérea vigente lo muestra a cielo abierto. Si la imagen del inventario mostraba una techumbre que ya no existe, no se puede saber con esta evidencia.
- Al oriente y al poniente del estacionamiento, entre los autos y la banqueta, hay franjas oscuras con borde claro: jardinera, arbolado o sombra de una barda. No se distingue y no se modela barda ahí.
- Entre el banco y el estacionamiento, fuera de las plantas de inventario, la aérea muestra una franja clara alargada de unos 5 × 22 m (x −127…−120, z −48…−26) con banda oscura al poniente (cubierta con su sombra o andador con jardinera), un bloque claro de unos 10 × 5 m (x −105…−95, z −27…−22) con bandas oscuras al norte y al poniente (parece una cubierta) y un elemento blanco pequeño junto a Yáñez (≈ −91, −27). Quedan fuera del inventario de octubre y del conteo de 139, como el cobertizo de C19.
- Las secciones se asignan a su registro por contigüidad con su planta de inventario; no se afirma propiedad ni división predial.

## Siguiente paso de evidencia

Con una toma de calle de Serdán, Yáñez y Obregón se sustituye la tipología por los vanos reales sin tocar volúmenes; la misma toma decide si hay barda al oriente y al poniente del estacionamiento y si las cubiertas del patio interior se agregan al inventario.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/pruebas-identificacion.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c01.json C01
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c01.json /tmp/vistas-c01 public/levantamiento/evidence/C01/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c01.json public/levantamiento/evidence/C01/20261110-modelado/camaras-blender.json /tmp/blender-c01
```
