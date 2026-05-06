import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- SIDEBAR LOGIC ---
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const btnToggleSidebar = document.getElementById('btnToggleSidebar');
const btnToggleMobileSidebar = document.getElementById('btnToggleMobileSidebar');
const btnCloseSidebarMobile = document.getElementById('btnCloseSidebarMobile');

const toggleSidebar = () => {
    sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed-mode');
    const icon = btnToggleSidebar.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('ph-caret-left');
        icon.classList.add('ph-caret-right');
        btnToggleSidebar.title = "Expandir Menu";
    } else {
        icon.classList.remove('ph-caret-right');
        icon.classList.add('ph-caret-left');
        btnToggleSidebar.title = "Recolher Menu";
    }
};

const openMobileSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
};

const closeMobileSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
};

if (btnToggleSidebar) btnToggleSidebar.addEventListener('click', toggleSidebar);
if (btnToggleMobileSidebar) btnToggleMobileSidebar.addEventListener('click', openMobileSidebar);
if (btnCloseSidebarMobile) btnCloseSidebarMobile.addEventListener('click', closeMobileSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

// Close mobile sidebar when clicking a link
document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            closeMobileSidebar();
        }
    });
});

// Swipe to close logic (interactive)
let touchStartX = 0;
let touchMoveX = 0;

if (sidebar) {
    sidebar.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        sidebar.style.transition = 'none'; // Desabilita transição durante o arraste
    }, { passive: true });

    sidebar.addEventListener('touchmove', e => {
        touchMoveX = e.touches[0].clientX;
        let diff = touchMoveX - touchStartX;

        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            if (diff < 0) { // Só permite arrastar para a esquerda
                sidebar.style.transform = `translateX(${diff}px)`;
                // Efeito de opacidade no overlay proporcional ao arraste
                const opacity = 0.7 * (1 + diff / 280);
                if (sidebarOverlay) sidebarOverlay.style.opacity = Math.max(0, opacity);
            }
        }
    }, { passive: true });

    sidebar.addEventListener('touchend', e => {
        sidebar.style.transition = ''; // Restaura a transição
        sidebar.style.transform = '';
        if (sidebarOverlay) sidebarOverlay.style.opacity = '';

        let diff = touchMoveX - touchStartX;
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            if (diff < -100) { // Limiar para fechar
                closeMobileSidebar();
            }
        }
        touchStartX = 0;
        touchMoveX = 0;
    }, { passive: true });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (loginContainer) loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        userGreeting.innerText = `Olá, ${user.email.split('@')[0]}`;
        fetchAll(); // Carrega os dados apenas após o login
    } else {
        if (loginContainer) loginContainer.style.display = 'flex';
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
    const draft = localStorage.getItem('selah_draft_livre');
    editors.livre.root.innerHTML = draft ? draft : "<p><br></p>";
    renderGuidedQuestions(); // Reseta para as perguntas padrão
    tempActions = [];
    tempLinks = [];
    renderLists();
    setTodayDate();
    if (tagManager) tagManager.clear();
    if (authorManager) authorManager.clear();
};

// --- CUSTOM MODALS (REPLACING ALERT/CONFIRM) ---
const showAlert = (msg) => {
    document.getElementById('customAlertMessage').innerText = msg;
    document.getElementById('customAlertModal').showModal();
};

const showConfirm = (msg) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('customConfirmModal');
        document.getElementById('customConfirmMessage').innerText = msg;

        const btnOk = document.getElementById('btnOkConfirm');
        const btnCancel = document.getElementById('btnCancelConfirm');

        const onOk = () => {
            modal.close();
            removeListeners();
            resolve(true);
        };
        const onCancel = () => {
            modal.close();
            removeListeners();
            resolve(false);
        };
        const removeListeners = () => {
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
        };

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
        modal.showModal();
    });
};

// --- EDITORES E PERGUNTAS DINÂMICAS ---
const customColors = [
    false, 
    '#e60000', 
    '#ff9900', 
    '#d4af37', 
    '#008a00', 
    '#0066cc', 
    '#9933ff'
];
const toolbar = [['bold', 'italic', 'underline'], [{ 'color': customColors }], [{ 'header': [1, 2, false] }], ['clean']];
const editors = {
    livre: new Quill('#quillEditorLivre', { theme: 'snow', modules: { toolbar } })
};

const savedDraft = localStorage.getItem('selah_draft_livre');
if (savedDraft) editors.livre.root.innerHTML = savedDraft;

editors.livre.on('text-change', () => {
    if (!document.getElementById('editId').value) {
        localStorage.setItem('selah_draft_livre', editors.livre.root.innerHTML);
    }
});

// --- MOBILE FLOATING TOOLBAR LOGIC ---
const mobileToolbar = document.getElementById('mobileQuillToolbar');
editors.livre.on('selection-change', (range) => {
    
    if (range && range.length > 0) {
        const bounds = editors.livre.getBounds(range.index, range.length);
        if(mobileToolbar) {
            mobileToolbar.style.display = 'flex';
            const containerRect = editors.livre.container.getBoundingClientRect();
            const tbWidth = mobileToolbar.offsetWidth || 250; 
            
            let leftPos = containerRect.left + bounds.left + window.scrollX;
            if (leftPos + tbWidth > window.innerWidth) {
                leftPos = window.innerWidth - tbWidth - 10;
            }
            
            mobileToolbar.style.left = Math.max(0, leftPos) + 'px';
            const tbHeight = mobileToolbar.offsetHeight || 40;
            
            let topPos = containerRect.top + bounds.top + window.scrollY - tbHeight - 10;
            if (topPos < window.scrollY) {
                topPos = containerRect.top + bounds.bottom + window.scrollY + 10;
            }
            mobileToolbar.style.top = topPos + 'px';
            
            const format = editors.livre.getFormat(range);
            mobileToolbar.querySelectorAll('button').forEach(btn => {
                const f = btn.dataset.format;
                const v = btn.dataset.value;
                if (f === 'clean') return;
                let isActive = false;
                if (v) isActive = (format[f] == v);
                else isActive = format[f];
                btn.classList.toggle('active-format', !!isActive);
            });
        }
    } else {
        if(mobileToolbar) {
            mobileToolbar.style.display = 'none';
            document.getElementById('ftColorGroup').style.display = 'none';
            document.getElementById('ftMainGroup').style.display = 'flex';
        }
    }
});

const handleFormatBtn = (e, btn) => {
    e.preventDefault(); 
    const f = btn.dataset.format;
    const v = btn.dataset.value;
    const range = editors.livre.getSelection();
    if (!range) return;
    
    if (f === 'clean') {
        editors.livre.removeFormat(range.index, range.length);
    } else {
        const currentFormat = editors.livre.getFormat(range);
        if (v) {
            editors.livre.format(f, currentFormat[f] == v ? false : v);
        } else {
            editors.livre.format(f, !currentFormat[f]);
        }
    }
    
    if (f === 'color') {
        document.getElementById('ftColorGroup').style.display = 'none';
        document.getElementById('ftMainGroup').style.display = 'flex';
    }
};

if(mobileToolbar) {
    const ftMainGroup = document.getElementById('ftMainGroup');
    const ftColorGroup = document.getElementById('ftColorGroup');

    mobileToolbar.querySelectorAll('button').forEach(btn => {
        if (btn.id === 'ftBtnColorToggle') {
            const toggle = (e) => { e.preventDefault(); ftMainGroup.style.display = 'none'; ftColorGroup.style.display = 'flex'; };
            btn.addEventListener('mousedown', toggle);
            btn.addEventListener('touchstart', toggle);
            return;
        }
        if (btn.id === 'ftBtnColorBack') {
            const back = (e) => { e.preventDefault(); ftColorGroup.style.display = 'none'; ftMainGroup.style.display = 'flex'; };
            btn.addEventListener('mousedown', back);
            btn.addEventListener('touchstart', back);
            return;
        }

        btn.addEventListener('mousedown', (e) => handleFormatBtn(e, btn));
        btn.addEventListener('touchstart', (e) => handleFormatBtn(e, btn));
    });
}

let guidedEditors = [];
const defaultQuestions = [
    "Qual é o contexto da passagem?",
    "Sobre o que a passagem fala?",
    "O que a passagem revela sobre Deus?",
    "O que a passagem revela sobre o ser humano?",
    "Como posso aplicar essa passagem na minha vida?"
];

// --- LÓGICA DO MODAL DE PERGUNTAS NO MOBILE ---
window.handleQuestionClick = (idx, inputEl) => {
    // Se a tela for pequena (celular), abre o modal. Se for PC, edita direto.
    if (window.innerWidth <= 768) {
        inputEl.blur(); // Oculta o teclado do celular
        const modal = document.getElementById('editQuestionModal');
        const textarea = document.getElementById('editQuestionTextarea');
        textarea.value = inputEl.value; // Puxa o texto atual
        modal.showModal();

        // Lógica de salvar
        document.getElementById('btnSaveQuestion').onclick = () => {
            inputEl.value = textarea.value; // Atualiza o input com o novo texto
            modal.close();
        };
    }
};

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
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap: 8px;">
                        <div class="collapse-toggle" style="cursor:pointer; display:flex; align-items:center; color: var(--text-muted); padding: 5px;" title="Recolher/Expandir">
                            <i class="ph ph-caret-down collapse-icon"></i>
                        </div>
                        <input type="text" class="question-input truncate-mobile" value="${q}" 
                            style="flex:1; font-weight:500; min-width:0; padding-right:5px; text-overflow:ellipsis;" 
                            onclick="handleQuestionClick(${idx}, this)" 
                            onfocus="if(window.innerWidth <= 768) this.blur();">
                        <button type="button" class="btn-icon text-danger" style="margin:0; padding:5px;" onclick="event.preventDefault(); removeGuidedQuestion(${idx});" title="Remover Pergunta"><i class="ph ph-trash"></i></button>
                    </div>
                </summary>
                <div class="details-content mt-2">
                    <div id="quillGuided_${idx}" class="editor-container"></div>
                </div>
            </details>
        `;
        container.appendChild(div);

        const qEditor = new Quill(`#quillGuided_${idx}`, { theme: 'snow', modules: { toolbar } });
        if (contents[idx]) qEditor.root.innerHTML = contents[idx];
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
    if (!desc.value) return;
    tempActions.push({ type: document.getElementById('actionType').value, description: desc.value, date: document.getElementById('actionDate').value });
    desc.value = ''; renderLists();
});

document.getElementById('btnAddLink').addEventListener('click', () => {
    const t = document.getElementById('linkTitle'), u = document.getElementById('linkUrl');
    if (!t.value || !u.value) return;
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
        userId: auth.currentUser.uid,
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        continuationOf: document.getElementById('continuationOf').value || null,
        mainPassage: document.getElementById('mainPassage').value,
        recordType: document.getElementById('recordType').value,
        author: authorManager.getTags(),
        relatedPassages: document.getElementById('relatedPassages').value,
        keywords: tagManager.getTags(),
        recordFormat: isLivre ? 'livre' : 'orientado',
        content: isLivre ? { texto: editors.livre.root.innerHTML } : {
            questions: getGuidedData()
        },
        actions: tempActions,
        links: tempLinks,
        updatedAt: new Date().toISOString()
    };

    try {
        if (editId) {
            await updateDoc(doc(db, "devotionals", editId), data);
            showAlert("Atualizado com sucesso!");
        } else {
            data.createdAt = data.updatedAt;
            await addDoc(collection(db, "devotionals"), data);
            showAlert("Salvo com sucesso!");
            localStorage.removeItem('selah_draft_livre');
        }

        resetFormFields(); // Limpa o formulário silenciosamente
        fetchAll(); // Busca os dados atualizados sem piscar a tela

    } catch (err) {
        console.error("Erro ao salvar no Firestore:", err);
        showAlert("Ocorreu um erro ao salvar. Verifique o console (F12) para mais detalhes.");
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
        if (!val) { dropdown.style.display = 'none'; hidden.value = ''; return; }

        const matches = allRecords.filter(r =>
            (r.title && r.title.toLowerCase().includes(val)) ||
            (r.mainPassage && r.mainPassage.toLowerCase().includes(val))
        );

        if (matches.length > 0) {
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
        if (!e.target.closest('.autocomplete-container')) dropdown.style.display = 'none';
    });
};

// Global keyword index: maps lowercase key → original casing (first seen)
const globalKeywordIndex = new Map();
const globalAuthorIndex = new Map();

const buildIndices = () => {
    globalKeywordIndex.clear();
    globalAuthorIndex.clear();
    allRecords.forEach(r => {
        if (r.keywords) {
            r.keywords.forEach(k => {
                if (k && !globalKeywordIndex.has(k.toLowerCase())) {
                    globalKeywordIndex.set(k.toLowerCase(), k);
                }
            });
        }
        if (r.author) {
            if (typeof r.author === 'string' && r.author.trim() !== '') {
                const a = r.author.trim();
                if (!globalAuthorIndex.has(a.toLowerCase())) globalAuthorIndex.set(a.toLowerCase(), a);
            } else if (Array.isArray(r.author)) {
                r.author.forEach(a => {
                    if (a && !globalAuthorIndex.has(a.toLowerCase())) globalAuthorIndex.set(a.toLowerCase(), a);
                });
            }
        }
    });
};

// ── TagManager ──────────────────────────────────────────────────────────
class TagManager {
    constructor(config) {
        this.tags = [];          // array of lowercase strings
        this.activeIdx = -1;     // keyboard selection index in suggestions

        this.config = Object.assign({
            wrapperId: 'tagInputWrapper',
            chipsId: 'tagChips',
            inputId: 'tagInputField',
            sugListId: 'tagSuggestions',
            sectionId: 'keywordsSection',
            maxTags: 3,
            maxTagsMsg: "Você pode adicionar no máximo 3 palavras-chave.",
            indexMap: globalKeywordIndex,
            iconClass: 'ph-tag',
            placeholderMobile: "Adicionar palavras-chave..."
        }, config || {});

        this.wrapper = document.getElementById(this.config.wrapperId);
        this.chipsEl = document.getElementById(this.config.chipsId);
        this.input = document.getElementById(this.config.inputId);
        this.sugList = document.getElementById(this.config.sugListId);

        this._bind();
    }

    _bind() {
        if (window.innerWidth <= 768 && this.config.placeholderMobile) {
            this.input.placeholder = this.config.placeholderMobile;
        }

        this.wrapper.addEventListener('click', () => this.input.focus());
        this.input.addEventListener('input', () => this._onInput());
        this.input.addEventListener('keydown', (e) => this._onKeydown(e));
        document.addEventListener('click', (e) => {
            if (!e.target.closest(`#${this.config.sectionId}`)) this._hideSuggestions();
        });
    }

    _onInput() {
        const raw = this.input.value;
        if (raw.includes(',')) {
            const parts = raw.split(',');
            parts.slice(0, -1).forEach(p => this._addTag(p.trim()));
            this.input.value = parts[parts.length - 1].trim();
        }
        this._renderSuggestions(this.input.value.trim());
    }

    _onKeydown(e) {
        const val = this.input.value.trim();
        const items = this.sugList.querySelectorAll('.tag-suggestion-item');

        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (this.activeIdx >= 0 && items[this.activeIdx]) {
                this._acceptSuggestion(items[this.activeIdx].dataset.tag);
            } else if (val) {
                this._addTag(val);
                this.input.value = '';
                this._hideSuggestions();
            }
        } else if (e.key === 'Backspace' && val === '' && this.tags.length) {
            this._removeTag(this.tags.length - 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.activeIdx = Math.min(this.activeIdx + 1, items.length - 1);
            this._highlightSuggestion(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.activeIdx = Math.max(this.activeIdx - 1, -1);
            this._highlightSuggestion(items);
        } else if (e.key === 'Escape') {
            this._hideSuggestions();
        }
    }

    _renderSuggestions(query) {
        this.sugList.innerHTML = '';
        this.activeIdx = -1;
        if (!query) { this._hideSuggestions(); return; }

        const q = query.toLowerCase();
        const matches = Array.from(this.config.indexMap.entries())
            .filter(([key]) => key.includes(q) && !this.tags.includes(key))
            .slice(0, 8);

        if (matches.length === 0) { this._hideSuggestions(); return; }

        matches.forEach(([key, label]) => {
            const li = document.createElement('li');
            li.className = 'tag-suggestion-item';
            li.dataset.tag = key;
            const highlighted = label.replace(
                new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                '<mark>$1</mark>'
            );
            li.innerHTML = `<i class="ph ${this.config.iconClass}"></i>${highlighted}`;
            li.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this._acceptSuggestion(key);
            });
            this.sugList.appendChild(li);
        });

        this.sugList.style.display = 'block';
    }

    _highlightSuggestion(items) {
        items.forEach((el, i) => el.classList.toggle('active', i === this.activeIdx));
    }

    _hideSuggestions() {
        this.sugList.style.display = 'none';
        this.activeIdx = -1;
    }

    _acceptSuggestion(tagKey) {
        this._addTag(tagKey);
        this.input.value = '';
        this._hideSuggestions();
        this.input.focus();
    }

    _addTag(raw) {
        if (!raw) return;
        const key = raw.toLowerCase().trim();
        if (!key || this.tags.includes(key)) return;

        if (this.tags.length >= this.config.maxTags) {
            showAlert(this.config.maxTagsMsg);
            return;
        }

        if (!this.config.indexMap.has(key)) this.config.indexMap.set(key, raw.trim());

        this.tags.push(key);
        this._renderChips();
    }

    _removeTag(idx) {
        this.tags.splice(idx, 1);
        this._renderChips();
    }

    _renderChips() {
        this.chipsEl.innerHTML = '';
        this.tags.forEach((tag, i) => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            const label = this.config.indexMap.get(tag) || tag;
            chip.innerHTML = `${label}<button type="button" class="tag-chip-remove" title="Remover"><i class="ph ph-x"></i></button>`;
            chip.querySelector('.tag-chip-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this._removeTag(i);
            });
            this.chipsEl.appendChild(chip);
        });
    }

    getTags() { return [...this.tags]; }

    setTags(arr) {
        this.tags = arr.map(t => t.toLowerCase().trim()).filter(Boolean);
        this.tags.forEach(t => { if (!this.config.indexMap.has(t)) this.config.indexMap.set(t, t); });
        this._renderChips();
    }

    clear() {
        this.tags = [];
        this.input.value = '';
        this._renderChips();
        this._hideSuggestions();
    }
}

let tagManager;
let authorManager;

const fetchAll = async () => {
    // Pega o usuário logado atualmente no Firebase Auth
    const user = auth.currentUser;

    // Se por acaso não tiver ninguém logado, cancela a execução para evitar erros
    if (!user) return;

    // Busca apenas os registros que pertencem ao userId logado
    const q = query(
        collection(db, "devotionals"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
    );

    const snap = await getDocs(q);
    allRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    buildIndices();

    if (!tagManager) tagManager = new TagManager();
    if (!authorManager) authorManager = new TagManager({
        wrapperId: 'authorTagWrapper',
        chipsId: 'authorTagChips',
        inputId: 'authorInputField',
        sugListId: 'authorSuggestions',
        sectionId: 'authorSection',
        maxTags: 5,
        maxTagsMsg: "Você pode adicionar no máximo 5 autores.",
        indexMap: globalAuthorIndex,
        iconClass: 'ph-user',
        placeholderMobile: "Adicionar autores..."
    });
    initAutocomplete();
    renderFeed(allRecords);
    renderChart(allRecords);
};

const renderFeed = (arr) => {
    const feed = document.getElementById('devotionalsFeed');
    feed.innerHTML = arr.map(r => {
        const keywordChips = (r.keywords && r.keywords.length)
            ? `<div class="card-keywords">${r.keywords.map(k => `<span class="card-tag">${globalKeywordIndex.get(k) || k}</span>`).join('')}</div>`
            : '';
        return `
        <div class="card" onclick="viewRecord('${r.id}')" style="cursor: pointer; transition: 0.2s;">
            <h3 class="card-title">${r.title ? r.title : r.mainPassage}</h3>
            ${r.title ? `<div class="card-passage">${r.mainPassage}</div>` : ''}
            <div class="card-meta">${r.date.split('-').reverse().join('/')} | ${r.recordType}</div>
            ${keywordChips}
        </div>`;
    }).join('');
};

// --- CRUD: ACOES DOS CARDS ---
window.viewRecord = (id) => {
    const r = allRecords.find(x => x.id === id);
    document.getElementById('viewTitle').innerText = r.title ? r.title : r.mainPassage;

    let html = '<div class="view-meta-grid">';
    
    html += `<div class="meta-item"><span class="meta-label">Data</span><span class="meta-value">${r.date.split('-').reverse().join('/')}</span></div>`;
    html += `<div class="meta-item"><span class="meta-label">Tipo</span><span class="meta-value tag uppercase">${r.recordType}</span></div>`;
    
    if (r.author) {
        const authorsArr = Array.isArray(r.author) ? r.author.map(a => globalAuthorIndex.get(a) || a) : [r.author];
        if (authorsArr.length > 0 && authorsArr[0] !== '') {
            html += `<div class="meta-item full-width"><span class="meta-label">Autor(es)</span><span class="meta-value capitalize">${authorsArr.join(', ')}</span></div>`;
        }
    }
    
    if (r.title && r.mainPassage) {
        html += `<div class="meta-item full-width"><span class="meta-label">Passagem</span><span class="meta-value capitalize">${r.mainPassage}</span></div>`;
    }
    
    if (r.relatedPassages) {
        html += `<div class="meta-item full-width"><span class="meta-label">Passagens Relacionadas</span><span class="meta-value capitalize">${r.relatedPassages}</span></div>`;
    }

    if (r.keywords && r.keywords.length > 0) {
        const keywordHtml = r.keywords.map(k => `<span class="meta-value tag capitalize">${globalKeywordIndex.get(k) || k}</span>`).join('');
        html += `<div class="meta-item full-width"><span class="meta-label">Palavras-chave</span><div style="display:flex; gap:5px; flex-wrap:wrap;">${keywordHtml}</div></div>`;
    }
    
    html += '</div>';

    // Lógica de Trilha (Chain Logic)
    let chainBack = [], chainForward = [];
    let curr = r;
    while (curr.continuationOf) {
        let parent = allRecords.find(x => x.id === curr.continuationOf);
        if (!parent) break;
        chainBack.unshift(parent);
        curr = parent;
    }
    curr = r;
    while (true) {
        let child = allRecords.find(x => x.continuationOf === curr.id);
        if (!child) break;
        chainForward.push(child);
        curr = child;
    }
    const fullChain = [...chainBack, r, ...chainForward];
    if (fullChain.length > 1) {
        html += `
        <details class="chain-details mt-2 mb-4">
            <summary>
                <i class="ph ph-caret-down"></i>
                <span>Trilha de Registros (${fullChain.length})</span>
            </summary>
            <div class="chain-list">
                ${fullChain.map((item, idx) => {
                    const isCurrent = item.id === r.id;
                    const tagHtml = isCurrent ?
                        `<span class="tag" style="background:var(--primary-color);color:var(--bg-color);font-weight:600;">${item.title || item.mainPassage}</span>` :
                        `<a href="#" onclick="viewRecord('${item.id}'); return false;" class="tag">${item.title || item.mainPassage}</a>`;
                    
                    return `
                    <div class="chain-item">
                        <span class="chain-number">${idx + 1}.</span>
                        ${tagHtml}
                    </div>`;
                }).join('')}
            </div>
        </details>`;
    }

    html += '<div class="view-content-area">';
    if (r.recordFormat === 'livre') {
        html += `<div>${r.content.texto}</div>`;
    } else {
        if (r.content.questions) {
            r.content.questions.forEach(q => {
                if (q.a && q.a !== '<p><br></p>') {
                    html += `<h4>${q.q}</h4><div>${q.a}</div>`;
                }
            });
        } else {
            // Legado
            const qs = ["Contexto", "Sobre o que fala", "Revela sobre Deus", "Revela sobre o Homem", "Aplicação"];
            [r.content.c1, r.content.c2, r.content.c3, r.content.c4, r.content.c5].forEach((c, i) => {
                if (c && c !== '<p><br></p>') html += `<h4>${qs[i]}</h4><div>${c}</div>`;
            });
        }
    }

    if (r.links?.length) html += `<h4 class="mt-4">Links</h4>` + r.links.map(l => `<a href="${l.url}" target="_blank" class="tag">${l.title}</a>`).join('');
    html += '</div>';

    document.getElementById('viewBody').innerHTML = html;

    // Injeta os botões de ação (Lápis e Lixeira) no cabeçalho do modal
    document.getElementById('viewModalActions').innerHTML = `
        <button type="button" onclick="editRecord('${r.id}')" class="btn-icon" title="Editar"><i class="ph ph-pencil"></i></button>
        <button type="button" onclick="deleteRecord('${r.id}')" class="btn-icon text-danger" title="Excluir"><i class="ph ph-trash"></i></button>
    `;

    document.getElementById('viewModal').showModal();
};

window.editRecord = (id) => {
    // Fecha o modal de visualização antes de rolar para cima para edição
    const modal = document.getElementById('viewModal');
    if (modal.open) modal.close();

    const r = allRecords.find(x => x.id === id);
    document.getElementById('editId').value = r.id;
    document.getElementById('formTitle').innerText = "Editando Registro";
    document.getElementById('title').value = r.title || '';
    document.getElementById('date').value = r.date;

    document.getElementById('continuationOf').value = r.continuationOf || '';
    if (r.continuationOf) {
        const parent = allRecords.find(x => x.id === r.continuationOf);
        if (parent) document.getElementById('continuationSearch').value = parent.title || parent.mainPassage;
    } else {
        document.getElementById('continuationSearch').value = '';
    }

    document.getElementById('mainPassage').value = r.mainPassage;
    document.getElementById('recordType').value = r.recordType;
    document.getElementById('relatedPassages').value = r.relatedPassages || '';

    let authorsArr = [];
    if (Array.isArray(r.author)) {
        authorsArr = r.author;
    } else if (typeof r.author === 'string' && r.author.trim() !== '') {
        authorsArr = [r.author.trim()];
    }
    authorManager.setTags(authorsArr);
    
    tagManager.setTags(r.keywords || []);

    if (r.recordFormat === 'livre') {
        document.querySelector('[data-type="livre"]').click();
        editors.livre.root.innerHTML = r.content.texto;
    } else {
        document.querySelector('[data-type="orientado"]').click();
        if (r.content.questions) {
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

    // Rola até o topo e abre o accordion de Novo Registro caso esteja fechado
    document.querySelector('.collapsible-section[open]') || document.querySelector('.collapsible-section').setAttribute('open', '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteRecord = async (id) => {
    if (await showConfirm("Deseja realmente excluir este registro?")) {
        await deleteDoc(doc(db, "devotionals", id));

        // Fecha o modal caso a exclusão seja feita por lá
        const modal = document.getElementById('viewModal');
        if (modal.open) modal.close();

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
    if (match) return match[1].trim();
    return "Outros";
};

const renderChart = (arr) => {
    const typeCounts = arr.reduce((acc, r) => { acc[r.recordType] = (acc[r.recordType] || 0) + 1; return acc; }, {});
    const bookCounts = arr.reduce((acc, r) => {
        if (r.mainPassage) {
            const b = extractBibleBook(r.mainPassage);
            acc[b] = (acc[b] || 0) + 1;
        }
        return acc;
    }, {});

    if (typeChart) typeChart.destroy();
    typeChart = new Chart(document.getElementById('devotionalsChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#3b82f6'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });

    if (booksChartInstance) booksChartInstance.destroy();
    const sortedBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
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
        if (t && r.recordType !== t) match = false;
        if (k && !(r.mainPassage.toLowerCase().includes(k) || (r.title && r.title.toLowerCase().includes(k)) || r.keywords?.some(kw => kw.includes(k)))) match = false;
        if (author && (!r.author || !r.author.toLowerCase().includes(author))) match = false;
        if (dStart && r.date < dStart) match = false;
        if (dEnd && r.date > dEnd) match = false;
        return match;
    });
    renderFeed(filtered);
};

document.getElementById('btnRandom').onclick = () => {
    if (allRecords.length === 0) return showAlert("Nenhum registro encontrado.");
    const randomIdx = Math.floor(Math.random() * allRecords.length);
    viewRecord(allRecords[randomIdx].id);
};

// --- CONFIGURAÇÃO PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}