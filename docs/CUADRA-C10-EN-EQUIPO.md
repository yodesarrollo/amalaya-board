# C10 · cuadra 25 · entrega parcial del 30 de octubre de 2026

Base `99a0490414f1e2dda9429f945395db547773898d`. Alcance: edificios 84–88; preservar el 83 y el mundo vigente. **No se declara nivel medio ni edificios terminados.** El paquete se prepara para revisión en PR borrador, sin merge ni despliegue. **P5 visual del84 está bloqueado por una pared muy oscura desdeP113; no es apto para merge.**

| Edificio | Entrega comprobable | Pendiente |
|---|---|---|
| 84 · D1-09 | Nave clara y anexo sur bajo sobre la huella histórica; solar exterior conservado. Tres vistas integradas coinciden exactamente con las del productor. | Identificar fachada y esquinas en calle. Corte del anexo y alturas 6.2/3.5 m son hipótesis visuales sin medición. |
| 85 · D1-10 | Patio existente conservado. Runtime admite detalles con techo y base perforados, muros interiores neutros y colisiones restadas. Prueba opt-in sobre el patio real. | No se activa un nuevo exterior ni un paquete arquitectónico neutro de prueba. Falta identidad de fachada. |
| 86 · D1-11 | Huella, junta y modelo previos conservados; ninguna discrepancia exterior respaldada exige cambio. | Fotografía continua de calle y esquina relacionada con la huella. |
| 87 · D2-01 | Ficha de evidencia aérea y diagnóstico de encuentros; modelo conservado. | Fotografía de calle, acceso y esquina identificados. |
| 88 · D2-02 | Ficha de evidencia aérea y diagnóstico de encuentros; modelo conservado. | Fotografía de calle, acceso y esquina identificados. |

La aérea C10 tiene fecha desconocida. Las fichas históricas de planta declaran incertidumbre visual ±3 m; no son mediciones ni deslindes. Un render ciego no demuestra que la fachada real sea ciega. Se conserva el diagnóstico anterior y no se añaden vanos sin correspondencia visual. El panorama de diciembre de 2023 documentado para 84 todavía no identifica cada elemento de su fachada; su descarga directa devolvió HTTP 403. No se atribuye un hash fotográfico a una vista no descargada.

La evidencia de [84](../public/levantamiento/evidence/D1-09/20261030-equipo/manifest.json) incluye fuentes, cámaras, seis capturas del productor y tres capturas de la integración. Las tres últimas reproducen los hashes de las vistas después del productor: la composición se conserva. Son rasterizaciones por software de triángulos reales, con cámaras aproximadas, sin calibración contra fotografía; no prueban WebGL. La [prueba visual de patio 85](../public/levantamiento/evidence/D1-10/20261030-equipo/patio-prueba.json) aplica temporalmente un paquete neutro sobre el plan real y conserva las imágenes históricas.

La escena C10 pasa de 24,239 a 24,431 triángulos. La comparación de escenas confirma 16,820 colisionadores ajenos al 84 idénticos, incluidos 82 y 83; las cajas de 83/85–88 se conservan. La huella de 84 queda a 4.521 unidades del modelo de calzada y 3.421 de la banqueta C10; el espesor añadido queda dentro de ese margen. Son distancias del modelo y sólo de esas superficies. No certifican tránsito, accesibilidad ni medidas de campo. El muestreo recto del solar contiene 201 posiciones libres con radio de personaje 0.23 m; no demuestra todo el recorrido ni el perímetro.

La prueba inicial de patio tenía un fallo de arnés: mutaba una instancia ESM sin query mientras el runtime importaba otra con `?v=`. Su verde inicial no acreditaba activación. La prueba corregida importa la URL exacta y exige `blockReview === 'C10'` y `frontageId === 'cuadra-D1-10'`, además de conservar el hueco, cinco muestras interiores sin colisión y triángulos de techo/base fuera de ellas. Se conserva este hallazgo y las imágenes del paquete técnico.

Los archivos generados de mundo y visor cambian la cadena de hashes de imports para invalidar caché; no se reemplaza el mundo aprobado del 82. Los recibos de 82 quedan intactos. Los siete archivos históricos que difieren del runtime actual se conservan en `docs/historico82/` con el hash completo en su nombre, vinculados desde el [manifiesto C10](../public/levantamiento/evidence/C10/20261030-equipo/manifest.json). El verificador exige su contenido exacto y verifica también las fuentes actuales C10. Las guardias geométricas conservan 82, 83 y los demás vecinos.

Para reproducir las comprobaciones desde esta raíz:

```sh
node scripts/pruebas-c10-patio.mjs
node scripts/exportar-escena-c08.mjs /tmp/c10-integrada.json C10 --names
node scripts/comprobar-encaje84-c10.mjs /tmp/c10-integrada.json
node scripts/comprobar-encuentros-c10.mjs /tmp/c10-integrada.json
node scripts/evidencia-c10-8586.mjs /tmp/c10-patio85-nuevo --prueba-patio
npm run pruebas
npm run build
npm run verificar:publicacion
```

El exportador admite nombres sólo con `--names`; la comprobación de superficies rechaza una escena sin ellos. El directorio de evidencia 85 debe ser nuevo para conservar los originales. Las comprobaciones técnicas, el circuito local y el dictamen independiente quedan vinculados desde el manifiesto C10. Ratón, iPhone físico, medidas, lados ocultos y publicación permanecen fuera de lo acreditado.


Para continuar, 84 requiere una vista continua mirando al sur desde Sufragio que enlace vecinos y huella, acceso y esquinas, más una aérea que permita contrastar el corte del anexo. 85 necesita el frente de Felipe Salido y la relación del patio con la huella. 86 requiere la junta con 85 y el límite con 88; el nombre histórico «rojo» no prueba el material actual. 87 necesita las vistas norte y este sobre Mina ligadas a sus quiebres de cubierta. 88 requiere el frente sur de Felipe Salido y la esquina oriental sobre Mina, relacionados con 86 y 87. Cada original debe conservar procedencia, orientación, fecha conocida o desconocida y hash del archivo real.

Trabajaron seis especialistas: Astra (`gpt-6-astra`), dos Sol (`gpt-6.1-sol`) y tres Terra (`gpt-6.1-terra`), más root como enlace de autorizaciones, siete agentes en total. Al entregar, los productores pasaron a encaje de 84, prueba real del patio 85 y encuentros del solar; los comunes tuvieron un único integrador. Sin otra mejora respaldada, permanecieron disponibles para correcciones. Las reservas se liberan al cerrar esta entrega. No existe una base comparable para atribuir ahorro de tiempo, ni se midieron FPS.


El circuito local sobre `7f59715` abrió WebGL con SwiftShader, seleccionó P113, retrocedió con S y avanzó lateralmente con A; el visor ligero seleccionó84 y mostró nave/anexo. La paredP113 permanece muy oscura incluso tras separarse unos2.16m; no se aprueba su visibilidad. El controlP111 muestra82 y el modo vuelo muestra la cubierta84. Se hicieron dos controles finitos en una copia efímera: retirar recepción de sombra no resolvió la pared; emisión roja temporal sí coloreó esa superficie. No se demostró un arreglo seguro y no se incorporó esa emisión ni una sustitución de material al producto. Las capturas, recibos y el resultado de pruebas quedan en el manifiesto C10. El dictamen de avance parcial no aprueba P5 ni habilita merge o publicación.
