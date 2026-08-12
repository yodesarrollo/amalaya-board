// ============================================================
// MOTOR FINANCIERO de Amalaya — funciones puras, sin React.
// Todo lo que el board suma o calcula sale de aquí, y de aquí
// mismo se alimentan las pruebas (scripts/pruebas-calc.mjs).
//
// El Sheet guarda INSUMOS; los resultados se calculan aquí.
// ============================================================

// --- Normalización de identificadores -----------------------
// "Núm. de Alumnos" → "num._de_alumnos"… no: quitamos acentos,
// minúsculas, espacios a guion bajo. Se usa igual para las
// etiquetas de factores y para los nombres dentro de fórmulas,
// así "Alumnos" y "alumnos" son el mismo insumo.
export function normalizarId(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
}

// --- Intérprete de mini-fórmulas ----------------------------
// Gramática CERRADA: números, nombres de factores, + - * / y
// paréntesis. Nada más. No hay eval ni new Function: es un
// parser de descenso recursivo que solo entiende esa gramática.
// Devuelve SIEMPRE { valor, error } — nunca un 0 silencioso:
// una fórmula rota que se degrada a 0 subestimaría el valor por
// acción en el reporte al banco, que es el error más caro posible.
const MAX_FORMULA = 200

export function interpretar(fuente, variables = {}) {
  const src = String(fuente || '').trim()
  if (!src) return { valor: null, error: 'La fórmula está vacía.' }
  if (src.length > MAX_FORMULA) {
    return { valor: null, error: `La fórmula es demasiado larga (máximo ${MAX_FORMULA} caracteres).` }
  }

  // --- tokenizar ---
  const tokens = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (/\s/.test(c)) { i++; continue }
    if ('+-*/()'.includes(c)) { tokens.push({ t: c }); i++; continue }
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      const txt = src.slice(i, j)
      if ((txt.match(/\./g) || []).length > 1) {
        return { valor: null, error: `Número mal escrito: «${txt}».` }
      }
      tokens.push({ t: 'num', v: parseFloat(txt) })
      i = j
      continue
    }
    if (/[a-zA-ZÀ-ÿ_]/.test(c)) {
      let j = i
      while (j < src.length && /[a-zA-Z0-9À-ÿ_]/.test(src[j])) j++
      tokens.push({ t: 'id', v: normalizarId(src.slice(i, j)) })
      i = j
      continue
    }
    return { valor: null, error: `Carácter no permitido en la fórmula: «${c}».` }
  }
  if (tokens.length === 0) return { valor: null, error: 'La fórmula está vacía.' }

  // --- parsear (descenso recursivo) ---
  let pos = 0
  const ver = () => tokens[pos]
  const tomar = () => tokens[pos++]

  function factor() {
    const tk = ver()
    if (!tk) throw new Error('La fórmula termina antes de tiempo.')
    if (tk.t === 'num') { tomar(); return tk.v }
    if (tk.t === 'id') {
      tomar()
      if (!(tk.v in variables)) {
        throw new Error(`El factor «${tk.v}» no existe en este espacio.`)
      }
      const v = Number(variables[tk.v])
      if (!Number.isFinite(v)) {
        throw new Error(`El factor «${tk.v}» no tiene un valor numérico.`)
      }
      return v
    }
    if (tk.t === '-') { tomar(); return -factor() }
    if (tk.t === '(') {
      tomar()
      const v = expr()
      const cierre = tomar()
      if (!cierre || cierre.t !== ')') throw new Error('Falta cerrar un paréntesis.')
      return v
    }
    throw new Error(`No se esperaba «${tk.t}» en esa posición.`)
  }

  function termino() {
    let v = factor()
    while (ver() && (ver().t === '*' || ver().t === '/')) {
      const op = tomar().t
      const d = factor()
      if (op === '/') {
        if (d === 0) throw new Error('División entre cero.')
        v = v / d
      } else {
        v = v * d
      }
    }
    return v
  }

  function expr() {
    let v = termino()
    while (ver() && (ver().t === '+' || ver().t === '-')) {
      const op = tomar().t
      const d = termino()
      v = op === '+' ? v + d : v - d
    }
    return v
  }

  try {
    const v = expr()
    if (pos < tokens.length) {
      return { valor: null, error: 'Sobra algo al final de la fórmula.' }
    }
    if (!Number.isFinite(v)) {
      return { valor: null, error: 'El resultado no es un número válido.' }
    }
    return { valor: v, error: null }
  } catch (e) {
    return { valor: null, error: e.message }
  }
}

// --- Monto de una línea financiera --------------------------
// monto_anual acepta un número o una mini-fórmula que empieza
// con '=' y usa las etiquetas de los factores del mismo espacio.
// Devuelve { valor, error } igual que interpretar.
export function montoLinea(linea, factoresDelEspacio = []) {
  const crudo = linea && linea.monto_anual
  const txt = String(crudo === undefined || crudo === null ? '' : crudo).trim()
  if (txt.startsWith('=')) {
    const vars = {}
    for (const f of factoresDelEspacio) {
      vars[normalizarId(f.etiqueta)] = Number(f.valor)
    }
    return interpretar(txt.slice(1), vars)
  }
  const v = Number(txt.replace(/[$,\s]/g, ''))
  if (txt === '' || !Number.isFinite(v)) {
    return { valor: null, error: 'El monto no es un número.' }
  }
  return { valor: v, error: null }
}

// --- Escenarios ---------------------------------------------
// Una línea cuenta si no pertenece a ningún escenario (aplica
// siempre) o si su escenario está activo (activo = "si").
export function lineasVigentes(lineas = [], escenarios = []) {
  const activos = new Set(
    escenarios
      .filter((e) => normalizarId(e.activo) === 'si')
      .map((e) => String(e.id))
  )
  return lineas.filter((l) => {
    const esc = String(l.escenario_id || '').trim()
    return esc === '' || activos.has(esc)
  })
}

// --- Resumen por espacio ------------------------------------
export function resumenEspacio(espacio, lineas = [], factores = [], escenarios = []) {
  const propias = lineasVigentes(
    lineas.filter((l) => String(l.espacio_id) === String(espacio.id)),
    escenarios.filter((e) => String(e.espacio_id) === String(espacio.id))
  )
  const misFactores = factores.filter((f) => String(f.espacio_id) === String(espacio.id))

  let ingreso = 0
  let costo = 0
  let regalias = 0
  const errores = []
  for (const l of propias) {
    const { valor, error } = montoLinea(l, misFactores)
    if (error) {
      errores.push({ linea: l, error })
      continue
    }
    const tipo = normalizarId(l.tipo)
    if (tipo === 'ingreso') {
      ingreso += valor
      // Las líneas de regalías (concepto que las nombre) alimentan
      // el tercer componente del valor por acción.
      if (normalizarId(l.concepto).includes('regalia')) regalias += valor
    } else if (tipo === 'costo') {
      costo += valor
    }
  }
  return { ingreso, costo, utilidad: ingreso - costo, regalias, errores }
}

// --- Config -------------------------------------------------
// La pestaña Config es clave|valor|notas. Aquí la volvemos un
// mapa y leemos números con un valor por defecto explícito.
export function mapaConfig(filasConfig = []) {
  const m = {}
  for (const f of filasConfig) m[normalizarId(f.clave)] = f.valor
  return m
}

export function configNum(config, clave, porDefecto = 0) {
  const v = Number(String(config[normalizarId(clave)] ?? '').replace(/[$,\s]/g, ''))
  return Number.isFinite(v) && String(config[normalizarId(clave)] ?? '') !== '' ? v : porDefecto
}

// --- Resumen global y VALOR POR ACCIÓN ----------------------
// componente_inmobiliario = Σ( m2 × valor_m2_<tipo> )
// componente_operativo    = Σ( utilidad anual ) × multiplo_operativo
// componente_regalias     = utilidad anual de regalías × multiplo_regalias
// valor_por_accion        = suma de componentes / acciones_emitidas
// costo_construccion      = Σ( m2 × costo_m2_<tipo> ) + gastos_generales
// La utilidad operativa EXCLUYE regalías para no contarlas doble.
export function resumenGlobal({ espacios = [], lineas = [], factores = [], escenarios = [], config = {} }) {
  const porEspacio = []
  let utilidadTotal = 0
  let regaliasTotal = 0
  let inmobiliario = 0
  let costoConstruccion = 0

  for (const e of espacios) {
    const r = resumenEspacio(e, lineas, factores, escenarios)
    porEspacio.push({ espacio: e, ...r })
    utilidadTotal += r.utilidad
    regaliasTotal += r.regalias

    const m2 = Number(e.m2) || 0
    const tipo = normalizarId(e.tipo)
    inmobiliario += m2 * configNum(config, `valor_m2_${tipo}`, configNum(config, 'valor_m2', 0))
    costoConstruccion += m2 * configNum(config, `costo_m2_${tipo}`, configNum(config, 'costo_m2', 0))
  }

  costoConstruccion += configNum(config, 'gastos_generales', 0)

  const multOperativo = configNum(config, 'multiplo_operativo', 6)
  const multRegalias = configNum(config, 'multiplo_regalias', 4)
  const acciones = configNum(config, 'acciones_emitidas', 0)

  const utilidadOperativa = utilidadTotal - regaliasTotal
  const compOperativo = utilidadOperativa * multOperativo
  const compRegalias = regaliasTotal * multRegalias
  const valorProyecto = inmobiliario + compOperativo + compRegalias

  return {
    porEspacio,
    utilidadTotal,
    utilidadOperativa,
    regaliasTotal,
    costoConstruccion,
    aniosRecuperacion: utilidadTotal > 0 ? costoConstruccion / utilidadTotal : null,
    valorPorAccion: {
      inmobiliario,
      operativo: compOperativo,
      regalias: compRegalias,
      total: valorProyecto,
      porAccion: acciones > 0 ? valorProyecto / acciones : null,
    },
  }
}
