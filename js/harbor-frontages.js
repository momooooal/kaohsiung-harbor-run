// Outlines are surveyed map features. Near-ground elevations and materials
// interpret dated public views listed in DATA-SOURCES.md.
export function coralFrontage(line,{panel,beam,slab,P,mix}){
  const roof=8.25;
  // The crown of this building follows the hexagons in the mapped outline.
  // An inset glass wall leaves the visible Y-shaped supports in the shade.
  function inside(p){
    let yes=false;
    for(let j=1;j<line.length;j++){
      const a=line[j-1],b=line[j];
      if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;
    }
    return yes;
  }
  const edge=line.slice(0,-1);
  const corners=edge.map((p,i)=>{
    const prev=edge[(i+edge.length-1)%edge.length],next=edge[(i+1)%edge.length];
    const normal=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);return [dz/len,-dx/len];};
    const left=normal(prev,p),right=normal(p,next),den=Math.max(.45,1+left[0]*right[0]+left[1]*right[1]);
    return [p[0]+1.8*(left[0]+right[0])/den,p[1]+1.8*(left[1]+right[1])/den];
  });
  slab([...corners,corners[0]],roof-.52,0xe5e4d8);
  for(let i=0;i<edge.length;i++){
    const j=(i+1)%edge.length,a=edge[i],b=edge[j],c=corners[i],d=corners[j];
    panel(c,d,3.76,7.22,.15,0x35464c);
    panel(c,d,3.95,.30,.30,0x293c43);
    panel(a,b,roof,.55,.52,0xedece4);
    for(const t of [.06,.35,.68]){
      const p=mix(c,d,t);beam(P(p,.15),P(p,roof-.45),.047,0x6c797b);
    }
    // A fork rises from the recessed wall out to two outer canopy nodes.
    if(i%2===0&&Math.hypot(b[0]-a[0],b[1]-a[1])>4){
      const p=mix(c,d,.50);beam(P(p,.15),P(p,5.25),.16,0xc2c9c7);
      beam(P(p,5.2),P(a,roof-.23),.12,0xdbe0dc);beam(P(p,5.2),P(b,roof-.23),.12,0xdbe0dc);
    }
  }
  // A regular module follows the first surveyed hexagon edge. Avoid caps
  // that cross the deeply indented perimeter.
  const center=[(line[0][0]+line[1][0])/2,(line[0][1]+line[1][1])/2];
  const angle=Math.atan2(line[1][1]-line[0][1],line[1][0]-line[0][0]),radius=7.12;
  const xy=(x,z)=>[center[0]+x*Math.cos(angle)-z*Math.sin(angle),center[1]+x*Math.sin(angle)+z*Math.cos(angle)];
  for(let row=-15;row<=15;row++)for(let col=-15;col<=15;col++){
    const x=radius*1.5*col,z=Math.sqrt(3)*radius*(row+(Math.abs(col)%2)*.5);
    const ring=Array.from({length:6},(_,i)=>xy(x+radius*.98*Math.cos(i*Math.PI/3),z+radius*.98*Math.sin(i*Math.PI/3)));
    if(!ring.every(inside))continue;
    for(let i=0;i<6;i++)panel(ring[i],ring[(i+1)%6],roof-.24,.23,.31,0xf2f1e8);
  }
}

export function terminalEnvelope(line,{panel,beam,slab,P,mix}){
  // The public approach passes under the east wing. Its lower facade is
  // dark louvred metal. The taller west volume has closely spaced fins.
  const min=Math.min(...line.map(p=>p[0])),max=Math.max(...line.map(p=>p[0]));
  const height=p=>{const t=(p[0]-min)/(max-min);return 10.7+21*Math.pow(1-t,2.5)+2.3*Math.sin(t*Math.PI*2);};
  const base=5.15;
  slab(line,0,0xa5aeb0,height);slab(line,base,0x444b4c);
  for(let j=1;j<line.length;j++){
    const a=line[j-1],b=line[j],n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/2.6);
    for(let i=0;i<n;i++){
      const p=mix(a,b,i/n),q=mix(a,b,(i+1)/n),h=height(mix(p,q,.5));
      panel(p,q,(base+h)/2,h-base,.24,0x46575e);
      panel(p,q,base+.11,.22,.45,0x8f9b9e);
      if(h>15){
        beam(P(p,base+.2),P(q,h-.4),.14,0x9aa6a9,.22);
      }else{
        for(let y=base+.4;y<h-.3;y+=.46)panel(p,q,y,.075,.34,0x728087);
      }
      panel(p,q,h,.22,.37,0xbac2c2);
    }
  }
}
