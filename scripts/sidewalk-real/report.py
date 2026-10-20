"""Render a concise evidence report from live receipts, never from invented scores."""
import json,statistics,html
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib.colors import HexColor,white
from reportlab.platypus import Paragraph,Table,TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parents[2];DATA=ROOT/'public/levantamiento/sidewalk-real-v1'
micro=json.loads((ROOT/'tmp/sidewalk-real-results/analysis.json').read_text())
whole=json.loads((ROOT/'tmp/sidewalk-workflow-results/analysis.json').read_text())
OUT=ROOT.parent/'output/banqueta-real/Amalaya_Prueba_Real_Banqueta_2026-10-20.pdf'
OUT.parent.mkdir(exist_ok=True,parents=True)
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
W,H=landscape(A4);M=38;green=HexColor('#203f35');muted=HexColor('#5b7062');gold=HexColor('#c9a254')
c=canvas.Canvas(str(OUT),pagesize=(W,H));c.setTitle('Amalaya · prueba real de revisión de banqueta');c.setAuthor('Revisión técnica para Alejandro Puebla')
styles={key:ParagraphStyle(key,fontName='DejaVu',fontSize=size,leading=lead,textColor=color,spaceAfter=6)for key,size,lead,color in [('body',11,16,green),('small',9,13,muted),('title',28,33,green),('h2',17,22,green)]}
def p(text,x,y,w,style='body'):
    o=Paragraph(text,styles[style]);ww,hh=o.wrap(w,H);assert y-hh>24,('overflow',text);o.drawOn(c,x,y-hh);return y-hh-8
def page(n,title):
    c.setFillColor(HexColor('#f5f6f0'));c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(green);c.setFont('DejaVuBold',10);c.drawString(M,H-28,'AMALAYA / PRUEBA REAL · 20 OCT 2026')
    c.setStrokeColor(gold);c.line(M,H-38,W-M,H-38)
    c.setFont('DejaVu',8);c.setFillColor(muted);c.drawString(M,19,'Frente 21 · Obregón sur · Garmendia–Abasolo · 1 microzona, 2 repeticiones');c.drawRightString(W-M,19,str(n))
    return p(title,M,H-54,W-2*M,'title')
def table(data,widths,x,y,font=10):
    cells=[[Paragraph(html.escape(str(v)),ParagraphStyle('cell',fontName='DejaVu',fontSize=font,leading=font+4,textColor=green))for v in row]for row in data]
    t=Table(cells,colWidths=widths,repeatRows=1);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#e2eadf')),('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),10),('LINEBELOW',(0,0),(-1,-1),.4,HexColor('#d3ddd0'))]));tw,th=t.wrap(sum(widths),H);assert y-th>35,('table overflow',th,y);t.drawOn(c,x,y-th);return y-th-14
names={'A':'GPT completo','B90':'Jev 90% + GPT','B95':'Jev 95% + GPT'}
y=page(1,'Banqueta real: resultado de la comparación')
y=p('La medición principal revisa los nueve criterios juntos: una llamada GPT frente a una llamada Jev y, cuando hace falta, una revisión GPT con las dudas agrupadas. Las imágenes y criterios son los mismos en los tres métodos.',M,y,W-2*M)
rows=[['Revisión completa','Aciertos / 18','Automáticos Jev','Remisiones a GPT','Tiempo por revisión (s)']]
for k,s in whole['summary'].items():rows.append([names[k],f"{s['correct']}/18",s['automatic'],s['fallback'],' / '.join(f'{v/1000:.2f}'for v in s['runs_client_ms'])])
y=table(rows,[190,105,110,130,W-2*M-535],M,y)
baseline=whole['summary']['A']['median_client_ms'];b=whole['summary']['B90'];d=whole['summary']['B95']
y=p(f"Medianas de revisión completa: GPT {baseline/1000:.2f} s; Jev90% {b['median_client_ms']/1000:.2f} s; Jev95% {d['median_client_ms']/1000:.2f} s. Se muestran también las dos mediciones individuales para evitar que una mediana oculte la variación.",M,y,W-2*M)
y=p('El umbral filtra decisiones automáticas; no convierte el puntaje de Jev en una probabilidad de acierto verificada. El ahorro sólo existe si Jev resuelve suficientes criterios correctamente y reduce trabajo de GPT.',M,y,W-2*M)
y=p('<b>Alcance del tiempo:</b> desde la solicitud de revisión hasta el dictamen de los nueve puntos, incluyendo imágenes, clasificación y remisiones. No incluye desarrollo, despliegues ni una corrección geométrica que todavía necesita anclaje. Dos repeticiones de un frente no permiten estimar el rendimiento general de Amalaya.',M,y,W-2*M,'small');c.showPage()
y=page(2,'La evidencia: mismo frente, lado sur')
pw=(W-2*M-20)/2;ph=pw/1.4
c.drawImage(str(DATA/'images/photo-P10-south.jpg'),M,y-ph,width=pw,height=ph)
c.drawImage(str(DATA/'images/model-before.png'),M+pw+20,y-ph,width=pw,height=ph)
y-=ph+10
y1=p('<b>Fotografía P10.</b> Panorama real archivado, reproyectado. Se ven el bolardo negro, la protección amarilla y el paño oscuro/rojizo de la banqueta.',M,y,pw,'small')
y2=p('<b>Modelo actual.</b> Triángulos reales con profundidad. La superficie C22 es uniforme y no contiene los dos objetos. Texturas omitidas; no es fotografía del sitio.',M+pw+20,y,pw,'small')
y=min(y1,y2)-4
y=p('El número21, la fachada gris con remates azules y el lado sur permiten identificar el frente. La pose óptica no está calibrada y los vanos del modelo no coinciden por completo con la foto. Esta prueba compara observaciones de banqueta; no usa IoU entre foto y modelo ni deriva medidas en centímetros.',M,y,W-2*M,'small')
y=p('Foto original: recorrido/lYkbkN5HLT-6YQS4vIsd2g.jpg · Modelo base af0cc341f7715a17… · Sin defectos insertados artificialmente. Fecha de captura de la foto desconocida: presencia histórica no garantiza permanencia actual.',M,y,W-2*M,'small');c.showPage()
y=page(3,'Qué se evaluó y qué se corrigió')
labels={'surface':'Franja de banqueta','bollard':'Bolardo negro','rail':'Protección amarilla','paving':'Paño de pavimento','curb':'Borde reconocible','width':'Error de ancho >20 cm','height':'Error de altura >5 cm','ramp':'Accesibilidad','ends':'Continuidad entre esquinas'}
truth=json.loads((DATA/'truth.json').read_text());rows=[['Criterio','Referencia de evaluación','Estado tras la prueba']]
for k,t in truth.items():
    expected='Discrepancia visible'if t['presence']is True else'Coincide en este criterio'if t['presence']is False else'No comprobable'
    state='Faltante registrado; anclaje pendiente'if t['presence']is True else'Sin cambio necesario'if t['presence']is False else'Requiere información adicional'
    rows.append([labels[k],expected,state])
y=table(rows,[205,245,W-2*M-450],M,y,9)
y=p('Implementado: revisión enlazada desde el seguimiento de Amalaya, fotografía con marcas, criterios explícitos, resultados comparables, registro de los tres faltantes y remisión90/95 a GPT. La prueba no coloca objetos en 3D con coordenadas inventadas ni cierra continuidad o accesibilidad sin evidencia.',M,y,W-2*M,'small')
c.showPage()
y=page(4,'Método, trazabilidad y límites')
y=p('<b>Datos y modelos.</b> Nueve criterios sobre una microzona, dos repeticiones por método. GPT gpt-5.4-2026-03-05, esfuerzo medium; Jev1.14.0. Cada revisión completa parte del mismo par de imágenes y usa llamadas independientes. Los criterios y el protocolo del flujo completo quedaron congelados antes de esas llamadas.',M,y,W-2*M)
rows=[['Desglose suplementario por criterio','Aciertos / 18','Automáticos','Mediana por criterio (s)']]
for name,s in micro['summary'].items():rows.append([name,s['correct'],s['automatic'],f"{s['median_client_ms']/1000:.2f}"])
y=table(rows,[310,115,100,W-2*M-525],M,y,9)
y=p('Este desglose no sustituye el tiempo de revisión completa: en una operación habitual se pueden agrupar los puntos en una llamada. Se preservan todas las respuestas, puntajes, hashes de imágenes y recibos de proveedor.',M,y,W-2*M,'small')
y=p('<b>Incidentes de preparación.</b> Una fotografía truncada fue bloqueada por su hash antes de invocar proveedores. Se repusieron los mismos bytes y se conservó el intento fallido. Un despliegue falló por una prueba de arranque ajena a este estudio; la repetición con la misma protección pasó. Los erroresHTTP502 y tiempos de preparación se conservan y no se contabilizan como respuestas de modelos.',M,y,W-2*M,'small')
y=p('<b>Límites.</b> Referencia evaluada por ChatGPT mediante foto y grafo de escena, sin medición independiente de campo ni cegamiento. Son criterios correlacionados de un frente y sólo dos tiempos por método. No hay prueba de precisión del90/95%, de mejora estadísticamente estable, de posición métrica de los objetos ni de terminación del modelo.',M,y,W-2*M,'small')
y=p('<b>Para continuar la corrección física:</b> confirmar permanencia, localizar los apoyos y la base del bolardo con una referencia espacial, medir el paño y conservar la revisión abierta hasta renderizar y comprobar el cambio. Revisión y datos: <link href="https://yodesarrollo.github.io/amalaya-board/levantamiento/sidewalk-real-v1/" color="#20714a">abrir prueba real de banqueta</link>.',M,y,W-2*M,'small')
c.save();print(OUT)
