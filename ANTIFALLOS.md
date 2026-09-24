# Amalaya · plan antifallos

Qué pasa si roban una cuenta, si alguien borra datos o si cambia el cálculo,
y cómo se recupera todo. Acordado con Alejandro el 24-sep-2026.

## 1 · Cuentas maestras (recuperación)

- Viven en la **Propiedad del Script `CUENTAS_MAESTRAS`** (correos separados por
  coma), no en el Sheet ni en el board. Solo se cambian en el editor de Apps
  Script → Configuración del proyecto → Propiedades del script.
- Recomendado: **dos o tres** correos de Google con verificación en dos pasos,
  de personas distintas (p. ej. dirección y una cuenta de respaldo que no se
  usa para nada más).
- Nadie las puede apagar, degradar, borrar ni cambiarles el correo desde el
  board (el servidor lo rechaza).
- Si un atacante las toca directamente en el Sheet, al entrar con Google
  **se restauran solas** como admin activas (y queda anotado en Historial).

## 2 · Nadie se queda afuera

- Nadie se puede apagar ni quitar el admin a sí mismo.
- Nunca puede quedar **cero admins activos**.
- Los códigos y ligas solo se cambian con sus botones (no con «guardar»).
- Freno: máximo **25 borrados por hora** por persona (un robo no vacía el Sheet).

## 3 · Nada se pierde

| Qué | Dónde | Cómo se recupera |
|---|---|---|
| Cada cambio (antes → después) | pestaña `Historial` (solo la escribe el servidor) | se lee el «antes» y se vuelve a capturar |
| Filas borradas | `Historial`, campo «(fila borrada)» con la fila completa en JSON | se pega de vuelta en su pestaña |
| Todo el Sheet | respaldo nocturno ~3 am en Drive → `AMALAYA/Respaldos` (⚙️ → «Nocturno» lo activa; «Respaldo» lo hace ya) | se copia el JSON de vuelta pestaña por pestaña |
| Versiones del Reporte | Drive → `AMALAYA/Reportes`, con **datos y cifras** congeladas | el board las abre; si el cálculo cambió, enseña lo congelado y avisa la diferencia |
| El Sheet mismo | historial de versiones de Google Sheets | Archivo → Historial de versiones → Restaurar |

## 4 · Si hay un hackeo, en este orden

1. Entra con una **cuenta maestra** (Google). Si la tocaron, se restaura sola.
2. ⚙️ → apaga a la cuenta robada y genérale código y liga nuevos (los viejos mueren).
3. Revisa `Historial` desde la hora del robo y regresa lo que cambió.
4. Si hubo borrado grande: restaura del respaldo nocturno o del historial de versiones del Sheet.
5. Si el atacante tuvo acceso al editor de Apps Script: cambia `CUENTAS_MAESTRAS` y re-despliega con «Nueva versión».
