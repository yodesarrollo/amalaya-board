"""Before/after building footprints on the same georeferenced image, one pair per block."""
import json,math,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from shapely.geometry import Polygon,shape
from shapely.ops import unary_union
root=Path(__file__).resolve().parents[1];d=root/'public/levantamiento';fit=json.loads((d/'ajuste-visual/cuadras.json').read_text());reg=json.loads((d/'cuadras.json').read_text());ref=fit['reference'];im=Image.open(root/'public'/ref['image']).convert('RGBA')
def footprints(path):
 s=json.loads(Path(path).read_text());f={p['id']:Polygon(p['points'],p.get('holes',[])) for p in s['plans']};f.update({p['id']:unary_union([Polygon(t) for t in p['triangles']]) for p in s['entries']});return f
before,after=map(footprints,sys.argv[1:3]);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
def px(x,z):
 lng=-110.9547151+x/97200;lat=29.076115-z/110950;n=2**ref['tileZoom'];return (((lng+180)/360*n-ref['tileBounds'][0])*256,((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n-ref['tileBounds'][1])*256)
def polys(g):return [g] if g.geom_type=='Polygon' else [p for p in g.geoms if p.geom_type=='Polygon']
for b in reg['blocks']:
 block=unary_union([Polygon(p['points'],p['holes']) for p in fit['independentBlockBoundaries'][b['id']]]);panels=[]
 for footprints,color in [(before,(255,149,56,255)),(after,(10,231,176,255))]:
  layer=Image.new('RGBA',im.size);dr=ImageDraw.Draw(layer)
  for p in polys(block):dr.line([px(*q) for q in p.exterior.coords],fill=(51,184,255,255),width=3)
  for ident in b['buildingIds']:
   g=footprints[ident]
   for p in polys(g):
    dr.polygon([px(*q) for q in p.exterior.coords],fill=(*color[:3],40));dr.line([px(*q) for q in p.exterior.coords],fill=color,width=3)
    for h in p.interiors:dr.polygon([px(*q) for q in h.coords],fill=(0,0,0,0));dr.line([px(*q) for q in h.coords],fill=color,width=2)
   dr.text(px(g.centroid.x,g.centroid.y),ident,font=font,fill='white',stroke_width=2,stroke_fill='black',anchor='mm')
   for p in polys(g.difference(block)) if not g.difference(block).is_empty else []:dr.polygon([px(*q) for q in p.exterior.coords],fill=(240,25,45,140))
  a=px(block.bounds[0],block.bounds[1]);z=px(block.bounds[2],block.bounds[3]);cx=(a[0]+z[0])/2;cy=(a[1]+z[1])/2;w=max(z[0]-a[0],z[1]-a[1])+90;box=tuple(map(int,(cx-w/2,cy-w/2,cx+w/2,cy+w/2)))
  panels.append(Image.alpha_composite(im,layer).convert('RGB').crop(box).resize((598,598)))
 result=Image.new('RGB',(1200,635),'#172830');result.paste(panels[0],(0,35));result.paste(panels[1],(602,35));dr=ImageDraw.Draw(result)
 dr.text((12,9),b['id']+' · Antes · rojo: fuera del límite vial',font=font,fill='white');dr.text((614,9),'Después · encaje visual de edificios',font=font,fill='white');result.save(d/'ajuste-visual'/f'{b["id"]}-modelo.jpg',quality=85,optimize=True)
print('33 comparaciones de edificios en el mismo encuadre georreferenciado.')
