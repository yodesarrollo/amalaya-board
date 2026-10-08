# Recintos y unidades de negocio · borrador para socios

El board de operación incorpora Recintos y la pestaña Negocio en la ficha del mapa. El portal público enlaza a la sección autenticada; no expone datos del Sheet ni incluye un respaldo público de cifras privadas.

La presentación de inversión y el planteamiento original se recuperaron del Drive autorizado. El inventario vigente conserva sus cinco recintos, sus IDs y sus posiciones. Se prepararon once unidades dentro de esos recintos, con cinco etapas de negocio cada una. Son propuestas de estudio, no hechos aprobados. No se añadieron edificios ni se movieron polígonos para aparentar una ubicación interior precisa.

## Persistencia y permisos

Cada borrador está en una fila privada de Conocimientos, fuente `amalaya:recinto:v1`, con JSON versionado en texto. Sus notas legibles permanecen en las fichas. La carga inicial se hizo como mantenimiento autorizado del Sheet, con registro en Historial y lectura de confirmación. Las ediciones ordinarias de la interfaz usan el mismo Apps Script, permisos de sesión, debounce, reintento y estado de guardado existentes. No requieren un nuevo servidor.

Los datos del modelo anterior (Factores, Finanzas_Lineas, Config) se conservaron. Recintos es un escenario de trabajo separado, expresamente rotulado. El rol inversionista sigue recibiendo su Reporte congelado; no se ampliaron sus permisos. El borrador debe revisarse antes de usarlo como reporte aprobado.

## Cálculo

Ingreso retenido = capacidad × periodos × ocupación × precio × retención + complemento neto. Costos variables se aplican al ingreso retenido; costos fijos se mantienen separados. Regalías netas = regalías brutas × participación del distrito × (1 − gestión). Las cifras de regalías son hipótesis sin contratos confirmados.

Valor = inmueble + resultado operativo después de renta imputada × múltiplo + regalías netas × múltiplo − deuda. La renta imputada evita sumar el aprovechamiento gratuito del inmueble a su propio valor. El flujo del propietario-operador no descuenta esa transferencia interna, pero sí muestra servicio de deuda por separado. No se calcula TIR, valor comercial certificado ni rentabilidad garantizada. El flujo es antes de impuestos.

Valor por acción = suma del valor de recintos / acciones de Config. La unidad recibe una parte del inmueble/deuda según su área, más su resultado operativo y regalías. No se emiten acciones independientes por unidad. Los escenarios modifican demanda, precios y costos; ocupación nunca excede 100%. Los datos inválidos bloquean totales parciales; superficies y punto de equilibrio se comprueban.

## Identidad musical

El catálogo inicial se restringe a Carin León, Christian Nodal, Natanael Cano, Alfredo Olivas y Luis R Conriquez, con origen sonorense verificado y fuentes en `src/recintos.js`. Se reutilizan fotografías ya licenciadas con sus créditos. Son referencias creativas, no representantes contratados, patrocinadores o socios. Las caras existentes se conservan; las faltantes se completaron como propuestas.

## Verificación

Pruebas de flujos y regalías, deuda, consolidación, valor por acción, límites de capacidad, áreas y entradas inválidas. Render React con los borradores privados, compilación y suite existente. Datos privados de prueba fuera del repositorio; lectura de confirmación coincide exactamente con las filas escritas. La revisión visual pública verifica el enlace, no sustituye una sesión autenticada de los socios.
