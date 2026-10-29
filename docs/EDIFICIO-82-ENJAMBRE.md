# C1-13 · 82 · evidencia de comparación

Línea base `ef89166299e759ab5e0840bc956e97c7f38eb103`, cuadra C06. El índice 82 no es domicilio. Las referencias sur y este de diciembre de 2023 están en `public/levantamiento/evidence/C1-13/20261029-ola1/`; la vista este es parcial y la sur está obstruida. Rasgos observados: turquesa y morado, semicírculos decorativos sobre vanos rectangulares en sur, esquina curva y arcos profundos en el este. Cubierta posterior, medidas y conteo completo oriental no están confirmados.

Las tres cámaras históricas se conservan sin cambios; se agrega una cuarta vista oblicua hacia el este para revisar esa fachada. Sus poses son aproximadas y no calibradas. Las tres imágenes base reproducen los hashes históricos; el recibo registra hashes, versión del mundo y estado del árbol. El raster exporta triángulos reales e iluminación simplificada: no prueba el visor ni WebGL.

Para capturar cada etapa una sola vez, desde el árbol correspondiente:

```sh
node scripts/evidencia-c1-13-enjambre.mjs antes
node scripts/evidencia-c1-13-enjambre.mjs despues
```

Los directorios existentes se rechazan para no sobrescribir evidencia. Se puede indicar como segundo argumento otro directorio padre. Después debe hacerse sobre el candidato integrado, conservar su recibo y cotejar las cuatro cámaras con la línea base. Para concluir se requieren revisión visual, pruebas de encaje y colisiones, preservación de vecinos, versión ligera y comprobación del visor real. La publicación requiere su propio recibo.

Prueba inicial local: Chromium 151 se ejecutó con SwiftShader y servidor HTTP local; la captura con presupuesto virtual no terminó y se interrumpió. No se acredita WebGL ni navegación, ni la versión ligera con este intento. Pendiente prueba controlada del candidato integrado.

## Candidato 06f05c6

Se conservaron vistas intermedias de `9762851` en `intermedia-9762851/` y el candidato `06f05c6` en `final-06f05c6/`. La cámara este elevada es complementaria y tiene su par de base en `este-antes/`; muestra los tres arcos y la pilastra unida al friso. La vista llamada `este-detalle` de las cuatro originales mira principalmente al sur y la esquina. La comparación de cámaras es exacta entre cada par, no calibrada contra fotografía. Los recibos registran imágenes y cámara; `final-06f05c6/manifest.json` identifica además los hashes del código de paramento, datos, fuentes y archivos ligeros regenerados en el árbol de integración.

En Chromium 151 con HTTP local, se seleccionó C1-13 en la vista ligera regenerada, se pulsó Acercar dos veces y Girar 45°. `final-06f05c6/ligera-82.png` muestra fachada sur, curva, parte del este y vecino; el barandal se aprecia como línea fina y no permite evaluar cada pieza. La vista ligera usa canvas 2D. En el recorrido completo se creó contexto WebGL con SwiftShader, pero el cargador mostró fallo antes de obtener una vista navegable; no se valida el recorrido ni la publicación.
