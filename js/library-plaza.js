// Suspended reading rooms over the 7.5 m clear entrance plaza. See KSML's
// building guide in DATA-SOURCES.md. All coordinates follow the map footprint.
export function libraryPlaza(line,{panel,beam,slab,P,mix,group,tree}){
  const bottom=7.5,roof=33,levels=7;
  slab(line,bottom,0xc2bfad);
  slab(line,roof,0x9da991);
  // The north forecourt opens toward the tree-lined street. Embed the tile
  // grid and circular inlays in one surface so they stay flat and continuous.
  const origin=line[0],end=line[3],dx=end[0]-origin[0],dz=end[1]-origin[1],len=Math.hypot(dx,dz);
  const side=(u,v)=>[origin[0]+(dx*u+dz*v)/len,origin[1]+(dz*u-dx*v)/len];
  const court=new THREE.PlaneGeometry(len,20);
  court.rotateX(-Math.PI/2);
  const paving=new THREE.MeshLambertMaterial({color:0xd1cdc1});
  paving.onBeforeCompile=s=>{
    s.vertexShader='varying vec2 plazaUV;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nplazaUV=uv;');
    s.fragmentShader='varying vec2 plazaUV;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 site=plazaUV*vec2(71.,20.);
      vec2 seam=abs(fract(site/vec2(.72,.53))-.5);
      float line=smoothstep(.474,.5,max(seam.x,seam.y));
      float radius=length(vec2(mod(site.x,24.)-12.,site.y-11.));
      float ring=1.-smoothstep(.0,.10,abs(radius-4.5));
      diffuseColor.rgb*=1.-.18*line-.16*ring-.08*step(radius,3.2);`);
  };
  const tile=new THREE.Mesh(court,paving),mid=side(len/2,10);
  tile.rotation.y=-Math.atan2(dz,dx);tile.position.set(mid[0],.094,mid[1]);group(...mid).add(tile);
  for(const u of [8,26,46,63]){
    const p=side(u,18.5);tree(...p,.80,1.05);
    const lamp=side(u+2,17.5);beam(P(lamp,.10),P(lamp,4.2),.073,0x909a97);
    beam(P(lamp,4.2),P(side(u+2.9,17.5),4.23),.076,0xbac0b8);
  }
  const corners=[];
  for(let j=1;j<line.length;j++){
    const a=line[j-1],b=line[j],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
    if(!len)continue;
    const inward=[-dz/len,dx/len],sunny=inward[0]>.7||inward[1]<-.7;
    const point=(t,depth)=>[a[0]+dx*t+inward[0]*depth,a[1]+dz*t+inward[1]*depth];
    const bays=Math.max(1,Math.round(len/3.4));
    for(let floor=0;floor<levels;floor++){
      const y=bottom+(roof-bottom)*floor/levels,h=(roof-bottom)/levels;
      const depth=sunny&&floor>=1?5:.33;
      panel(point(0,depth),point(1,depth),y+h/2,h-.10,.14,0x50696c);
      panel(point(0,depth/2),point(1,depth/2),y,.34,depth+.66,0xcac9b8);
      for(let k=0;k<bays;k++){
        const p=point((k+.09)/bays,depth-.10);
        beam(P(p,y+.1),P(p,y+h-.09),.05,0x929e9b);
        panel(point(k/bays,depth-.13),point((k+1)/bays,depth-.13),y+h*.70,.07,.075,0xb7bfba);
      }
      if(depth>1){
        panel(point(0,.35),point(1,.35),y+.32,.52,.64,0x9fa18d);
        beam(P(point(0,.2),y+1),P(point(1,.2),y+1),.04,0x99a59c);
        for(let k=0;k<bays;k++){
          const t=(k+.55)/bays;
          panel(point((k+.1)/bays,.72),point((k+.85)/bays,.72),y+.63,.35+.2*Math.sin(k+floor),.67,0x74905e);
          if((k+floor)%3===0)beam(P(point(t,.85),y+.45),P(point(t,.94),y+1.15),.27,0x617c54,.45);
        }
      }
    }
    // Suspend the library above the plaza. The four corner cores carry
    // the load, leaving the approaches between them open.
    const prev=line[(j-2+line.length-1)%(line.length-1)];
    const ux=a[0]-prev[0],uz=a[1]-prev[1],turn=Math.abs(ux*dz-uz*dx)/(Math.hypot(ux,uz)*len||1);
    if(turn>.7)corners.push(a);
  }
  const center=corners.reduce((c,p)=>[c[0]+p[0]/corners.length,c[1]+p[1]/corners.length],[0,0]);
  for(const p of corners){
    const base=mix(p,center,.15);
    for(const dx of [-.7,.7])beam(P([base[0]+dx,base[1]],.1),P([base[0]+dx,base[1]],bottom),.33,0x979e99);
    beam(P([base[0]-.7,base[1]],.5),P([base[0]+.7,base[1]],bottom-.3),.14,0x959c96);
  }
}
