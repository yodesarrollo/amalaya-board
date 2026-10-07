"""Comparación de planta: misma foto y encuadre en las 33 cuadras."""
import json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from shapely.geometry import Polygon,shape
from shapely.ops import unary_union
root=Path(__file__).resolve().parents[1];d=root/'public/levantamiento';data=json.loads((d/'ajuste-visual/cuadras.json').read_text()); reg=json.loads((d/'cuadras.json').read_text()); ref=data['reference'];im=Image.open(root/'public'/ref['image']).convert('RGBA')
def px(x,z):
 lng=-110.9547151+x/97200;lat=29.076115-z/110950;n=2**ref['tileZoom']
 return (((lng+180)/360*n-ref['tileBounds'][0])*256,((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n-ref['tileBounds'][1])*256)
layer=Image.new('RGBA',im.size);dr=ImageDraw.Draw(layer)
for s in data['surfaces']:
 color={'road':(30,122,210,85),'sidewalk':(244,170,44,200),'path':(200,155,65,170)}[s['kind']]
 for p in s['polygons']:
  dr.polygon([px(*q) for q in p['points']],fill=color)
  for h in p['holes']:dr.polygon([px(*q) for q in h],fill=(0,0,0,0))
after=Image.alpha_composite(im,layer).convert('RGB');before=im.convert('RGB');font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
for start in range(0,33,9):
 sheet=Image.new('RGB',(1500,1500),'white');sd=ImageDraw.Draw(sheet)
 for j,b in enumerate(reg['blocks'][start:start+9]):
  g=shape(b['boundaryLocal']);a=px(g.bounds[0],g.bounds[1]);z=px(g.bounds[2],g.bounds[3]);cx=(a[0]+z[0])/2;cy=(a[1]+z[1])/2;w=max(z[0]-a[0],z[1]-a[1])+90;box=(int(cx-w/2),int(cy-w/2),int(cx+w/2),int(cy+w/2))
  crop=after.crop(box).resize((490,470)); x=j%3*500;y=j//3*500;sheet.paste(crop,(x,y+28));sd.text((x+5,y+3),b['id']+' · azul calle / naranja banqueta',font=font,fill='black')
  comparison=Image.new('RGB',(1200,635),'#172830');comparison.paste(before.crop(box).resize((598,598)),(0,35));comparison.paste(after.crop(box).resize((598,598)),(602,35));cd=ImageDraw.Draw(comparison);cd.text((12,9),b['id']+' · Foto de referencia',font=font,fill='white');cd.text((614,9),'Montaje aproximado · pasos 2 y 3',font=font,fill='white');comparison.save(d/'ajuste-visual'/f'{b["id"]}.jpg',quality=83,optimize=True)
 sheet.save(root.parent/f'superficies-{start//9}.jpg',quality=85)
print('33 comparaciones y 4 hojas de revisión')
