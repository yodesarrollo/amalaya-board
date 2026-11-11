"""Render de revisión con Blender (Cycles) a partir de la escena exportada del tablero.

Uso: python3 blender_render.py escena.json camaras.json salida/ [--glb salida.glb --poligono x,z;x,z;...]
La escena son triángulos reales del mundo publicado (marco local: x este, y arriba, z sur).
Blender usa z arriba: (x, y, z)_mundo -> (x, -z, y)_blender. No inventa geometría.
"""
import json, math, sys, time
from pathlib import Path
import bpy, bmesh
from mathutils import Vector

escena, camaras, salida = sys.argv[1], sys.argv[2], Path(sys.argv[3])
salida.mkdir(parents=True, exist_ok=True)
glb = sys.argv[sys.argv.index('--glb') + 1] if '--glb' in sys.argv else None
poligono = None
if '--poligono' in sys.argv:
    poligono = [tuple(map(float, p.split(','))) for p in sys.argv[sys.argv.index('--poligono') + 1].split(';')]

def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def dentro(x, z, pts, margen=0.45):
    # Punto en polígono con margen (rejas y marcos sobresalen del paño).
    n, ok = len(pts), False
    for i in range(n):
        (x1, z1), (x2, z2) = pts[i], pts[(i + 1) % n]
        if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / (z2 - z1) + x1:
            ok = not ok
    if ok:
        return True
    for i in range(n):
        (x1, z1), (x2, z2) = pts[i], pts[(i + 1) % n]
        dx, dz = x2 - x1, z2 - z1
        t = max(0, min(1, ((x - x1) * dx + (z - z1) * dz) / (dx * dx + dz * dz)))
        if math.hypot(x - x1 - t * dx, z - z1 - t * dz) <= margen:
            return True
    return False

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
datos = json.load(open(escena))
por_color, sub_color = {}, {}
for t in datos['triangles']:
    v = [(t[i], -t[i + 2], t[i + 1]) for i in (0, 3, 6)]
    por_color.setdefault(t[9], []).append(v)
    if poligono:
        cx, cz, cy = sum(t[i] for i in (0, 3, 6)) / 3, sum(t[i] for i in (2, 5, 8)) / 3, sum(t[i] for i in (1, 4, 7)) / 3
        if cy > 0.02 and dentro(cx, cz, poligono):
            sub_color.setdefault(t[9], []).append(v)

def material(hexc):
    m = bpy.data.materials.get('c' + hexc)
    if m:
        return m
    m = bpy.data.materials.new('c' + hexc)
    m.use_nodes = True
    r, g, b = (int(hexc[i:i + 2], 16) for i in (0, 2, 4))
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (lin(r), lin(g), lin(b), 1)
    oscuro = (r + g + b) / 3 < 70
    bsdf.inputs['Roughness'].default_value = 0.35 if oscuro else 0.88
    return m

def malla(nombre, grupos, coleccion):
    me = bpy.data.meshes.new(nombre)
    ob = bpy.data.objects.new(nombre, me)
    coleccion.objects.link(ob)
    bm = bmesh.new()
    for i, (hexc, tris) in enumerate(grupos.items()):
        me.materials.append(material(hexc))
        for tri in tris:
            try:
                f = bm.faces.new([bm.verts.new(p) for p in tri])
                f.material_index = i
            except ValueError:
                pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = False
    return ob

malla('mundo', por_color, sc.collection)

# Sol de Hermosillo (29.07 N) a media tarde de noviembre: azimut ~225°, elevación ~36°.
az, el = math.radians(225), math.radians(36)
sol = bpy.data.lights.new('sol', 'SUN')
sol.energy, sol.angle = 3.6, math.radians(0.6)
so = bpy.data.objects.new('sol', sol)
sc.collection.objects.link(so)
s = Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))
so.rotation_euler = s.to_track_quat('Z', 'Y').to_euler()
mundo = bpy.data.worlds.new('cielo')
sc.world = mundo
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs[0].default_value = (0.52, 0.66, 0.84, 1)
mundo.node_tree.nodes['Background'].inputs[1].default_value = 0.9

sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 40
sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x, sc.render.resolution_y = 1280, 880
sc.render.image_settings.file_format = 'PNG'

for nombre, lat, lng, rumbo, fov, cabeceo, ojo in json.load(open(camaras)):
    x, z = (lng + 110.9547151) * 97200, (29.076115 - lat) * 110950
    cam = bpy.data.cameras.new(nombre)
    cam.angle = math.radians(fov)
    cam.clip_end = 2000
    co = bpy.data.objects.new(nombre, cam)
    sc.collection.objects.link(co)
    co.location = (x, -z, ojo)
    co.rotation_euler = (math.radians(90 + cabeceo), 0, -math.radians(rumbo))
    sc.camera = co
    sc.render.filepath = str(salida / f'{nombre}.png')
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'render {nombre}: {time.time() - t0:.1f}s')

if glb and sub_color:
    for ob in list(sc.objects):
        bpy.data.objects.remove(ob)
    malla('edificio', sub_color, sc.collection)
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', export_apply=True)
    print('glb', glb, sum(len(v) for v in sub_color.values()), 'triangulos')
