# C10 · primera pasada práctica y publicación por edificio

## Alcance autorizado

El propietario autorizó una primera pasada reconocible, sin exigir fotografía exacta ni perfección, con hipótesis conservadoras, reversibles y revisables (PRACTICO-2). Después exigió que el cierre incluya publicación y comprobación de lo publicado. La secuencia vigente es85→86, conservando84 y los mejores resultados82/83.

Este alcance NO certifica fidelidad fotográfica, alturas medidas, accesibilidad, recorridos completos ni aprobación humana de cada supuesto. P1–P6 y dictámenes anteriores se conservan como historia, sin convertir sus NO PASA en PASA. La aprobación de publicar esta propuesta no equivale a DEJAR ASÍ en las fichas.

## Definición de terminado práctico

1. Propuesta integrada y explícitamente identificada como hipótesis.
2. Integridad técnica y preservación de huellas, patios, colisiones y vecinos comprobadas.
3. Capturas del modelo y ficha localizada, con revisión del renderer, supuesto y opciones DEJAR ASÍ / CORREGIR / APORTO FOTO. Pendiente por defecto; decisiones locales, sin escribir Sheets.
4. Revisión independiente del alcance y los cambios comunes.
5. CI del commit exacto, publicación autorizada y comprobación posterior de URL/artefactos servidos.

Un render local, PR abierto, build verde o merge sin comprobar el despliegue no cierra un edificio. La incertidumbre de una fachada no detiene la cola si queda rotulada; un fallo técnico sí impide publicar ese candidato.

##85 · versión candidata

La propuesta añade tres paños ciegos, zócalo y remate mediante superposición somera sobre la masa nativa, sin abrir vanos ni cambiar las colisiones. Las capturas WebGL y del visor ligero se encuentran en `public/levantamiento/evidence/C10/20261030-practico85/`; la ficha está en su subdirectorio `revision/`. Incluye84 como antecedente integrado. El nuevo módulo86 está excluido de esta versión.

El presupuesto del binario ligero permanece960000bytes; no se aumentó para aceptar esta entrega. Las capturas WebGL usan cámaras de inspección y render automático pausado; no sustituyen un recorrido interactivo ni una prueba de rendimiento.

## Trazabilidad y generaciones

Los manifiestos `20261030-equipo` y `20261030-continuacion` conservan sus bytes. `scripts/c10-generaciones.mjs` verifica cada generación, su padre, sus fuentes históricas archivadas, las fuentes actuales y cada entrada de evidencia por separado: una clave posterior no puede ocultar un hash anterior.

El puntero `public/levantamiento/evidence/C10/actual.json` identifica la generación técnica activa. El campo `publication:false` de los manifiestos técnicos delimita lo que ese recibo acredita: sellado de archivos, no despliegue. La publicación se demuestra separadamente mediante el run de Pages y la lectura pública posterior del SHA y recursos correspondientes.

Las fichas y capturas se guardan dentro de cada generación; la siguiente no las sobrescribe. Para generar otra versión se usa un nombre nuevo, el SHA exacto de su antecesora y evidencia nueva. No modificar manifiestos históricos para hacer pasar pruebas. El generador recibe subdirectorios/archivos explícitos mediante `--evidencia`; no crea auditorías ni aprobaciones.

## Verificación reproducible

- `npm run pruebas`
- `python3 scripts/pruebas-puente.py`
- `npm run verificar:publicacion`
- `npm run build`

Las pruebas de fuentes exigen primero un caso positivo completo y después negativos causales: fuente actual, colisión de evidencia histórica, snapshot previo, snapshot82, hash del padre, ruta fuera de alcance y cobertura. La auditoría y el recibo público deben nombrar la revisión efectivamente comprobada; este documento no afirma que la candidata esté ya desplegada.

## Criterio del propietario · 10-nov-2026 · mundo terminado

Decisión de Alejandro Puebla (10-nov-2026, 07:58 HMO): «si ya hay una instrucción para eso, levantar un genérico; si no hay foto específica del lugar, la foto queda para después, pero dar por buena la edificación ahora. Lo que queremos es un mundo virtual terminado, no necesariamente perfecto».

- Sin fotografía atribuible se modela un genérico rotulado (paños ciegos, zócalo y remate neutros sobre la masa nativa, sin vanos ni accesos inventados) y se acepta: `DEJAR ASÍ`.
- La foto del lugar queda como mejora posterior; cuando llegue, corrige el genérico en una generación nueva sin bloquear la cola.
- La incertidumbre se sigue rotulando: genérico aceptado no equivale a fachada observada, cota medida ni fotorealismo.

## 88 · genérico aceptado y cierre de C10

`public/levantamiento/c10-88-data.js` (H88-S-01) trata la arista2 original de D2-02, frente sur hacia Felipe Salido, con el mismo lenguaje que 86 en esa calle: tres paños ciegos, zócalo y remate, retirados 0.15 de cada extremo. Conserva la huella efectiva de cinco vértices, la cubierta, la altura provisional 6.2, todos los vecinos y las colisiones (`scripts/pruebas-modelo88.mjs`). El binario ligero quedó en 959 920 bytes, dentro del presupuesto de 960 000.

La generación técnica `20261030-practico88-20261110` sella las fuentes; sus vistas CPU están en `vistas/` y la decisión del propietario en `decision-propietario.json`: 87 y 88 `DEJAR ASÍ` como genéricos aceptados y 84–86 aceptados bajo el mismo criterio. Con ello C10 (D1-08, D1-09, D1-10, D1-11, D2-01 y D2-02) queda cerrada en primera pasada práctica. Las fichas r1–r3 de 87 y los dictámenes previos se conservan sin reescribir.
