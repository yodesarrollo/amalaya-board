# Amalaya · Jev para imágenes 1.14 · ampliación experimental
Corte: 2026-10-28 America/Hermosillo. Documento complementario a `docs/JEV-REVISION-OPERATIVA.md`, `docs/OPERACION-MULTIAGENTE-AMALAYA.md` y `docs/PROCESO-CALIDAD-EDIFICIO-3D.md`. **No altera trabajos, modelos, reservas, límites, ni estados previos.**
Fuentes: https://docs.typesafe.ai/images y https://docs.typesafe.ai/primitives/box . La versión experimental incluye imágenes y `box`, requiere opt-in `TypeSafe-Danger-Zone-Images: true`, y no está validada para producción.
## Procedimiento en cada edificio
1. Terra recibe lease activo de Sol con edificio, cuadra, ID visible provisional, revision SHA, fuente autorizada y vistas (frontal/esquina/aérea), fecha, lado y hash. No reusar estudio finito `amalaya_sidewalk_*` fuera de su manifiesto.
2. Preflight local: JPEG/PNG, dimensiones válidas, orientación y minimización. Si la entrada es PDF o vídeo, convertir páginas/fotogramas con herramientas externas y registrar cobertura; Jev no ingiere video ni audio.
3. En **sombra** y solo con adaptador autorizado, formular preguntas atómicas de presencia/visibilidad y tipo de elemento (vanos, cubierta, portón, retiro, obstáculo); un `box` es una pista 2D normalizada. No extrapolar metros, propiedades, dirección postal, pose calibrada, espesor ni malla 3D.
4. Contrastar por el mismo frente con las vistas originales y verificadores de medidas/encaje/colisiones. Si falta ancla o dimensión, conservar `needs_evidence` / `BLOQUEADO`; no dibujar geometría a partir de sólo una caja.
5. Sol revisa paquete y alcance; Astra dictamina P1–P5 y P6a con recibos reales y P6b únicamente tras publicación verificada. Jev no aprueba ni sustituye a Astra. Registrar prueba de presencia antes de consumir box.
6. Evaluar tiempo total hasta edificio aprobado, cobertura de criterios, falsos positivos/negativos, fotos revisadas, costo y GPT evitado. Conservar prueba histórica frente 21 (Jev 90/95 remitió todos a GPT); nunca anunciar ahorro hasta contrastar nueva muestra de edificios.
## Estado de relevo
Este documento prepara el piloto y facilita el handoff a los chats/agentes que lean el repositorio. **No demuestra** Jev visual conectado, agentes trabajando, fachada reconstruida, ni cambios en GitHub Pages.
