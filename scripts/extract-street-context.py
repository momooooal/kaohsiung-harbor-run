"""Usage: python scripts/extract-street-context.py area-1.osm area-2.osm ...
Compile OSM XML extracts to near-route features in the shared east/south grid.
"""
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

def xy(lat, lon):
    return [round((float(lon)-120.29)*102820, 1), round((22.61-float(lat))*110750, 1)]

def cell(p):
    return (math.floor(p[0]/80), math.floor(p[1]/80))

routes = json.loads(Path('data/recommendations.json').read_text(encoding='utf-8'))['routes']
corridor = set()
for route in routes:
    for leg in route['geometry']:
        path = [xy(*v) for v in leg['coordinates']]
        for a,b in zip(path,path[1:]):
            n = max(1, math.ceil(math.dist(a,b)/35))
            for j in range(n+1):
                x,z=cell([a[k]+(b[k]-a[k])*j/n for k in (0,1)])
                corridor.update((x+i,z+l) for i in range(-2,3) for l in range(-2,3))

out={k:[] for k in ['roads','buildings','areas','crossings','fixtures','rows']}
seen_ways,seen_nodes=set(),set()
def tags(el):
    return {v.get('k'):v.get('v') for v in el.findall('tag')}
def number(value, fallback):
    try:return float(value)
    except (TypeError,ValueError):return fallback

for f in sys.argv[1:]:
    root=ET.parse(f)
    ns={n.get('id'):xy(n.get('lat'),n.get('lon')) for n in root.findall('node')}
    for n in root.findall('node'):
        i=n.get('id')
        if i in seen_nodes or cell(ns[i]) not in corridor:continue
        seen_nodes.add(i);t=tags(n)
        for k,v,kind in [('highway','street_lamp','lamp'),('amenity','bench','bench'),('highway','traffic_signals','signal'),('natural','tree','tree')]:
            if t.get(k)==v:out['fixtures'].append([kind,ns[i]])
    for way in root.findall('way'):
        i=way.get('id')
        if i in seen_ways:continue
        seen_ways.add(i);t=tags(way)
        p=[ns[n.get('ref')] for n in way.findall('nd') if n.get('ref') in ns]
        if len(p)<2 or not any(cell(v) in corridor for v in p):continue
        if t.get('location')=='underground' or number(t.get('layer'),0)<0:continue
        highway=t.get('highway');surface=t.get('surface','')
        if t.get('footway')=='crossing' or t.get('cycleway')=='crossing':out['crossings'].append(p)
        elif t.get('natural')=='tree_row':out['rows'].append(p)
        elif t.get('building') and p[0]==p[-1] and t['building'] not in ('roof','construction','underground'):
            h=number(t.get('height'),number(t.get('building:levels'),3)*3.15)
            if number(t.get('layer'),0)==0:out['buildings'].append([min(200,max(h,2.5)),p])
        elif highway in ('primary','secondary','tertiary','residential','service','unclassified','cycleway','footway','pedestrian','path') and not t.get('bridge') and t.get('area')!='yes':
            kind='path' if highway in ('cycleway','footway','pedestrian','path') else 'road'
            lanes=int(min(8,max(0,number(t.get('lanes'),0))))
            defaults={'path':2.6,'road':max(4,lanes*3.15) if lanes else 6}
            width=max(.75,min(36,number(t.get('width'),defaults[kind])))
            out['roads'].append([kind,width,lanes,surface,p])
        elif p[0]==p[-1]:
            kind=''
            if t.get('natural')=='water' or t.get('waterway')=='riverbank':kind='water'
            elif t.get('leisure') in ('park','garden','playground') or t.get('landuse') in ('grass','forest','meadow','recreation_ground') or t.get('natural') in ('wood','scrub','grassland'):kind='green'
            elif t.get('amenity')=='parking':kind='parking'
            if kind:out['areas'].append([kind,p])
file=Path('data/route-streets.js')
file.write_text('// © OpenStreetMap contributors, ODbL. Local east/south metres. 2026-11-25.\nexport default '+json.dumps(out,separators=(',',':'))+';\n',encoding='utf-8')
print({k:len(v) for k,v in out.items()},file.stat().st_size)
