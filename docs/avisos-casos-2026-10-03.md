# Avisos y casos: código recuperado

Revisión de repositorios del 3 de octubre de 2026. Se consultaron código,
pull requests, incidencias y documentación guardada; no se abrieron conversaciones
privadas ni se ejecutaron turnos de negocio.

## Expedientes del Despacho

Repositorio: [yodesarrollomx/yod-portal](https://github.com/yodesarrollomx/yod-portal),
revisión `7d7c2834da3195831c115cc87a618e20d397fb37`.

[PR 48](https://github.com/yodesarrollomx/yod-portal/pull/48) está integrada.
El aviso al recuperar un expediente distingue sesión/autorización, espera agotada,
formato inválido y apertura fuera de YOD OS. El cliente conserva códigos permitidos
y no publica excepciones del servidor.

| Parte | Archivo guardado |
| --- | --- |
| Avisos visibles y conexión | `despacho-agents/Agents.tsx` |
| Recuperación de expediente, historial y trabajos | `despacho3d/conversation.mjs` |
| Puente de sesión y ventana | `os/despacho-conversation.js` |
| Transporte autenticado | `os/despacho-transport.js` |
| Pruebas del contrato | `tests/despacho-conversation.test.cjs` |
| Procedimiento y aceptación | `docs/arquitectura/despacho-conversacion.md` |
| Capacidades y ejecución | `docs/arquitectura/despacho-capacidades.md` |

La falta de un turno completo indicada en la descripción original de PR 48 es
histórica. Las revisiones posteriores registran dos turnos auténticos, memoria y
recuperación al cerrar y reabrir. Leer un caso no vuelve a encolarlo. Un ACK perdido
conserva el ID; el reenvío requiere una acción explícita.

[Issue 56](https://github.com/yodesarrollomx/yod-portal/issues/56) sigue abierta y
es el relevo operativo vigente. Los comentarios registran Terminal YOD 0.2.0 en
Chromebook, un agente activo y una respuesta persistida. Después de
[PR 57](https://github.com/yodesarrollomx/yod-portal/pull/57), la extensión privada
r4 quedó preparada y probada; falta guardar el código del servidor y actualizar
su implementación para aceptar el perfil real. El chat anterior sigue disponible.
El documento de conversación conserva referencias históricas a r2; para retomar,
hay que leer también los comentarios recientes de Issue 56 y la matriz de
capacidades.

Los expedientes reales, conversaciones y ejecutor permanecen en Sheets/Drive y
el entorno privado del propietario. El repositorio público contiene cliente,
contratos y pruebas. Este entorno no dispone del paquete privado de la terminal.
Quedan por acreditar el perfil tras r4, latencia en Chromebook, autorización de
otras identidades, terminal por puesto y recuperación tras reinicio físico.

## Avisos e incidencias de Amalaya

Repositorio: [yodesarrollo/amalaya-board](https://github.com/yodesarrollo/amalaya-board),
base `82c7db018d07f704b1005a8840cdc51e7d0b854a`.

- `src/componentes/AvisoIncompleto.jsx`: insumos ausentes y fórmulas rotas.
- `src/componentes/AvisoSupuestos.jsx` y `src/confianza.js`: proyecciones con supuestos.
- PR 44, 45 y 46 integradas: lectura canónica de Config y distinción de superficie
  base frente a área construida.
- `public/chinche.js`, `.github/workflows/chinches.yml` y
  `scripts/conciliar-chinches.py`: incidencias técnicas y conciliación de cierres.
- [PR 48 de Amalaya](https://github.com/yodesarrollo/amalaya-board/pull/48): cámara
  y fotos de la matriz 3D integradas; Issue 47 completada.

En la revisión había cero incidencias abiertas de Amalaya. Issue 25 fue cerrada
como `not_planned` por la aclaración del propietario: los insumos definitivos
restantes corresponden a los socios. Ese cierre no certifica cifras estimadas.

Para continuar el levantamiento, usar [el relevo ISC-58](isc58-revision.md). Para
continuar casos del Despacho, usar Issue 56 y su entorno privado; ambos flujos
tienen repositorios, permisos y datos diferentes.
