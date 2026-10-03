import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { transform } from 'esbuild'

export const BASE_WORLD_SHA256 = 'fb652de887d19482a4379645cb0db07091ba50b073e04eecd4b94855a6fdbd69'
export const BASE_VISOR_SHA256 = 'fc34a1ebbca16fe0e4694de11e30f8c1ecdccf9f49cae8578fb07caf41d4704a'
export const ISC58_IMPORT = 'import { applyIsc58 as applyIsc58Refinement } from "./isc58-refinement.js";\n'
export const ISC58_CALL = 'applyIsc58Refinement(c, a, u[0], f, { Group: Ot, Mesh: Y, Shape: $r, Path: Qr, ShapeGeometry: Wi, BoxGeometry: X, BufferGeometry: An, Float32BufferAttribute: J, Box3: Zt, Vector3: U, createProceduralMaterial: $, addArchedWindow: pu }), '
const ANCHOR = 'c.userData.navigationColliders = f, Ip(c, n), Up(c), c;'
const PATCHED_ANCHOR = `c.userData.navigationColliders = f, ${ISC58_CALL}Ip(c, n), Up(c), c;`
const REGION_NAMES = ['src/obregon-ob01-frontage.ts', 'src/obregon-ob01-corners.ts', 'src/obregon-ob02-frontage.ts', 'src/obregon-ob01.ts', 'src/obregon-ob02.ts']
export const ISC58_VISOR_IMPORT = 'import { applyIsc58 as applyIsc58Refinement } from "../../isc58-refinement.js";\n'
export const ISC58_VISOR_CALL = 'applyIsc58Refinement(Ng,t,n,Hg,{Group:G,Mesh:J,Shape:da,Path:ua,ShapeGeometry:no,BoxGeometry:Y,BufferGeometry:Er,Float32BufferAttribute:q,Box3:Jn,Vector3:U,createProceduralMaterial:Q,addArchedWindow:uf});'
const VISOR_ANCHOR = 'Ig&&(Ug=new Eg(Ng,$,Hg)'
export const sha256 = value => createHash('sha256').update(value).digest('hex')
const unique = (source, anchor) => source.split(anchor).length === 2
const importFor = (base, runtimeModuleSha256) => {
  if (runtimeModuleSha256 !== undefined && !/^[a-f0-9]{64}$/.test(runtimeModuleSha256)) throw new Error('ISC-58: hash de módulo inválido.')
  return runtimeModuleSha256 ? base.replace('isc58-refinement.js"', `isc58-refinement.js?v=${runtimeModuleSha256.slice(0, 12)}"`) : base
}

function removeCanonicalImport(source, relativePath) {
  const path = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`^import \\{ applyIsc58 as applyIsc58Refinement \\} from "${path}(?:\\?v=[a-f0-9]{12})?";\\n`)
  const match = source.match(pattern)
  if (!match || !unique(source, match[0])) throw new Error('ISC-58: import de hook desconocido o repetido.')
  return source.slice(match[0].length)
}

export function removeIsc58Hook(source) {
  if (!source.includes('applyIsc58Refinement')) return source
  if (!unique(source, PATCHED_ANCHOR)) throw new Error('ISC-58: hook desconocido o repetido; se conserva el bundle sin escribir.')
  return removeCanonicalImport(source, './isc58-refinement.js').replace(PATCHED_ANCHOR, ANCHOR)
}

export function regionHashes(source) {
  return Object.fromEntries(REGION_NAMES.map(name => {
    const marker = `//#region ${name}\n`
    if (!unique(source, marker)) throw new Error(`ISC-58: región ausente o repetida ${name}.`)
    const start = source.indexOf(marker)
    const end = source.indexOf('//#endregion', start)
    if (end < 0) throw new Error(`ISC-58: región sin cierre ${name}.`)
    return [name, sha256(source.slice(start, end + '//#endregion'.length))]
  }))
}

export function removeIsc58VisorHook(source) {
  if (!source.includes('applyIsc58Refinement')) return source
  if (!unique(source, ISC58_VISOR_CALL + VISOR_ANCHOR)) throw new Error('ISC-58: hook del visor desconocido o repetido; se conserva sin escribir.')
  return removeCanonicalImport(source, '../../isc58-refinement.js').replace(ISC58_VISOR_CALL + VISOR_ANCHOR, VISOR_ANCHOR)
}

export function refineVisorBundle(source, runtimeModuleSha256) {
  const base = removeIsc58VisorHook(source)
  if (sha256(base) !== BASE_VISOR_SHA256 || !unique(base, VISOR_ANCHOR)) throw new Error('ISC-58: el visor no coincide con el checkpoint actual o su encuentro no es único.')
  const code = importFor(ISC58_VISOR_IMPORT, runtimeModuleSha256) + base.replace(VISOR_ANCHOR, ISC58_VISOR_CALL + VISOR_ANCHOR)
  if (sha256(removeIsc58VisorHook(code)) !== BASE_VISOR_SHA256) throw new Error('ISC-58: el hook del visor no es invertible.')
  return { code, baseVisorSha256: BASE_VISOR_SHA256, visorSha256: sha256(code) }
}

export function refineBundle(source, runtimeModuleSha256) {
  const base = removeIsc58Hook(source)
  if (sha256(base) !== BASE_WORLD_SHA256) throw new Error('ISC-58: el bundle base no coincide con el mundo actual auditado; no se reemplazan avances anteriores.')
  if (!unique(base, ANCHOR)) throw new Error('ISC-58: el encuentro anterior a Ip/Up no es único.')
  const preservedRegions = regionHashes(base)
  const code = importFor(ISC58_IMPORT, runtimeModuleSha256) + base.replace(ANCHOR, PATCHED_ANCHOR)
  if (JSON.stringify(regionHashes(code)) !== JSON.stringify(preservedRegions)) throw new Error('ISC-58: una región OB-01/OB-02 cambió inesperadamente.')
  if (sha256(removeIsc58Hook(code)) !== BASE_WORLD_SHA256) throw new Error('ISC-58: el hook no es invertible.')
  return { code, baseWorldSha256: BASE_WORLD_SHA256, worldSha256: sha256(code), preservedRegions, patchVersion: 'isc58-technical-1' }
}

export async function compileEditableIsc58() {
  const sourcePath = resolve(process.env.ISC58_SOURCE || '../amalaya-3d-continuation/src/isc58-refinement.js')
  const editableSource = await readFile(sourcePath, 'utf8')
  const { code: source } = await transform(editableSource, { minify: true, format: 'esm', target: 'es2022', legalComments: 'none' })
  return { source, editableSourceSha256: sha256(editableSource) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = resolve('public/levantamiento')
  const { source, editableSourceSha256 } = await compileEditableIsc58()
  const runtimeModuleSha256 = sha256(source)
  const result = refineBundle(await readFile(`${target}/world.js`, 'utf8'), runtimeModuleSha256)
  const visorPath = `${target}/visor/assets/index-RoPA5goG.js`
  const visor = refineVisorBundle(await readFile(visorPath, 'utf8'), runtimeModuleSha256)
  await mkdir(target, { recursive: true })
  await writeFile(`${target}/isc58-refinement.js`, source)
  await writeFile(`${target}/world.js`, result.code)
  await writeFile(visorPath, visor.code)
  const visorIndex = `${target}/visor/index.html`
  const visorHtml = await readFile(visorIndex, 'utf8')
  await writeFile(visorIndex, visorHtml.replace(/index-RoPA5goG\.js(?:\?v=[a-f0-9]{12})?/g, `index-RoPA5goG.js?v=${visor.visorSha256.slice(0,12)}`))
  await writeFile(resolve('src/levantamiento-version.js'), `// Generated from the preserved visual bundle and ISC-58 refinement.\nexport const VERSION_LEVANTAMIENTO = '${result.worldSha256.slice(0, 12)}'\n`)
  const { code, ...provenance } = result
  void code
  await writeFile(`${target}/isc58-provenance.json`, JSON.stringify({ ...provenance, baseVisorSha256: visor.baseVisorSha256, visorSha256: visor.visorSha256, runtimeModuleSha256, editableSourceSha256, generatedFrom: 'private editable visual extension; esbuild ESM, no source maps', baseSourceStatus: 'published bundle retained; private source not recovered' }, null, 2) + '\n')
  console.log(`ISC-58 preparado; base ${result.baseWorldSha256.slice(0, 12)}, OB-01/OB-02 conservados.`)
}
