# Pasos 2 y 3 · montaje visual por cuadras

Cambio de criterio autorizado el 7 de octubre de 2026: completar el plano y montar
el 3D con aproximaciones coherentes, sin exigir levantamiento topográfico. Objetivo
visual de 0.5–1 m; no constituye exactitud medida. Se conservan el inventario de
33 cuadras, los 139 edificios, las fotos, registros y las 11 etapas históricas.
Los estados actuales de plantas, calles, banquetas y esquinas se superponen como
cierre visual explícito por cuadra; el estado histórico original queda intacto.

Se revisaron las 33 superposiciones contra la misma fotografía del calco anterior.
Los límites INEGI sirven de inicio, se ensanchan donde una huella exige proteger
un edificio y se cruzan con los ejes OSM. Las vías se unen antes de triangularlas:
un cruce tiene una superficie, no dos franjas encimadas. No se convierten los
pasillos internos de estacionamientos en calles. Los bordes de cerro fuera de la
red vial no reciben calzada ni banqueta automática. Los tramos ocultos quedan
identificados como estimados. Las banquetas usan una franja nominal de 1.1 m,
recortada contra las huellas: es representación, no un ancho medido o normativo.

La comparación de C21 exigió reducir el ancho este-oeste del conjunto EB-SW,
anclado a su borde occidental: factor 0.88, corrección máxima de 6.46 m en el
extremo oriental del modelo heredado. Esa corrección no es una tolerancia aceptada
contra una medición. Se conservan materiales, detalle, patios y altura. Las 260
cajas de colisión propias siguen el mismo cambio; ninguna otra cambia.

Las ocho alertas históricas de pertenencia se conservan. En particular D1-03 y
D3-11 coinciden razonablemente con la foto pero cruzan límites INEGI: se protegen
sus huellas al construir el suelo, sin recortar edificios para hacerlos caber en
la cartografía. OB-01/OB-02 mantienen el encuentro de cubierta/fachada heredado
(0.11 m² de proyección); no es un encimamiento entre superficies de circulación.

## Uso

Seguimiento → cuadra → Ver ajuste visual. Foto/plano, líneas y calco anterior son
conmutables. Cada cuadra incluye comparación de referencia/superficies y enlace
para abrirla centrada en 3D. El conjunto principal y el recorrido detallado usan
la misma capa; la vista ligera se regenera desde ese mundo.

## Regeneración

```sh
node scripts/exportar-huellas-inventario.mjs /tmp/huellas.json --baseline
python scripts/generar-ajuste-visual.py /tmp/huellas.json
python scripts/ajuste-visual-evidencias.py
node scripts/preparar-ajuste-visual.mjs
npm run build
```

Python requiere Shapely 2.1+ y Pillow. El manifiesto registra hashes y referencias;
las correcciones geométricas y superficies quedan en `ajuste-visual/cuadras.json`.
El módulo del visor sólo contiene triángulos y correcciones para no cargar las
observaciones completas al navegar. Las comparaciones cargan bajo demanda.

Pruebas nuevas ejercitan el mundo real, conservación del detalle, colisiones,
idempotencia, superficies únicas y trazados para las 33 cuadras. Se comprobó
además con Shapely la geometría Float32 exportada del runtime: sin intersecciones
suelo/edificio o suelo/suelo superiores a 0.0001 m². Las pruebas históricas se
siguen ejecutando sobre su etapa original. La reversión consiste en retirar la
llamada `applyVisualFit` y regenerar versiones/vista ligera o revertir este PR.

Relieve, alturas, identidad y fachadas siguen sus etapas originales; este cierre
es de trazado y montaje visual del suelo, no de esas etapas ni de topografía.
