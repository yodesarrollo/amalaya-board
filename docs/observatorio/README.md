# Observatorio de comunicación · 20 octubre 2026

Pedido: integrar en el portal una cronología visual de las publicaciones de Amalaya y una red navegable de actores, medios, cuentas y temas. El usuario indicó conectar las fuentes automáticas después.

## Entregado

- `observatorio.html`, enlazado desde la entrada y el encabezado del tablero.
- 25 fuentes públicas de investigación; 14 miniaturas de imágenes de las fuentes. Dos enlaces Facebook no pudieron leerse y están identificados. Las fuentes sin fotografía no tienen imagen sintética.
- Cronología, filtros de texto/plataforma/fecha y métricas; fichas con URL, quién habla, autor, actores, relación y evidencia.
- Red draggable y zoom con selección de nodos; cada arista guarda publicación de origen. Recuento de conexiones no significa influencia.
- Capturas manuales locales, importación/exportación JSON, CSV de selección. Dedupe por URL canónica. Historial fechado de métricas; null no es cero. No se declara viralidad sin una base comparable.

## Datos y próxima conexión

`public/observatorio/publicaciones.json` contiene exclusivamente información de publicaciones públicas, sin datos del Sheet privado, inversiones, documentos internos ni credenciales. No cambia `public/data.json`, Apps Script, sesiones o permisos.

Las capturas manuales permanecen en `localStorage` con clave `amalaya.observatorio.v1`; se informa en pantalla y en los formularios. Exportación JSON ofrece respaldo/movilidad. No hay escritura compartida, cron ni escucha automática activa. La petición más reciente difiere expresamente la conexión.

Contrato de publicación: `id,title,url,date,dateLabel,medium,platform,account,author,speaker,summary,topics[],actors[],relations[{actor,role}],image,imageSourceUrl,imageStatus,evidence,notes,metrics,metricHistory[]`. Métricas: `views,likes,comments,shares,observedAt`. Desconocidos son null. Las fechas de eventos o de publicación desconocida se identifican en `dateLabel` y notas.

Futura integración debe respetar servidor único de escritura y control de acceso vigente. Un adaptador autorizado normalizará este contrato, mantendrá IDs/canonización e historial, y guardará procedencia por registro. No incluir API keys en el navegador. Celavii requiere una conexión operativa antes de prometer automatización.

## Verificación

`node scripts/pruebas-observatorio.mjs`: integridad de fuentes, archivos de portada, dedupe, fechas nulas, datos numéricos faltantes, URLs, importaciones y relación→fuente. Ejecutar además los verificadores generales y el build del portal antes de publicar.

## Registro Buzón · entrega

Implementación aislada en rama `codex/observatorio-amalaya`. No interviene en reservas del levantamiento. Evidencia: suite general `npm run pruebas` aprobada, `npm run verificar:publicacion` aprobada, tres pruebas Python del puente aprobadas, prueba funcional en Chromium sin errores JavaScript: cronología, filtro, grafo, historial, alta, persistencia y móvil de 390 px sin desbordamiento. Capturas de QA locales fuera del repositorio. Se mantienen Carlos/Florencio separados; Eter/Etel y variantes verificadas de Chito se normalizan sólo en la visualización del grafo, preservando texto de fuente.
