# Calco 2D de calles y banquetas

Solicitud del 7 de octubre de 2026: dibujar el suelo en 2D y superponerlo al
modelo existente, evitando anchos supuestos, sombras interpretadas como bordes
y superficies duplicadas.

## Estado de este cambio

**Borrador, no levantamiento terminado ni referencia actual certificada.**
Se incorpora un piloto de 14 segmentos: 10 bordes de calzada y 4 bordes de
banqueta interpretados visualmente. No se cierran polígonos, no se generan
superficies 3D ni se cambia el avance de los edificios. Ambos controles están
apagados por defecto. No reemplazar la base de producción con este borrador.

La inspección visual del primer intento detectó líneas que seguían cubiertas
en lugar de guarniciones; se descartó ese intento y se redujo el piloto al
sector legible. Esto confirma que no basta la coincidencia matemática: cada
borde necesita contraste visual independiente.

## Referencia y transformación

- Foto existente: `public/levantamiento/ground-reference.jpg`, 1792 × 1792 px.
- Proveedor: Esri World Imagery. Fecha de descarga: 2026-10-07.
- **Fecha de captura desconocida.** Descargar hoy no convierte la foto en actual.
- Huella SHA-256, nivel de tesela y origen conservados en `src/plano-trazos.json`.
- Los píxeles se convierten a longitud/latitud mediante la inversa exacta de
  Web Mercator de las teselas. No se estira el calco con la calibración histórica
  del Sheet. La foto y el dibujo usan las mismas cuatro esquinas.
- Los bordes bajo sombra, árboles o vehículos quedan sin trazar; no se deducen
  usando ejes OSM ni anchos constantes.

## Integración

En el panel existente Capas: «Calco 2D · bordes por validar» muestra el piloto
sobre su foto; «Plano limpio · sin fotografía» lo presenta sobre papel. Ambos
usan la misma fuente geográfica, también con el mapa inclinado. El calco antiguo
y los rellenos conceptuales se ocultan mientras se inspecciona este piloto.

Si falla el estilo vectorial remoto antes de iniciar el mapa, se activa una
sola vez un estilo local y la referencia fotográfica guardada. No se requieren
credenciales nuevas. Un error de red aislado deja de activar inmediatamente la
pantalla que desmontaba el lienzo; la recuperación cancela sus temporizadores.

## Comprobaciones y límites pendientes

`npm run pruebas:plano` comprueba la huella de la imagen, sus cuatro esquinas,
la ida/vuelta píxel-coordenada, que el piloto arranque apagado y que la
recuperación no repita intentos ni dispare errores después de desmontarse.
También se ejecutaron las pruebas del proyecto, el control de publicación y
la compilación.

Pendiente: contraste de cada línea con una ortofoto de fecha y precisión
conocidas o levantamiento disponible; completar el resto del perímetro y los
cruces; validar el conjunto dentro de una sesión autenticada del tablero.
La sesión del navegador de esta revisión quedó en la pantalla de acceso.
No se modificaron credenciales ni se confirmó la causa del error particular
que vio el usuario.
