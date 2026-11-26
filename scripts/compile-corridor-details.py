"""Compile surface-level OSM features beside every outbound and return leg.
Usage: python scripts/compile-corridor-details.py path/to/extracts/*.osm
"""
import glob
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

def project(lat, lon):
    return [round((float(lon)-120.29)*102820, 1), round((22.61-float(lat))*110750, 1)]

def cells(points):
    for a,b in zip(points,points[1:] or points):
        steps=max(1,math.ceil(math.dist(a,b)/35))
        for i in range(steps+1):
            yield tuple(math.floor((a[j]+(b[j]-a[j])*i/steps)/80) for j in (0,1))

near=set()
for route in json.loads(Path('data/recommendations.json').read_text(encoding='utf8'))['routes']:
    for leg in route['geometry']:
        for x,z in cells([project(*p) for p in leg['coordinates']]):
            near.update((x+i,z+j) for i in range(-2,3) for j in range(-2,3))

def classify(t,point):
    if t.get('location')=='underground' or t.get('layer','0')!='0' or t.get('bridge','no')!='no' or t.get('tunnel','no')!='no':return
    if point:
        if t.get('highway')=='bus_stop' and t.get('public_transport')=='platform':return 'bus'
        if t.get('barrier')=='bollard':return 'bollard'
        if t.get('amenity')=='waste_basket':return 'bin'
        return
    if t.get('barrier') in ('hedge','fence','wall','guard_rail','retaining_wall'):return t['barrier']
    if t.get('railway') in ('light_rail','tram','rail'):return 'track'
    if t.get('leisure')=='pitch':return 'court'
    if t.get('man_made')=='pier':return 'pier'
    if t.get('landuse')=='flowerbed':return 'bed'
    if t.get('amenity')=='shelter' or t.get('building')=='roof' and t.get('public_transport')=='platform':return 'shelter'

features={}
buildings={}
for filename in sorted({p for arg in sys.argv[1:] for p in glob.glob(arg)}):
    root=ET.parse(filename).getroot()
    nodes={n.get('id'):project(n.get('lat'),n.get('lon')) for n in root.findall('node')}
    for el in root:
        if el.tag not in ('way','node'):continue
        point=el.tag=='node'
        tags={t.get('k'):t.get('v') for t in el.findall('tag')}
        kind=classify(tags,point)
        building=not point and tags.get('building') and tags.get('location')!='underground' and tags.get('layer','0')=='0'
        if not kind and not building:continue
        refs=[nd.get('ref') for nd in el.findall('nd')]
        if not point and (len(refs)<2 or any(ref not in nodes for ref in refs)):continue
        p=[nodes[el.get('id')]] if point else [nodes[ref] for ref in refs]
        if not any(c in near for c in cells(p)):continue
        if building and p[0]==p[-1]:
            attrs={k:tags[k] for k in ('building','building:material','building:colour','roof:colour','roof:shape','height','building:levels') if k in tags}
            if len(attrs)>1 or attrs['building']!='yes':buildings['%d,%d' % tuple(math.floor(v+.5) for v in p[0])]=attrs
        if not kind:continue
        if kind in ('court','bed','shelter') and (p[0]!=p[-1] or len(p)<4):continue
        key=el.tag[0]+el.get('id')
        features[key]=[kind,key,p]
if not features:raise SystemExit('No matching OSM features')
rows=list(sorted(features.values(),key=lambda r:r[1]))
Path('data/corridor-details.js').write_text('// © OpenStreetMap contributors, ODbL. Local metres; n = node, w = way.\nexport default '+json.dumps(rows,separators=(',',':'))+';\n',encoding='utf8')
Path('data/corridor-buildings.js').write_text('// © OpenStreetMap contributors, ODbL. Matched to mapped footprints.\nexport default '+json.dumps(buildings,separators=(',',':'),sort_keys=True)+';\n', encoding='utf8')
from collections import Counter
print(Counter(r[0] for r in rows))

