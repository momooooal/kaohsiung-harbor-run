"""Compile mapped skyline silhouettes from OSM XML extracts (height/storeys where recorded).
Usage: python scripts/build-distant-buildings.py region.osm [region2.osm ...]
Run from the project root. Coordinates are east/south metres in the scene grid.
"""
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

def xy(lat, lon):
    return [round((float(lon)-120.29)*102820), round((22.61-float(lat))*110750)]

def metres(value):
    match = re.fullmatch(r'(\d+(?:\.\d+)?)\s*m?', value.strip())
    return float(match[1]) if match else 0

near = set()
for r in json.loads(Path('data/recommendations.json').read_text(encoding='utf8'))['routes']:
    for leg in r['geometry']:
        for p in leg['coordinates']:
            x,z=xy(*p)
            near.update((x//160+i,z//160+j) for i in range(-8,9) for j in range(-8,9))
# OSM models the wings, suspended shaft, crown and mast of the 85 Sky Tower separately.
tower_parts={'344740871','344740872','344740873','344740874','345038766','345038767'}
buildings = {}
for file in sys.argv[1:]:
    root=ET.parse(file).getroot()
    nodes={n.get('id'):xy(n.get('lat'),n.get('lon')) for n in root.findall('node')}
    for way in root.findall('way'):
        uid=way.get('id')
        tags={v.get('k'):v.get('v') for v in way.findall('tag')}
        if uid in buildings or not (tags.get('building') or uid in tower_parts) or tags.get('building') in ('construction','roof'):continue
        h=metres(tags.get('height','')) or 3.15*metres(tags.get('building:levels',''))
        if h>400 or (h and h<6):continue
        refs=[n.get('ref') for n in way.findall('nd')]
        if len(refs)<4 or refs[0]!=refs[-1] or not all(i in nodes for i in refs):continue
        ring=[nodes[i] for i in refs[:-1]]
        if not h:
            area=abs(sum(x*ring[(i+1)%len(ring)][1]-z*ring[(i+1)%len(ring)][0] for i,(x,z) in enumerate(ring)))/2
            if area<85 or tags.get('building') in ('garage','shed','hut','kiosk'):continue
            h=7.0 if area<200 else 10.5
        if any((x//160,z//160) in near for x,z in ring):
            buildings[uid]=[round(h,1),ring]
            if uid in tower_parts:
                buildings[uid].extend([metres(tags.get('min_height','')),tags.get('roof:shape')=='pyramidal'])
if not buildings:raise SystemExit('No measured or storey-tagged buildings found')
target=Path('data/distant-buildings.js')
target.write_text('// © OpenStreetMap contributors, ODbL. See DATA-SOURCES.md.\nexport default '+json.dumps(list(buildings.values()),separators=(',',':'))+';\n',encoding='utf8')
print(len(buildings),'mapped skyline footprints')
