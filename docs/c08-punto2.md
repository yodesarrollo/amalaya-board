# C08 · punto 2 · banquetas y esquinas

Revisión visual del 8 de octubre de 2026. Se conserva el punto 1 publicado en
`300c61589fdb21baad0a391cf704dec4c2d7802a` y sus cinco edificios. No se cambia
ninguna huella, altura, fachada ni colisión de edificio.

Se contrastan siete vistas de Street View (diciembre de 2023): cuatro encuentros
y tres vistas complementarias del frente oeste. La referencia aérea conservada
se usa para mantener el encuadre y la georreferencia del punto 1.

Cambios:

- Se sustituye la franja uniforme por tramos de ancho independiente y remates
  hasta las fachadas existentes de Obregón y Juan Álvarez.
- Juan Álvarez, entre Obregón y Sufragio Efectivo, se representa como corredor
  peatonal pavimentado. Se retira el asfalto de debajo del mismo polígono.
- Se incorpora la rampa adosada a C2-01 visible en la toma noreste. Su longitud,
  ancho, altura y pendiente son interpretaciones visuales, no medidas verificadas.
- Las guarniciones tienen caras verticales y retornos suavizados. No se dibuja
  una barrera transversal en la conexión con el corredor peatonal.
- No se añaden rebajes donde los vehículos ocultan el bordillo. Tampoco se
  rellena el patio ni el estacionamiento.

La sección queda cerrada visualmente. No certifica medidas, accesibilidad
normativa, ni la presencia o ausencia de rebajes ocultos. El límite vial previo
se conserva; la ficha declara las cotas y los anchos como estimaciones.

Evidencia: `public/levantamiento/evidence/c08-punto2-20261008/`. Contiene planta
antes/referencia/después, dos pares de renders de los triángulos reales, las siete
fotos originales con atribución, cámaras, hashes, pruebas y siguiente pendiente.
Los renders no sustituyen la comprobación de navegación: el entorno de navegador
puede usar el modo ligero si no dispone de WebGL.

Continuación exacta: **C08, sección 3, Edificios y volúmenes**. Se conservan las
cinco secciones de la cuadra y las once acciones históricas. Los puntos 3–5
permanecen pendientes. La ficha permite abrir la evidencia del punto 1 o del 2.

Para reproducir, exportar huellas y escena del commit base con
`scripts/exportar-huellas-inventario.mjs` y `scripts/exportar-escena-c08.mjs`.
Pasar las huellas base a `python3 scripts/preparar-c08-punto2.py archivo.json`;
ejecutar `node scripts/preparar-paramento.mjs`; exportar el resultado y renderizar
con `scripts/renderizar-evidencia-paramento.py`. Las cámaras están en el registro.
El generador de evidencia recibe huellas, escenas, referencias y renders antes
y después como argumentos. Requiere Shapely 2.1, Pillow y NumPy.

Gate: `npm run pruebas`, `npm run verificar:publicacion`, `npm run build`.
La prueba de secciones exige huellas y colisiones intactas, ausencia de cruces
entre suelo vial/peatonal/edificios y estacionamiento libre; comprueba evidencia,
pendiente real de la rampa y siguiente sección.
