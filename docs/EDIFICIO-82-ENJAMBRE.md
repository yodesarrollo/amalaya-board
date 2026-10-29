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
