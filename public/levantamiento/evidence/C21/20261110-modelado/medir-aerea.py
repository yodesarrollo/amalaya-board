"""C21 · cuadra 10 (10-nov-2026): color de azotea por sección sobre la aérea Esri z19 y trazo de evidencia.
La aérea desplaza las azoteas ~1.3 m al norte (relieve: el borde norte de los techos cae casi en la
guarnición, donde las fotos muestran banqueta); por eso cada planta se mide corrida 1.3 m al norte.
Uso: python3 medir-aerea.py <repo> <geom.json> <salida-dir>"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
repo,geomf,out=sys.argv[1:4]
L=repo+'/public/levantamiento/'
av=json.load(open(L+'ajuste-visual/cuadras.json')); tb=av['reference']['tileBounds']
img=Image.open(L+'calco/referencia.webp').convert('RGB'); A=np.asarray(img)
DZ=-1.3
def px(x,z):
    lat,lng=29.076115-z/110950,x/97200-110.9547151; n=256*2**19; s=math.sin(math.radians(lat))
    return (lng+180)/360*n-tb[0]*256,(0.5-math.log((1+s)/(1-s))/(4*math.pi))*n-tb[1]*256
def inside(x,y,poly):
    c=False
    for i in range(len(poly)):
        (x1,y1),(x2,y2)=poly[i],poly[i-1]
        if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
def medir(poly):
    P=[px(x,z+DZ) for x,z in poly]; xs=[p[0] for p in P]; ys=[p[1] for p in P]; vals=[]
    for j in range(int(min(ys)),int(max(ys))+1):
        for i in range(int(min(xs)),int(max(xs))+1):
            if inside(i+.5,j+.5,P): vals.append(A[j,i])
    v=np.array(vals,float); lum=v@[.2126,.7152,.0722]; m=np.median(v,axis=0).astype(int)
    area=abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1]))/2)
    return {'mediana':'#%02x%02x%02x'%tuple(m),'pixeles':len(v),'oscuro_pct':round(float((lum<90).mean()*100),1),'area_m2':round(area,2)}
G=json.load(open(geomf))
ebnw=[[65.48577,-36.82626],[80.48021,-37.82364],[82.88317,-22.9738],[67.88873,-21.97642]]
viejo={'B3-01 frente-rojo':[[84.044,-37.19],[84.044,-21.327],[91.083,-20.547],[92,-20.64079],[92,-37.68597]],
 'B3-01 frente-blanco':[[92,-37.68597],[92,-20.64079],[101.251,-21.587],[101.251,-22.628],[112.17399,-24.12317],[110.27508,-38.82501]]}
# Franjas de azotea vistas en la aérea (coordenadas ya corregidas al suelo)
franjas={'enladrillado frente rojo':[[83.6,-39.2],[91.8,-39.2],[91.8,-35.3],[83.6,-35.3]],
 'gris-azul fondo':[[87.2,-35.2],[97.4,-35.2],[97.4,-25.8],[87.2,-25.8]],
 'mancha verde-azul':[[97.6,-34.8],[102.4,-34.8],[102.4,-31.3],[97.6,-31.3]],
 'blanco frente oriente':[[97.6,-39.2],[104.6,-39.2],[104.6,-35.6],[97.6,-35.6]],
 'blanco esquina NE (fuera de INEGI)':[[110.6,-39.6],[115.6,-39.6],[115.6,-21.0],[110.6,-21.0]]}
res={'desplazamiento_z':DZ,'secciones':{k:medir(v) for k,v in G.items()},'EB-NW':medir(ebnw),'franjas':{k:medir(v) for k,v in franjas.items()}}
json.dump(res,open(out+'/medidas-aerea.json','w'),indent=1,ensure_ascii=False); print(json.dumps(res,indent=1,ensure_ascii=False))
# Trazo: aérea x 60–120, z −46 a −14 con plantas viejas, secciones nuevas e INEGI (dibujadas corridas igual que se midió)
x0,z0,x1,z1,S=60,-46,120,-14,6
pa,pb=px(x0,z0),px(x1,z1); box=(int(pa[0]),int(pa[1]),int(math.ceil(pb[0])),int(math.ceil(pb[1])))
im=img.crop(box).resize(((box[2]-box[0])*S,(box[3]-box[1])*S),Image.LANCZOS); d=ImageDraw.Draw(im)
Pp=lambda x,z,dz=DZ:((px(x,z+dz)[0]-box[0])*S,(px(x,z+dz)[1]-box[1])*S)
try: fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
except Exception: fs=ImageFont.load_default()
for gx in range(x0,x1+1,5): d.line([Pp(gx,z0,0),Pp(gx,z1,0)],fill=(255,255,255),width=1); d.text((Pp(gx,z0,0)[0]+2,3),str(gx),font=fs,fill=(255,255,255))
for gz in range(z0,z1+1,5): d.line([Pp(x0,gz,0),Pp(x1,gz,0)],fill=(255,255,255),width=1); d.text((3,Pp(x0,gz,0)[1]+2),str(gz),font=fs,fill=(255,255,255))
reg=json.load(open(L+'cuadras.json')); b=[k for k in reg['blocks'] if k['id']=='C21'][0]
for ring in b['boundaryLocal']['coordinates']: d.line([Pp(*p) for p in ring[0]+[ring[0][0]]],fill=(255,70,70),width=2)
for poly in viejo.values(): d.line([Pp(*p) for p in poly+[poly[0]]],fill=(150,150,150),width=2)
d.line([Pp(*p) for p in ebnw+[ebnw[0]]],fill=(255,215,0),width=3)
col={'rojo':(255,80,60),'rojo-fondo':(255,160,120),'blanco':(80,200,255),'blanco-fondo':(140,220,255),'amarillo':(255,200,0)}
for k,v in G.items():
    d.line([Pp(*p) for p in v+[v[0]]],fill=col[k],width=3); cx=sum(p[0] for p in v)/len(v); cz=sum(p[1] for p in v)/len(v); q=Pp(cx,cz); d.text((q[0]-20,q[1]-8),k,font=fs,fill=col[k])
for k,v in franjas.items(): d.line([Pp(*p) for p in v+[v[0]]],fill=(255,0,255),width=1)
for n,x,z in [('qU0X',98.24,-42.449),('kwpq',78.129,-41.329),('cjTH',60.614,-40.530),('wgpw',117.631,-44.236)]:
    q=Pp(x,z,0); d.ellipse([q[0]-6,q[1]-6,q[0]+6,q[1]+6],fill=(255,0,255)); d.text((q[0]+8,q[1]-8),n,font=fs,fill=(255,0,255))
d.rectangle([0,im.height-58,im.width,im.height],fill=(0,0,0))
d.text((8,im.height-54),'C21 · cuadra 10 · aérea Esri z19 con plantas corridas 1.3 m al norte (relieve). Rojo: límite INEGI. Gris: planta anterior de B3-01. Amarillo: EB-NW (sin cambio).',font=fs,fill=(255,255,255))
d.text((8,im.height-32),'Secciones nuevas de B3-01: rojo, rojo-fondo, blanco, blanco-fondo, amarillo. Magenta: franjas de azotea medidas y panorámicas del recorrido R-002.',font=fs,fill=(255,255,255))
im.save(out+'/aerea-trazo.jpg',quality=88); print(out+'/aerea-trazo.jpg',im.size)
