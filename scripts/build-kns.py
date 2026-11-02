"""Rebuild the photo-based KNS presentation model with Blender 4.3+.

blender --background --factory-startup --python scripts/build-kns.py
Coordinates below are (width, height, front depth), not engineering dimensions.
"""
from pathlib import Path
from math import pi, sin, cos
from collections import defaultdict
import bpy

ROOT = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def xyz(p):
    return (p[0], -p[2], p[1])

def material(name, color, metal=0, rough=.4, coat=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Coat Weight'].default_value = coat
    return m

def photo_material(name, path, rough=.55, color=(1, 1, 1)):
    m = material(name, color, .08, rough)
    n = m.node_tree.nodes.new('ShaderNodeTexImage')
    n.image = bpy.data.images.load(str(path))
    n.image.pack()
    m.node_tree.links.new(n.outputs['Color'], m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    return m

pcb = material('Solder mask · dark green', (.018, .105, .055), .08, .43, .2)
edge = material('FR4 board edge', (.17, .21, .09), 0, .65)
metal = material('Brushed aluminium', (.48, .51, .53), .88, .31)
steel = material('Stainless fasteners', (.55, .58, .59), .93, .2)
black = material('Black anodised aluminium', (.012, .017, .021), .72, .32)
plastic = material('Capacitor sleeve', (.009, .013, .014), .08, .26, .25)
cap_top = material('Capacitor top seal', (.025, .032, .03), .25, .34)
vent = material('Engraved marks', (.13, .16, .14), .6, .33)
ferrite = material('Ferrite core', (.025, .029, .028), .15, .39)
copper = material('Copper winding', (.58, .205, .064), .92, .23, .12)
yellow = material('Transformer insulation', (.57, .43, .09), .05, .46)
blue = material('Connector polymer', (.009, .043, .3), .03, .32)
gold = material('Gold contacts', (.59, .43, .13), .88, .22)
ceramic = material('Ceramic capacitor', (.49, .39, .21), .05, .58)
ink = material('Silkscreen', (.64, .7, .64), 0, .7)
front_photo = photo_material('Actual component-side photograph', ROOT/'model/reference/component-side.jpg', .62)
back_photo = photo_material('Cleaned back-side photograph', ROOT/'model/reference/back-cleaned.png', .59)

def finish(o, mat, bevel=0):
    o.data.materials.append(mat)
    if bevel:
        b = o.modifiers.new('Manufactured edge radius', 'BEVEL')
        b.width = bevel
        b.segments = 3
        b.affect = 'EDGES'
        n = o.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
        n.keep_sharp = True
    return o

def box(name, p, dims, mat, bevel=.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz(p))
    o = bpy.context.object
    o.name = name
    o.dimensions = (dims[0], dims[2], dims[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, mat, bevel)

def cylinder(name, p, radius, depth, mat, vertices=32, bevel=.005):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=xyz(p), rotation=(pi/2, 0, 0))
    o = bpy.context.object
    o.name = name
    for poly in o.data.polygons:
        poly.use_smooth = len(poly.vertices) == 4
    return finish(o, mat, bevel)

def wire(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 1
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new('POLY')
    spline.points.add(len(points)-1)
    for v, p in zip(spline.points, points): v.co = (*xyz(p), 1)
    o = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(mat)
    return o

def quad(name, points, uvs, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([xyz(p) for p in points], [], [(0,1,2,3)])
    mesh.uv_layers.new(name='Photo UV')
    for loop, uv in zip(mesh.uv_layers.active.data, uvs): loop.uv = uv
    o = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(o)
    return finish(o, mat)

def screw(x, y, z, r=.042):
    cylinder('Fastener washer', (x,y,z), r*1.3, .012, steel)
    cylinder('Recessed screw head', (x,y,z+.015), r, .026, steel, 24)
    box('Driver slot', (x,y,z+.031), (r*1.35,.009,.002), black, .001)
    box('Driver slot cross', (x,y,z+.032), (.009,r*1.35,.002), black, .001)

# FR4 substrate and photographic surface detail.  Source pixels stay untouched;
# the front photograph is projected by UV coordinates onto the physical board.
box('FR4 substrate', (0,0,0), (3.15,3.8,.064), edge, .008)
box('Green solder mask', (0,0,.002), (3.14,3.79,.066), pcb, .006)
# Keep the populated side physically modelled: projecting component photography
# here would duplicate capacitors and bake the room lighting onto the PCB.
trace_mat = material('Solder-mask traces', (.025,.14,.071), .1, .42)
for i in range(20):
    y=-1.7+i*.172
    x=.87+(i%3)*.095
    wire('PCB trace',[(1.5,y,.037),(x+.18,y,.037),(x,y+.08,.037),(x-.18,y+.08,.037)],.0035,trace_mat)
for x,y in [(1.0,.2),(.23,-1.38),(1.05,-1.48),(-.4,1.72),(.22,1.72)]:
    for side in [-1,1]:
        box('Silkscreen footprint',(x+side*.145,y,.037),(.005,.32,.002),ink,.001)
        box('Silkscreen footprint',(x,y+side*.16,.037),(.29,.005,.002),ink,.001)
quad('Back-side printed detail', [(1.565,-1.89,-.037),(-1.565,-1.89,-.037),(-1.565,1.89,-.037),(1.565,1.89,-.037)], [(1,0),(0,0),(0,1),(1,1)], back_photo)

# Anodised face plate with real through-holes, edge radii and status label patch.
plate = box('Anodised mounting plate', (-1.68,0,.37), (.045,4.18,1.0), black, .014)
for y in [-1.9,1.9]:
    for z in [-.01,.72]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=.034, depth=.15, location=xyz((-1.68,y,z)), rotation=(0,pi/2,0))
        cutter=bpy.context.object
        bpy.context.view_layer.objects.active=plate
        boolean=plate.modifiers.new('Mounting through hole','BOOLEAN')
        boolean.operation='DIFFERENCE';boolean.object=cutter
        bpy.ops.object.modifier_apply(modifier=boolean.name)
        bpy.data.objects.remove(cutter,do_unlink=True)
font = bpy.data.fonts.load(str(ROOT/'model/reference/DejaVuSans.ttf'))
for i, text in enumerate(['СЕТЬ', 'НОРМА', 'АВАРИЯ', 'СТАБ.ТОКА']):
    height = 1.22-i*.2
    bpy.ops.object.text_add(location=xyz((-1.706,height,.08)), rotation=(pi/2,0,-pi/2))
    obj=bpy.context.object;obj.name='Original status label · '+text
    obj.data.body=text;obj.data.font=font;obj.data.size=.125;obj.data.extrude=.0002
    obj.data.materials.append(ink)
    led=cylinder('Status indicator',(-1.709,height+.035,-.015),.024,.008,vent,20,.002)
    led.rotation_euler=(0,pi/2,0)
for y in [-1.5, 1.6]:
    box('Plate fixing bracket', (-1.53,y,.12), (.3,.16,.18), metal, .008)

# Four electrolytic capacitors, with sleeves, rolled rims and recessed vents.
for i in range(4):
    y=1.23-i*.79
    cylinder('Electrolytic capacitor sleeve',(-1.13,y,.32),.205,.53,plastic,48,.013)
    cylinder('Rolled aluminium rim',(-1.13,y,.591),.198,.014,steel,48,.004)
    cylinder('Dark capacitor top',(-1.13,y,.601),.181,.014,cap_top,48,.004)
    box('Pressure vent',(-1.13,y,.61),(.19,.005,.002),vent,.001)
    box('Pressure vent',(-1.13,y,.611),(.005,.19,.002),vent,.001)
    for side in [-1,1]: cylinder('Capacitor lead',(-1.13+side*.09,y,.065),.014,.05,steel,12,.001)

# Main insulated transformer and ferrite bobbins.
box('Transformer ferrite frame',(-.34,1.08,.34),(.73,1.0,.6),ferrite,.025)
box('Transformer insulation wrap',(-.34,1.08,.37),(.59,.89,.62),yellow,.023)
for y in [.61,1.55]: box('Transformer clamp',(-.34,y,.43),(.7,.065,.51),black,.008)
for cx in [-.36,.33]:
    cy=.15
    box('Coil bobbin base',(cx,cy,.13),(.54,.67,.15),ferrite,.012)
    for side in [-1,1]:
        box('Ferrite core leg',(cx+side*.225,cy,.33),(.08,.67,.48),ferrite,.01)
        box('Ferrite core crossbar',(cx,cy+side*.29,.33),(.54,.08,.48),ferrite,.01)
    pts=[]
    turns=17
    for i in range(650):
        t=i/649*2*pi*turns
        pts.append((cx+.17*cos(t),cy-.235+.47*i/649,.33+.17*sin(t)))
    wire('Transformer winding',pts,.013,copper)

# Toroidal inductors with continuous copper winding and insulating discs.
def toroid(x,y,r,cover=True):
    bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=12,location=xyz((x,y,.29)),rotation=(pi/2,0,0),major_radius=r,minor_radius=.084)
    finish(bpy.context.object,yellow)
    pts=[];turns=29
    for i in range(1000):
        t=i/999*2*pi;radius=r+.096*cos(turns*t)
        pts.append((x+radius*cos(t),y+radius*sin(t),.29+.096*sin(turns*t)))
    wire('Toroid enamelled copper wire',pts,.012,copper)
    if cover:
        cylinder('Insulating cover',(x,y,.407),r*.86,.026,yellow,48,.008)
        screw(x,y,.43,.028)
toroid(1.04,1.27,.305)
toroid(-.34,-1.16,.355)
toroid(-.34,-.56,.225,False)
toroid(1.13,-.66,.185,False)

for y in [1.0,.49,-.02]:
    cylinder('Output capacitor blue sleeve',(.95,y,.23),.134,.35,blue,32,.009)
    cylinder('Output capacitor top rim',(.95,y,.412),.126,.015,steel,32,.004)
    cylinder('Output capacitor seal',(.95,y,.422),.113,.007,cap_top,32,.003)
    box('Capacitor vent',(.95,y,.427),(.13,.004,.002),vent,.001)

for x in [-.82,.58]:
    box('Aluminium heat spreader',(x,.015,.44),(.19,3.57,.15),metal,.012)
    box('Heat spreader return flange',(x-.065,.015,.3),(.066,3.57,.29),metal,.008)
    for y in [-1.54,-.64,.64,1.54]:screw(x,y,.524)
    for y in [-1.2,-.2,.83,1.3]:box('Semiconductor mounting tab',(x+.14,y,.31),(.2,.18,.055),metal,.005)

for y in [-1.21,1.2]:
    box('Connector housing',(1.62,y,.18),(.18,.94,.37),blue,.012)
    box('Connector recess',(1.722,y,.19),(.018,.76,.24),black,.003)
    for i in range(12):
        py=y-.37+i*.067
        box('Gold connector pin',(1.47,py,.18),(.23,.015,.02),gold,.003)
        box('Socket contact',(1.733,py,.19),(.022,.018,.12),gold,.002)
    for py in [y-.45,y+.45]:box('Connector latch',(1.64,py,.23),(.24,.06,.42),blue,.006)

# Surface packages and passive components; real depth at close viewing angles.
for x,y in [(1.0,.2),(.23,-1.38),(1.05,-1.48),(-.4,1.72),(.22,1.72)]:
    box('Semiconductor package',(x,y,.1),(.2,.25,.09),ferrite,.008)
    for i in range(4):
        for side in [-1,1]:box('Gull-wing lead',(x+side*.112,y-.08+i*.053,.07),(.055,.017,.016),steel,.003)
for i in range(25):
    x=.81+(i%3)*.145;y=-1.45+(i//3)*.12
    if abs(y+.66)<.3:continue
    box('SMD ceramic',(x,y,.065),(.062,.034,.035),ceramic,.004)
    for side in [-1,1]:box('SMD end cap',(x+side*.028,y,.065),(.012,.037,.038),steel,.002)
for x in [-1.43,1.42]:
    for y in [-1.72,1.72]:screw(x,y,.044,.034)

# Bake modifiers and join by material to keep the web model's draw calls low.
bpy.ops.object.select_all(action='DESELECT')
for o in list(bpy.context.scene.objects):
    if o.type not in {'MESH','CURVE','FONT'}:continue
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    if o.type in {'CURVE','FONT'}:bpy.ops.object.convert(target='MESH')
    for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
    o.select_set(False)
groups=defaultdict(list)
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':groups[o.data.materials[0].name].append(o)
for name,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    bpy.context.object.name=name
bpy.ops.object.select_all(action='SELECT')
for o in bpy.context.selected_objects:
    o['presentation_model']='Visual reconstruction from user-supplied photos; not measured CAD'
    o['source']='СКТБ СКиТ / supplied KNS photographs'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'model/kns.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/kns.glb'),export_format='GLB',export_yup=True,export_apply=True,export_extras=True)
print('KNS MODEL EXPORTED',len([o for o in bpy.context.scene.objects if o.type=='MESH']),'material groups')
