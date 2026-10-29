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

Una segunda rotación de 45° desde la misma interacción produce `final-06f05c6/ligera-82-este.png`: se distinguen los tres arcos orientales, la pilastra y el friso en la vista ligera. El recibo identifica también el hash de `c1-13-barandal.js`. La reducción y escala impiden certificar cada pieza o profundidad del arco.

Diagnóstico único adicional del recorrido servido desde el árbol de integración: Chromium creó WebGL2 en ANGLE/SwiftShader. La consola informó `Round 01: missing template or duplicate OSM owner` en `applyPlanRound`, emitió `amalaya:world-error` y después `amalaya:world-ready`; el cargador permaneció en estado de error. También informó `Registro del board inválido: P023`. No se observaron respuestas HTTP ≥400 en los recursos monitorizados. El recibo crudo es `final-06f05c6/webgl-local-diagnostico.json`. Esto no demuestra la causa profunda del fallo ni permite validar el recorrido de 82.

## Revisión integrada aprobada

Astra aprobó P1–P5 y P6a en `AUDIT-ASTRA-82-20261029-REV3-RUNTIME`. Se conserva la geometría de `06f05c6`; el runtime `0e73851` restaura el sector OSM usando la fuente canónica y permite entrar a los puntos del board sin quedar dentro de una colisión. La referencia fotográfica permanece intacta; caminar usa una entrada libre y avisa el ajuste. P023 conserva el norte mediante normalización 360°→0°.

La prueba local Chromium/SwiftShader abrió P111 frente al 82 y avanzó aproximadamente 1.44 m con teclado, tras un ajuste de entrada de unos 2.5 m. No acredita giro de ratón, iPhone físico ni todo el recorrido. Los recibos anteriores de fallo se conservan como historia; la adenda y capturas vigentes están en `public/levantamiento/evidence/C1-13/20261029-enjambre/auditoria-runtime.json` y `runtime-0e73851/`.

Suite completa, compilación, verificador de publicación, pruebas de plan/puente y regresiones de sector/entrada pasaron localmente. El modelo ligero final mide 948,840 bytes (298,785 gzip), 47,442 triángulos. P6b requiere el recibo de despliegue y la comprobación pública; la aceptación local no los sustituye.

## Publicación verificada

Astra emitió `AUDIT-ASTRA-82-20261029-REV4-PUBLICACION` el 2026-10-29T18:25:36.465994+00:00: P6b PASA. PR 113, merge `8c584bac919741d95160a3e5e979059eb3c984dd`, CI `40929361247` y despliegue `40929674832` exitosos. Los hashes públicos coinciden con la revisión aprobada. La sesión pública Chromium/SwiftShader abrió P111 y avanzó aproximadamente 3.96 m con W durante cinco segundos, con el frente 82 visible.

Evidencia nueva en `public/levantamiento/evidence/C1-13/20261029-enjambre/publicacion-8c584ba/`: dictamen, recibo de despliegue, hashes, capturas y registro CDP. El checklist actual distingue esta entrega de los rechazos y diagnósticos conservados. Este checkpoint documental no altera geometría ni runtime. Ratón, iPhone físico, recorrido completo, medidas y superficies ocultas siguen sin certificar. Los edificios 84 y 89 no se declaran terminados.
