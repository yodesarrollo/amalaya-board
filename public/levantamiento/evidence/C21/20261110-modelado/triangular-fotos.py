"""C21 · cuadra 10 (10-nov-2026): bordes de fachada triangulados entre panorámicas del recorrido R-002.
Cada caso da la columna y fila de un mismo borde en dos vistas rectificadas (1100×760 px, rumbo,
cabeceo y campo horizontal en grados; panorámicas niveladas con roll.json) y corta los dos rayos en
planta. Resultado: x,z locales y cuánto queda el borde al norte de la línea de lote + 0.2 m (dz<0).
Uso: python3 triangular-fotos.py <repo>"""
import json, math, sys
REC=sys.argv[1]+'/public/recorrido/'
POS={}
for r in json.load(open(REC+'rutas.json'))['rutas']:
    for p in r['puntos']: POS[p['id'][:4]]=((p['lng']+110.9547151)*97200,(29.076115-p['lat'])*110950)
def rayo(cam,h,p,fov,col,row,W=1100,H=760):
    h,p=math.radians(h),math.radians(p)
    f=[math.sin(h)*math.cos(p),math.sin(p),-math.cos(h)*math.cos(p)]; rt=[math.cos(h),0,math.sin(h)]
    up=[rt[1]*f[2]-rt[2]*f[1],rt[2]*f[0]-rt[0]*f[2],rt[0]*f[1]-rt[1]*f[0]]
    t=math.tan(math.radians(fov)/2); a=(2*(col+.5)/W-1)*t; b=(1-2*(row+.5)/H)*t*H/W
    d=[f[k]+a*rt[k]+b*up[k] for k in range(3)]; n=math.hypot(d[0],d[2]); return POS[cam],(d[0]/n,d[2]/n)
def corte(r1,r2):
    (p,d),(q,e)=r1,r2; den=d[0]*e[1]-d[1]*e[0]; t=((q[0]-p[0])*e[1]-(q[1]-p[1])*e[0])/den; return (p[0]+d[0]*t,p[1]+d[1]*t)
lote=lambda x:-38.11-0.04669*(x-65.23)
V={'kwpq-108':('kwpq',108,1,44),'kwpq-128':('kwpq',128,6,80),'qU0X-262':('qU0X',262,1,28),'qU0X-232':('qU0X',232,4,80)}
casos=[('verde/rojo (pilastra blanca)',('kwpq-128',650,400),('qU0X-262',400,450)),
 ('puerta roja, jamba oriente',('kwpq-108',405,550),('qU0X-262',230,600)),
 ('puerta roja, jamba poniente',('kwpq-108',470,550),('qU0X-262',300,600)),
 ('marco puerta roja, oriente',('kwpq-108',378,550),('qU0X-262',165,600)),
 ('marco puerta roja, poniente',('kwpq-108',512,550),('qU0X-262',300,600)),
 ('ventana roja oriente, borde poniente',('kwpq-108',340,520),('qU0X-262',125,640)),
 ('rojo/blanco',('kwpq-108',295,300),('qU0X-232',712,450))]
res=[]
for n,(v1,c1,f1),(v2,c2,f2) in casos:
    x,z=corte(rayo(*V[v1],c1,f1),rayo(*V[v2],c2,f2)); res.append({'borde':n,'x':round(x,2),'z':round(z,2),'dz_vs_lote_mas_0.2':round(z-(lote(x)+.2),2)})
dz=sorted(r['dz_vs_lote_mas_0.2'] for r in res)
print(json.dumps({'vistas':V,'bordes':res,'mediana_dz':dz[len(dz)//2]},ensure_ascii=False,indent=1))
