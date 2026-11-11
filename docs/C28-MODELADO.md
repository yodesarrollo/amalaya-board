# C28 · cuadra 13 · edificio 51 · modelado con foto de calle y aérea

Cierre del 10 de noviembre de 2026. Versión aceptable a la realidad según las fotos: el panorama R-001 punto 14 ve de frente rasante la esquina Obregón–Abasolo, y la aérea da cubiertas, terraza y equipos. Mismo ciclo que [C07](C07-MODELADO.md) (foto del recorrido + aérea) con la [fábrica de fachadas](FABRICA-FACHADAS.md) donde no hay foto. Medidas visuales, no métricas.

## Fuentes

- Panorama Street View de la ruta R-001 (Obregón), punto 14 (`public/recorrido/ywXPe_aoOm7HUa9l5NTdfg.jpg`), al poniente de Abasolo: frente de Abasolo y esquina. Orientación del visor (u=0.5 = norte) y horizonte corregido con `roll.json`.
- Panorama de la ruta R-002, punto 1 (`TMvGKzSUcJSVhkTRRxjHIA.jpg`), en Abasolo al norte: el frente visto de lejos, tapado en parte por los edificios del norte de la cuadra.
- Aérea Esri World Imagery, zoom 19 (`calco/referencia.webp`, 0.26 m/píxel) y recorte `ajuste-visual/C28.jpg`.
- Registro de inventario `evidence/B3-05/20261006-01-cierre.json` («Obregón–Abasolo · cuerpo del borde oriental», planta ±3 m) y calzada AB-E de Abasolo (`street-round.json`): Abasolo al poniente y Obregón al sur.

## Seis pasos

| Paso | Resultado |
|---|---|
| 1. Identidad y evidencia | 51/B3-05, único registro de la cuadra 13, en la esquina Obregón–Abasolo. Dos panoramas del recorrido y aérea. |
| 2. Forma | La planta de inventario era una caja de 6.2 m corrida 2–3 m al noreste. Pasa a cuatro secciones a ±1 m: la esquina gris, con su frente a Abasolo sobre la línea de lote (la foto pone la esquina en el vértice del lote); el cuerpo beige de Obregón, en la franja junto a la banqueta; el cuerpo blanco del norte y el oriente, hasta la franja oscura de x≈211 que lo separa del vecino; y el cuarto gris de la azotea. La planta de inventario queda como registro. |
| 3. Alturas | Medidas por ángulo en la foto con la cámara a 2.5 m: remate de la esquina a ≈4.3 m (9.0° a 11.2 m) y del cuerpo beige a ≈3.6 m (4.5° a 14.1 m), ±0.4 m; cuarto de azotea ≈2.2 m sobre la cubierta (6.5 m). El cuerpo blanco no se ve desde la calle: 4.0 m por tipología. |
| 4. Fachada | Observado en Abasolo: portal de piedra con puerta azul clara cerca de la esquina, dos ventanas altas de marco blanco con reja y remate claro, en las mismas columnas que la foto desde su cámara. Por continuidad: una tercera ventana donde el muro con mural de enfrente tapa la foto. Obregón: casa de un nivel en beige (la foto la ve rasante). Muro ciego del cuerpo blanco detrás del beige. 11 vanos. |
| 5. Material y azotea | Muro gris pizarra, puerta, marcos y piedra estimados a pleno sol desde la foto a la sombra; terraza con piso de terracota medido (#c39579) y seis macetas; cubiertas blancas en #e6e2d6 y franja beige #ccc4b1; tres tinacos en las manchas vistas. |
| 6. Conjunto y ligero | Secciones dentro del lote; vecinos idénticos por firma de triángulos; vanos alcanzados desde la calle; ancla del registro sobre la cubierta de la esquina; LOD en la vista ligera; foto frente al modelo desde la misma cámara; mismas cámaras de calle antes y después; vistas de Blender y GLB. |

Ficha con fuentes, alturas, trazado, frentes, colores medidos, límites y hashes: [ficha.json](../public/levantamiento/evidence/C28/20261110-modelado/ficha.json).

## Vista ligera

Con el 51, la vista ligera queda en 994,660 bytes / 337,316 gzip (antes 987,300 / 334,959 en main b50f486, ya con las cuadras 1–8, 10, 18 y 29–33), bajo el techo por edificio de fábrica (84 edificios: 1,140,000 bytes / 382,000 gzip).

## Límites

- Posiciones de los vanos a ±1 m: el frente de Abasolo se ve en ángulo rasante; la tercera ventana es por continuidad.
- La fachada de Obregón sólo se ve rasante; sus vanos son tipológicos. El gris de la esquina dobla ~1 m sobre Obregón y luego sigue el cuerpo beige.
- La cubierta de la esquina queda bajo los árboles de Abasolo; se toma blanca como su parte visible.
- El cuerpo blanco del norte y el oriente no se ve desde la calle (altura tipológica).
- El resto de la cuadra C28, al oriente y al norte, no está en el inventario de 139 y queda sin volumen.
- En esta aérea el sol viene del este; las franjas oscuras no se usan como medida.

## Siguiente paso de evidencia

Una toma frontal de Obregón confirmaría los vanos del cuerpo beige y si el cuerpo blanco tiene un segundo nivel.

## Comandos

```sh
node scripts/preparar-paramento.mjs
node scripts/generar-vista-ligera.mjs
node scripts/pruebas-fabrica.mjs
node scripts/pruebas-lod-ligero.mjs
node scripts/exportar-escena-c08.mjs /tmp/escena-c28.json C28
python3 scripts/renderizar-evidencia-paramento.py /tmp/escena-c28.json /tmp/vistas-c28 public/levantamiento/evidence/C28/20261110-modelado/camaras.json
python3 herramientas/blender/render-revision.py /tmp/escena-c28.json public/levantamiento/evidence/C28/20261110-modelado/camaras.json /tmp/blender-c28
```
