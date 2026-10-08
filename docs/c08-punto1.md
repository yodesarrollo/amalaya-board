# C08 · punto 1: planta y calle

Cierre visual del 8 de octubre UTC (7 de octubre en Hermosillo).
Sección 1 de las cinco acordadas, en la cuadra C08: OB-01, OB-02, C2-01,
C2-02 y C2-03. No se avanzó a la sección 2.

Se conserva el montaje visual anterior de calles. Se revisaron las cinco plantas
sobre la referencia aérea conservada y se corrigió solo C2-03: posición,
orientación y brazo norte de la cubierta visible. Alturas y materiales heredados.
El patio/estacionamiento permanece abierto. Los otros 138 registros no cambian.

Las once acciones originales siguen disponibles. Las cinco secciones nuevas
solo se ponen verdes con registro y antes/referencia/después por cuadra. Los
avances previos se muestran sin convertirlos automáticamente en una nueva
aprobación ni borrarlos. Siguiente pendiente: C08, sección 2, banquetas y esquinas.

Evidencia: `public/levantamiento/evidence/c08-punto1-20261008/`.
El registro fija el commit anterior, fuente, encuadre, huellas y hashes.
Se trata de una aproximación visual, no de un levantamiento métrico; la imagen
es la referencia conservada de enero de 2024, no una captura de hoy.

Reproducción desde el commit anterior (con Shapely y Pillow): exportar huellas
con `scripts/exportar-huellas-inventario.mjs`; ejecutar
`python scripts/preparar-c08-punto1.py` y `node scripts/preparar-paramento.mjs`;
volver a exportar huellas; ejecutar `python scripts/evidencia-c08-punto1.py
antes.json despues.json`; regenerar la vista ligera con `npm run build`.
La evidencia comprueba que solo C2-03 cambia, que las plantas no invaden suelo
vial y que los puntos de comprobación del estacionamiento quedan abiertos.
