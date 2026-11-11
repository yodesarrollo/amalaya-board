"""C17 · 118/D3-18 · mediciones sobre la aérea georreferenciada y trazo de evidencia.

Uso (desde la raíz del repositorio):
  python3 public/levantamiento/evidence/C17/20261110-modelado/medir-aerea.py [salida.jpg]

Lee calco/referencia.webp (Esri World Imagery z19) con la georreferencia del tablero:
x = (lng + 110.9547151) * 97200, z = (29.076115 - lat) * 110950; píxel = Web Mercator z19
menos tileBounds * 256 (ajuste-visual/cuadras.json -> reference). Imprime en JSON el color
mediano del techo, el de la franja oriental que la planta de inventario cubría, la luminancia
del techo (para buscar tinacos o equipos oscuros) y las áreas; con un argumento dibuja el trazo.
Medidas visuales sobre una imagen de 0.26 m/píxel, no métricas.
"""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont

R = 'public/levantamiento/'
INVENTARIO = [[97.601, 189.439], [103.597, 188.399], [106.204, 199.321], [99.947, 201.401]]
SECCION = [[97.9, 188.9], [103.5, 188.4], [103.4, 199.9], [99.7, 201.0]]
INTERIOR = [[98.7, 189.3], [102.9, 189.0], [102.9, 199.2], [99.5, 199.9]]   # techo menos 0.5 m de borde
FRANJA = [[103.6, 188.6], [106.0, 199.2], [103.6, 199.6]]                  # inventario fuera del techo

av = json.load(open(R + 'ajuste-visual/cuadras.json'))
tb = av['reference']['tileBounds']
img = Image.open(R + 'calco/referencia.webp').convert('RGB')
pix = img.load()

def px(x, z):
    lat, lng = 29.076115 - z / 110950, x / 97200 - 110.9547151
    n = 256 * 2 ** 19
    s = math.sin(math.radians(lat))
    return (lng + 180) / 360 * n - tb[0] * 256, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n - tb[1] * 256

A, B, C = px(100, 190), px(101, 190), px(100, 191)
SX, SZ = B[0] - A[0], C[1] - A[1]
loc = lambda u, v: (100 + (u - A[0]) / SX, 190 + (v - A[1]) / SZ)

def dentro(x, z, pts):
    ok = False
    for i in range(len(pts)):
        (x1, z1), (x2, z2) = pts[i - 1], pts[i]
        if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / (z2 - z1) + x1:
            ok = not ok
    return ok

def muestras(pts):
    xs, zs = [p[0] for p in pts], [p[1] for p in pts]
    u0, v0 = px(min(xs), min(zs)); u1, v1 = px(max(xs), max(zs))
    return [pix[u, v] for v in range(int(v0), int(v1) + 2) for u in range(int(u0), int(u1) + 2)
            if dentro(*loc(u + .5, v + .5), pts)]

def mediana(vals):
    s = sorted(vals); n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2

def hexc(rgb):
    return '#' + ''.join('%02x' % int(round(c)) for c in rgb)

area = lambda p: abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(p, p[1:] + p[:1]))) / 2
techo, franja = muestras(INTERIOR), muestras(FRANJA)
lum = sorted(sum(c) / 3 for c in techo)
med_t = [mediana([c[i] for c in techo]) for i in range(3)]
med_f = [mediana([c[i] for c in franja]) for i in range(3)]
pct = lambda q: round(lum[min(len(lum) - 1, int(q * len(lum)))], 1)
print(json.dumps({
    'metrosPorPixel': [round(1 / SX, 4), round(1 / SZ, 4)],
    'techo': {'pixeles': len(techo), 'mediana': hexc(med_t), 'luminancia': {'min': pct(0), 'p05': pct(.05), 'p50': pct(.5)}},
    'franjaOriental': {'pixeles': len(franja), 'mediana': hexc(med_f), 'luminanciaMediana': round(mediana([sum(c) / 3 for c in franja]), 1)},
    'areas_m2': {'inventario': round(area(INVENTARIO), 2), 'seccion': round(area(SECCION), 2)},
}, ensure_ascii=False, indent=1))

if len(sys.argv) > 1:
    x0, z0, x1, z1, S = 86, 176, 120, 212, 8
    pa, pb = px(x0, z0), px(x1, z1)
    box = (int(pa[0]), int(pa[1]), int(math.ceil(pb[0])), int(math.ceil(pb[1])))
    im = img.crop(box).resize(((box[2] - box[0]) * S, (box[3] - box[1]) * S), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    P = lambda x, z: ((px(x, z)[0] - box[0]) * S, (px(x, z)[1] - box[1]) * S)
    try:
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
        fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
    except OSError:
        f = fs = ImageFont.load_default()
    for gx in range(90, x1 + 1, 5):
        d.line([P(gx, z0), P(gx, z1)], fill=(255, 255, 255), width=1); d.text((P(gx, z0)[0] + 3, 3), str(gx), font=fs, fill=(255, 255, 255))
    for gz in range(180, z1 + 1, 5):
        d.line([P(x0, gz), P(x1, gz)], fill=(255, 255, 255), width=1); d.text((3, P(x0, gz)[1] + 3), str(gz), font=fs, fill=(255, 255, 255))
    banqueta = [s for s in av['surfaces'] if s['id'] == 'C17' and s['kind'] == 'sidewalk'][0]
    for poly in banqueta['polygons']:
        d.polygon([P(*p) for p in poly['points']], outline=(80, 220, 255), width=2)
    for a, b in zip(INVENTARIO, INVENTARIO[1:] + INVENTARIO[:1]):
        for k in range(0, 24, 2):
            d.line([P(a[0] + (b[0] - a[0]) * k / 24, a[1] + (b[1] - a[1]) * k / 24),
                    P(a[0] + (b[0] - a[0]) * (k + 1) / 24, a[1] + (b[1] - a[1]) * (k + 1) / 24)], fill=(255, 140, 0), width=2)
    d.polygon([P(*p) for p in SECCION], outline=(255, 215, 0), width=3)
    d.line([P(*SECCION[3]), P(*SECCION[0])], fill=(255, 60, 90), width=4)
    d.line([P(*SECCION[0]), P(*SECCION[1])], fill=(255, 170, 200), width=3)
    cx, cz = sum(p[0] for p in SECCION) / 4, sum(p[1] for p in SECCION) / 4
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        d.text((P(cx, cz)[0] - 15 + dx, P(cx, cz)[1] - 9 + dy), '118', font=f, fill=(0, 0, 0))
    d.text((P(cx, cz)[0] - 15, P(cx, cz)[1] - 9), '118', font=f, fill=(255, 255, 255))
    leyenda = [((255, 215, 0), 'sección trazada a ±0.5 m (118 / D3-18)'), ((255, 140, 0), 'planta de inventario ±3 m (registro)'),
               ((255, 60, 90), 'cara a la calle · Profesor Enrique Quijada'), ((255, 170, 200), 'cara norte · a menos de 4 m de la banqueta'),
               ((80, 220, 255), 'banqueta de C17 (tiras abiertas, sin anillo)')]
    y0 = im.height - (22 * len(leyenda) + 12)
    d.rectangle([0, y0, im.width, im.height], fill=(20, 32, 40))
    for i, (c, t) in enumerate(leyenda):
        y = y0 + 8 + 22 * i
        d.line([(10, y + 8), (40, y + 8)], fill=c, width=4); d.text((50, y), t, font=fs, fill=(240, 240, 240))
    d.text((im.width - 330, y0 + 8), 'Esri World Imagery z19 · 0.26 m/píxel', font=fs, fill=(200, 200, 200))
    d.text((im.width - 330, y0 + 30), 'rejilla local de 5 m (x este, z sur)', font=fs, fill=(200, 200, 200))
    im.save(sys.argv[1], quality=90)
