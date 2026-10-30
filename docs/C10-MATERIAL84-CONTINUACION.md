# C10 · corrección del material 84

Continuación de PR 115 sobre `15d52b4`, sin publicación. El muro norte del 84
dejaba de verse como superficie mineral y aparecía casi negro en WebGL.
La causa era una propiedad heredada del primer material de extrusión que el
visor encontraba: `metalness=1`, `roughness=1`. El exportador Node seleccionaba
otra plantilla con `metalness=0`, `roughness=.96`; por eso sus renders y pruebas
anteriores no reproducían el fallo del visor.

El paquete 84 declara ahora `surfaceMaterial: {metalness:0, roughness:.96}`.
El constructor aplica esos valores mediante clones privados antes de agrupar
las mallas. Sólo 84 opta por esa regla: no se modifican luces, emisión, albedo,
huellas, alturas, fachadas, vecinos ni colisiones. Los valores son una
representación mineral neutra, no una medición de acabado real.

## Evidencia causal

El [recibo GPU](../public/levantamiento/evidence/C10/20261030-continuacion/candidato-estable/recibo.json)
conserva la cámara, materiales, tamaño del buffer y lectura de píxel. Sobre el
visor compilado real se mantuvieron geometría, luces, cámara y albedo:

| Prueba en memoria | Metalness | Roughness | Píxel RGBA (500,300) |
|---|---:|---:|---|
| Control de herencia metálica | 1 | 1 | 13,16,16,255 |
| Candidato explícito | 0 | .96 | 125,128,124,255 |
| Cambiar sólo metalness | 0 | 1 | 125,128,124,255 |

Se llamó `gl.finish()` y se leyeron píxel y PNG del canvas dentro del mismo
turno JavaScript. El control metálico es un contrafactual causal sobre el
candidato; el [estado previo real](../public/levantamiento/evidence/C10/20261030-continuacion/visor-aislado/runtime.json)
conserva los cuatro materiales 1/1 observados antes de aplicar el arreglo.
Las primeras capturas DOM del probe no constituyen evidencia causal fiable:
su control salió celeste por un buffer no preservado; se conservan como intento
descartado. La hipótesis Scene/Group también se descartó: produjo imágenes
idénticas. Normales, luz y color no se cambiaron para ocultar el defecto.

Tras restaurar la visibilidad original de todas las mallas se renderizó el
mundo completo en las cámaras P113 y P144. La vista P144 muestra la cara norte
gris y el lateral claro; no demuestra que sus fachadas reales sean ciegas.
No se añadieron vanos sin referencias.

## Límites de aceptación

La corrección del material tiene evidencia WebGL real. El recorrido P5 completo
sigue pendiente: el loader agotó su plazo en este entorno de memoria limitada,
aunque el mundo terminó de construirse y permitió los frames de diagnóstico.
El arnés suspendió el render repetitivo durante la carga y colocó cámaras por
código; no acredita navegación continua, FPS, ratón o iPhone. No hay una nueva
captura de control P111 ni una nueva inspección visual del visor ligero.
Tampoco se declara nivel medio de C10: faltan las correspondencias fotográficas
de fachadas 84–88 ya documentadas en la entrega anterior.

## Reproducción y preservación

`node scripts/pruebas-material84.mjs` ejercita el factory real con una plantilla
de extrusión metálica, reproduce el fallo en la base y exige los cuatro
materiales 84 corregidos, plantilla intacta y vecinos idénticos.

El arnés `scripts/comprobar-material84-webgl.mjs` recibe URL del visor local,
carpeta nueva, revisión, módulo Playwright instalado y URL CDP de un Chromium
aislado. Es una prueba manual; no instala ni publica servicios. La revisión
debe coincidir con los hashes del [manifiesto de continuación](../public/levantamiento/evidence/C10/20261030-continuacion/manifest.json).

El manifiesto y los dictámenes de `20261030-equipo` permanecen byte por byte.
El verificador ahora exige los hashes actuales de la continuación y comprueba
las fuentes anteriores mediante snapshots exactos obtenidos con `git show
15d52b4:<ruta>`, conservados en `docs/historico-c10/`. Las evidencias 82 mantienen
su contrato previo. `node scripts/pruebas-fuentes-c10.mjs` demuestra que el
verificador real rechaza una fuente actual alterada sin modificar el original.
