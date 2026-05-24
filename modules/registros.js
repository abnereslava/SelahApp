import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let db;
let auth;

export function render(container) {
    container.innerHTML = `
        <details class="collapsible-section" open>
            <summary class="collapsible-summary">
                <div class="summary-content">
                    <i class="ph ph-note-pencil"></i>
                    <span>Novo Registro</span>
                </div>
                <i class="ph ph-caret-down caret-icon"></i>
            </summary>
            <main class="form-container">
                <form id="devotionalForm">
                    <input type="hidden" id="editId">

                    <div class="form-group">
                        <label for="title"><i class="ph ph-text-t"></i> Título do Registro</label>
                        <input type="text" id="title" placeholder="Ex: O Bom Pastor" required>
                    </div>

                    <div class="form-group date-group">
                        <label for="date"><i class="ph ph-calendar-blank"></i> Data</label>
                        <input type="date" id="date" required>
                    </div>

                    <div class="form-group autocomplete-container">
                        <label for="continuationSearch"><i class="ph ph-link"></i> Continuação de...</label>
                        <input type="text" id="continuationSearch"
                            placeholder="Buscar título do registro anterior..." autocomplete="off">
                        <input type="hidden" id="continuationOf">
                        <ul id="continuationDropdown" class="autocomplete-list" style="display:none;"></ul>
                    </div>

                    <div class="form-group">
                        <label for="mainPassage"><i class="ph ph-bookmark-simple"></i> Passagem Principal</label>
                        <input type="text" id="mainPassage" placeholder="Ex: João 3:16" required>
                    </div>

                    <div class="form-group">
                        <label for="recordType"><i class="ph ph-tag"></i> Tipo de Registro</label>
                        <select id="recordType" required>
                            <option value="devocional">Devocional</option>
                            <option value="culto_domestico">Culto Doméstico</option>
                            <option value="aula">Aula</option>
                            <option value="ebd">EBD</option>
                            <option value="pregacao">Pregação</option>
                            <option value="anotacoes_gerais">Anotações Gerais</option>
                            <option value="outros">Outros</option>
                        </select>
                    </div>

                    <details class="optional-fields" id="authorSection">
                        <summary><i class="ph ph-user"></i> Autoria</summary>
                        <div class="details-content">
                            <div class="tag-input-wrapper" id="authorTagWrapper">
                                <div class="tag-chips" id="authorTagChips"></div>
                                <input type="text" id="authorInputField" class="tag-input-field"
                                    placeholder="Adicione autores separados por vírgula..."
                                    autocomplete="off">
                            </div>
                            <ul id="authorSuggestions" class="tag-suggestions-list" style="display:none;"></ul>
                        </div>
                    </details>
                    <details class="optional-fields">
                        <summary><i class="ph ph-bookmarks"></i> Passagens Relacionadas</summary>
                        <div class="details-content"><input type="text" id="relatedPassages"
                                placeholder="Ex: Romanos 5:8"></div>
                    </details>
                    <details class="optional-fields" id="keywordsSection">
                        <summary><i class="ph ph-tag"></i> Palavras-chave</summary>
                        <div class="details-content">
                            <div class="tag-input-wrapper" id="tagInputWrapper">
                                <div class="tag-chips" id="tagChips"></div>
                                <input type="text" id="tagInputField" class="tag-input-field"
                                    placeholder="Adicione até três palavras-chave, separadas por vírgula..."
                                    autocomplete="off">
                            </div>
                            <ul id="tagSuggestions" class="tag-suggestions-list" style="display:none;"></ul>
                        </div>
                    </details>

                    <hr class="divider">

                    <div class="form-group">
                        <label><i class="ph ph-pen-nib"></i> Formato do Registro</label>
                        <div class="toggle-group">
                            <button type="button" class="btn-toggle active" data-type="livre">Livre</button>
                            <button type="button" class="btn-toggle" data-type="orientado">Perguntas Orientadoras</button>
                        </div>
                    </div>

                    <div id="freeRecordContainer" class="record-section active">
                        <div class="guided-question">
                            <div id="quillEditorLivre" class="editor-container"></div>
                        </div>
                    </div>

                    <div id="guidedRecordContainer" class="record-section">
                        <div id="dynamicQuestionsContainer">
                        </div>
                        <button type="button" id="btnAddQuestion" class="btn-secondary mt-2"><i
                                class="ph ph-plus"></i> Adicionar Pergunta</button>
                    </div>

                    <div class="action-buttons">
                        <button type="button" class="btn-secondary" id="btnOpenActionsModal"><i
                                class="ph ph-list-plus"></i> Ações e Links</button>
                        <button type="submit" class="btn-primary" id="btnSubmit"><i
                                class="ph ph-floppy-disk"></i> Salvar na Nuvem</button>
                        <button type="button" class="btn-secondary" id="btnCancelEdit"
                            style="display: none;">Cancelar Edição</button>
                    </div>
                </form>
            </main>
        </details>

        <details class="collapsible-section">
            <summary class="collapsible-summary">
                <div class="summary-content">
                    <i class="ph ph-books"></i>
                    <span>Meus Registros</span>
                </div>
                <i class="ph ph-caret-down caret-icon"></i>
            </summary>
            <main class="data-container mt-4">
                <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
                    <details class="optional-fields" style="border: 1px solid var(--border-color); border-radius: var(--radius); flex: 1; min-width: 280px; margin: 0; background: var(--secondary-color);">
                        <summary style="font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; padding: 12px; cursor: pointer; color: var(--text-muted);"><i class="ph ph-funnel"></i> Filtrar e Buscar Registros</summary>
                        <div class="details-content" style="padding: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px;">
                            <input type="text" id="filterKeyword" placeholder="Buscar termo ou passagem" style="width: 100%;">
                            <select id="filterType" style="width: 100%;">
                                <option value="">Todos os Tipos</option>
                                <option value="devocional">Devocional</option>
                                <option value="culto_domestico">Culto Doméstico</option>
                                <option value="aula">Aula</option>
                                <option value="ebd">EBD</option>
                                <option value="pregacao">Pregação</option>
                                <option value="anotacoes_gerais">Anotações Gerais</option>
                                <option value="outros">Outros</option>
                            </select>
                            <div class="filter-dates" style="display: flex; gap: 10px; width: 100%;">
                                <input type="date" id="filterDateStart" title="Data Inicial" style="flex: 1;">
                                <input type="date" id="filterDateEnd" title="Data Final" style="flex: 1;">
                            </div>
                            <input type="text" id="filterAuthor" placeholder="Filtrar por autor" style="width: 100%;">
                            <button type="button" id="btnApplyFilters" class="btn-primary" style="width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-funnel"></i> Aplicar Filtros</button>
                        </div>
                    </details>
                    <button type="button" id="btnRandom" class="btn-secondary" style="height: 48px; border-radius: var(--radius); display: flex; align-items: center; gap: 8px; justify-content: center; padding: 0 20px; font-weight: 500; margin: 0;" title="Sortear Devocional Aleatório">
                        <i class="ph ph-shuffle"></i> Sortear Registro
                    </button>
                </div>

                <div id="devotionalsFeed" class="feed-grid mt-4"></div>
            </main>
        </details>

        <details class="collapsible-section">
            <summary class="collapsible-summary">
                <div class="summary-content">
                    <i class="ph ph-chart-pie"></i>
                    <span>Estatísticas</span>
                </div>
                <i class="ph ph-caret-down caret-icon"></i>
            </summary>
            <div class="stats-container">
                <div class="charts-grid mt-4">
                    <div class="chart-wrapper">
                        <h3 class="chart-title">Por Tipo de Registro</h3>
                        <canvas id="devotionalsChart"></canvas>
                    </div>
                    <div class="chart-wrapper">
                        <h3 class="chart-title">Livros Mais Frequentes</h3>
                        <canvas id="booksChart"></canvas>
                    </div>
                </div>
            </div>
        </details>

        <!-- Modais associados a esta aba -->
        <dialog id="actionsModal" class="modal modal-lg">
            <div class="modal-content">
                <header class="modal-header">
                    <h2>Ações e Links</h2>
                    <button type="button" onclick="this.closest('dialog').close()" class="btn-icon"><i
                            class="ph ph-x"></i></button>
                </header>
                <div class="modal-body dual-panel">
                    <div class="panel-section">
                        <h3><i class="ph ph-list-checks"></i> Ações</h3>
                        <div class="inline-form">
                            <select id="actionType" class="compact-select">
                                <option value="pedidos_oracao">Oração</option>
                                <option value="acoes_pessoas">Prática</option>
                                <option value="metas_espirituais">Meta</option>
                                <option value="gratidao">Gratidão</option>
                                <option value="jejum">Jejum</option>
                                <option value="outros">Lembrete</option>
                            </select>
                            <input type="text" id="actionDesc" placeholder="O que fazer?">
                            <input type="date" id="actionDate" class="compact-date">
                            <button type="button" id="btnAddAction" class="btn-secondary btn-compact" title="Inserir"><i
                                    class="ph ph-plus"></i></button>
                        </div>
                        <ul id="actionsListDOM" class="modern-item-list"></ul>
                    </div>
                    <hr class="divider mobile-only">
                    <div class="panel-section">
                        <h3><i class="ph ph-link"></i> Links Relacionados</h3>
                        <div class="inline-form">
                            <input type="text" id="linkTitle" placeholder="Título do link">
                            <input type="url" id="linkUrl" placeholder="https://...">
                            <button type="button" id="btnAddLink" class="btn-secondary btn-compact" title="Inserir"><i
                                    class="ph ph-plus"></i></button>
                        </div>
                        <ul id="linksListDOM" class="modern-item-list"></ul>
                    </div>
                </div>
            </div>
        </dialog>

        <dialog id="viewModal" class="modal view-modal">
            <div class="modal-content">
                <header class="modal-header" style="flex-direction: column; align-items: stretch;">
                    <div style="display: flex; justify-content: flex-end; align-items: center; width: 100%;">
                        <div id="viewModalActions" style="display: flex; gap: 12px; margin-right: 15px;"></div>
                        <button type="button" onclick="this.closest('dialog').close()" class="btn-icon"><i class="ph ph-x"></i></button>
                    </div>
                    <h2 id="viewTitle" style="margin-top: 5px;">Título do Devocional</h2>
                </header>
                <div id="viewBody" class="modal-body read-content">
                </div>
            </div>
        </dialog>

        <dialog id="editQuestionModal" class="modal modal-sm">
            <div class="modal-content">
                <header class="modal-header" style="margin-bottom: 15px;">
                    <h2 style="font-size: 1.3rem; color: var(--primary-color);"><i class="ph ph-pencil-simple"></i>
                        Editar Pergunta</h2>
                    <button type="button" onclick="this.closest('dialog').close()" class="btn-icon"
                        style="padding:0; font-size:1.4rem;"><i class="ph ph-x"></i></button>
                </header>
                <textarea id="editQuestionTextarea" rows="4"
                    style="width: 100%; border: 1px solid var(--border-color); background: var(--secondary-color); color: var(--text-main); border-radius: 8px; padding: 12px; font-family: inherit; font-size: 1rem; resize: none; outline: none;"></textarea>
                <div class="modal-actions mt-4 dual-panel-horizontal">
                    <button type="button" onclick="this.closest('dialog').close()"
                        class="btn-secondary">Cancelar</button>
                    <button type="button" id="btnSaveQuestion" class="btn-primary">Salvar</button>
                </div>
            </div>
        </dialog>
    `;
}

export function init(firebaseDb, firebaseAuth) {
    db = firebaseDb;
    auth = firebaseAuth;

    // --- UTILITÁRIOS INTERNOS ---
    const showAlert = (msg) => {
        const modal = document.getElementById('customAlertModal');
        if (modal) {
            document.getElementById('customAlertMessage').innerText = msg;
            modal.showModal();
        } else {
            alert(msg);
        }
    };

    const showConfirm = (msg) => {
        return new Promise((resolve) => {
            const modal = document.getElementById('customConfirmModal');
            if (!modal) {
                resolve(confirm(msg));
                return;
            }
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

    const setTodayDate = () => {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
    };
    setTodayDate();

    const resetFormFields = () => {
        const form = document.getElementById('devotionalForm');
        if (!form) return;
        form.reset();
        document.getElementById('editId').value = "";
        document.getElementById('continuationOf').value = "";
        document.getElementById('continuationSearch').value = "";
        document.getElementById('btnCancelEdit').style.display = 'none';
        document.getElementById('btnSubmit').innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar na Nuvem';
        document.getElementById('formTitle').innerText = "Novo Registro";

        // Limpa editores e arrays
        const draft = localStorage.getItem('selah_draft_livre');
        if (editors.livre) {
            editors.livre.root.innerHTML = draft ? draft : "<p><br></p>";
        }
        renderGuidedQuestions(); // Reseta para as perguntas padrão
        tempActions = [];
        tempLinks = [];
        renderLists();
        setTodayDate();
        if (tagManager) tagManager.clear();
        if (authorManager) authorManager.clear();
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
    if (savedDraft && editors.livre) {
        editors.livre.root.innerHTML = savedDraft;
    }

    if (editors.livre) {
        editors.livre.on('text-change', () => {
            const editId = document.getElementById('editId');
            if (editId && !editId.value) {
                localStorage.setItem('selah_draft_livre', editors.livre.root.innerHTML);
            }
        });
    }

    // --- MOBILE FLOATING TOOLBAR LOGIC ---
    const mobileToolbar = document.getElementById('mobileQuillToolbar');
    
    const setupMobileToolbarForEditor = (qEditor) => {
        if (!mobileToolbar) return;

        qEditor.on('selection-change', (range) => {
            if (window.innerWidth > 768) return; // only for mobile!

            if (range) {
                // Editor gained focus
                window.activeQuillEditor = qEditor;
                
                // Hide bottom nav to avoid clashing
                const bottomNav = document.getElementById('mobileBottomNav');
                if (bottomNav) bottomNav.style.display = 'none';
                
                // Show mobile toolbar docked at bottom
                mobileToolbar.style.display = 'flex';
                
                // Update button format states
                const format = qEditor.getFormat(range);
                mobileToolbar.querySelectorAll('button').forEach(btn => {
                    const f = btn.dataset.format;
                    const v = btn.dataset.value;
                    if (f === 'clean') return;
                    let isActive = false;
                    if (v) isActive = (format[f] == v);
                    else isActive = format[f];
                    btn.classList.toggle('active-format', !!isActive);
                });
            } else {
                // Editor lost focus (blur)
                setTimeout(() => {
                    // Check if another editor took focus, or if we really lost focus
                    if (window.activeQuillEditor === qEditor && !qEditor.hasFocus()) {
                        mobileToolbar.style.display = 'none';
                        const bottomNav = document.getElementById('mobileBottomNav');
                        if (bottomNav) bottomNav.style.display = 'flex';
                        window.activeQuillEditor = null;
                        
                        // Also reset color toggle groups
                        const ftColorGroup = document.getElementById('ftColorGroup');
                        const ftMainGroup = document.getElementById('ftMainGroup');
                        if (ftColorGroup) ftColorGroup.style.display = 'none';
                        if (ftMainGroup) ftMainGroup.style.display = 'flex';
                    }
                }, 150);
            }
        });
    };

    if (editors.livre) {
        setupMobileToolbarForEditor(editors.livre);
    }

    if (mobileToolbar && !window.mobileToolbarListenersBound) {
        window.mobileToolbarListenersBound = true;
        const ftMainGroup = document.getElementById('ftMainGroup');
        const ftColorGroup = document.getElementById('ftColorGroup');

        const handleFormatBtn = (e, btn) => {
            e.preventDefault(); 
            if (!window.activeQuillEditor) return;
            const activeEditor = window.activeQuillEditor;
            
            // Retain focus on editor
            activeEditor.focus();
            
            const f = btn.dataset.format;
            const v = btn.dataset.value;
            const range = activeEditor.getSelection();
            if (!range) return;
            
            if (f === 'clean') {
                activeEditor.removeFormat(range.index, range.length);
            } else {
                const currentFormat = activeEditor.getFormat(range);
                if (v) {
                    activeEditor.format(f, currentFormat[f] == v ? false : v);
                } else {
                    activeEditor.format(f, !currentFormat[f]);
                }
            }
            
            if (f === 'color') {
                ftColorGroup.style.display = 'none';
                ftMainGroup.style.display = 'flex';
            }
            
            // Update button active states
            setTimeout(() => {
                const newRange = activeEditor.getSelection();
                if (newRange) {
                    const format = activeEditor.getFormat(newRange);
                    mobileToolbar.querySelectorAll('button').forEach(b => {
                        const bf = b.dataset.format;
                        const bv = b.dataset.value;
                        if (bf === 'clean') return;
                        let isActive = false;
                        if (bv) isActive = (format[bf] == bv);
                        else isActive = format[bf];
                        b.classList.toggle('active-format', !!isActive);
                    });
                }
            }, 50);
        };

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

    window.handleQuestionClick = (idx, inputEl) => {
        if (window.innerWidth <= 768) {
            inputEl.blur();
            const modal = document.getElementById('editQuestionModal');
            const textarea = document.getElementById('editQuestionTextarea');
            textarea.value = inputEl.value;
            modal.showModal();

            document.getElementById('btnSaveQuestion').onclick = () => {
                inputEl.value = textarea.value;
                modal.close();
            };
        }
    };

    const renderGuidedQuestions = (questionsToRender = defaultQuestions, contents = []) => {
        const container = document.getElementById('dynamicQuestionsContainer');
        if (!container) return;
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
            setupMobileToolbarForEditor(qEditor);
        });
    };

    window.removeGuidedQuestion = (idx) => {
        const currentData = getGuidedData();
        currentData.splice(idx, 1);
        renderGuidedQuestions(currentData.map(d => d.q), currentData.map(d => d.a));
    };

    const btnAddQuestion = document.getElementById('btnAddQuestion');
    if (btnAddQuestion) {
        btnAddQuestion.addEventListener('click', () => {
            const currentData = getGuidedData();
            currentData.push({ q: "Nova pergunta orientadora?", a: "" });
            renderGuidedQuestions(currentData.map(d => d.q), currentData.map(d => d.a));
        });
    }

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
    const btnOpenActionsModal = document.getElementById('btnOpenActionsModal');
    if (btnOpenActionsModal) {
        btnOpenActionsModal.addEventListener('click', () => {
            document.getElementById('actionsModal').showModal();
        });
    }

    let tempActions = [], tempLinks = [];
    const renderLists = () => {
        const aList = document.getElementById('actionsListDOM');
        const lList = document.getElementById('linksListDOM');
        if (!aList || !lList) return;

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

    const btnAddAction = document.getElementById('btnAddAction');
    if (btnAddAction) {
        btnAddAction.addEventListener('click', () => {
            const desc = document.getElementById('actionDesc');
            if (!desc.value) return;
            tempActions.push({ type: document.getElementById('actionType').value, description: desc.value, date: document.getElementById('actionDate').value });
            desc.value = ''; renderLists();
        });
    }

    const btnAddLink = document.getElementById('btnAddLink');
    if (btnAddLink) {
        btnAddLink.addEventListener('click', () => {
            const t = document.getElementById('linkTitle'), u = document.getElementById('linkUrl');
            if (!t.value || !u.value) return;
            tempLinks.push({ title: t.value, url: u.value });
            t.value = ''; u.value = ''; renderLists();
        });
    }

    // --- CRUD: SALVAR E ATUALIZAR ---
    const devForm = document.getElementById('devotionalForm');
    if (devForm) {
        devForm.addEventListener('submit', async (e) => {
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

                resetFormFields();
                fetchAll();
            } catch (err) {
                console.error("Erro ao salvar no Firestore:", err);
                showAlert("Ocorreu um erro ao salvar. Verifique o console (F12) para mais detalhes.");
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // --- CRUD: BUSCAR E RENDERIZAR ---
    let allRecords = [];

    const initAutocomplete = () => {
        const input = document.getElementById('continuationSearch');
        const dropdown = document.getElementById('continuationDropdown');
        const hidden = document.getElementById('continuationOf');
        if (!input || !dropdown || !hidden) return;

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

    // --- TagManager ---
    class TagManager {
        constructor(config) {
            this.tags = [];
            this.activeIdx = -1;

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

            if (this.wrapper && this.input) {
                this._bind();
            }
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
        try {
            const user = auth.currentUser;
            if (!user) return;

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
        } catch (err) {
            console.error("Erro ao carregar devocionais em fetchAll:", err);
        }
    };

    const renderFeed = (arr) => {
        const feed = document.getElementById('devotionalsFeed');
        if (!feed) return;
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
    window.viewRecord = (id, fromTrail = false) => {
        const prevDetails = document.querySelector('.chain-details');
        const wasOpen = fromTrail && prevDetails ? prevDetails.hasAttribute('open') : false;

        const r = allRecords.find(x => x.id === id);
        if (!r) return;
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
            <details class="chain-details mt-2 mb-4" ${wasOpen ? 'open' : ''}>
                <summary>
                    <i class="ph ph-caret-down"></i>
                    <span>Trilha de Registros (${fullChain.length})</span>
                </summary>
                <div class="chain-list">
                    ${fullChain.map((item, idx) => {
                        const isCurrent = item.id === r.id;
                        const tagHtml = isCurrent ?
                            `<span class="tag" style="background:var(--primary-color);color:var(--bg-color);font-weight:600;">${item.title || item.mainPassage}</span>` :
                            `<a href="#" onclick="viewRecord('${item.id}', true); return false;" class="tag">${item.title || item.mainPassage}</a>`;
                        
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

        document.getElementById('viewModalActions').innerHTML = `
            <button type="button" onclick="editRecord('${r.id}')" class="btn-icon" title="Editar"><i class="ph ph-pencil"></i></button>
            <button type="button" onclick="deleteRecord('${r.id}')" class="btn-icon text-danger" title="Excluir"><i class="ph ph-trash"></i></button>
        `;

        document.getElementById('viewModal').showModal();
    };

    window.editRecord = (id) => {
        const modal = document.getElementById('viewModal');
        if (modal && modal.open) modal.close();

        const r = allRecords.find(x => x.id === id);
        if (!r) return;
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
            if (editors.livre) editors.livre.root.innerHTML = r.content.texto;
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

        const coll = document.querySelector('.collapsible-section');
        if (coll && !coll.hasAttribute('open')) {
            coll.setAttribute('open', '');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteRecord = async (id) => {
        if (await showConfirm("Deseja realmente excluir este registro?")) {
            await deleteDoc(doc(db, "devotionals", id));

            const modal = document.getElementById('viewModal');
            if (modal && modal.open) modal.close();

            fetchAll();
        }
    };

    const btnCancelEdit = document.getElementById('btnCancelEdit');
    if (btnCancelEdit) {
        btnCancelEdit.onclick = () => {
            resetFormFields();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

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

        const typeCanvas = document.getElementById('devotionalsChart');
        if (typeCanvas) {
            if (typeChart) typeChart.destroy();
            typeChart = new Chart(typeCanvas, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(typeCounts),
                    datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#3b82f6'] }]
                },
                options: { plugins: { legend: { position: 'bottom' } } }
            });
        }

        const booksCanvas = document.getElementById('booksChart');
        if (booksCanvas) {
            if (booksChartInstance) booksChartInstance.destroy();
            const sortedBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
            booksChartInstance = new Chart(booksCanvas, {
                type: 'bar',
                data: {
                    labels: sortedBooks.map(b => b[0]),
                    datasets: [{ label: 'Qtd de Registros', data: sortedBooks.map(b => b[1]), backgroundColor: '#3b82f6' }]
                },
                options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });
        }
    };

    // --- FILTROS E BUSCA ---
    const btnApplyFilters = document.getElementById('btnApplyFilters');
    if (btnApplyFilters) {
        btnApplyFilters.onclick = () => {
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
    }

    const btnRandom = document.getElementById('btnRandom');
    if (btnRandom) {
        btnRandom.onclick = () => {
            if (allRecords.length === 0) return showAlert("Nenhum registro encontrado.");
            const randomIdx = Math.floor(Math.random() * allRecords.length);
            viewRecord(allRecords[randomIdx].id);
        };
    }

    // Inicialização da busca de dados
    fetchAll();
}
