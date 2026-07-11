const canvas = document.querySelector("#viewport");
const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
const $ = (selector) => document.querySelector(selector);
if (!gl) { $("#status").textContent = "WebGL unavailable"; throw new Error("WebGL is required for this demo"); }

const state = { budget: 72000, lod: .7, culling: true, paused: false, camera: { yaw: .55, pitch: .28, distance: 10.5 }, pointer: null, tiles: [], dirty: true, last: performance.now(), fps: 60, metricAt: 0 };
function multiply(a, b) { const out = new Array(16).fill(0); for (let r=0;r<4;r++) for (let c=0;c<4;c++) for (let k=0;k<4;k++) out[c*4+r]+=a[k*4+r]*b[c*4+k]; return out; }
function normalize(v) { const l = Math.hypot(...v) || 1; return v.map((n) => n / l); }
function cross(a,b) { return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
function subtract(a,b) { return a.map((n,i)=>n-b[i]); }
function perspective(fov, aspect, near, far) { const f=1/Math.tan(fov/2), nf=1/(near-far); return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]; }
function lookAt(eye,target,up=[0,1,0]) { const z=normalize(subtract(eye,target)),x=normalize(cross(up,z)),y=cross(z,x); return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x.reduce((s,n,i)=>s+n*eye[i],0),-y.reduce((s,n,i)=>s+n*eye[i],0),-z.reduce((s,n,i)=>s+n*eye[i],0),1]; }
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function shader(type, source) { const out=gl.createShader(type); gl.shaderSource(out,source); gl.compileShader(out); if(!gl.getShaderParameter(out,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(out)); return out; }
function program(vertex, fragment) { const out=gl.createProgram();gl.attachShader(out,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(out,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(out);if(!gl.getProgramParameter(out,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(out));return out; }
const renderProgram = program(
  `attribute vec3 aPosition;attribute vec4 aColorSize;uniform mat4 uView;uniform mat4 uProjection;varying vec4 vColor;void main(){vec4 view=uView*vec4(aPosition,1.0);gl_Position=uProjection*view;gl_PointSize=clamp(aColorSize.w*185.0/max(.6,-view.z),1.0,46.0);vColor=aColorSize;}`,
  `precision mediump float;varying vec4 vColor;void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=dot(p,p);if(r>1.0)discard;float gaussian=exp(-3.7*r);gl_FragColor=vec4(vColor.rgb,gaussian*vColor.a);}`,
);
const loc = { position: gl.getAttribLocation(renderProgram,"aPosition"), colorSize: gl.getAttribLocation(renderProgram,"aColorSize"), view: gl.getUniformLocation(renderProgram,"uView"), projection: gl.getUniformLocation(renderProgram,"uProjection") };

function seeded(seed) { let n = seed >>> 0; return () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; }; }
function createTiles() {
  state.tiles.forEach((tile)=>gl.deleteBuffer(tile.buffer)); state.tiles=[];
  const columns=5, rows=4, tileTotal=columns*rows, perTile=Math.floor(state.budget/tileTotal);
  for(let row=0;row<rows;row++) for(let col=0;col<columns;col++) {
    const cx=(col-(columns-1)/2)*4.4, cz=(row-(rows-1)/2)*4.4, random=seeded(99+row*17+col*31), data=new Float32Array(perTile*7);
    for(let i=0;i<perTile;i++){const angle=random()*Math.PI*2, radius=Math.pow(random(),.55)*2.7, height=(random()-.5)*3.8;const base=i*7;data[base]=cx+Math.cos(angle)*radius;data[base+1]=height+Math.sin(angle*3)*.35;data[base+2]=cz+Math.sin(angle)*radius;const hue=(col/columns*.42+row/rows*.12+random()*.09)%1;const color=hslToRgb(hue,.78,.64);data[base+3]=color[0];data[base+4]=color[1];data[base+5]=color[2];data[base+6]=7+random()*16;}
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);state.tiles.push({buffer,count:perTile,center:[cx,0,cz]});
  }
  $("#status").textContent=`Generated ${state.tiles.reduce((n,t)=>n+t.count,0).toLocaleString()} splats`;
}
function hslToRgb(h,s,l){const a=s*Math.min(l,1-l);const f=(n)=>{const k=(n+h*12)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return[f(0),f(8),f(4)];}
function camera() { const {yaw,pitch,distance}=state.camera; const eye=[distance*Math.sin(yaw)*Math.cos(pitch),distance*Math.sin(pitch),distance*Math.cos(yaw)*Math.cos(pitch)]; return {eye,forward:normalize(eye.map((n)=>-n))}; }
function visible(tile, eye, forward) { if(!state.culling)return true; const to=normalize(subtract(tile.center,eye)); return to.reduce((sum,n,i)=>sum+n*forward[i],0)>.35; }
function render(now) {
  requestAnimationFrame(render); if(state.paused) return;
  const width=Math.max(1,canvas.clientWidth*devicePixelRatio),height=Math.max(1,canvas.clientHeight*devicePixelRatio);if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  const frameMs=now-state.last;state.last=now;state.fps=state.fps*.9+(1000/Math.max(1,frameMs))*.1;
  gl.viewport(0,0,width,height);gl.clearColor(.02,.04,.075,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(renderProgram);
  const {eye,forward}=camera();gl.uniformMatrix4fv(loc.view,false,lookAt(eye,[0,0,0]));gl.uniformMatrix4fv(loc.projection,false,perspective(Math.PI/3,width/height,.1,100));
  let drawn=0, visibleTiles=0;for(const tile of state.tiles){if(!visible(tile,eye,forward))continue;visibleTiles++;const count=Math.max(1,Math.floor(tile.count*state.lod));gl.bindBuffer(gl.ARRAY_BUFFER,tile.buffer);gl.enableVertexAttribArray(loc.position);gl.vertexAttribPointer(loc.position,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(loc.colorSize);gl.vertexAttribPointer(loc.colorSize,4,gl.FLOAT,false,28,12);gl.drawArrays(gl.POINTS,0,count);drawn+=count;}
  if(now-state.metricAt>160){state.metricAt=now;$("#fps").textContent=state.fps.toFixed(0);$("#frame-ms").textContent=`${frameMs.toFixed(1)} ms`;$("#drawn").textContent=drawn.toLocaleString();$("#tiles").textContent=`${visibleTiles}/${state.tiles.length}`;$("#camera-chip").textContent=`Orbit · ${state.camera.distance.toFixed(1)} units`;}
}
$("#budget").addEventListener("change",(event)=>{state.budget=Number(event.target.value);createTiles();});
$("#lod").addEventListener("input",(event)=>{state.lod=Number(event.target.value)/100;$("#lod-output").textContent=`${event.target.value}%`;});
$("#culling").addEventListener("change",(event)=>{state.culling=event.target.checked;$("#status").textContent=state.culling?"Tile culling enabled":"Tile culling disabled";});
$("#pause").addEventListener("change",(event)=>{state.paused=event.target.checked;$("#status").textContent=state.paused?"Renderer paused":"Renderer resumed";});
$("#regenerate").addEventListener("click",createTiles);
canvas.addEventListener("pointerdown",(event)=>{canvas.setPointerCapture(event.pointerId);state.pointer={x:event.clientX,y:event.clientY};canvas.focus();});
canvas.addEventListener("pointermove",(event)=>{if(!state.pointer)return;state.camera.yaw-= (event.clientX-state.pointer.x)*.008;state.camera.pitch=clamp(state.camera.pitch+(event.clientY-state.pointer.y)*.008,-1.35,1.35);state.pointer={x:event.clientX,y:event.clientY};});
canvas.addEventListener("pointerup",()=>{state.pointer=null;});canvas.addEventListener("wheel",(event)=>{event.preventDefault();state.camera.distance=clamp(state.camera.distance*(event.deltaY>0?1.08:.92),5,38);},{passive:false});
createTiles();requestAnimationFrame(render);
