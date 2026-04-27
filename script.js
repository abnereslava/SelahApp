import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBgD8fxcab5A8jVmedYsoUnuq6fgWKWPUA",
    authDomain: "selahappdevocionais.firebaseapp.com",
    projectId: "selahappdevocionais",
    storageBucket: "selahappdevocionais.firebasestorage.app",
    messagingSenderId: "921145770588",
    appId: "1:921145770588:web:e7e82d8c34a5c28b089c99"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- AUTENTICAÇÃO ---
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const btnLogout = document.getElementById('btnLogout');
const userGreeting = document.getElementById('userGreeting');

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        userGreeting.innerText = `Olá, ${user.email.split('@')[0]}`;
        fetchAll(); // Carrega os dados apenas após o login
    } else {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('btnLogin');
    
    try {
        btn.disabled = true;
        loginError.style.display = 'none';
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginError.innerText = "E-mail ou senha incorretos.";
        loginError.style.display = 'block';
        btn.disabled = false;
    }
});

btnLogout.addEventListener('click', () => {
    signOut(auth);
});

// --- UTILITÁRIOS ---
const setTodayDate = () => {
    document.getElementById('date').valueAsDate = new Date();
};
setTodayDate();

const resetFormFields = () => {
    document.getElementById('devotionalForm').reset();
    document.getElementById('editId').value = "";
    document.getElementById('continuationOf').value = "";
    document.getElementById('continuationSearch').value = "";
    document.getElementById('btnCancelEdit').style.display = 'none';
    document.getElementById('btnSubmit').innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar na Nuvem';
    document.getElementById('formTitle').innerText = "Novo Registro";
    
    // Limpa editores e arrays
    editors.livre.root.innerHTML = "<p><br></p>";
    renderGuidedQuestions(); // Reseta para as perguntas padrão
    tempActions = [];
    tempLinks = [];
    renderLists();
    setTodayDate();
};

// --- EDITORES E PERGUNTAS DINÂMICAS ---
const toolbar = [['bold', 'italic', 'underline'], [{ 'color': [] }], [{ 'header': [1, 2, false] }], ['clean']];
const editors = {
    livre: new Quill('#quillEditorLivre', { theme: 'snow', modules: { toolbar } })
};

let guidedEditors = [];
const defaultQuestions = [
    "Qual é o contexto da passagem?",
    "Sobre o que a passagem fala?",
    "O que a passagem revela sobre Deus?",
    "O que a passagem revela sobre o ser humano?",
    "Como posso aplicar essa passagem na minha vida?"
];

const renderGuidedQuestions = (questionsToRender = defaultQuestions, contents = []) => {
    const container = document.getElementById('dynamicQuestionsContainer');
    container.innerHTML = '';
    guidedEditors = [];
    
    questionsToRender.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'guided-question';
        div.innerHTML = `
            <details class="guided-collapse" open>
                <summary>
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap: 10px;">
                        <div class="collapse-toggle" style="cursor:pointer; display:flex; align-items:center; color: var(--text-muted); padding: 5px;" title="Recolher/Expandir">
                            <i class="ph ph-caret-down collapse-icon"></i>
                        </div>
                        <input type="text" class="question-input" value="${q}" style="flex:1; font-weight:500;" onclick="event.preventDefault();">
                        <button type="button" class="btn-icon text-danger" onclick="event.preventDefault(); removeGuidedQuestion(${idx});" title="Remover Pergunta"><i class="ph ph-trash"></i></button>
                    </div>
                </summary>
                <div class="details-content mt-2">
                    <div id="quillGuided_${idx}" class="editor-container"></div>
                </div>
            </details>
        `;
        container.appendChild(div);
        
        const qEditor = new Quill(`#quillGuided_${idx}`, { theme: 'snow', modules: { toolbar } });
        if(contents[idx]) qEditor.root.innerHTML = contents[idx];
        guidedEditors.push({ id: idx, editor: qEditor });
    });
};

window.removeGuidedQuestion = (idx) => {
    const currentData = getGuidedData();
    currentData.splice(idx, 1);
    renderGuidedQuestions(currentData.map(d => d.q), currentData.map(d => d.a));
};

document.getElementById('btnAddQuestion').addEventListener('click', () => {
    const currentData = getGuidedData();
    currentData.push({ q: "Nova pergunta orientadora?", a: "" });
    renderGuidedQuestions(currentData.map(d => d.q), currentData.map(d => d.a));
});

const getGuidedData = () => {
    const inputs = document.querySelectorAll('.question-input');
    return guidedEditors.map((g, i) => ({
        q: inputs[i].value,
        a: g.editor.root.innerHTML
    }));
};

renderGuidedQuestions(); // inicializa as perguntas padrão

// --- ALTERNÂNCIA DE FORMATO ---
document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.record-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.type === 'livre' ? 'freeRecordContainer' : 'guidedRecordContainer').classList.add('active');
    });
});

// --- GESTÃO DE AÇÕES E LINKS (MODAL) ---
document.getElementById('btnOpenActionsModal').addEventListener('click', () => {
    document.getElementById('actionsModal').showModal();
});

let tempActions = [], tempLinks = [];
const renderLists = () => {
    const aList = document.getElementById('actionsListDOM');
    const lList = document.getElementById('linksListDOM');
    const iconMap = { pedidos_oracao: 'ph-hands-praying', acoes_pessoas: 'ph-users', metas_espirituais: 'ph-target', gratidao: 'ph-heart', jejum: 'ph-fork-knife', outros: 'ph-push-pin' };
    
    aList.innerHTML = tempActions.map((a, i) => `
        <li class="modern-item">
            <div class="item-info">
                <i class="ph ${iconMap[a.type] || 'ph-push-pin'}"></i>
                <span class="item-desc">${a.description}</span>
                ${a.date ? `<span class="item-date">${a.date.split('-').reverse().join('/')}</span>` : ''}
            </div>
            <button type="button" class="btn-icon" onclick="removeAction(${i})"><i class="ph ph-trash"></i></button>
        </li>
    `).join('');
    
    lList.innerHTML = tempLinks.map((l, i) => `
        <li class="modern-item">
            <div class="item-info">
                <i class="ph ph-link"></i>
                <a href="${l.url}" target="_blank" class="item-desc">${l.title}</a>
            </div>
            <button type="button" class="btn-icon" onclick="removeLink(${i})"><i class="ph ph-trash"></i></button>
        </li>
    `).join('');
};

window.removeAction = i => { tempActions.splice(i, 1); renderLists(); };
window.removeLink = i => { tempLinks.splice(i, 1); renderLists(); };

document.getElementById('btnAddAction').addEventListener('click', () => {
    const desc = document.getElementById('actionDesc');
    if(!desc.value) return;
    tempActions.push({ type: document.getElementById('actionType').value, description: desc.value, date: document.getElementById('actionDate').value });
    desc.value = ''; renderLists();
});

document.getElementById('btnAddLink').addEventListener('click', () => {
    const t = document.getElementById('linkTitle'), u = document.getElementById('linkUrl');
    if(!t.value || !u.value) return;
    tempLinks.push({ title: t.value, url: u.value });
    t.value = ''; u.value = ''; renderLists();
});

// --- CRUD: SALVAR E ATUALIZAR ---
document.getElementById('devotionalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('btnSubmit');
    const editId = document.getElementById('editId').value;
    submitBtn.disabled = true;

    const isLivre = document.querySelector('.btn-toggle.active').dataset.type === 'livre';
    const data = {
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        continuationOf: document.getElementById('continuationOf').value || null,
        mainPassage: document.getElementById('mainPassage').value,
        recordType: document.getElementById('recordType').value,
        author: document.getElementById('author').value,
        relatedPassages: document.getElementById('relatedPassages').value,
        keywords: document.getElementById('keywords').value.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== ""),
        recordFormat: isLivre ? 'livre' : 'orientado',
        content: isLivre ? { texto: editors.livre.root.innerHTML } : {
            questions: getGuidedData()
        },
        actions: tempActions,
        links: tempLinks,
        updatedAt: new Date().toISOString()
    };

    try {
        if(editId) {
            await updateDoc(doc(db, "devotionals", editId), data);
            alert("Atualizado com sucesso!");
        } else {
            data.createdAt = data.updatedAt;
            await addDoc(collection(db, "devotionals"), data);
            alert("Salvo com sucesso!");
        }
        
        resetFormFields(); // Limpa o formulário silenciosamente
        fetchAll(); // Busca os dados atualizados sem piscar a tela
        
    } catch (err) {
        console.error("Erro ao salvar no Firestore:", err);
        alert("Ocorreu um erro ao salvar. Verifique o console (F12) para mais detalhes.");
    } finally {
        submitBtn.disabled = false;
    }
});

// --- CRUD: BUSCAR E RENDERIZAR ---
let allRecords = [];

const initAutocomplete = () => {
    const input = document.getElementById('continuationSearch');
    const dropdown = document.getElementById('continuationDropdown');
    const hidden = document.getElementById('continuationOf');

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        dropdown.innerHTML = '';
        if(!val) { dropdown.style.display = 'none'; hidden.value = ''; return; }
        
        const matches = allRecords.filter(r => 
            (r.title && r.title.toLowerCase().includes(val)) || 
            (r.mainPassage && r.mainPassage.toLowerCase().includes(val))
        );
        
        if(matches.length > 0) {
            dropdown.style.display = 'block';
            matches.slice(0, 10).forEach(m => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${m.title || m.mainPassage}</strong> <br><small>${m.date.split('-').reverse().join('/')}</small>`;
                li.onclick = () => {
                    input.value = m.title || m.mainPassage;
                    hidden.value = m.id;
                    dropdown.style.display = 'none';
                };
                dropdown.appendChild(li);
            });
        } else {
            dropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if(!e.target.closest('.autocomplete-container')) dropdown.style.display = 'none';
    });
};

const updateKeywordsDatalist = () => {
    const list = document.getElementById('keywordsList');
    const uniqueKeywords = new Set();
    
    allRecords.forEach(r => {
        if(r.keywords) r.keywords.forEach(k => { if(k) uniqueKeywords.add(k); });
    });
    list.innerHTML = Array.from(uniqueKeywords).map(k => `<option value="${k}">`).join('');
};

const fetchAll = async () => {
    const q = query(collection(db, "devotionals"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    allRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    updateKeywordsDatalist();
    initAutocomplete();
    renderFeed(allRecords);
    renderChart(allRecords);
};

const renderFeed = (arr) => {
    const feed = document.getElementById('devotionalsFeed');
    feed.innerHTML = arr.map(r => `
        <div class="card">
            <h3 class="card-title">${r.title ? r.title : r.mainPassage}</h3>
            ${r.title ? `<div class="card-passage">${r.mainPassage}</div>` : ''}
            <div class="card-meta">${r.date.split('-').reverse().join('/')} | ${r.recordType}</div>
            <div class="card-actions">
                <button class="btn-card" onclick="viewRecord('${r.id}')" title="Ver"><i class="ph ph-eye"></i></button>
                <button class="btn-card" onclick="editRecord('${r.id}')" title="Editar"><i class="ph ph-pencil"></i></button>
                <button class="btn-card btn-delete" onclick="deleteRecord('${r.id}')" title="Excluir"><i class="ph ph-trash"></i></button>
            </div>
        </div>
    `).join('');
};

// --- CRUD: ACOES DOS CARDS ---
window.viewRecord = (id) => {
    const r = allRecords.find(x => x.id === id);
    document.getElementById('viewTitle').innerText = r.title ? r.title : r.mainPassage;
    
    let html = '';
    if(r.title) html += `<p><strong>Passagem:</strong> ${r.mainPassage}</p>`;
    html += `<p><strong>Tipo:</strong> ${r.recordType} | <strong>Data:</strong> ${r.date}</p>`;
    
    // Lógica de Trilha (Chain Logic)
    let chainBack = [], chainForward = [];
    let curr = r;
    while(curr.continuationOf) {
        let parent = allRecords.find(x => x.id === curr.continuationOf);
        if(!parent) break;
        chainBack.unshift(parent);
        curr = parent;
    }
    curr = r;
    while(true) {
        let child = allRecords.find(x => x.continuationOf === curr.id);
        if(!child) break;
        chainForward.push(child);
        curr = child;
    }
    const fullChain = [...chainBack, r, ...chainForward];
    if(fullChain.length > 1) {
        html += `<div class="chain-container mt-2 mb-4"><strong>Trilha:</strong> `;
        html += fullChain.map(item => item.id === r.id ? 
            `<span class="tag" style="background:var(--primary-color);color:white">${item.title || item.mainPassage}</span>` : 
            `<a href="#" onclick="viewRecord('${item.id}'); return false;" class="tag">${item.title || item.mainPassage}</a>`
        ).join(' &rarr; ');
        html += `</div>`;
    }
    
    if(r.recordFormat === 'livre') {
        html += `<div class="mt-4">${r.content.texto}</div>`;
    } else {
        if(r.content.questions) {
            r.content.questions.forEach(q => {
                if(q.a && q.a !== '<p><br></p>') {
                    html += `<h4>${q.q}</h4><div>${q.a}</div>`;
                }
            });
        } else {
            // Legado
            const qs = ["Contexto", "Sobre o que fala", "Revela sobre Deus", "Revela sobre o Homem", "Aplicação"];
            [r.content.c1, r.content.c2, r.content.c3, r.content.c4, r.content.c5].forEach((c, i) => {
                if(c && c !== '<p><br></p>') html += `<h4>${qs[i]}</h4><div>${c}</div>`;
            });
        }
    }

    if(r.links?.length) html += `<h4 class="mt-4">Links</h4>` + r.links.map(l => `<a href="${l.url}" target="_blank" class="tag">${l.title}</a>`).join('');
    
    document.getElementById('viewBody').innerHTML = html;
    document.getElementById('viewModal').showModal();
};

window.editRecord = (id) => {
    const r = allRecords.find(x => x.id === id);
    document.getElementById('editId').value = r.id;
    document.getElementById('formTitle').innerText = "Editando Registro";
    document.getElementById('title').value = r.title || '';
    document.getElementById('date').value = r.date;
    
    document.getElementById('continuationOf').value = r.continuationOf || '';
    if(r.continuationOf) {
        const parent = allRecords.find(x => x.id === r.continuationOf);
        if(parent) document.getElementById('continuationSearch').value = parent.title || parent.mainPassage;
    } else {
        document.getElementById('continuationSearch').value = '';
    }
    
    document.getElementById('mainPassage').value = r.mainPassage;
    document.getElementById('recordType').value = r.recordType;
    document.getElementById('author').value = r.author || '';
    document.getElementById('keywords').value = r.keywords?.join(', ') || '';
    
    if(r.recordFormat === 'livre') {
        document.querySelector('[data-type="livre"]').click();
        editors.livre.root.innerHTML = r.content.texto;
    } else {
        document.querySelector('[data-type="orientado"]').click();
        if(r.content.questions) {
            renderGuidedQuestions(r.content.questions.map(q => q.q), r.content.questions.map(q => q.a));
        } else {
            const qs = ["Contexto", "Sobre o que a passagem fala?", "O que a passagem revela sobre Deus?", "O que a passagem revela sobre o ser humano?", "Como posso aplicar essa passagem na minha vida?"];
            const contents = [r.content.c1, r.content.c2, r.content.c3, r.content.c4, r.content.c5];
            renderGuidedQuestions(qs, contents);
        }
    }
    tempActions = r.actions || []; tempLinks = r.links || [];
    renderLists();
    document.getElementById('btnSubmit').innerHTML = '<i class="ph ph-check"></i> Atualizar Registro';
    document.getElementById('btnCancelEdit').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteRecord = async (id) => {
    if(confirm("Deseja realmente excluir este devocional?")) {
        await deleteDoc(doc(db, "devotionals", id));
        fetchAll();
    }
};

document.getElementById('btnCancelEdit').onclick = () => {
    resetFormFields();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- GRÁFICOS ---
let typeChart, booksChartInstance;

const extractBibleBook = (passage) => {
    const match = passage.trim().match(/^(\d?\s*[A-Za-zÀ-ÿ]+(?:[\s-][A-Za-zÀ-ÿ]+)*)/);
    if(match) return match[1].trim();
    return "Outros";
};

const renderChart = (arr) => {
    const typeCounts = arr.reduce((acc, r) => { acc[r.recordType] = (acc[r.recordType] || 0) + 1; return acc; }, {});
    const bookCounts = arr.reduce((acc, r) => {
        if(r.mainPassage) {
            const b = extractBibleBook(r.mainPassage);
            acc[b] = (acc[b] || 0) + 1;
        }
        return acc;
    }, {});

    if(typeChart) typeChart.destroy();
    typeChart = new Chart(document.getElementById('devotionalsChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#3b82f6'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
    
    if(booksChartInstance) booksChartInstance.destroy();
    const sortedBooks = Object.entries(bookCounts).sort((a,b) => b[1] - a[1]).slice(0, 10);
    booksChartInstance = new Chart(document.getElementById('booksChart'), {
        type: 'bar',
        data: {
            labels: sortedBooks.map(b => b[0]),
            datasets: [{ label: 'Qtd de Registros', data: sortedBooks.map(b => b[1]), backgroundColor: '#3b82f6' }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
};

// --- FILTROS E BUSCA ---
document.getElementById('btnApplyFilters').onclick = () => {
    const k = document.getElementById('filterKeyword').value.toLowerCase();
    const t = document.getElementById('filterType').value;
    const author = document.getElementById('filterAuthor').value.toLowerCase();
    const dStart = document.getElementById('filterDateStart').value;
    const dEnd = document.getElementById('filterDateEnd').value;

    const filtered = allRecords.filter(r => {
        let match = true;
        if(t && r.recordType !== t) match = false;
        if(k && !(r.mainPassage.toLowerCase().includes(k) || (r.title && r.title.toLowerCase().includes(k)) || r.keywords?.some(kw => kw.includes(k)))) match = false;
        if(author && (!r.author || !r.author.toLowerCase().includes(author))) match = false;
        if(dStart && r.date < dStart) match = false;
        if(dEnd && r.date > dEnd) match = false;
        return match;
    });
    renderFeed(filtered);
};

document.getElementById('btnRandom').onclick = () => {
    if(allRecords.length === 0) return alert("Nenhum registro encontrado.");
    const randomIdx = Math.floor(Math.random() * allRecords.length);
    viewRecord(allRecords[randomIdx].id);
};
