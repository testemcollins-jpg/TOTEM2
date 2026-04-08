// ================= CONFIG =================
const ADMIN = { user: "admin", pass: "1234" };

// caminhos das plantas (SVG)
let plantas = {
  0: "plantas/terreo.svg",
  1: "plantas/andar1.svg",
  2: "plantas/andar2.svg",
  3: "plantas/andar3.svg",
  4: "plantas/andar4.svg"
};

// setores por andar (nome deve bater com ID no SVG)
let floorsData = {
  0:[{nome:''},{nome:''}],
  1:[{nome:'RH'}],
  2:[{nome:'TI'}],
  3:[],
  4:[]
};

let currentFloor = 0;
let svg; // SVG dinâmico
const start = {x:150,y:280};

const results = document.getElementById('results');

// ================= LOGIN =================
function openLogin(){
  document.getElementById('loginScreen').style.display = 'flex';
}
function closeLogin(){
  document.getElementById('loginScreen').style.display = 'none';
}
function login(){
  const u = document.getElementById('user').value;
  const p = document.getElementById('pass').value;

  if(u===ADMIN.user && p===ADMIN.pass){
    closeLogin();
    document.getElementById('adminPanel').style.display = 'block';
  } else {
    alert("Acesso negado");
  }
}

// fecha login ao clicar fora do card
document.getElementById('loginScreen').addEventListener('click',(e)=>{
  if(e.target.id === 'loginScreen') closeLogin();
});

// ================= ANDARES =================
function initButtons(){
  const c = document.getElementById('floorButtons');
  for(let i=0;i<=4;i++){
    const b=document.createElement('button');
    b.innerText = i===0?'Térreo':i+'º Andar';
    b.onclick=()=>setFloor(i);
    c.appendChild(b);
  }
}

// ================= CARREGAR PLANTA =================
function loadFloorSVG(floor){
  fetch(plantas[floor])
    .then(r=>r.text())
    .then(svgContent=>{
      document.getElementById('mapContainer').innerHTML = svgContent;
      svg = document.querySelector('#mapContainer svg');

      // garante path de rota
      let route = svg.querySelector('#route');
      if(!route){
        route = document.createElementNS("http://www.w3.org/2000/svg","path");
        route.setAttribute('id','route');
        svg.appendChild(route);
      }
    });
}

// ================= SET FLOOR =================
function setFloor(f){
  currentFloor = f;

  document.querySelectorAll('.floors button')
    .forEach((b,i)=>b.classList.toggle('active', i===f));

  loadFloorSVG(f);
  render();
}

// ================= LISTA =================
function render(){
  results.innerHTML='';
  floorsData[currentFloor].forEach(s=>{
    const d=document.createElement('div');
    d.className='card';
    d.innerText=s.nome;
    d.onclick=()=>drawRoute(s);
    results.appendChild(d);
  });
}

// ================= GRAFO (múltiplos caminhos) =================
let graph = {
  A:{x:150,y:280,neighbors:['B']},
  B:{x:150,y:200,neighbors:['A','C','D']},
  C:{x:80,y:120,neighbors:['B']},
  D:{x:220,y:120,neighbors:['B']}
};

function closestNode(point){
  let min=Infinity, node=null;
  for(let k in graph){
    const dx=graph[k].x-point.x;
    const dy=graph[k].y-point.y;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<min){ min=d; node=k; }
  }
  return node;
}

function findPath(startNode,endNode){
  let queue=[[startNode]];
  let visited=new Set();

  while(queue.length){
    let path=queue.shift();
    let node=path[path.length-1];
    if(node===endNode) return path;

    if(!visited.has(node)){
      visited.add(node);
      graph[node].neighbors.forEach(n=>{
        queue.push([...path,n]);
      });
    }
  }
  return null;
}

// ================= ROTA =================
function drawRoute(dest){
  const el = document.getElementById(dest.nome);
  if(!el){ alert("ID não encontrado no SVG"); return; }

  const box = el.getBBox();
  const target = { x: box.x+box.width/2, y: box.y+box.height/2 };

  const startNode = closestNode(start);
  const endNode = closestNode(target);
  const pathNodes = findPath(startNode,endNode);

  let d = `M ${start.x} ${start.y}`;
  pathNodes.forEach(n=>{
    d += ` L ${graph[n].x} ${graph[n].y}`;
  });
  d += ` L ${target.x} ${target.y}`;

  svg.querySelector('#route').setAttribute('d',d);
  drawSteps(pathNodes,target);
}

// ================= PEGADAS =================
function drawSteps(pathNodes,target){
  svg.querySelectorAll('.footstep').forEach(e=>e.remove());

  let points=[start,...pathNodes.map(n=>graph[n]),target];

  for(let i=0;i<points.length-1;i++){
    let p1=points[i], p2=points[i+1];

    for(let j=1;j<=8;j++){
      const x=p1.x+(p2.x-p1.x)*(j/8);
      const y=p1.y+(p2.y-p1.y)*(j/8);

      const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
      c.setAttribute('cx',x);
      c.setAttribute('cy',y);
      c.setAttribute('r',3);
      c.setAttribute('class','footstep');
      svg.appendChild(c);
    }
  }
}

// ================= ADMIN =================
function addSetor(){
  const nome = document.getElementById('nome').value.replace(/\s+/g,'');
  const andar = parseInt(document.getElementById('andar').value);

  if(!floorsData[andar]) floorsData[andar]=[];
  floorsData[andar].push({nome});

  setFloor(andar);
}

// ================= INIT =================
initButtons();
setFloor(0);