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
// ajuste (opcional, del «¿Y si…?»): multiplica los INGRESOS por
// (1 + ocupacion%) × (1 + precio%). No guarda nada: solo recalcula.
export function factorAjuste(ajuste) {
  const oc = Number(ajuste?.ocupacion) || 0
  const pr = Number(ajuste?.precio) || 0
  return (1 + oc / 100) * (1 + pr / 100)
}

export function resumenEspacio(espacio, lineas = [], factores = [], escenarios = [], ajuste = null) {
  const k = factorAjuste(ajuste)
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
      ingreso += valor * k
      // Las líneas de regalías (concepto que las nombre) alimentan
      // el tercer componente del valor por acción.
      if (normalizarId(l.concepto).includes('regalia')) regalias += valor * k
    } else if (tipo === 'costo') {
      costo += valor
    }
  }
  return { ingreso, costo, utilidad: ingreso - costo, regalias, errores }
}

// --- m² construidos -----------------------------------------
// El valor inmobiliario y el costo de obra se calculan sobre el
// área CONSTRUIDA, no sobre el predio: m² × (COS/100) × pisos,
// leyendo los factores del propio espacio (etiquetas que
// contengan "cos" y "piso"). Un comercial de 2,000 m² con COS
// 75% y 4 pisos vale por sus ~6,000 m² vendibles. Sin esos
// factores, el m² del predio queda tal cual (fallback).
export function m2Construidos(espacio, factores = []) {
  const m2 = Number(espacio.m2) || 0
  const propios = factores.filter((f) => String(f.espacio_id) === String(espacio.id))
  const busca = (re) => {
    const f = propios.find((x) => re.test(normalizarId(x.etiqueta)))
    const v = f ? Number(f.valor) : NaN
    return Number.isFinite(v) && v > 0 ? v : null
  }
  // "cos" como palabra (no "costo"); "piso" en cualquier parte.
  const cos = busca(/(^|_|\()cos($|_|\))/)
  const pisos = busca(/piso/)
  if (cos === null && pisos === null) return { m2c: m2, cos: null, pisos: null }
  return {
    m2c: m2 * (cos !== null ? cos / 100 : 1) * (pisos !== null ? pisos : 1),
    cos,
    pisos,
  }
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
export function resumenGlobal({ espacios = [], lineas = [], factores = [], escenarios = [], config = {}, ajuste = null }) {
  const porEspacio = []
  let utilidadTotal = 0
  let regaliasTotal = 0
  let inmobiliario = 0
  let costoConstruccion = 0

  for (const e of espacios) {
    const r = resumenEspacio(e, lineas, factores, escenarios, ajuste)
    const entrada = { espacio: e, ...r }
    porEspacio.push(entrada)
    utilidadTotal += r.utilidad
    regaliasTotal += r.regalias

    // Área construida (m² × COS × pisos), no el puro predio.
    const { m2c } = m2Construidos(e, factores)
    const tipo = normalizarId(e.tipo)
    entrada.inmobiliario = m2c * configNum(config, `valor_m2_${tipo}`, configNum(config, 'valor_m2', 0))
    inmobiliario += entrada.inmobiliario
    costoConstruccion += m2c * configNum(config, `costo_m2_${tipo}`, configNum(config, 'costo_m2', 0))
  }

  costoConstruccion += configNum(config, 'gastos_generales', 0)

  const multOperativo = configNum(config, 'multiplo_operativo', 6)
  const multRegalias = configNum(config, 'multiplo_regalias', 4)
  const acciones = configNum(config, 'acciones_emitidas', 0)

  const utilidadOperativa = utilidadTotal - regaliasTotal
  const compOperativo = utilidadOperativa * multOperativo
  const compRegalias = regaliasTotal * multRegalias
  const valorProyecto = inmobiliario + compOperativo + compRegalias

  // Valor por acción DESGLOSADO POR ESPACIO: qué parte de cada acción
  // representa cada espacio (sus tres componentes ÷ acciones). La suma de
  // todos los espacios es exactamente el valor por acción.
  for (const x of porEspacio) {
    x.operativo = (x.utilidad - x.regalias) * multOperativo
    x.regaliasValor = x.regalias * multRegalias
    x.valor = x.inmobiliario + x.operativo + x.regaliasValor
    x.porAccion = acciones > 0 ? x.valor / acciones : null
  }

  // UX-08: qué le falta al total para ser una cifra completa. «Sin dato»
  // (vacío o 0 donde 0 no tiene sentido) no es lo mismo que «cero real», y una
  // fórmula rota no es cero: todo eso se lista, nunca se esconde en la suma.
  const sinDato = (clave) => !(configNum(config, clave, 0) > 0)
  const faltantes = []
  if (sinDato('acciones_emitidas')) faltantes.push({ clave: 'acciones_emitidas', texto: 'acciones emitidas' })
  const tipos = [...new Set(espacios.map((e) => normalizarId(e.tipo)).filter(Boolean))]
  for (const t of tipos) {
    if (sinDato(`valor_m2_${t}`) && sinDato('valor_m2')) faltantes.push({ clave: `valor_m2_${t}`, texto: `valor por m² de ${t}` })
    if (sinDato(`costo_m2_${t}`) && sinDato('costo_m2')) faltantes.push({ clave: `costo_m2_${t}`, texto: `costo de construcción por m² de ${t}` })
  }
  for (const e of espacios) if (!(Number(e.m2) > 0)) faltantes.push({ clave: `m2:${e.id}`, texto: `m² de ${e.nombre || e.id}` })
  const conLineas = new Set(lineas.map((l) => String(l.espacio_id)))
  const sinLineas = espacios.filter((e) => !conLineas.has(String(e.id)))
  if (sinLineas.length) faltantes.push({ clave: 'lineas', texto: `ingresos y costos de ${sinLineas.map((e) => e.nombre || e.id).join(', ')}` })
  const errores = porEspacio.flatMap((x) => x.errores.map((er) => ({ ...er, espacio: x.espacio })))

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
    faltantes,
    errores,
    completo: faltantes.length === 0 && errores.length === 0,
  }
}

// --- Comparar escenarios ------------------------------------
// El resumen del espacio como si SOLO ese escenario estuviera
// prendido (null = ninguno: solo las líneas que aplican siempre).
export function resumenConEscenario(espacio, lineas = [], factores = [], escenarios = [], escenarioId = null) {
  const propios = escenarios
    .filter((e) => String(e.espacio_id) === String(espacio.id))
    .map((e) => ({ ...e, activo: escenarioId !== null && String(e.id) === String(escenarioId) ? 'si' : 'no' }))
  return resumenEspacio(espacio, lineas, factores, propios)
}

// --- Autocompletar factores en una fórmula ------------------
// Dado el texto y la posición del cursor, devuelve la palabra a
// medio escribir y las etiquetas de factores que empiezan igual.
export function sugerirFactores(texto, cursor, etiquetas = []) {
  const t = String(texto || '')
  if (!t.trim().startsWith('=')) return { parcial: '', desde: cursor, sugerencias: [] }
  const antes = t.slice(0, cursor)
  const m = antes.match(/[a-zA-ZÀ-ÿ_][a-zA-Z0-9À-ÿ_]*$/)
  const parcial = m ? m[0] : ''
  const desde = cursor - parcial.length
  const p = normalizarId(parcial)
  const ids = [...new Set(etiquetas.map((e) => normalizarId(e)).filter(Boolean))]
  const sugerencias = ids.filter((id) => (p ? id.startsWith(p) && id !== p : true)).slice(0, 6)
  return { parcial, desde, sugerencias }
}
