# Jev y revisión convencional en Amalaya

Vigente: 20-oct-2026. Aplicar al revisar banquetas, fachadas, esquinas, equipamiento, evidencias y cierre del levantamiento. El objetivo es reducir tiempo hasta un resultado comprobado. Conservar el orden de trabajo y las fuentes existentes; no abrir un sistema paralelo.

## Elegir qué herramienta usar

| Trabajo | Ruta |
|---|---|
| IDs, lado geográfico, revisión, hashes, medidas, encaje y colisiones | Fuente y verificadores deterministas |
| Localizar documentos/evidencias | `jev_triage` y ranking de fragmentos, conservando candidatos |
| Clasificar notas y transcripciones | `jev_clasificar` con categorías del caso y revisión de dudas |
| Contrastar una afirmación textual ya leída | `jev_verificar` y comprobación del original |
| Revisar una fotografía contra el modelo | Capacidad visual del modelo principal o adaptador visual suficiente y comprobado |
| Aplicar una corrección 3D | Constructor propietario, ancla/dimensiones verificadas y prueba del cambio |

El MCP textual de Jev no analiza imágenes o audio por recibir una URL o base64. Los adaptadores `amalaya_sidewalk_*` pertenecen a estudios finitos, con manifiesto y presupuesto propios. No reutilizarlos para otras fotos ni resetear slots. La voz se transcribe en otra capa; Jev puede clasificar sus segmentos textuales.

Para instrucciones generales y los 30 usos, usar la skill `jev-ahorro-tokens` v2. Los mantenedores del backend y Claude disponen de la guía `docs/JEV-OPERACION.md` de `alexpueblag/yod-agent-cloud`; su acceso no se amplía al publicar esta guía de Amalaya.

## Preparar el caso real

1. Localizar el objeto/celda y su constructor, versión actual del mundo y evidencia. Registrar lado geográfico, frente, fecha conocida/desconocida y cámara/recorte. Un POI o punto de ruta no es una medición del centro óptico.
2. Confirmar el mismo frente mediante elementos reconocibles. Cuando la pose no esté calibrada, declarar comparación semántica y excluir IoU entre vistas y mediciones en centímetros.
3. Conservar originales y crear sólo proyecciones reproducibles si se necesitan. Registrar dimensiones y hashes; no insertar defectos artificiales ni usar imágenes generadas como realidad de campo.
4. Formular criterios atómicos a partir del pedido. Separar «obstáculo visible» de «pendiente/ancho cumplen». Congelar pregunta, requisito, referencia, versión y ruta de respaldo antes de comparar métodos.
5. Revisar en una sola solicitud conjunta cuando ése sea el flujo útil. No dividir la base convencional en muchas llamadas para hacer parecer rápida una cascada. Agrupar sólo preguntas independientes.

## Exigir evidencia por criterio

La política implementada está en [evidence-policy.mjs](../public/levantamiento/sidewalk-real-v1/evidence-policy.mjs). Usar sus claves exactas; un valor ausente se conserva como pendiente.

| Criterios | Requisitos implementados | Lo que permiten |
|---|---|---|
| `surface`, `bollard`, `rail`, `paving`, `curb` | `photo`, `sameFront` | Observación visual o consistencia visible |
| `width` | `measuredScale`, `calibratedPose` | Comparación métrica de ancho |
| `height` | `measuredLevels` | Comparación de niveles |
| `ramp` | `measuredSlope`, `measuredClearWidth` | Evaluar la condición medida; no basta un obstáculo visible |
| `ends` | `bothCorners`, `continuousCoverage` | Revisión del tramo completo |

`planReview` divide criterios listos y diferidos; `guardReview` conserva respuesta cruda y devuelve `needs_evidence`, `needs_review`, `observed_discrepancy` o `visually_consistent`. `canApplyGeometry` exige discrepancia observada más `verifiedAnchor` y `verifiedDimensions`. Una alta puntuación no elimina esos requisitos ni concede permisos.

Crear criterios durante la ejecución significa adaptar preguntas, alternativas y niveles al pedido, antes de puntuar. Registrar revisión y fuente del requisito. No significa reentrenar el modelo ni cambiar una rúbrica después de ver el resultado. Para `score` real o `box`, usar sólo un contrato que los soporte; no inventar herramientas del MCP.

## Seguir lo que mostró la prueba real

[Abrir evidencia y resultados](https://yodesarrollo.github.io/amalaya-board/levantamiento/sidewalk-real-v1/). Caso P10: banqueta sur de Obregón, frente 21, Garmendia–Abasolo. Referencia manual de ChatGPT y escena; sin medición de campo independiente.

| Método de revisión conjunta | Tiempos completos observados | Mediana | Concordancia del caso |
|---|---|---:|---:|
| GPT convencional | 26.74 / 32.23 s | 29.48 s | 18/18 |
| Jev 90 → GPT | 22.73 / 26.23 s | 24.48 s | 18/18 |
| Jev 95 → GPT | 39.53 / 29.32 s | 34.43 s | 18/18 |

Las dos cascadas enviaron todos los criterios a GPT. Los seis payloads GPT fueron idénticos; dos repeticiones no permiten atribuir una aceleración a Jev. Preferir el flujo GPT conjunto para casos equivalentes hasta que una evaluación nueva pruebe una ruta útil. Un umbral 0.95 no es 95% de acierto demostrado.

El ensayo por criterio hizo 72 llamadas y el flujo conjunto 10; son 82 llamadas de un caso con criterios correlacionados. La auditoría del criterio mixto de accesibilidad se conserva sin reescribir etiquetas ni resultados. La guardia operativa se añadió después y no mejora retrospectivamente las puntuaciones del experimento.

Se registraron tres discrepancias: bolardo negro, protección amarilla y parche de pavimento. La aplicación 3D sigue condicionada a ancla/dimensiones verificadas. Tiempo del diagnóstico no equivale a tiempo de corrección aceptada; no declarar el frente o toda la cuadra terminados por este estudio.

## Aplicar los usos 16–25

| Uso | Instrucción de trabajo |
|---|---|
| 16 · Once etapas | Revisar únicamente criterios observables de la etapa y conservar los pendientes métricos |
| 17 · Región por revisar | Usar caja/recorte como guía visual; no como coordenada 3D |
| 18 · Evidencia suficiente | Comprobar cobertura antes del juicio y pedir el dato faltante exacto |
| 19 · Antes/después | Mantener cámara y objeto, registrar hashes/revisión y comprobar el cambio |
| 20 · Fachada real | Separar identidad, vanos, proporción y acabado; señalar fecha/pose desconocidas |
| 21 · Fallos geométricos | Calcular fallos con validadores; Jev sólo ayuda a priorizarlos |
| 22 · Siguiente trabajo | Elegir acciones independientes con requisitos cumplidos, respetando el orden vigente |
| 23 · Cambios relevantes | Preseleccionar regiones cambiadas por código; conservar revisión de zonas sin alerta |
| 24 · Navegación y captura | Probar estados y gestos reales; una imagen no demuestra toda la interacción |
| 25 · Cobertura de cierre | Exigir las vistas/fuentes y recibos de la etapa; no cerrar por un «sí» del modelo |

## Voz, chinches y ficha de salida

Conservar ID, versión, huella, audio privado, texto exacto y tiempos reales. Relacionar «aquí» con el trazo/captura del mismo intervalo; si falta, conservar el ancla pendiente. Clasificar petición, restricción, propuesta, decisión y pendiente, manteniendo negaciones y atribución incierta. No reenviar una chinche para probar si llegó: conciliar el recibo original.

Entregar por observación: criterio/revisión, evidencia, objeto propietario, respuesta cruda, estado, cambio propuesto, dato faltante, responsable y siguiente paso. Separar observado → preparado → aplicado → verificado. Capturar el resultado real tras cada acción conforme al proceso del levantamiento.

## Medir y mantener la mejora

Medir preparación, acceso, Jev, colas, respaldo GPT y revisión final. Registrar cobertura automática, omisiones, falsos avisos y reaperturas. Si Jev deriva todo al mismo trabajo GPT, omitir el prefiltro salvo otra utilidad comprobada. Ante error/cuota/timeout, conservar el fallo y continuar por la ruta permitida una vez, sin bucles ni reemplazo de respuestas incómodas.

Para otro experimento, preparar un manifiesto, criterios y referencia nuevos antes de las llamadas; comparar varios casos con el mismo final de tarea. Mantener todos los recibos y fallos. No tocar los manifiestos/etiquetas históricos. Publicar código o MD no acredita adopción de todos los agentes, una nueva rutina, despliegue del backend o geometría corregida.
