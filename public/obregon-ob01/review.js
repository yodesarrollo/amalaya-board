let view = 'block', version = 'after'
const labels = {block: 'Cuadra', street: 'A pie', plan: 'Planta'}
const image = document.querySelector('#comparison-image')
function update() {
  image.src = `./${view}-${version}.jpg`
  image.alt = `${labels[view]} · ${version === 'after' ? 'piloto nuevo de cubierta metálica y cerramiento' : 'modelo anterior sin la cubierta, con jardinera provisional'}`
  document.querySelector('#caption').textContent = `${labels[view]} · ${version === 'after' ? 'piloto nuevo' : 'modelo anterior'}`
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)))
  document.querySelectorAll('[data-version]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.version === version)))
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {view = b.dataset.view; update()}))
document.querySelectorAll('[data-version]').forEach(b => b.addEventListener('click', () => {version = b.dataset.version; update()}))
