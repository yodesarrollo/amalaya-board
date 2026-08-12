#!/usr/bin/env python3
"""Guardián de salud de Amalaya Board.

Hace `ping` al Apps Script y pide el sitio de Pages, y escribe
public/estado.json con METADATOS únicamente: nunca baja ni guarda
un solo dato del negocio. Ese archivo es público a propósito — solo
dice si las piezas viven.

Uso:
  python3 scripts/verificar_salud.py          # revisa y escribe estado.json
  python3 scripts/verificar_salud.py --seco   # solo revisa, no escribe
"""

import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ESTADO = RAIZ / "public" / "estado.json"
SITIO = "https://yodesarrollo.github.io/amalaya-board/"


def leer_url_backend():
    """La URL /exec se lee de src/config.js — una sola fuente de verdad."""
    config = (RAIZ / "src" / "config.js").read_text(encoding="utf-8")
    m = re.search(r"APPS_SCRIPT_URL\s*=\s*'([^']+)'", config)
    url = m.group(1) if m else ""
    return url if url.startswith("https://") else None


def revisar(url, es_ping=False):
    try:
        if es_ping:
            req = urllib.request.Request(
                url,
                data=json.dumps({"action": "ping"}).encode(),
                headers={"Content-Type": "text/plain;charset=utf-8"},
                method="POST",
            )
        else:
            req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            cuerpo = resp.read(4096).decode("utf-8", errors="replace")
            if es_ping:
                return "ok" if '"ok":true' in cuerpo.replace(" ", "") else "raro"
            return "ok" if resp.status == 200 else f"http {resp.status}"
    except Exception as e:
        return f"caido ({type(e).__name__})"


def main():
    seco = "--seco" in sys.argv
    url = leer_url_backend()

    estado = {
        "revisado": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "backend": revisar(url, es_ping=True) if url else "sin conectar",
        "sitio": revisar(SITIO),
    }
    print(json.dumps(estado, ensure_ascii=False, indent=1))

    if seco:
        return

    # Solo escribir si el ESTADO cambió (la fecha sola no cuenta): así el
    # workflow solo commitea caídas y recuperaciones, no latidos.
    if ESTADO.exists():
        try:
            previo = json.loads(ESTADO.read_text(encoding="utf-8"))
            if (previo.get("backend"), previo.get("sitio")) == (estado["backend"], estado["sitio"]):
                print("Sin cambios de estado.")
                return
        except Exception:
            pass

    ESTADO.parent.mkdir(parents=True, exist_ok=True)
    ESTADO.write_text(json.dumps(estado, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Escrito: {ESTADO}")


if __name__ == "__main__":
    main()
