# Operación multiagente · Amalaya

Corte de preparación: 28 de octubre de 2026 en Hermosillo; actualización ISO UTC: 2026-10-29T03:47:12.296407Z. El tablero es una instantánea versionada, no un monitor ni un proceso en segundo plano. El inventario reúne 139 registros del modelo en 33 cuadras físicas; no es un censo de construcciones reales. La numeración visible proviene de `public/levantamiento/identificadores-provisionales.json`; las cuadras usan `displayNumber` e ID de `public/levantamiento/cuadras.json`.

## Roles y transferencia

- Sol dirige el plan, asigna reservas, integra y publica. Es el único escritor de archivos compartidos, generados y de publicación.
- Terra produce en rama y área propias. Entrega ID, cuadra, alcance, base SHA, manifiesto y su hash, evidencia con fechas y capturas, pruebas, limitaciones y siguiente acción.
- Astra audita de manera independiente el paquete y sus evidencias. El productor no se autoaprueba. El dictamen por criterio es PASA, NO PASA o BLOQUEADO, con motivo; si no existe dictamen, se registra PENDIENTE.
- Se admite una reserva activa por cuadra. La reserva identifica agente, unidad, base SHA y alcance; el manager coordina conflictos y libera o transfiere el lease mediante recibo explícito. El handoff incluye manifest hash y recibo; no basta con una etiqueta de estado.

## Cierre

Los seis criterios son los del proceso individual: identidad y evidencia, forma, fachada, material y estructura, conjunto y ligero, comparación y entrega. La comparación usa frente, esquina y aérea con posiciones semejantes y declara límites y fechas. Las pruebas técnicas no sustituyen la revisión visual. Un resultado NO PASA o BLOQUEADO conserva motivo y siguiente acción; se repite la revisión afectada tras corregir.

**APROBADO PARA INTEGRAR** requiere dictamen Astra independiente PASA en P1–P5 y P6a, el paquete previo a publicación. **PUBLICADO VERIFICADO** requiere además P6b PASA, recibo de despliegue y comprobación del tablero real; son hitos separados. No se migran estados históricos «Hecho» a seis pasos aprobados. Los antecedentes publicados de 79/D1-03, 80/D1-04 y 81/C1-12 se verificaron el 28 de octubre; no constituyen un nuevo dictamen Astra.

La ola asigna 82/C1-13 en C06, cuadra visible 24; 84/D1-09 en C10, cuadra 25; y 89/D1-12 en C11, cuadra 26. Los paquetes y dictámenes están pendientes. 76/D1-05, 77/D1-06, 78/D1-07 y 83/D1-08 son antecedentes de seis pasos documentados, con exterior visual aproximado; no son producción nueva ni dictámenes Astra nuevos. EB-SW 42 y 140/141 son segmentos visuales, no tres propiedades. El manager incorporará resultados, reservas y dictámenes al JSON versionado junto con fecha, evidencia y bitácora. No se emplea localStorage ni controles de la página como aprobación.

## Reanudación y límites de concurrencia

En un chat nuevo, leer la instantánea y su fecha, la bitácora, los leases, handoffs y recibos; contrastar SHA y manifiestos con el repositorio vigente antes de reanudar. No asumir que los agentes de una sesión anterior siguen activos: Sol confirma o libera reservas y registra el estado. De siete slots se ocupan como máximo seis, dejando uno libre. La ola usa hasta tres cuadras y un lease activo por cuadra.

Sol recibe reservas, SHA, paquetes y dictámenes; asigna, integra y registra. Terra recibe un lease, fuentes y SHA, trabaja solo en los archivos autorizados de su rama y entrega commit, manifiesto y `sha256sum <manifiesto>`, capturas, pruebas, límites y siguiente acción. Astra recibe el paquete y dictamina independientemente por criterio. `git status --short` permite comprobar el alcance; `node scripts/pruebas-plan-accion.mjs` comprueba la integridad del plan. Sol es el escritor único de compartidos, generados y publicación; el productor no se autoaprueba.

PASA significa evidencia suficiente y criterio satisfecho. NO PASA documenta un fallo observado, evidencia y corrección solicitada. BLOQUEADO significa que falta evidencia o acceso para emitir juicio y especifica qué hace falta. PENDIENTE significa que aún no se ha registrado dictamen. Cada juicio registra auditor, fecha y motivo.

La comprobación histórica detectó que 83/D1-08 ya tenía seis pasos publicados en PR 105 el 28 de octubre; se reasignó el trabajo de C10 a 84/D1-09, evitando repetir producción. El registro anterior es un antecedente visual aproximado y no un dictamen Astra nuevo.

## Contrato de datos para el siguiente corte

`updatedAtISO` es una fecha y hora ISO 8601 con zona, por ejemplo `2026-10-29T00:30:00Z`. La página la muestra en `America/Hermosillo` y calcula la edad desde ese instante; no usa la fecha del servidor como fecha local ni estima una ETA. Si falta el dato, informa que la hora está pendiente.

`currentWave` contiene `status`, `label`, `summary` y `units` (cada unidad con `buildingId`, `number`, `blockId` y `blockDisplayNumber`). `agents` es un arreglo con `id`, `name`, `role`, `model`, `state`, `activeBuilding` y `lease` por agente. El manager mantiene ambos desde evidencia y reservas vigentes; la vista no debe asumir que un agente sigue activo.

`buildings[].steps` contiene seis pasos P1–P6. P6 contiene `subgates.prepublication` (id P6a) y `subgates.publication` (id P6b). P6a comprueba comparaciones, evidencias y pruebas previas a integración; P6b comprueba el recibo de despliegue y vista real. Cada subgate tiene objeto `audit` con resultado, motivo, auditor y fecha. Una ficha histórica P6 sin esta separación se muestra con dos subgates pendientes, sin atribuirle un juicio nuevo. La integración requiere PASA P1–P5 y P6a; la publicación verificada requiere además P6b PASA y recibo.

## Orden ejecutable y contrato de entrega · Astra v1

1. Sol reserva `task_id`, cuadra, un edificio, `baseSHA`, `allowed_paths`, `criterion_rev`, propietario y vencimiento al cierre de la sesión; Terra devuelve acuse. Una reserva no implica avance ni ejecución continua.
2. Terra lee AGENTS y el proceso de calidad; confirma ID/número/huella, fuentes con fecha/lado, tres rasgos e incertidumbres. Entrada: main exacto, ficha canónica, imágenes autorizadas y lease. No atribuye identidad por una etiqueta de panorama.
3. Terra establece correspondencia calle → esquinas → aérea antes de modelar. Busca fuentes públicas nuevas si faltan y comunica hallazgos a Sol; si sólo hay un fragmento, registra qué extremo falta.
4. Terra resuelve masa, patios y cubierta, conservando anclas y vecinos; exporta el mundo y hace un primer cotejo de tres cámaras fijas. Comandos existentes: `node scripts/exportar-escena-c08.mjs /tmp/escena.json C06` y el script específico `node scripts/evidencia-ola-c06.mjs /tmp/amalaya-ola-c06` (C11 dispone del equivalente; C10 conserva cámaras).
5. Terra aplica fachada, materiales y estructura sólo de rasgos observables. Conserva partes ocultas neutras y declara dimensiones estimadas. Sólo escribe archivos permitidos; un cambio compartido se entrega como diff para Sol, único escritor de integración.
6. Terra ejecuta pruebas dirigidas (`node scripts/pruebas-paramento.mjs`, `node scripts/pruebas-navegacion.mjs` o las pertinentes al cambio), compara antes/después con las mismas cámaras, y entrega manifiesto con SHA256, fuente/lado/fecha, revisión base, diff de alcance, límites, resultados y siguiente acción. Capturas sin archivo/hash quedan como pendientes explícitos. No se autoaprueba.
7. Sol verifica hashes, alcance, rebase e integración candidata, después una suite completa: `npm run pruebas`, `python scripts/pruebas-puente.py`, `npm run verificar:publicacion`, `npm run build` y `node scripts/pruebas-plan-accion.mjs`. Astra juzga P1–P5 y P6a. Rechazo: `criterion_id`, evidencia, cambio requerido, responsable y revisión. Dos devoluciones del mismo criterio exigen replanteo de Sol; no se cambia la rúbrica para aprobar.
8. Sol publica la revisión exacta aprobada, registra CI, commit, URL y hashes de activos. Astra comprueba P6b mediante UI pública y recibo. Sólo entonces cierra el lease y registra publicación verificada. Publicar un diagnóstico no cierra el modelo del edificio.

Checkpoint como máximo cada diez minutos durante trabajo activo, con hora y efecto real, sin ETA inventada. Para retomar, reconciliar agentes terminados, reservas y main; revisar el último paquete y recibo antes de ejecutar. Lo que sigue en cola no trabaja al cerrar el chat. Salida de Terra: paquete reproducible o bloqueo concreto con intento de búsqueda, nunca promesa de ejecución futura. Salida de Sol: revisión exacta integrada o rechazo motivado. Salida de Astra: dictamen independiente por criterio.
