# C30 · cuadra 8 · edificios 28–34 · modelado con fotos de calle y aérea

Cierre del 10 de noviembre de 2026. Mismo ciclo que [C08](C08-MODELADO.md) (cuadra 1, también con paquete de fotos de octubre) y que [C01](C01-MODELADO.md), con la [fábrica de fachadas](FABRICA-FACHADAS.md) y las instrucciones de [oleadas](OLEADAS-CUADRAS.md). Medidas visuales, no métricas. Nunca se empeora lo que ya se había modelado con foto.

## Fuentes

- Paquete C30 del 8-oct (`evidence/c30-cierre-20261008/`): siete capturas de Street View de dic-2023 (Serdán centro, Serdán biblioteca, esquina Serdán–Yáñez, Garmendia norte, medio y sur, Obregón), registro y vistas de entonces. Se conserva íntegro.
- Panorama del recorrido R-000 punto 1 en la esquina Serdán–Garmendia (`recorrido/2MNg6Xk9_yV3lqEALqRg4Q.jpg`), recortado a 200°, 235° y 265°: frente de la farmacia de 29/A2-06 en Serdán, que no estaba en el paquete.
- Aérea Esri World Imagery, zoom 19, `calco/referencia.webp` (0.26 m/píxel) y recorte `ajuste-visual/C30.jpg`: color de cubiertas y equipos de azotea.
- Referencia de 2025 de la biblioteca (El Colegio de Sonora, El Imparcial), ya citada por el paquete.
- Banqueta de C30 con anillo interior (`ajuste-visual/cuadras.json`) para detectar las caras a la calle.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 28/A2-05 escuela de dos niveles en Serdán; 29/A2-06 farmacia de esquina Serdán–Garmendia; 30/B2-01 y 31/B2-02 cuerpos bajos en Garmendia; 32/CH-YG-BBVA banco de la esquina Serdán–Yáñez; 33/CH-YG-BIB biblioteca en Serdán; 34/ISC-58 Instituto Sonorense de Cultura. Todos con foto de calle. |
| 2. Forma | Se conservan las seis plantas del paquete (cuatro del paramento y dos huellas OSM): las fotos ubican cada edificio y las juntas de azotea que se ven en la aérea no alcanzan para retrazar (ver Límites). Cada edificio pasa a su módulo `c30-NN-data.js`; el paquete C30 queda con los módulos, los peldaños del banco y la fachada patrimonial del ISC. 34/ISC-58 conserva su módulo propio. |
| 3. Alturas | Las de las fotos del paquete: 7.2 m (28, dos niveles), 6.2 m (29 y 32), 4.6 m (30), 3.6 m (31), 9.6 m provisionales (33, tres niveles) y 7.45 m (34, módulo propio). |
| 4. Fachada | Se conservan los vanos, bandas y aletas observados en octubre. Nuevo en 29/A2-06: frente de Serdán con dos escaparates de vidrio y marco verde entre pilares blancos, faldón café claro que da vuelta a Garmendia y muro de Garmendia marcado como ciego (así se ve en la foto). Ninguna cara a la calle queda sin fachada. 17 vanos en los seis módulos (10 en los cuatro con marca de fábrica). No se reproducen letreros, marcas ni el mural. |
| 5. Material y azotea | Color de techo medido en la aérea: blancas en #e6e2d6 (28, 29 y 30), 31 en #dddccf y la del banco en terracota #ad8774. 17 equipos en las manchas oscuras vistas: 1 en 28, 1 en 29, 3 ventilas en 30, 2 en 31 y 10 en el banco. |
| 6. Conjunto y ligero | Firmas de colisión del banco, la biblioteca y los vecinos sin cambio; 10 vanos de fábrica alcanzados desde fuera; anclas de los seis registros sobre su cubierta; LOD en la vista ligera. |

Ficha con fuentes, frentes, equipos, anclas, límites y hashes: [ficha.json](../public/levantamiento/evidence/C30/20261110-modelado/ficha.json).

## Banco y biblioteca: huella OSM sin marca de fábrica

32/CH-YG-BBVA y 33/CH-YG-BIB se construyen sobre su huella de OpenStreetMap (dueño propio), no sobre una planta del paramento. `scripts/pruebas-fabrica.mjs` exige planta del paramento para la marca `fabrica`, así que estos dos módulos llevan su registro (`hypothesis`), LOD, color de cubierta y equipos, pero no la marca. Sus fachadas son de foto, sin cambio, y su firma de colisión se conserva (`pruebas-c1-13-enjambre`).

## 34 / ISC-58

El Instituto Sonorense de Cultura tiene módulo propio (`isc58-refinement.js`, versión `isc58-technical-1`) y fachada patrimonial interpretada en el paquete (poniente de dos niveles, pórtico de cuatro arcos y paño rojo con pilastras; foto de Obregón de dic-2023). Se revisó y no se rehace: `scripts/pruebas-isc58.mjs` pasa sin cambios. Su azotea con paneles solares, la cubierta roja piramidal y los cuerpos blancos del centro siguen como en el módulo.

## Vista ligera

Con C30, la vista ligera queda en 972,260 bytes / 326,284 gzip (antes 968,220 / 324,762 con C04), bajo el techo por edificio de fábrica del PR #132: 1,073,500 bytes / 358,250 gzip con 65 edificios de fábrica.

## Límites

- Fotos de dic-2023 y aérea de fecha no verificada. La biblioteca estaba en obra en la foto y en la aérea; su fachada terminada viene de la referencia de 2025 y el color de su cubierta es estimado.
- En la aérea, la azotea blanca del frente de Serdán muestra divisiones que no coinciden del todo con los límites de 33, 28 y 29: una junta oscura unos 5 m al oriente del borde poniente de 28 y una franja gris entre 28 y 29. Las fotos ubican la escuela y la farmacia como están; las plantas se conservan (±3 m).
- 30/B2-01 y 31/B2-02 tienen partes oscuras en la aérea (árbol, patio o sombra) que no se distinguen; se conserva la cubierta continua con el tono claro medido.
- La aérea muestra cubiertas fuera del inventario de octubre, como el cuerpo blanco del extremo sureste junto a Garmendia–Obregón; siguen fuera del conteo de 139.

## Siguiente paso de evidencia

Una toma actual de Serdán confirmaría la biblioteca terminada (alturas, vidrios y cubierta) y los límites entre 33, 28 y 29.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/pruebas-identificacion.mjs
node scripts/pruebas-isc58.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c30.json C30
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c30.json /tmp/vistas-c30 public/levantamiento/evidence/C30/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c30.json public/levantamiento/evidence/C30/20261110-modelado/camaras-blender.json /tmp/blender-c30
```
