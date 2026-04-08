const ADMIN_CONF = { user: "admin", pass: "admin2" };

let floorsData = {
    0: [{ nome: 'Recepção' }, { nome: 'Secretaria' }],
    1: [{ nome: 'RH' }],
    2: [{ nome: 'TI' }],
    3: [],
    4: []
};

let currentFloor = 0;

window.onload = () => {
    initFloorButtons();
};

function initFloorButtons() {
    const container = document.getElementById('floorButtons');
    container.innerHTML = '';
    for (let i = 0; i <= 4; i++) {
        const btn = document.createElement('button');
        btn.innerText = i === 0 ? 'Térreo' : i + 'º Andar';
        btn.onclick = () => {
            currentFloor = i;
            setFloor(i);
            document.getElementById('mainLayout').style.display = 'grid';
        };
        container.appendChild(btn);
    }
}

function setFloor(f) {
    document.querySelectorAll('.floors button').forEach((b, i) => {
        b.classList.toggle('active', i === f);
    });
    renderResults();
}

function searchSetor() {
    const term = document.getElementById('search').value.toLowerCase().trim();
    const layout = document.getElementById('mainLayout');
    
    if (term.length > 0) {
        layout.style.display = 'grid';
        renderSearchResults(term);
    } else {
        layout.style.display = 'none';
    }
}

function renderResults() {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = '';
    floorsData[currentFloor].forEach(s => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = s.nome;
        resDiv.appendChild(card);
    });
}

function renderSearchResults(term) {
    const resDiv = document.getElementById('results');
    resDiv.innerHTML = '';
    for (let f in floorsData) {
        floorsData[f].forEach(s => {
            if (s.nome.toLowerCase().includes(term)) {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerText = `${s.nome} (${f === '0' ? 'Térreo' : f + 'º Andar'})`;
                card.onclick = () => {
                    currentFloor = parseInt(f);
                    setFloor(currentFloor);
                };
                resDiv.appendChild(card);
            }
        });
    }
}

// Lógica de Modais e Admin
function openLogin() { document.getElementById('loginModal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function checkLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if (u === ADMIN_CONF.user && p === ADMIN_CONF.pass) {
        closeModal('loginModal');
        document.getElementById('adminPanel').style.display = 'flex';
    } else {
        alert("Credenciais incorretas!");
    }
}

function addSetor() {
    const nome = document.getElementById('nomeSetor').value;
    const andar = parseInt(document.getElementById('andarSetor').value);
    
    if (nome && !isNaN(andar) && floorsData[andar]) {
        floorsData[andar].push({ nome });
        alert(`Setor "${nome}" adicionado com sucesso!`);
        document.getElementById('nomeSetor').value = '';
        renderResults();
    } else {
        alert("Preencha os dados corretamente.");
    }
}