# C22 · cuadra 11 · edificios 43–46 · modelado con fotos de calle y aérea

Cierre del 11 de noviembre de 2026. Es una versión aceptable a la realidad según los panoramas del recorrido R-001 sobre Obregón (P08–P14) y la aérea. Sigue el mismo criterio que el [89](EDIFICIO-89-MODELADO.md), [C08](C08-MODELADO.md), [C03](C03-MODELADO.md) y la [fábrica de fachadas](FABRICA-FACHADAS.md), con el método de las [oleadas](OLEADAS-CUADRAS.md). Las medidas son visuales, no métricas.

Pedido de Alejandro Puebla: «Continúan cuadra 11» (10-nov, 23:15 HMO). Se leyó como la cuadra 11 de la numeración del tablero (C22), igual que las cuadras que otros chats tomaron «ahora». La tarea programada de esta cuadra no existía (fila 577 del Buzón).

## Diagnóstico

| # | Edificio | Foto | Antes | Acción |
|---|---|---|---|---|
| 43 | C3-01 | P08, P09, P10 | Frente «estructura-sur» del paramento de octubre: caja de 5.4 m con cuatro vanos abiertos | Paquete `c22-43-data.js` sobre la misma planta y altura |
| 44 | C3-02 | P10, P11, P12 | Caja de inventario de 3.9 m sin fachada, metida en el estacionamiento de Sufragio | Paquete `c22-44-data.js`, cuatro secciones |
| 45 | C3-03 | P12, P13, P14 | Caja turquesa de 4.0 m con la esquina en punta | Paquete `c22-45-data.js`, cinco secciones con torreón |
| 46 | OB-21 | P10 | Constructor propio con huella provisional | Sin cambio (ver límites) |

- **Calle.** Los cuatro edificios dan a Obregón por el norte y a Sufragio Efectivo por el sur. C3-01 da también a Garmendia, y C3-03 termina frente a la plaza del cruce con Abasolo. Los nueve puntos del recorrido a menos de 22 m están todos sobre Obregón, así que no hay foto de Sufragio Efectivo.
- **Construcción previa.** El frente de C3-01 vive en `FRONT_BUILDINGS` y las alturas de C3-02 y C3-03 en `HEIGHT_REVIEWS` de `paramento-data.js`, que no se edita. Cada paquete toma su dueño, lo retira y lo reconstruye, sin dejar muros duplicados.
- **Medición.** Se usaron vistas rectilíneas de los panoramas con rejilla de píxeles (`u=0.5` = norte; sin la inclinación de `roll.json`, porque sin ella el horizonte encaja mejor con el modelo). Cada columna se intersectó con el paño de su sección. P11 y P13 coinciden con la aérea. P12 se registró +0.9 m al oriente, porque el lindero poniente de la casa blanca queda en x 143.5 en la foto y en x 144.3–144.5 en la aérea (sombra sobre el local vecino y quiebre de la banqueta).

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 43/C3-01 es un espacio abierto de mesas bajo cubiertas plegadas, con quiosco acristalado y un cuerpo de lámina galvanizada. 46/OB-21 es la casa de aplanado crema y remate azul, con el número 21. 44/C3-02 tiene cuatro frentes de un nivel. 45/C3-03 es una casa blanca, un frente turquesa y un torreón redondo en el cruce. |
| 2. Forma | C3-01 conserva la planta del paramento. C3-02 se traza en cuatro secciones: crema, crema alta, amarilla y local. C3-03 se traza en cinco: blanca poniente, blanca, turquesa alta, turquesa baja y torreón en medio octágono. El borde sur sigue la línea de la azotea y deja abierto el estacionamiento de Sufragio; la plaza del cruce queda abierta. |
| 3. Alturas | 5.4 m en C3-01 (paramento). En C3-02, 3.9, 4.5, 3.6 y 3.0 m. En C3-03, 3.95, 4.45, 4.4, 4.0 y 5.6 m (el torreón, hasta el remate del pretil). Son alturas visuales, ±0.5 m. |
| 4. Fachada | **C3-01:** lámina con rejilla, quiosco acristalado con el hueco de la cubierta encima, siete vanos abiertos sobre murete blanco en Obregón y Garmendia, plafón gris y remate rojo ladrillo. **C3-02:** ventana con reja y puerta azul de tablones bajo cornisa café y zoclo de piedra; ventana del tramo alto; casa amarilla con alero blanco corrido, ventana, puerta de reja y ventanal; local con faja de piedra y puerta metálica. **C3-03:** ventana en arco con marco amarillo y puerta con marco de cantera sobre zoclo azul; cortina café, alero y zoclo verde; puerta de madera y porche con mural; arcos ciegos de moldura crema en el torreón, con losa de terraza y pretil de piedra. Las caras a Sufragio llevan tipología casa (C3-02, C3-03) o barda con acceso (C3-01). |
| 5. Material y azotea | Colores de la foto a media luz. Techos medidos en la aérea: blanco con tope `#e6e2d6`, terraza del torreón `#d5d1b9` y cubierta de C3-01 `#e4dccc`. Seis tinacos y tres calentadores en las manchas oscuras. Superficie mate. |
| 6. Conjunto y ligero | Los 30,765 triángulos de los vecinos (escena C22 sobre main e3f94e6) quedan idénticos y C3-01 conserva sus 118 colisiones. Las secciones quedan dentro del lote y sin enciman; los 33 vanos de C3-02 y C3-03 se alcanzan desde fuera. Hay LOD en la vista ligera, mismas cámaras antes y después, foto contra modelo, cuatro vistas de Blender y GLB de la cuadra. |

La ficha con fuentes, medición, límites y hashes está en [ficha.json](../public/levantamiento/evidence/C22/20261111-modelado/ficha.json). El trazo sobre la aérea está en [aerea-trazo.jpg](../public/levantamiento/evidence/C22/20261111-modelado/aerea-trazo.jpg) y la comparación en [foto-modelo.jpg](../public/levantamiento/evidence/C22/20261111-modelado/foto-modelo.jpg). El archivo 3D es [C22-43-46.glb](../public/levantamiento/evidence/C22/20261111-modelado/C22-43-46.glb).

## Por qué C3-01 no lleva marca de fábrica

Sus vanos son abiertos, sin cierre detrás, y `pruebas-fabrica` exige un modelo detrás de cada vano. Sin la marca, `pruebas-c1-13-enjambre` exige que sus colisiones no cambien. Por eso se reconstruye sobre la misma planta y la misma altura del paramento, y `pruebas-lamina` fija su altura exacta, de modo que no lleva equipos de azotea.

## Vista ligera

Sobre main@e3f94e6 pasa de 994,660 a 1,002,220 bytes y de 337,316 a 339,621 en gzip (50,111 triángulos, 378 más). Con 86 edificios de fábrica el techo es 1,147,000 / 384,500. Son tres edificios reconstruidos y sólo dos llevan marca, así que el techo sube 7,000 bytes y 2,500 gzip: en gzip la cuadra cabe en lo que suma y en bytes usa 560 del margen común, que queda en 144,780 bytes y 44,879 gzip. La primera versión se midió sobre 1785401 (968,220 → 975,780 bytes); antes de fusionar se rehízo sobre e3f94e6. Las vistas de antes-después y de foto contra modelo salen iguales píxel a píxel (en antes-después sólo cambia el rótulo del commit), y el GLB es idéntico; sólo cambian las dos aéreas de Blender, que se volvieron a hacer porque ahora muestran a los vecinos ya fusionados.

## Límites

- **OB-21 sin cambio.** La foto P10 sitúa su fachada en x 107.6–116.2, unos 7 m al oriente de su huella provisional (x 100.6–114.3). Esa huella tapa el tramo de lámina de C3-01 en x 100.6–107.6, y C3-02 cierra el frente desde x 114.5 con un tramo liso. Su dueño no es una planta física de la lámina, así que `pruebas-fabrica` no lo reconoce, y sus 36 colisiones están congeladas. Moverlo exige cambiar pruebas o el constructor, lo que queda fuera de lo autorizado para las oleadas: es una decisión pendiente.
- **Planta de C3-01.** Queda 1.6–3.2 m detrás del borde de la cubierta que muestra la aérea. La cubierta plegada se representa plana y no se modelan las columnas inclinadas ni el barandal.
- **Precisión.** Los vanos van a ±0.5 m y las alturas a ±0.5 m: la pose de los panoramas es aproximada y la altura de la cámara no está calibrada. Los contornos van a ±1 m.
- **Sufragio Efectivo.** No hay foto de esas caras: vanos, puertas y colores son tipológicos.
- **Murales y letreros.** Kamy Sushi House, Sastrería Thomé, las figuras de los murales y los adornos de talavera no se reproducen; los murales quedan como paños de color.
- **Terraza del torreón.** Se modela sólida hasta el remate del pretil.
- **Sombras.** En esta aérea el sol viene del este. La franja oscura junto a x 144.5 es la sombra de la casa blanca sobre el local, y la curva oscura del oriente es la del pretil del torreón; ninguna se usa como medida de altura.
- **Blender.** El suelo gris de esas vistas es un fondo de render, no geometría del modelo.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c22.json C22
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c22.json /tmp/vistas-c22 public/levantamiento/evidence/C22/20261111-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c22.json public/levantamiento/evidence/C22/20261111-modelado/camaras-blender.json /tmp/blender-c22 --glb /tmp/C22-43-46.glb --poligono "$(cat public/levantamiento/evidence/C22/20261111-modelado/poligono-glb.txt)"
```
