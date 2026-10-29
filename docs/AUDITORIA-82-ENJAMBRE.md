# Auditoría Astra · edificio 82 / C1-13

2026-10-29T17:42:42Z. Base inspeccionada ef89166299e759ab5e0840bc956e97c7f38eb103. Auditor técnico independiente; no muta producción. Reserva anterior de 15:11Z por conciliar por Sol antes de integración; trabajo local aislado permitido. Prototipo histórico 9e8616d NO PASA, no activarlo sin corrección. 79/80/81 fuera del alcance.

## Evidencia original inspeccionada

- `82-sur-fuente-202312.jpg`: fachada turquesa; cuatro superficies semicirculares moradas sobre vanos inferiores rectangulares, no perforaciones arqueadas. Dos superiores visibles cerca del centro forman ventana doble; hueco próximo a curva es menor y más bajo. Barandal blanco sobre cornisa con retorno curvo; zócalo/molduras morados. Obstrucciones poste y vehículo.
- `82-este-fuente-202312.jpg`: tres arcos visibles en recorte, extremos parciales. Izquierdo con herrería, central nicho/puerta cegada morada sin transparencia, derecho puerta azul. Pilastra entre central/derecho y friso superior. Repisas superiores recortadas: no certificar número ni extensión del lateral entero.
- `81-sur-202312.jpg`: patio abierto, lateral gris del cuerpo oriental y extremo turquesa a derecha. Correspondencia visual razonable entre patio, cuerpo y esquina; no identidad predial.
- `ajuste-visual/C06.jpg`: bloque oriental y patio vecinos en aérea general; fecha desconocida, cubierta trasera sin resolución suficiente.
- Prototipo esquina histórico: omite lateral y barandal, altos homogéneos. Rechazo P3/P4 confirmado visualmente.

## Criterios congelados v2 para paquete local

P1: correspondencia visual documentada patio81→cuerpo82→esquina y límites de cobertura. No exigir levantamiento métrico para formas estimadas autorizadas.
P2: anclas históricas conservadas, curva contenida, patio abierto, cubierta desconocida neutra. Prueba real de invasión de calle por molduras.
P3: semicírculos pintados sur, vanos rectangulares/herrería y altos diferenciados; lateral con arco central opaco, arcos extremos y pilastra en tramo observable. Sin repetición inventada en tramo oculto.
P4: barandal claro sustentado sobre remate, retorno coherente, materiales y profundidad legibles. Repisas observadas sin fingir balcones completos no vistos.
P5: vecinos y colisiones preservados, encaje vial de todos salientes, recorrido real y elementos esenciales visibles en modelo ligero.
P6a: paquete con fuentes, hashes, revisión exacta, tres cámaras antes/después fijas y detalle este adicional; pruebas reales. Auditoría independiente del candidato final.
P6b: pendiente hasta publicación autorizada, recibo y prueba de UI real exacta. No confundir render software con WebGL.

## Reparto recomendado

1. Forma/anclas/encaje. 2. Lateral este. 3. Sur/barandal. 4. Ligero/colisiones/vecinos. 5. Evidencia/cámaras/runtime.

Sol mantiene una reserva C06 y es único integrador. Cinco Terra trabajan áreas disjuntas; autorización expresa de concurrencia prevalece sobre límite documental anterior. Auditoría por rotación con Hallazgo/Evidencia/Corrección/Criterio; registro sólo de verificaciones realmente realizadas.

Checkpoint secuencial (hora no capturada) · Primera rotación real. Terra3 entregó barandal recto52a6bb2; se devolvió retorno curvo faltante P4, produjo d939192 con curva cuadrática. Código inspeccionado; pendiente render. Terra2 confirmó sur heterogéneo y arco central ciego. Terra4 de0ded6 test de 16919 colisionadores+firmas vecinos y presencia en ligero, explícitamente no acredita visibilidad. Terra1 render-b inspeccionado: curva sureste/patio coherentes; su `points` histórico explícito resultó posteriormente con 3 intersecciones viales según Sol, por lo que P2 sigue BLOQUEADO hasta fittedPlan vigente y mapa índices. Se instruyó no sustituir encaje actual por coordenadas históricas. Terra2 detectó semicírculos omitidos y pilastras replicadas en curva; en corrección, no aprobadas.

Checkpoint secuencial (hora no capturada) · Segunda rotación. Terra1 77db691 preserva fittedPlan5 vigente: esquinaSE índice3, sur2 oeste→este, este3/4. Render-c inspeccionado curva y patio coherentes. Terra3 07b84cc adapta barandal a5p y curva3, código revisado; falta imagen final. Terra2 comunicado invertir progresivas sur y no extrapolar lateral. Lectura directa de su código revela rejas rectangulares con altura reducida (h-w/2) por falta fullBars: devolución P3 concreta para82; exigir parteluz de ventana doble y repisas orientales sólo observadas. Terra4 detectó falso positivo por triángulo vial degenerado: excluir degenerados es válido, baseline fittedPlan5=0; suma por caras NO área-unión en metros cuadrados. Estas pruebas aún no evalúan paquete integrado final.

Checkpoint secuencial (hora no capturada) · Tercera rotación. Se inspeccionaron imágenes calle/esquina/este de /tmp/terra2-82-r3: sur, semicírculos pintados y barandal curvo reconocibles; detalle este demasiado cercano sólo deja arco azul, devuelto a5 para cámara útil de tres rasgos. Se retiró hallazgo altura rejas al comprobar transformación posterior fullBars:!!v.rect; no era defecto real. Sí se comprobó que transformación borraba barColor82, causando rejas negras visibles en r3. Terra2 0d5a95f corrige azul e incorpora parteluz/repisita oriental parcial; pendiente imágenes nuevas. Terra4 reporta integración parcial 202 caras,0 cruces viales,16831 colisionadores ajenos+vecinos conservados; no basta para detalles finales.

Checkpoint secuencial (hora no capturada) · Cuarta rotación. Cuatro imágenes integradas f521924 revisadas: sur y aérea coherentes; detalle llamado este sólo muestra sur/esquina. Vista elevada de9762851 finalmente permite revisar lateral y revela NO PASA P3: orden invertido frente a foto heading270 (foto reja→nicho→pilastra→azul de sur/izquierda a norte/derecha; modelo azul→pilastra→nicho→reja). También arco de reja se ve oscuro sin barrotes; hipótesis verificable código: fill recess .025 de roundedFront oculta barras -.08. Devuelto aTerra2 invertir atributos locales y adelantar reja. Pilastra9762851 ya conecta friso, P4 encuentro corregido. Terra5 reportó captura ligera con prisma beige/selección desviada: P5 sigue BLOQUEADO, investigar versión/selección sin suponer fallo geométrico.

Checkpoint secuencial (hora no capturada) · Quinta rotación. Vista /tmp/terra2-82-order/82-este-amplia-3d.jpg inspeccionada: orden local corregido reja→nicho→pilastra→azul, reja adelantada visible y pilastra unida friso. P3/P4 visual local PASA estimado; falta evidencia equivalente del candidato integrado final. /tmp/amalaya-light-root82.png sí muestra82 turquesa, arcos y barandal; retirado falso bloqueo prisma beige que provenía de servidor worktree anterior sin ligero regenerado. Contorno naranja de selección apunta a otro edificio: pendiente diagnóstico independiente de selección, no geometría. Hashes originales sur/este coinciden auditoría histórica y 10 hashes antes/después f521924 comprobados, cámaras iguales. Dicho después es intermedio previo a corrección orientación lateral y no acredita candidato final.

2026-10-29T17:55:03.276900+00:00 · Dictamen local emitido: P1–P4 PASA exterior aproximado; P5 BLOQUEADO recorridoWebGL; P6a PASA paquete verificable20hashes/cámaras iguales; P6b PENDIENTE. Ligero este persistido inspeccionado con orden y rasgos visibles. Diagnóstico real WebGL muestra contexto disponible y excepción applyPlanRound, no falloGPU. Mantener bloqueo hasta corregir y recorrer; root continúa investigación.
