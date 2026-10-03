# ISC-58 · continuación de la revisión 1–11

Relevo histórico de ISC-58. Después de este cierre parcial, el usuario seleccionó
expresamente EB-SW; su avance está en [ebsw-revision.md](ebsw-revision.md).
Los pendientes de ISC-58 se conservan en la matriz.

Guía operativa principal: [Guía maestra de Amalaya 3D](https://drive.google.com/file/d/1n563KsI5gP3n6s-rLtqgQJEhRfTno1D7/view).
Este relevo describe el trabajo posterior al corte publicado de planta. La matriz
canónica sigue siendo `public/seguimiento-3d.json`; el Markdown se genera desde ella.

**ISC-58 está incompleto.** Los puntos 02 y 09 tienen cierre técnico del
modelo y 06 tiene identificación documental/visual trazable del acceso.
Los puntos 01, 03, 04, 05, 07, 08, 10 y 11 conservan impedimentos.
La revisión de las once acciones y las capturas posteriores no equivalen a
terminarlas. El siguiente trabajo es retomar el punto 01 y registrar cada
resultado en orden, en verde si cumple su criterio o en rojo con la causa y
el próximo acto necesario para resolverla.

El 3 de octubre se corrigió la comunicación anterior de cierre y la cabecera
«Avance 11», que podía interpretarse como terminación. Los puntos 03/04 ahora
tienen estado rojo y su impedimento explícito. El registro de revisión conserva
la corrección y los estados anteriores; no se modificaron modelo ni capturas.

## Punto de partida conservado

Base del board: `f12c7c2`, posterior a `6e97240`, `b97f47c` y `82c7db0`. El punto 01 ya estaba
bloqueado por correspondencia del frente, rumbo de imagen y escala; el punto 02
estaba activo. Se conservan sin alterar sus PNG, manifiestos y ficha. También se
conservan todos los checkpoints de OB-01/OB-02, sin cambiar sus hashes históricos.

El `world.js` base tiene SHA-256
`fb652de887d19482a4379645cb0db07091ba50b073e04eecd4b94855a6fdbd69`.
El preparador ISC aplica un encuentro mínimo antes de optimizar el mundo y antes
del avatar del visor. Al retirarlo se recuperan exactamente los bytes originales;
la procedencia registra además las cinco regiones de OB-01/OB-02.

La fuente privada completa `Hidalgo3D@a029964`, indicada en la guía, no se recuperó.
La carpeta autorizada de Drive conserva el ZIP/bundle histórico `489b812`; no se
usó para reemplazar el mundo de octubre. Esta continuación es una extensión
visual editable sobre el paquete vigente, no una restauración de la fuente
completa ni una ejecución de sus 108 pruebas históricas.

## Fuentes y calidad de los datos

- [SIC federal](https://sic.cultura.gob.mx/ficha.php?table=institucion_cultural&table_id=18):
  Instituto Sonorense de Cultura, Av. Obregón 58 entre Yáñez y Garmendia.
- [OSM way 664499024](https://www.openstreetmap.org/way/664499024): siete vértices
  únicos, comprobados contra la API vigente y el snapshot publicado.
- Borde sur cartográfico ≈91.84 m; alcance perpendicular máximo ≈55.41 m;
  área ≈3720.66 m². Son cálculos del contorno, no cotas catastrales.
- OSM no documenta altura, niveles, cubierta ni error absoluto. Los 7.45 m del
  modelo son interpretados. No se asignó una incertidumbre cartográfica inventada.
- P05/P06 amplían la consulta original de P03/P04. Sus JPG ya existían en el
  repositorio; se usan para consulta, sin aplicarlos como texturas. Norte absoluto
  y fechas de captura permanecen desconocidos.
- El nombre OSM y el domicilio no prueban cuál paño físico pertenece al #58.
  El ancho de 21 m y posición del tramo rojo son hipótesis heredadas editables;
  los frentes crema exteriores conservan morfología genérica sin verificar.

El registro numérico y hashes están en
[`identity-plan-record.json`](../public/levantamiento/evidence/ISC-58/identity-plan-record.json).

Al retomar el punto 01, una [foto de Commons](https://commons.wikimedia.org/wiki/File:Edificio_del_Instituto_Sonorense_de_Cultura.jpg)
permitió identificar el letrero ISC y numeral 58 en la arquería beige de cinco
arcos. P04/P05 y las fotos [frontal](https://www.flickr.com/photos/iscsonora/48309339622/)
y [de contexto](https://www.flickr.com/photos/iscsonora/48309284121/) corroboran
el acceso y su relación con el monumento. Es una identificación visual; no fija
extremos de parcela, posición métrica, escala ni norte del panorama. El punto 01
sigue bloqueado y el paño rojo conserva atribución administrativa desconocida.
Las imágenes se consultaron sin copiarlas al paquete público ni usarlas como
texturas. La fecha declarada y EXIF de Commons discrepan; Flickr no aporta GPS
ni rumbo útil y su cuenta no se trató como fuente oficial certificada.

Al retomar 03 se reparó la base bajo juntas y bordes del paso sur heredado,
se recortaron cuatro losetas que invadían el mesh actual de calzada y se añadieron
colliders para las doce pilastras visibles. Las pruebas usan rayos antes/después,
intersección independiente contra triángulos de asfalto y comprobación de los
sólidos visibles. No cambiaron cotas, perfil vial, transición ni OB-01/OB-02.
[Captura 09](../public/levantamiento/evidence/ISC-58/09-banqueta-sur-reparada.png)
y [manifiesto 03](../public/levantamiento/evidence/ISC-58/sidewalkA-repair-manifest.json)
registran este checkpoint propio. El avance de cabecera conserva el ámbito PH-01
aislado del inicio y no incluye la banqueta sur; su evidencia directa es 09.
03 sigue rojo por estrechamiento occidental, transición desconectada y falta de
cotas físicas. Se activa 04 únicamente después de registrar este resultado.

En 04 se añadió la base bajo juntas del pavimento de plaza y se retiraron o
recortaron 41 losetas de plaza y 165 losetas genéricas por su intersección con
la calzada o por solaparse con el pavimento del propietario PH-01. Se conservaron
biseles, tonos, UV, cotas, transición, OB-01/OB-02 y la reparación03 completa.
Las pruebas de rayos verifican tres juntas con base y el antiguo solape ahora
ocupado solo por asfalto. [Captura11](../public/levantamiento/evidence/ISC-58/11-paseo-norte-reparado.png)
y [manifiesto04](../public/levantamiento/evidence/ISC-58/sidewalkB-repair-manifest.json)
registran una captura posterior distinta de03. El cierre físico de04 sigue rojo.

La [ficha06](../public/levantamiento/evidence/ISC-58/identity-record.json) cierra
el criterio de identidad visual: código, domicilio oficial, frente observado,
P04/P05, coordenadas de ruta y SHA de los JPG cotejados con sus originales.
No equipara las coordenadas de ruta con el centro óptico o posición medida del
acceso. Las fechas y el norte desconocidos están declarados; la atribución del
paño rojo permanece desconocida. Los criterios de planta, volumen y fachada
mantienen sus impedimentos independientes.

## Revisión de las once acciones

| Orden | Acción | Trabajo y límite |
| --- | --- | --- |
| 01 | Planta | Ampliada la consulta de la huella; se conserva el bloqueo publicado de correspondencia/escala del frente. No se creó ni movió otra parcela. |
| 02 | Calle | Auditado el propietario vial y el perfil PH-01 existente: calzada 6.705 m y corrección del eje −1.53 m. Son parámetros de una consulta aérea anterior, no medición nueva. |
| 03 | Banqueta A | **Bloqueado.** A = sur geográfico. Perfil PH-01 existente: paso 0.931 m y transición 1.118 m; falta verificar cotas, ancho útil, accesos y continuidad. No se copió el ancho sur 1.2 m de OB-W. |
| 04 | Banqueta B | **Bloqueado.** B = norte geográfico. Paseo de plaza 19.181 m y transición 1.118 m en P05; falta delimitar el tramo, sus cotas, obstáculos y continuidad. No se copió el ancho norte 2.0 m de OB-W. |
| 05 | Esquinas | No se inventaron rampas o radios. Faltan detalles identificados de los extremos Yáñez/Obregón y Garmendia/Obregón. |
| 06 | Identidad | **Hecho dentro de su criterio documental/visual.** Acceso beige#58 reconocido en P04/P05; ficha con origen, coordenadas de ruta, hashes y fuentes. No certifica centro óptico, extremos ni atribución del paño rojo. |
| 07 | Volumen | Se conserva huella/techo/altura; se retira la pared opaca detrás de los vanos y se conserva un cierre superior hasta la cubierta heredada y se recortan colisiones a la huella irregular. Cotas, cubierta y acceso físico siguen sin levantar. |
| 08 | Fachada | El tramo rojo sustituye al tramo crema en vez de superponerse; tres vanos interpretados: ventana, portal central más ancho, ventana. Retirados ornamentos incompatibles en el límite. Proporciones y atribución continúan bloqueadas. |
| 09 | Acabados | Corregida doble escala UV: estuco métrico a 2.2 m por repetición, materiales procedurales originales. No certifica medidas ni color de campo. |
| 10 | Equipamiento | Inventariado el límite de información: no se añadieron postes/cables/árboles/anuncios sin anclas. Falta inventario medible y permanencia de los elementos del frente. |
| 11 | Comparación | Planta/bloque/peatón comparten P05 X/Z y rumbo 355.065831°, normal al borde OSM. La comparación técnica no registra el norte de los panoramas ni borra los bloqueos anteriores. |

P05 también permite reconocer un vano adicional parcialmente oculto junto al
árbol, y más frente con oclusiones. Los tres vanos del tramo editable no son el
recuento certificado de toda la fachada roja.

Los defectos técnicos de representación se corrigieron dentro del constructor
existente PH-01. La revisión no convierte la fachada candidata en una restitución
exacta del Instituto. Los problemas y datos necesarios permanecen en las celdas.

## Evidencia

La cabecera conserva la cámara original `ISC-58-fixed-v1`: posición
`[-20,135,-17]`, objetivo `[-20,0,-17]`, up `[0,0,-1]`, planta ortográfica
`[-88,88,55,-55]`, 1280×800. La captura final del mismo ámbito PH-01 se registra
como avance; el inicio publicado es inmutable.

La comparación adicional P05 usa ancla `29.0759512,-110.9546564`, X/Z
`5.70564,18.17361`, rumbo `355.06583118825637°`; alturas 70/12/1.68 m para
planta/bloque/peatón. La planta orienta su borde superior por ese rumbo y no dice
«norte arriba». Antes/después comparten cámaras, luz y mundo integrado. El detalle
puede usar otra cámara para evitar la oclusión del monumento y lo declara.

PNG nuevos, metadatos WebGL y límites:
[`evidence/ISC-58`](../public/levantamiento/evidence/ISC-58/).
Son capturas reales del modelo, no fotografías del sitio. El registro ordenado
[`review-record.json`](../public/levantamiento/evidence/ISC-58/review-record.json)
identifica los alcances revisados; no simula once modificaciones geométricas
independientes ni reasigna fotografías históricas al modelo nuevo.

## Retomar la terminal

En este entorno, board `/workspace/amalaya-board`; extensión privada editable
`/workspace/amalaya-3d-continuation/src/isc58-refinement.js`. El repositorio público
contiene solamente su activo ESM compilado/minificado, sin source maps. El paquete
local privado de continuación permite regenerar esa extensión; no sustituye la
fuente completa a029964.

```sh
cd /workspace/amalaya-board
git status --short
git log -3 --oneline
npm ci
npm run preparar:isc58
npm run pruebas
python3 scripts/pruebas-puente.py
npm run verificar:publicacion
npm run build
git diff --check
```

`ISC58_SOURCE` permite seleccionar explícitamente la fuente privada de la
extensión. `preparar:3d` comprueba el checkpoint antes de borrar activos: una
fuente histórica o desconocida se rechaza. Para una siguiente fuente completa,
revisar primero el cambio de base y las evidencias; no desactivar la comprobación
para copiar un mundo anterior.

Retomar ISC-58 desde el punto 01, el primer pendiente. Consultar primero las
referencias ya disponibles para resolver la correspondencia espacial y después
sustituir los parámetros interpretados, conservando evidencia y hashes históricos.
EB-SW permanece en cola; ISC-58 no está terminado. Esta sesión no inició otro
edificio.

Avisos de casos recuperados: [revisión de YOD Portal y Amalaya](avisos-casos-2026-10-03.md).

## Verificación de la entrega

Pasaron las pruebas del board, las dos pruebas del puente y las regresiones de
geometría/visor ISC. El verificador comprueba hashes de activos, PNG, cámaras y
conservación íntegra de los checkpoints anteriores. El visor directo, el embed
con personaje y la capa MapLibre real se renderizaron sin errores. Las banquetas
se mantienen bloqueadas para su cierre: la vista sur muestra paso estrecho y
salientes, y el tramo norte carece de límites/cotas verificados.
El cierre superior del cuerpo se comprobó por rayos y por inspección visual.
El visor y el avatar renderizan las reparaciones sin errores. Eso no acredita
navegación accesible completa: el avatar heredado no actualiza el apoyo vertical
al caminar; esta limitación técnica queda señalada en QA, que sigue rojo.

El corte `f12c7c2` guardó el fallo `page.goto: Timeout 30000ms exceeded`
antes de WebGL, sin frame. Se conserva en el historial. Las capturas nuevas usan
el paquete visual vigente y un servidor local comprobado. En Vite, abrir
`levantamiento/visor/index.html` explícitamente: `/visor/` puede caer al HTML de
la SPA. La prueba de la capa integral usó MapLibre real y el adaptador original,
con dos frames renderizados sin errores.
