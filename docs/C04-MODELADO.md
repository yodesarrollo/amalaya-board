# C04 · cuadra 6 · edificios 21–25 · modelado con aérea y fábrica de fachadas

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según las fotos disponibles: la aérea para 23–25 y las fotos de Hidalgo de la ronda 2 para 21–22, que ya cumplían y no se rehacen. Mismo ciclo que [C15](C15-MODELADO.md) y [C14](C14-MODELADO.md) con la [fábrica de fachadas](FABRICA-FACHADAS.md). Medidas visuales, no métricas.

## Fuentes

- Aérea Esri World Imagery, zoom 19, mosaico `calco/referencia.webp` (georreferenciado; 0.26 m/píxel) y recorte `ajuste-visual/C04.jpg`.
- Registros de inventario `evidence/C1-10`, `D1-01` y `D1-02/20261006-01-cierre.json` (plantas ±3 m). El de D1-02 dice «conjunto de cubierta baja junto a Paliza; se excluye la explanada de acceso».
- Fotos de Hidalgo H02 y H03 (Street View dic-2023, `evidence/paramento-ronda2-20261008/`): frentes de 21/C1-08 (local azul) y 22/C1-09 (local blanco). El letrero de H03 marca la esquina Hidalgo–Rosales, así que Rosales es el oriente de la cuadra y Pedro Moreno el poniente.
- Banqueta de C04 (`ajuste-visual/cuadras.json`): línea de fachada para detectar las caras a la calle y lote de las secciones.
- Sin foto de calle de Rosales, Paliza ni Pedro Moreno en el repositorio; el recorrido de Street View no pasa por esta cuadra.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 21/C1-08 y 22/C1-09 en Hidalgo, con foto (ronda 2); 23/C1-10 cuerpo intermedio sobre Rosales; 24/D1-01 conjunto de cubiertas conectadas sobre Rosales; 25/D1-02 conjunto bajo junto a Paliza. 23–25 sólo con aérea. |
| 2. Forma | Las plantas de inventario de 23–25 eran cajas de 6.2 m que llenaban patios, el terreno abierto del poniente y la masa de árboles. Cada cuerpo pasa a secciones trazadas a ±1 m sobre la aérea: 23 en dos (cuerpo angosto al poniente y cuerpo sobre Rosales, con un pasillo de 1.4 m entre ellos); 24 en una (conjunto con un patio grande y otro al sureste, abiertos y sin colisión; el cuerpo adosado al poniente va en la misma sección); 25 en dos (cuerpo poniente y cuerpo sobre Rosales, separados por un patio en sombra, con la franja de techo del sur y la explanada de Paliza abierta). 21 y 22 sin cambio. Las plantas de inventario quedan como registro. |
| 3. Alturas | Tipológicas: 4.0 m en 23 y 24 (mediana de frentes de un nivel del centro con Street View; ±0.7 m) y 3.2 m en 25 porque su registro dice cubierta baja. 21 (3.8 m) y 22 (3.3 m) conservan la altura visual de la foto. |
| 4. Fachada | Casa de un nivel en las tres caras a Rosales (detectadas contra la banqueta): 3 vanos en 23, 11 con dos puertas en 24 (patio grande y casa del sureste) y 2 en 25; casa de un nivel en las dos caras sur de 25, visibles desde Paliza a través de la explanada (11 vanos). Caras interiores y del poniente lisas. 27 vanos. |
| 5. Material y azotea | Color de techo mediano medido por sección: azoteas blancas en #e6e2d6 como en C09, C14 y C15 (24 y 25, luminancia mediana ≥ 239), 23 en #d8daca y #d2d1c2. Piso del patio grande de 24 con su color medido (#d0ccbc). Color de muro estimado; pretiles; cuatro tinacos y cinco equipos bajos en las manchas oscuras vistas. |
| 6. Conjunto y ligero | Secciones dentro del lote y sin encimarse con 21, 22 ni entre sí; 27 vanos alcanzados desde la calle; patios de 24 sin colisión; anclas de los cinco registros sobre cubierta; vista ligera con LOD; mismas cámaras de calle antes y después; vistas de Blender y GLB. |

Ficha con fuentes, trazado, frentes, colores medidos, límites y hashes: [ficha.json](../public/levantamiento/evidence/C04/20261110-modelado/ficha.json).

## Vista ligera

Con C04, la vista ligera queda en 968,220 bytes / 324,762 gzip (antes 958,120 / 321,028 en main 6fa0cc3, con las cuadras 1, 3, 7 y 29–33), dentro del techo fijo de 1 MB / 325 KB por 238 bytes comprimidos. La primera versión (977,100 / 327,362 sobre main a0610c3; 969,460 / 325,427 sobre 6fa0cc3) lo rebasaba, así que la cuadra se simplificó como pide la regla de oleadas, sin tocar el techo: el cuerpo poniente de 24 va en la sección principal (se pierde su línea de pretil), se omite el saliente de 3 × 4 m al norte de 25 y dos equipos contiguos de 24 quedan como uno. Cualquier otra cuadra que entre antes vuelve a rebasar el techo fijo; con el techo por edificio de fábrica del PR #132 (61 edificios: 1,059,500 bytes / 353,250 gzip) sobra margen.

## Límites

- Sin foto de calle de 23–25: vanos, puertas, colores de muro y alturas son tipológicos, no observaciones.
- Contornos a ±1 m. Sobre Rosales la aérea pone los techos de 23 y 24 entre 0.4 y 2.5 m más al oriente que la línea de lote del ajuste visual (posible alero o desfase de la banqueta). Las secciones no salen del lote: el frente queda 0.25–1.1 m dentro y el patio grande de 24 se recorre unos 1.2 m al poniente para dejar una crujía de 1–1.4 m sobre la calle.
- En el patio grande de 24, las bandas oscuras del norte y del poniente (corredor techado o sombra) quedan como parte abierta; el patio del sureste y los de 25 también se tratan como abiertos.
- No se modelan, por no tener registro ni forma segura: la cubierta clara del noroeste (fuera de toda planta de inventario, entre 21 y 24; posible estacionamiento techado) y la mancha gris oscura al sur de la masa central de 24 (árbol o sombra). Por el presupuesto de la vista ligera tampoco el saliente de 3 × 4 m al norte de 25 ni los tinacos a su pie.
- 21 y 22 conservan los frentes de la foto (ronda 2, en `paramento-data.js`, archivo compartido). La aérea muestra el techo blanco de 22 unos 2 m más al oriente y 3 m más al sur que ese frente; queda anotado sin cambio.
- En esta aérea el sol viene del este: las franjas oscuras al poniente de los cuerpos son sombra sobre el suelo y no se usan como medida.

## Siguiente paso de evidencia

Con una toma de calle de Rosales y de Paliza se sustituye la tipología por los vanos reales sin tocar volúmenes, y se confirma si la franja sur de 25 es un portal abierto. Asignar en el inventario la cubierta clara del noroeste permitiría modelarla con el mismo ciclo.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c04.json C04
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c04.json /tmp/vistas-c04 public/levantamiento/evidence/C04/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c04.json public/levantamiento/evidence/C04/20261110-modelado/camaras.json /tmp/blender-c04
```
