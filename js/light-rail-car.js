// Original C12 three-section car. Frame +Z follows the rails.
export function lightRailCar(station,material,mesh,solid,beam){
  // A rounded, raked cab made from horizontal sections. The windscreen follows the nose.
  function noseDepth(x,y){
    return -15.4 + .52*(Math.abs(x)/1.35)**2 + .39*(y-1.35)**2;
  }
  function cabPanel(rows,finish,offset=0){
    const positions=[],indices=[],steps=16;
    const samples=[rows[0]];
    for(let i=1;i<rows.length;i++){
      const [y0,w0]=rows[i-1],[y1,w1]=rows[i];
      const divisions=Math.ceil((y1-y0)/.085);
      for(let j=1;j<=divisions;j++)samples.push([y0+(y1-y0)*j/divisions,w0+(w1-w0)*j/divisions]);
    }
    for(const [y,half] of samples){
      for(let i=0;i<=steps;i++){
        const x=half*(2*i/steps-1);
        positions.push(x,y,noseDepth(x,y));
      }
    }
    for(let j=0;j<samples.length-1;j++)for(let i=0;i<steps;i++){
      const n=j*(steps+1)+i;
      indices.push(n,n+steps+1,n+1,n+1,n+steps+1,n+steps+2);
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setIndex(indices);geo.computeVertexNormals();finish.side=THREE.DoubleSide;
    mesh(geo,finish,0,0,offset,station);
  }
  const ivory=material(0xe3e7da,.46),green=material(0x227950,.44),glass=material(0x243e43,.24);
  const outline=[[.4,.92],[.64,1.12],[.93,1.24],[1.35,1.32],[2.1,1.34],[2.9,1.26],[3.32,1.14],[3.52,.90]];
  cabPanel(outline,ivory);
  cabPanel([[.4,.9],[.64,1.10],[.84,1.18]],green,-.034);
  cabPanel([[1.26,.98],[1.38,1.10],[2.77,1.09],[3.19,.93]],glass,-.034);
  for(const side of [-1,1]){
    const sidePos=[],idx=[];
    for(const [y,w] of outline)sidePos.push(side*w,y,noseDepth(w,y),side*w,y,-10.3);
    for(let j=0;j<outline.length-1;j++){const a=j*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(sidePos,3));geo.setIndex(idx);geo.computeVertexNormals();
    mesh(geo,ivory,0,0,0,station);
    solid(side*1.32,2.32,-11.9,.045,1.05,2.7,0x2f4649);
    const x=side*.99,y=1.08;
    beam([x,y,noseDepth(x,y)-.07],[x,y,noseDepth(x,y)-.17],.133,0x394944);
    beam([x,y,noseDepth(x,y)-.171],[x,y,noseDepth(x,y)-.19],.081,0xffedc6);
  }
  beam([-.7,1.37,-15.33],[.18,1.65,-15.43],.024,0x171f20);
  for(let car=-1;car<=1;car++){
    const z=car*7.1;
    solid(0,1.43,z,2.62,1.9,6.78,0xd7e1d5);solid(0,.66,z,2.63,.38,6.64,0x377953);
    solid(0,2.46,z,2.68,1.16,6.7,0x334951);solid(0,3.21,z,2.59,.35,6.8,0xd6ddd6);
    for(const dx of [-1.35,1.35])for(let bay=-2.7;bay<3;bay+=1.45)solid(dx,2.43,z+bay,.045,1.18,.105,0x828982);
  }

}
