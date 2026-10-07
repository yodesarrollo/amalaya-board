# Revisión por cuadras

La entrada de Seguimiento 3D presenta cuadras físicas y sus 11 etapas. Cada cuadra
abre sus lados, evidencia, indicaciones y edificios vinculados. Los edificios
conservan sus estados, fotografías, borradores y reportes históricos.

El inventario anterior contiene 18 agrupaciones de distinta naturaleza: sectores
de lámina, frentes de calle, una ruta de prueba y un borde de plaza. No constituye
un conteo de cuadras físicas. El registro nuevo vive en
`public/levantamiento/cuadras.json`; el total permanece desconocido (`null`).

C01 procede de la revisión documentada en el commit ac48c75 de
`fix/calco-por-cuadras`: contiene los edificios B1-05, B1-06 y B1-07. Su perímetro
es parcial y la pertenencia de otros edificios todavía debe comprobarse. La
comparación SVG se conserva como evidencia, sin cambiar geometría del mapa.

Los edificios sin pertenencia confirmada aparecen bajo «Pendientes de asignar»;
las agrupaciones anteriores solo facilitan encontrarlos. La plaza tiene su
sección independiente. Ningún edificio desaparece ni se duplica.

Para ampliar el registro, delimitar primero la cuadra sobre la referencia y
registrar sus IDs de edificio, fuente, lados y estados. `membershipComplete`
solo se activa tras comprobar todo el inventario de esa cuadra. No inferir
pertenencia a partir del prefijo de un edificio o de su sector de lámina.

Plantas, calles, banquetas, esquinas y revisión final requieren estado explícito
de cuadra. Los demás estados resumen los edificios vinculados, pero una
asignación incompleta nunca queda terminada por agregación. Los reportes de
cuadra usan `scope: block`, `building: null`, lista de miembros y clave propia;
fotos y borradores de edificios mantienen sus claves anteriores.

Validación: `node scripts/pruebas-cuadras.mjs`, pruebas existentes y compilación.
