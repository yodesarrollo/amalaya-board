// Google Identity Services FALSO, solo para el simulador. Pinta un botón
// «Continuar con Google» que entrega un id_token de prueba al callback.
window.google = { accounts: { id: {
  _cb: null,
  initialize(o) { this._cb = o.callback },
  renderButton(el) {
    const b = document.createElement('button')
    b.id = 'gsi-falso'
    b.type = 'button'
    b.textContent = 'Continuar con Google (simulado)'
    b.style.cssText = 'width:100%;padding:11px 16px;border-radius:999px;background:#202124;color:#fff;border:1px solid #5f6368;font:500 14px system-ui;cursor:pointer'
    b.onclick = () => this._cb && this._cb({ credential: 'SIM-GOOGLE-ID-TOKEN-0123456789' })
    el.appendChild(b)
  },
} } }
