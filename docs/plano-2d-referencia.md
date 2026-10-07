# Calco 2D de calles y banquetas

Solicitud del 7 de octubre de 2026: dibujar el suelo en 2D y superponerlo al
modelo existente, evitando anchos supuestos, sombras interpretadas como bordes
y superficies duplicadas.

## Estado de este cambio

**Borrador por cuadras, no levantamiento terminado.** La primera revisión es
C01, la cuadra que contiene B1-05, B1-06 y B1-07. Se inspeccionaron sus cuatro
lados en conjunto. Este y oeste tienen seis segmentos parciales retrazados;
norte y sur quedan pendientes por sombras y vegetación. No hay una banqueta
completa validada ni un perímetro cerrado.

El piloto anterior se conserva para comparación, pero deja de ser la capa
activa: T02 seguía una cubierta bajo sombra, T04 pasaba sobre una cubierta y
T08 atravesaba una cubierta y el estacionamiento. T09 también se ajusta al
borde visible; sus extremos tapados no se prolongan. Las líneas del piloto
fuera de C01 permanecen históricas, pendientes de revisar por su propia cuadra.

En Capas, activar «Calco 2D · revisión por cuadra» y «Superponer trazado
anterior». El botón de la cuadra encuadra sus cuatro lados en vista cenital.
Azul corresponde al retrazado; magenta discontinuo al anterior. Ambos son
interpretaciones visuales, no exactitud topográfica certificada.

Evidencia reproducible: [comparación C01](calco-cuadras/C01.svg),
[registro C01](calco-cuadras/C01.json). Regenerar con
`python scripts/evidencia-cuadra.py` (Pillow).

La separación entre dibujos se calcula únicamente en las porciones que
comparten intervalo de revisión. No se usa como error respecto a terreno real
ni se divide por un ancho supuesto. La referencia ofrece aproximadamente
0.52 m/píxel: no permite validar una tolerancia de 10 cm. La precisión absoluta
y la fecha de captura siguen sin comprobarse.

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

La reparación de carga se separó en el PR #66. Si falla el estilo vectorial remoto antes de iniciar el mapa, se activa una
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
