import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, limit, orderBy, query, startAfter, updateDoc, where, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let db;
let auth;

export function render(container) {
    container.innerHTML = `
        <div class="tab-page-header">
            <h2 class="tab-page-title"><i class="ph ph-notebook"></i> Registros</h2>
        </div>
        <!-- Stats Card -->
        <div class="stats-card" id="statsCardRegistros">
            <div class="stats-card-header" id="statsCardRegistrosHeader" style="cursor:pointer;justify-content:center;">
                <div class="stats-quick">
                    <div class="stats-quick-item">
                        <span class="stats-quick-number" id="statsTotalReg">0</span>
                        <span class="stats-quick-label">Total</span>
                    </div>
                    <div class="stats-quick-item">
                        <span class="stats-quick-number" id="statsMonthReg">0</span>
                        <span class="stats-quick-label">Este mês</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros + Feed -->
        <div class="data-container mt-4">
            <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
                <details class="optional-fields" style="border: 1px solid var(--border-color); border-radius: var(--radius); flex: 1; min-width: 280px; margin: 0;">
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
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-muted); cursor: pointer;">
                            <input type="checkbox" id="filterFavorites" style="width: auto; accent-color: var(--primary-color);">
                            <i class="ph ph-star" style="color:#3D6FA3;"></i> Apenas favoritos
                        </label>
                        <button type="button" id="btnApplyFilters" class="btn-primary" style="width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-funnel"></i> Aplicar Filtros</button>
                        <button type="button" id="btnClearFilters" class="btn-clear-filters" style="display: none;"><i class="ph ph-x-circle"></i> Limpar Filtros</button>
                    </div>
                </details>
                <button type="button" id="btnRandom" class="btn-secondary" style="height: 48px; border-radius: var(--radius); display: flex; align-items: center; gap: 8px; justify-content: center; padding: 0 20px; font-weight: 500; margin: 0;" title="Sortear Devocional Aleatório">
                    <i class="ph ph-shuffle"></i> Sortear Registro
                </button>
            </div>

            <div id="devotionalsFeed" class="feed-grid mt-4"></div>
            <div id="devotionalsSentinel"></div>
        </div>

        <!-- Modais associados a esta aba -->
        <dialog id="actionsModal" class="modal modal-lg">
            <div class="modal-content">
                <header class="modal-header">
                    <h2>Ações e Links</h2>
                    <button type="button" onclick="this.closest('dialog').close()" class="btn-icon"><i class="ph ph-x"></i></button>
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
                            <button type="button" id="btnAddAction" class="btn-secondary btn-compact" title="Inserir"><i class="ph ph-plus"></i></button>
                        </div>
                        <ul id="actionsListDOM" class="modern-item-list"></ul>
                    </div>
                    <hr class="divider mobile-only">
                    <div class="panel-section">
                        <h3><i class="ph ph-link"></i> Links Relacionados</h3>
                        <div class="inline-form">
                            <input type="text" id="linkTitle" placeholder="Título do link">
                            <input type="url" id="linkUrl" placeholder="https://...">
                            <button type="button" id="btnAddLink" class="btn-secondary btn-compact" title="Inserir"><i class="ph ph-plus"></i></button>
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
                <div id="viewBody" class="modal-body read-content"></div>
            </div>
        </dialog>

        <dialog id="editQuestionModal" class="modal modal-sm">
            <div class="modal-content">
                <header class="modal-header" style="margin-bottom: 15px;">
                    <h2 style="font-size: 1.3rem; color: var(--primary-color);"><i class="ph ph-pencil-simple"></i> Editar Pergunta</h2>
                    <button type="button" onclick="this.closest('dialog').close()" class="btn-icon" style="padding:0; font-size:1.4rem;"><i class="ph ph-x"></i></button>
                </header>
                <textarea id="editQuestionTextarea" rows="4"
                    style="width: 100%; border: 1px solid var(--border-color); background: var(--secondary-color); color: var(--text-main); border-radius: 8px; padding: 12px; font-family: inherit; font-size: 1rem; resize: none; outline: none;"></textarea>
                <div class="modal-actions mt-4 dual-panel-horizontal">
                    <button type="button" onclick="this.closest('dialog').close()" class="btn-secondary">Cancelar</button>
                    <button type="button" id="btnSaveQuestion" class="btn-primary">Salvar</button>
                </div>
            </div>
        </dialog>

        <!-- Create / Edit Overlay -->
        <div class="create-overlay" id="createRegistrosOverlay">
            <div class="overlay-dialog">
            <div class="create-overlay-header">
                <button type="button" class="create-overlay-close" id="btnCloseCreateRegistros">
                    <i class="ph ph-arrow-left"></i>
                </button>
                <h2 id="createRegistrosTitleLabel">Novo Registro</h2>
            </div>
            <div class="create-overlay-scroll">
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
                            <input type="text" id="continuationSearch" placeholder="Buscar título do registro anterior..." autocomplete="off">
                            <input type="hidden" id="continuationOf">
                            <ul id="continuationDropdown" class="autocomplete-list" style="display:none;"></ul>
                        </div>

                        <div class="form-group">
                            <label for="btnOpenPassagePicker"><i class="ph ph-bookmark-simple"></i> Capítulo</label>
                            <input type="hidden" id="mainPassage">
                            <button type="button" id="btnOpenPassagePicker" class="passage-select-btn" title="Selecionar livro e capítulo">
                                <span id="mainPassageLabel" class="passage-select-placeholder">Selecionar livro e capítulo</span>
                                <i class="ph ph-caret-right"></i>
                            </button>
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
                                    <input type="text" id="authorInputField" class="tag-input-field" placeholder="Adicione autores separados por vírgula..." autocomplete="off">
                                </div>
                                <ul id="authorSuggestions" class="tag-suggestions-list" style="display:none;"></ul>
                            </div>
                        </details>
                        <details class="optional-fields">
                            <summary><i class="ph ph-bookmarks"></i> Passagens Relacionadas</summary>
                            <div class="details-content">
                                <div id="relatedPassagesList" class="related-passages-list"></div>
                                <button type="button" id="btnAddRelatedPassage" class="passage-select-btn related-add-btn">
                                    <span class="passage-select-placeholder">Adicionar passagem relacionada</span>
                                    <i class="ph ph-plus"></i>
                                </button>
                                <input type="hidden" id="relatedPassages">
                            </div>
                        </details>
                        <details class="optional-fields" id="keywordsSection">
                            <summary><i class="ph ph-tag"></i> Palavras-chave</summary>
                            <div class="details-content">
                                <div class="tag-input-wrapper" id="tagInputWrapper">
                                    <div class="tag-chips" id="tagChips"></div>
                                    <input type="text" id="tagInputField" class="tag-input-field" placeholder="Adicione até três palavras-chave, separadas por vírgula..." autocomplete="off">
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
                            <div id="dynamicQuestionsContainer"></div>
                            <button type="button" id="btnAddQuestion" class="btn-secondary mt-2"><i class="ph ph-plus"></i> Adicionar Pergunta</button>
                        </div>

                        <div class="action-buttons">
                            <button type="button" class="btn-secondary" id="btnOpenActionsModal"><i class="ph ph-list-plus"></i> Ações e Links</button>
                            <button type="submit" class="btn-primary" id="btnSubmit"><i class="ph ph-floppy-disk"></i> Salvar na Nuvem</button>
                            <button type="button" class="btn-secondary" id="btnCancelEdit" style="display: none;">Cancelar Edição</button>
                        </div>
                        <button type="button" class="btn-danger" id="btnDeleteFromEdit" style="display:none;"><i class="ph ph-trash"></i> Excluir Registro</button>
                    </form>
                </main>
            </div>
            </div><!-- /.overlay-dialog -->
        </div>
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

            const onOk = () => { modal.close(); removeListeners(); resolve(true); };
            const onCancel = () => { modal.close(); removeListeners(); resolve(false); };
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
        if (dateInput) dateInput.valueAsDate = new Date();
    };
    setTodayDate();

    // --- OVERLAY OPEN/CLOSE ---
    window.openCreateRegistrosOverlay = () => {
        const overlay = document.getElementById('createRegistrosOverlay');
        if (!overlay) return;
        overlay.classList.add('open');
        if (!window._overlayCloseStack.includes(window._closeRegistros)) {
            window._overlayCloseStack.push(window._closeRegistros);
        }
    };

    // Desktop backdrop click: click on the overlay outside the dialog box closes it
    (() => {
        const overlay = document.getElementById('createRegistrosOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (window.innerWidth > 768 && e.target === overlay) {
                    window._requestCloseRegistros();
                }
            });
        }
    })();

    window.closeCreateRegistrosOverlay = () => {
        const overlay = document.getElementById('createRegistrosOverlay');
        if (overlay) overlay.classList.remove('open');
        const mobileToolbar = document.getElementById('mobileQuillToolbar');
        if (mobileToolbar) { mobileToolbar.style.display = 'none'; mobileToolbar.style.bottom = ''; }
        const bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.style.display = '';
        window.activeQuillEditor = null;
        // Fechar/cancelar/salvar é uma saída intencional → descarta o rascunho
        if (window.SelahDraft) window.SelahDraft.clear('registros');
        const idx = window._overlayCloseStack.indexOf(window._closeRegistros);
        if (idx > -1) window._overlayCloseStack.splice(idx, 1);
    };

    const btnCloseCreate = document.getElementById('btnCloseCreateRegistros');
    if (btnCloseCreate) {
        btnCloseCreate.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        btnCloseCreate.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window._requestCloseRegistros();
        }, { passive: false });
        btnCloseCreate.addEventListener('click', () => {
            window._requestCloseRegistros();
        });
    }

    // --- STATS CARD → abre analytics overlay ---
    const statsHeader = document.getElementById('statsCardRegistrosHeader');
    if (statsHeader) statsHeader.addEventListener('click', () => openAnalyticsOverlay());

    const resetFormFields = () => {
        const form = document.getElementById('devotionalForm');
        if (!form) return;
        form.reset();
        document.getElementById('editId').value = "";
        document.getElementById('continuationOf').value = "";
        document.getElementById('continuationSearch').value = "";
        document.getElementById('btnCancelEdit').style.display = 'none';
        document.getElementById('btnSubmit').innerHTML = '<i class="ph ph-floppy-disk"></i> Salvar na Nuvem';
        document.getElementById('createRegistrosTitleLabel').innerText = "Novo Registro";
        const btnDel = document.getElementById('btnDeleteFromEdit');
        if (btnDel) btnDel.style.display = 'none';

        if (editors.livre) {
            editors.livre.root.innerHTML = "<p><br></p>";
        }
        renderGuidedQuestions();
        tempActions = [];
        tempLinks = [];
        renderLists();
        setTodayDate();
        if (tagManager) tagManager.clear();
        if (authorManager) authorManager.clear();
        const mainPassageLabel = document.getElementById('mainPassageLabel');
        if (mainPassageLabel) {
            mainPassageLabel.textContent = 'Selecionar livro e capítulo';
            mainPassageLabel.classList.add('passage-select-placeholder');
        }
        relatedPassagesArr = [];
        renderRelatedPassages();
    };

    const doCloseRegistros = () => {
        window.closeCreateRegistrosOverlay();
        resetFormFields();
    };

    // Fecha pedindo confirmação quando há conteúdo não salvo (evita perda acidental)
    window._requestCloseRegistros = async () => {
        const ov = document.getElementById('createRegistrosOverlay');
        const open = ov && ov.classList.contains('open');
        if (open) {
            let hasStuff = false;
            try { hasStuff = collectDraft().hasContent || !!document.getElementById('editId')?.value; } catch (e) {}
            if (hasStuff) {
                const ok = await showConfirm('Descartar este registro? As anotações não salvas serão perdidas.');
                if (!ok) return;
            }
        }
        doCloseRegistros();
    };

    // Usado pelo botão Voltar do sistema (popstate) e pelo botão de fechar do overlay
    window._closeRegistros = window._requestCloseRegistros;

    // --- EDITORES E PERGUNTAS DINÂMICAS ---
    const customColors = [false, '#e60000', '#ff9900', '#A07E1A', '#008a00', '#0066cc', '#9933ff'];
    const toolbar = [['bold', 'italic', 'underline'], [{ 'color': customColors }], [{ 'header': [1, 2, false] }], ['clean']];
    const editors = {
        livre: new Quill('#quillEditorLivre', { theme: 'snow', modules: { toolbar } })
    };

    if (editors.livre) {
        editors.livre.on('text-change', () => {
            const editId = document.getElementById('editId');
            if (editId && !editId.value) saveDraftDebounced();
        });
    }

    // --- MOBILE FLOATING TOOLBAR LOGIC ---
    const mobileToolbar = document.getElementById('mobileQuillToolbar');

    const setupMobileToolbarForEditor = (qEditor) => {
        if (!mobileToolbar) return;

        // Atalho "---" → linha horizontal (vale para o editor livre e os guiados)
        window._setupQuillHrShortcut && window._setupQuillHrShortcut(qEditor);

        // Atualiza o botão "refazer" ao digitar (digitar limpa a pilha de redo)
        qEditor.on('text-change', () => {
            if (window.activeQuillEditor === qEditor) {
                window._refreshFtRedoBtn && window._refreshFtRedoBtn(qEditor);
            }
        });

        qEditor.on('selection-change', (range) => {
            if (range) {
                window.activeQuillEditor = qEditor;
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    const bottomNav = document.getElementById('mobileBottomNav');
                    if (bottomNav) bottomNav.style.display = 'none';
                }
                mobileToolbar.style.display = 'flex';
                // Reposiciona logo acima do teclado assim que aparece (só no mobile)
                if (isMobile && window._reposQuillToolbar) {
                    window._reposQuillToolbar();
                    setTimeout(window._reposQuillToolbar, 150);
                    setTimeout(window._reposQuillToolbar, 350);
                }

                const format = qEditor.getFormat(range);
                mobileToolbar.querySelectorAll('button').forEach(btn => {
                    const f = btn.dataset.format;
                    const v = btn.dataset.value;
                    if (f === 'clean') return;
                    let isActive = v ? (format[f] == v) : format[f];
                    btn.classList.toggle('active-format', !!isActive);
                });
                window._refreshFtListIcon && window._refreshFtListIcon(format);
                window._refreshFtHeaderIcon && window._refreshFtHeaderIcon(format);
                window._refreshFtRedoBtn && window._refreshFtRedoBtn(qEditor);
            } else {
                setTimeout(() => {
                    if (window.activeQuillEditor === qEditor && !qEditor.hasFocus()) {
                        mobileToolbar.style.display = 'none';
                        if (window.innerWidth <= 768) {
                            const bottomNav = document.getElementById('mobileBottomNav');
                            if (bottomNav) bottomNav.style.display = 'flex';
                        }
                        window.activeQuillEditor = null;
                        const ftColorGroup = document.getElementById('ftColorGroup');
                        const ftMainGroup = document.getElementById('ftMainGroup');
                        if (ftColorGroup) ftColorGroup.style.display = 'none';
                        if (ftMainGroup) ftMainGroup.style.display = 'flex';
                    }
                }, 150);
            }
        });
    };

    if (editors.livre) setupMobileToolbarForEditor(editors.livre);

    if (mobileToolbar && !window.mobileToolbarListenersBound) {
        window.mobileToolbarListenersBound = true;
        const ftMainGroup = document.getElementById('ftMainGroup');
        const ftColorGroup = document.getElementById('ftColorGroup');

        const handleFormatBtn = (e, btn) => {
            e.preventDefault();
            if (!window.activeQuillEditor) return;
            const activeEditor = window.activeQuillEditor;
            activeEditor.focus();

            const f = btn.dataset.format;
            const v = btn.dataset.value;

            // Desfazer / refazer não dependem de seleção
            const action = btn.dataset.action;
            if (action === 'undo' || action === 'redo') {
                if (activeEditor.history) {
                    if (action === 'undo') activeEditor.history.undo();
                    else activeEditor.history.redo();
                }
                window._refreshFtRedoBtn && window._refreshFtRedoBtn(activeEditor);
                return;
            }

            const range = activeEditor.getSelection();
            if (!range) return;

            if (f === 'clean') {
                activeEditor.removeFormat(range.index, range.length);
            } else if (f === 'hr') {
                window._insertQuillHr && window._insertQuillHr(activeEditor);
            } else if (f === 'list') {
                // Botão único que cicla: nenhum → marcador → numerado → nenhum
                const cur = activeEditor.getFormat(range).list;
                const next = cur === 'bullet' ? 'ordered' : (cur === 'ordered' ? false : 'bullet');
                activeEditor.format('list', next);
            } else if (f === 'header') {
                // Botão único que cicla: nenhum → T1 → T2 → T3 → nenhum
                const cur = activeEditor.getFormat(range).header;
                const next = cur === 1 ? 2 : (cur === 2 ? 3 : (cur === 3 ? false : 1));
                activeEditor.format('header', next);
            } else if (f === 'color') {
                // "Remover Cor" usa data-value="false" (string); aplica boolean false
                if (v === 'false') {
                    activeEditor.format('color', false);
                } else {
                    const cur = activeEditor.getFormat(range).color;
                    activeEditor.format('color', cur == v ? false : v);
                }
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

            setTimeout(() => {
                const newRange = activeEditor.getSelection();
                if (newRange) {
                    const format = activeEditor.getFormat(newRange);
                    mobileToolbar.querySelectorAll('button').forEach(b => {
                        const bf = b.dataset.format;
                        const bv = b.dataset.value;
                        if (bf === 'clean') return;
                        let isActive = bv ? (format[bf] == bv) : format[bf];
                        b.classList.toggle('active-format', !!isActive);
                    });
                    window._refreshFtListIcon && window._refreshFtListIcon(format);
                    window._refreshFtHeaderIcon && window._refreshFtHeaderIcon(format);
                }
                window._refreshFtRedoBtn && window._refreshFtRedoBtn(activeEditor);
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

    renderGuidedQuestions();

    // --- RASCUNHO AUTOMÁTICO ---
    let _draftTimer = null;

    const isRegOverlayOpen = () => {
        const ov = document.getElementById('createRegistrosOverlay');
        return ov && ov.classList.contains('open');
    };

    const stripTags = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

    const collectDraft = () => {
        const titleV = document.getElementById('title')?.value || '';
        const mainPassageV = document.getElementById('mainPassage')?.value || '';
        const isLivre = (document.querySelector('.btn-toggle.active')?.dataset.type || 'livre') === 'livre';
        const livreHtml = editors.livre ? editors.livre.root.innerHTML : '';
        const guided = getGuidedData();
        const bodyHasContent = isLivre
            ? stripTags(livreHtml) !== ''
            : guided.some(q => stripTags(q.a) !== '');
        const hasContent = !!(titleV.trim() || mainPassageV.trim() || bodyHasContent);
        return {
            hasContent,
            title: titleV,
            date: document.getElementById('date')?.value || '',
            continuationOf: document.getElementById('continuationOf')?.value || '',
            continuationSearch: document.getElementById('continuationSearch')?.value || '',
            mainPassage: mainPassageV,
            recordType: document.getElementById('recordType')?.value || 'devocional',
            author: authorManager ? authorManager.getTags() : [],
            relatedPassages: document.getElementById('relatedPassages')?.value || '',
            keywords: tagManager ? tagManager.getTags() : [],
            recordFormat: isLivre ? 'livre' : 'orientado',
            content: isLivre ? { texto: livreHtml } : { questions: guided },
            actions: tempActions || [],
            links: tempLinks || []
        };
    };

    const saveDraftNow = () => {
        if (!isRegOverlayOpen()) return;
        if (document.getElementById('editId')?.value) return; // só registros novos
        const d = collectDraft();
        if (!d.hasContent) { window.SelahDraft.clear('registros'); return; }
        window.SelahDraft.save('registros', d);
    };

    const saveDraftDebounced = () => {
        clearTimeout(_draftTimer);
        _draftTimer = setTimeout(saveDraftNow, 800);
    };

    // Registra o flush deste módulo (chamado em visibilitychange/pagehide)
    window._draftFlushers = window._draftFlushers || {};
    window._draftFlushers.registros = saveDraftNow;

    const devFormDraft = document.getElementById('devotionalForm');
    if (devFormDraft) {
        devFormDraft.addEventListener('input', saveDraftDebounced);
        devFormDraft.addEventListener('change', saveDraftDebounced);
    }

    const applyDraft = (d) => {
        document.getElementById('title').value = d.title || '';
        document.getElementById('date').value = d.date || '';
        document.getElementById('continuationOf').value = d.continuationOf || '';
        document.getElementById('continuationSearch').value = d.continuationSearch || '';
        document.getElementById('mainPassage').value = d.mainPassage || '';
        const lbl = document.getElementById('mainPassageLabel');
        if (lbl) {
            if (d.mainPassage) { lbl.textContent = d.mainPassage; lbl.classList.remove('passage-select-placeholder'); }
            else { lbl.textContent = 'Selecionar livro e capítulo'; lbl.classList.add('passage-select-placeholder'); }
        }
        document.getElementById('recordType').value = d.recordType || 'devocional';
        if (authorManager) authorManager.setTags(d.author || []);
        relatedPassagesArr = parseRelated(d.relatedPassages || '');
        renderRelatedPassages();
        if (tagManager) tagManager.setTags(d.keywords || []);
        if (d.recordFormat === 'orientado') {
            document.querySelector('[data-type="orientado"]').click();
            const qs = (d.content && d.content.questions) || [];
            renderGuidedQuestions(qs.map(q => q.q), qs.map(q => q.a));
        } else {
            document.querySelector('[data-type="livre"]').click();
            if (editors.livre) editors.livre.root.innerHTML = (d.content && d.content.texto) || '<p><br></p>';
        }
        tempActions = d.actions || [];
        tempLinks = d.links || [];
        renderLists();
    };

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
            desc.value = '';
            renderLists();
        });
    }

    const btnAddLink = document.getElementById('btnAddLink');
    if (btnAddLink) {
        btnAddLink.addEventListener('click', () => {
            const t = document.getElementById('linkTitle'), u = document.getElementById('linkUrl');
            if (!t.value || !u.value) return;
            tempLinks.push({ title: t.value, url: u.value });
            t.value = ''; u.value = '';
            renderLists();
        });
    }

    // --- CRUD: SALVAR E ATUALIZAR ---
    const devForm = document.getElementById('devotionalForm');
    if (devForm) {
        devForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btnSubmit');
            const editId = document.getElementById('editId').value;

            if (!document.getElementById('mainPassage').value) {
                showAlert("Selecione o livro e capítulo antes de salvar.");
                return;
            }

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
                content: isLivre ? { texto: editors.livre.root.innerHTML } : { questions: getGuidedData() },
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
                    data.randomSeed = Math.random();
                    await addDoc(collection(db, "devotionals"), data);
                    showAlert("Salvo com sucesso!");
                }

                window.closeCreateRegistrosOverlay();
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

    // --- CRUD: BUSCAR E RENDERIZAR (com paginação) ---
    let allRecords = [];
    let statsRecords = []; // todos os registros do usuário (para estatísticas/analytics corretos)
    let lastDoc = null;
    let allLoaded = false;
    let isFetching = false;
    let sentinelObserver = null;
    const PAGE_SIZE = 15;

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
                    if (k && !globalKeywordIndex.has(k.toLowerCase())) globalKeywordIndex.set(k.toLowerCase(), k);
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

            if (this.wrapper && this.input) this._bind();
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
                    this._addTag(val); this.input.value = ''; this._hideSuggestions();
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
                const displayLabel = this.config.uppercase ? label.toUpperCase() : label;
                const highlighted = displayLabel.replace(
                    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                    '<mark>$1</mark>'
                );
                li.innerHTML = `<i class="ph ${this.config.iconClass}"></i>${highlighted}`;
                li.addEventListener('mousedown', (e) => { e.preventDefault(); this._acceptSuggestion(key); });
                this.sugList.appendChild(li);
            });
            this.sugList.style.display = 'block';
        }

        _highlightSuggestion(items) {
            items.forEach((el, i) => el.classList.toggle('active', i === this.activeIdx));
        }

        _hideSuggestions() { this.sugList.style.display = 'none'; this.activeIdx = -1; }
        _acceptSuggestion(tagKey) { this._addTag(tagKey); this.input.value = ''; this._hideSuggestions(); this.input.focus(); }

        _addTag(raw) {
            if (!raw) return;
            const key = raw.toLowerCase().trim();
            if (!key || this.tags.includes(key)) return;
            if (this.tags.length >= this.config.maxTags) { showAlert(this.config.maxTagsMsg); return; }
            if (!this.config.indexMap.has(key)) this.config.indexMap.set(key, raw.trim());
            this.tags.push(key);
            this._renderChips();
        }

        _removeTag(idx) { this.tags.splice(idx, 1); this._renderChips(); }

        _renderChips() {
            this.chipsEl.innerHTML = '';
            this.tags.forEach((tag, i) => {
                const chip = document.createElement('span');
                chip.className = 'tag-chip';
                const raw = this.config.indexMap.get(tag) || tag;
                const label = this.config.uppercase ? raw.toUpperCase() : raw;
                chip.innerHTML = `${label}<button type="button" class="tag-chip-remove" title="Remover"><i class="ph ph-x"></i></button>`;
                chip.querySelector('.tag-chip-remove').addEventListener('click', (e) => {
                    e.stopPropagation(); this._removeTag(i);
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
        clear() { this.tags = []; this.input.value = ''; this._renderChips(); this._hideSuggestions(); }
    }

    let tagManager;
    let authorManager;

    const feedSkeletonHTML = `
        <div class="records-feed mt-2">
            ${[0,1,2].map(()=>`
            <div class="record-card" style="margin-bottom:10px;">
                <div class="record-card-header" style="pointer-events:none;">
                    <div class="record-card-date"><span class="skeleton-bar sk-meta" style="width:36px;height:40px;border-radius:4px;"></span></div>
                    <div class="record-card-info" style="gap:6px;display:flex;flex-direction:column;">
                        <div class="skeleton-bar sk-title"></div>
                        <div class="skeleton-bar sk-meta"></div>
                    </div>
                    <div style="width:60px;"><div class="skeleton-bar sk-meta" style="width:60px;"></div></div>
                </div>
            </div>`).join('')}
        </div>`;

    const RECORD_TYPE_LABELS = {
        devocional: 'Devocional', culto_domestico: 'Culto Dom.', aula: 'Aula',
        ebd: 'EBD', pregacao: 'Pregação', anotacoes_gerais: 'Anotações', outros: 'Outros'
    };

    const formatDateParts = (dateStr) => {
        const [y, m, d] = dateStr.split('-');
        const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        return { day: d, month: months[parseInt(m,10)-1], year: y };
    };

    const renderFeed = (arr, replace = true) => {
        const feed = document.getElementById('devotionalsFeed');
        if (!feed) return;

        if (replace && arr.length === 0) {
            feed.innerHTML = `
                <div class="records-empty-state">
                    <i class="ph ph-book-open"></i>
                    <p>Comece seu diário espiritual.<br>Toque no <strong>+</strong> para registrar o que o Senhor falou.</p>
                </div>`;
            return;
        }

        const html = arr.map(r => {
            const dp = formatDateParts(r.date);
            const typeLabel = RECORD_TYPE_LABELS[r.recordType] || r.recordType;
            const keywordChips = (r.keywords && r.keywords.length)
                ? `<div class="record-card-keywords">${r.keywords.map(k => `<span class="card-tag">${globalKeywordIndex.get(k) || k}</span>`).join('')}</div>`
                : '';
            return `
            <div class="record-card" id="rc-${r.id}" data-record-id="${r.id}">
                <div class="record-card-header" onclick="window.openReadingMode('${r.id}')">
                    <div class="record-card-date">
                        <span class="rc-day">${dp.day}</span>
                        <span class="rc-month">${dp.month}</span>
                        <span class="rc-year">${dp.year}</span>
                    </div>
                    <div class="record-card-info">
                        <div class="record-card-title">${r.title || r.mainPassage}</div>
                        <div class="record-card-meta">
                            ${r.title ? `<span class="record-card-passage">${r.mainPassage}</span>` : ''}
                            <span class="record-type-chip chip-${r.recordType}">${typeLabel}</span>
                        </div>
                    </div>
                    <i class="ph-fill ph-star card-fav-star${r.favorito ? ' active' : ''}" data-fav-id="${r.id}" title="Favoritar"></i>
                    <i class="ph ph-caret-right record-card-chevron"></i>
                </div>
            </div>`;
        }).join('');

        if (replace) {
            feed.className = 'records-feed mt-2';
            feed.innerHTML = html;
        } else {
            feed.insertAdjacentHTML('beforeend', html);
        }
    };

    // --- FAVORITOS ---
    const toggleFavorito = async (id) => {
        const r = allRecords.find(x => x.id === id);
        if (!r) return;
        const newVal = !r.favorito;
        r.favorito = newVal;
        try {
            await updateDoc(doc(db, 'devotionals', id), { favorito: newVal });
        } catch (err) {
            r.favorito = !newVal; // revert on error
            console.error('Erro ao atualizar favorito:', err);
            return;
        }
        // Update card star icon
        const star = document.querySelector(`.card-fav-star[data-fav-id="${id}"]`);
        if (star) star.classList.toggle('active', newVal);
        // Update reading overlay button if open
        const favBtn = document.getElementById('readingFavBtn');
        if (favBtn && favBtn.dataset.id === id) {
            favBtn.classList.toggle('active', newVal);
        }
        // Vibrate feedback
        navigator.vibrate?.(30);
        // If favorites filter is active, remove card from view when deselected
        if (filterState.favorites && !newVal) {
            const card = document.getElementById(`rc-${id}`);
            if (card) { card.style.transition = 'opacity 0.2s'; card.style.opacity = '0'; setTimeout(() => card.remove(), 200); }
        }
    };
    window._toggleRecordFavorito = toggleFavorito;

    // Long-press on feed cards (delegated)
    const feed = document.getElementById('devotionalsFeed');
    if (feed) {
        let lpTimer = null;
        let lpStartX = 0, lpStartY = 0;

        feed.addEventListener('pointerdown', (e) => {
            // Allow direct tap on star to toggle without long-press
            if (e.target.closest('.card-fav-star')) return;
            const card = e.target.closest('[data-record-id]');
            if (!card) return;
            lpStartX = e.clientX; lpStartY = e.clientY;
            lpTimer = setTimeout(() => {
                lpTimer = null;
                toggleFavorito(card.dataset.recordId);
            }, 500);
        });

        feed.addEventListener('pointermove', (e) => {
            if (!lpTimer) return;
            if (Math.abs(e.clientX - lpStartX) > 8 || Math.abs(e.clientY - lpStartY) > 8) {
                clearTimeout(lpTimer); lpTimer = null;
            }
        });

        feed.addEventListener('pointerup', () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } });
        feed.addEventListener('pointercancel', () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } });

        // Direct tap on star icon toggles favorite
        feed.addEventListener('click', (e) => {
            const star = e.target.closest('.card-fav-star');
            if (!star) return;
            e.stopPropagation();
            toggleFavorito(star.dataset.favId);
        }, true); // capture phase to intercept before record-card-header onclick
    }

    window.toggleRecordCard = (id) => {
        const card = document.getElementById(`rc-${id}`);
        if (card) card.classList.toggle('expanded');
    };

    window.openReadingMode = (id, fromRandom = false, opts = {}) => {
        const { openChain = false } = typeof fromRandom === 'object' ? fromRandom : opts;
        const r = allRecords.find(x => x.id === id);
        if (!r) return;

        const dp = formatDateParts(r.date);
        const typeLabel = RECORD_TYPE_LABELS[r.recordType] || r.recordType;

        // --- Trilha de registros ---
        let chainBack = [], chainForward = [];
        let curr = r;
        while (curr.continuationOf) {
            const parent = allRecords.find(x => x.id === curr.continuationOf);
            if (!parent) break;
            chainBack.unshift(parent);
            curr = parent;
        }
        curr = r;
        while (true) {
            const child = allRecords.find(x => x.continuationOf === curr.id);
            if (!child) break;
            chainForward.push(child);
            curr = child;
        }
        const fullChain = [...chainBack, r, ...chainForward];
        const chainHtml = fullChain.length > 1 ? `
            <details class="chain-details mt-2 mb-2"${openChain ? ' open' : ''}>
                <summary>
                    <i class="ph ph-caret-down"></i>
                    <span>Trilha de Registros (${fullChain.length})</span>
                </summary>
                <div class="chain-timeline">
                    ${fullChain.map((item, idx) => {
                        const isCurrent = item.id === r.id;
                        const titleEl = isCurrent
                            ? `<span class="chain-tl-title chain-tl-title--current">${item.title || item.mainPassage}</span>`
                            : `<a href="#" class="chain-tl-title chain-nav-link" data-chain-id="${item.id}">${item.title || item.mainPassage}</a>`;
                        return `<div class="chain-tl-item${isCurrent ? ' chain-tl-item--current' : ''}"><div class="chain-tl-dot"></div>${titleEl}</div>`;
                    }).join('')}
                </div>
            </details>` : '';

        let bodyHtml = '';
        if (r.recordFormat === 'livre') {
            bodyHtml = r.content?.texto || '';
        } else if (r.content?.questions) {
            bodyHtml = r.content.questions
                .filter(q => q.a && q.a !== '<p><br></p>')
                .map(q => `<h4>${q.q}</h4><div>${q.a}</div>`)
                .join('');
        }

        // Monta grade de metadados extras para o cabeçalho da leitura
        const authorsArr = r.author
            ? (Array.isArray(r.author) ? r.author.map(a => globalAuthorIndex.get(a) || a) : [r.author])
            : [];
        const infoRows = [];
        if (authorsArr.length) {
            const label = r.recordType === 'pregacao' ? 'Pregador' : 'Autor';
            infoRows.push(`<div class="reading-info-row"><span class="reading-info-label">${label}</span><span class="reading-info-value">${authorsArr.map(a => a.toUpperCase()).join(', ')}</span></div>`);
        }
        if (r.relatedPassages) {
            infoRows.push(`<div class="reading-info-row"><span class="reading-info-label">Passagens</span><span class="reading-info-value">${r.relatedPassages}</span></div>`);
        }
        if (r.keywords && r.keywords.length) {
            const chips = r.keywords.map(k => `<span class="reading-info-tag">${globalKeywordIndex.get(k) || k}</span>`).join('');
            infoRows.push(`<div class="reading-info-row"><span class="reading-info-label">Temas</span><span class="reading-info-value reading-info-tags">${chips}</span></div>`);
        }
        const infoGridHtml = infoRows.length ? `<div class="reading-info-grid">${infoRows.join('')}</div>` : '';

        const overlay = document.createElement('div');
        overlay.className = 'reading-overlay';
        overlay.id = 'readingOverlay';
        overlay.innerHTML = `
            <div class="overlay-dialog">
            <div class="reading-scroll">
                <div class="reading-meta">${dp.day} ${dp.month} ${dp.year}</div>
                <h1 class="reading-title">${r.title || r.mainPassage}</h1>
                ${r.title ? `<div class="reading-passage">${r.mainPassage}</div>` : ''}
                <span class="record-type-chip chip-${r.recordType} reading-type-chip">${typeLabel}</span>
                ${infoGridHtml}
                ${chainHtml}
                <hr class="reading-divider">
                <div class="reading-body">${bodyHtml}</div>
                ${r.links?.length ? `<hr class="reading-divider"><h4>Links</h4>${r.links.map(l=>`<a href="${l.url}" target="_blank" class="tag">${l.title}</a>`).join(' ')}` : ''}
            </div>
            <div class="reading-bottom-bar">
                <button class="reading-close-btn" id="readingCloseBtn"><i class="ph ph-arrow-left"></i></button>
                <div class="reading-actions-row">
                    <button class="rc-btn rc-btn-fav${r.favorito ? ' active' : ''}" id="readingFavBtn" data-id="${r.id}"><i class="ph-fill ph-star"></i> Favorito</button>
                    <button class="rc-btn rc-btn-shuffle" id="readingShuffleBtn"><i class="ph ph-shuffle"></i> Aleatório</button>
                    <button class="rc-btn" id="readingEditBtn"><i class="ph ph-pencil"></i> Editar</button>
                </div>
            </div>
            </div><!-- /.overlay-dialog -->
        `;

        document.body.appendChild(overlay);

        const close = () => {
            const idx = window._overlayCloseStack.indexOf(close);
            if (idx > -1) window._overlayCloseStack.splice(idx, 1);
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 200);
        };
        window._overlayCloseStack.push(close);

        // Desktop: clicar no backdrop (fora do .overlay-dialog) fecha
        overlay.addEventListener('click', (e) => {
            if (window.innerWidth > 768 && e.target === overlay) close();
        });

        document.getElementById('readingCloseBtn').addEventListener('click', close);
        document.getElementById('readingFavBtn').addEventListener('click', () => toggleFavorito(r.id));
        document.getElementById('readingEditBtn').addEventListener('click', () => {
            close();
            setTimeout(() => editRecord(r.id), 210);
        });
        document.getElementById('readingShuffleBtn').addEventListener('click', () => {
            close();
            setTimeout(() => {
                const pool = getShufflePool(r.id);
                if (pool.length === 0) return showAlert('Nenhum item disponível com os filtros atuais.');
                window.openReadingMode(pool[Math.floor(Math.random() * pool.length)].id);
            }, 210);
        });

        overlay.querySelectorAll('.chain-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.dataset.chainId;
                close();
                setTimeout(() => window.openReadingMode(targetId, false, { openChain: true }), 210);
            });
        });

        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
        });
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
                html += `<div class="meta-item full-width"><span class="meta-label">Autor(es)</span><span class="meta-value">${authorsArr.map(a => a.toUpperCase()).join(', ')}</span></div>`;
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
                        return `<div class="chain-item"><span class="chain-number">${idx + 1}.</span>${tagHtml}</div>`;
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
                    if (q.a && q.a !== '<p><br></p>') html += `<h4>${q.q}</h4><div>${q.a}</div>`;
                });
            } else {
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
        const viewModal = document.getElementById('viewModal');
        if (viewModal && viewModal.open) viewModal.close();

        const r = allRecords.find(x => x.id === id);
        if (!r) return;

        document.getElementById('editId').value = r.id;
        document.getElementById('createRegistrosTitleLabel').innerText = "Editando Registro";
        document.getElementById('title').value = r.title || '';
        document.getElementById('date').value = r.date;
        document.getElementById('continuationOf').value = r.continuationOf || '';

        if (r.continuationOf) {
            const parent = allRecords.find(x => x.id === r.continuationOf);
            if (parent) document.getElementById('continuationSearch').value = parent.title || parent.mainPassage;
        } else {
            document.getElementById('continuationSearch').value = '';
        }

        document.getElementById('mainPassage').value = r.mainPassage || '';
        const mainPassageLabelEdit = document.getElementById('mainPassageLabel');
        if (mainPassageLabelEdit) {
            if (r.mainPassage) {
                mainPassageLabelEdit.textContent = r.mainPassage;
                mainPassageLabelEdit.classList.remove('passage-select-placeholder');
            } else {
                mainPassageLabelEdit.textContent = 'Selecionar livro e capítulo';
                mainPassageLabelEdit.classList.add('passage-select-placeholder');
            }
        }
        document.getElementById('recordType').value = r.recordType;
        relatedPassagesArr = parseRelated(r.relatedPassages || '');
        renderRelatedPassages();

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

        tempActions = r.actions || [];
        tempLinks = r.links || [];
        renderLists();
        document.getElementById('btnSubmit').innerHTML = '<i class="ph ph-check"></i> Atualizar Registro';
        document.getElementById('btnCancelEdit').style.display = 'block';
        document.getElementById('btnDeleteFromEdit').style.display = 'flex';

        window.openCreateRegistrosOverlay();
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
        btnCancelEdit.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        btnCancelEdit.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window._requestCloseRegistros();
        }, { passive: false });
        btnCancelEdit.onclick = () => {
            window._requestCloseRegistros();
        };
    }

    const btnDeleteFromEdit = document.getElementById('btnDeleteFromEdit');
    if (btnDeleteFromEdit) {
        btnDeleteFromEdit.addEventListener('click', async () => {
            const editId = document.getElementById('editId').value;
            if (!editId) return;
            if (!await showConfirm("Deseja realmente excluir este registro?")) return;
            window.closeCreateRegistrosOverlay();
            resetFormFields();
            setTimeout(async () => {
                await deleteDoc(doc(db, "devotionals", editId));
                fetchAll();
            }, 210);
        });
    }

    // --- LIVROS BÍBLICOS (66 livros protestantes) ---
    const BIBLE_BOOKS = [
        { name:'Gênesis', chapters:50, t:'AT' }, { name:'Êxodo', chapters:40, t:'AT' }, { name:'Levítico', chapters:27, t:'AT' },
        { name:'Números', chapters:36, t:'AT' }, { name:'Deuteronômio', chapters:34, t:'AT' }, { name:'Josué', chapters:24, t:'AT' },
        { name:'Juízes', chapters:21, t:'AT' }, { name:'Rute', chapters:4, t:'AT' }, { name:'1 Samuel', chapters:31, t:'AT' },
        { name:'2 Samuel', chapters:24, t:'AT' }, { name:'1 Reis', chapters:22, t:'AT' }, { name:'2 Reis', chapters:25, t:'AT' },
        { name:'1 Crônicas', chapters:29, t:'AT' }, { name:'2 Crônicas', chapters:36, t:'AT' }, { name:'Esdras', chapters:10, t:'AT' },
        { name:'Neemias', chapters:13, t:'AT' }, { name:'Ester', chapters:10, t:'AT' }, { name:'Jó', chapters:42, t:'AT' },
        { name:'Salmos', chapters:150, t:'AT' }, { name:'Provérbios', chapters:31, t:'AT' }, { name:'Eclesiastes', chapters:12, t:'AT' },
        { name:'Cantares', chapters:8, t:'AT' }, { name:'Isaías', chapters:66, t:'AT' }, { name:'Jeremias', chapters:52, t:'AT' },
        { name:'Lamentações', chapters:5, t:'AT' }, { name:'Ezequiel', chapters:48, t:'AT' }, { name:'Daniel', chapters:12, t:'AT' },
        { name:'Oséias', chapters:14, t:'AT' }, { name:'Joel', chapters:3, t:'AT' }, { name:'Amós', chapters:9, t:'AT' },
        { name:'Obadias', chapters:1, t:'AT' }, { name:'Jonas', chapters:4, t:'AT' }, { name:'Miquéias', chapters:7, t:'AT' },
        { name:'Naum', chapters:3, t:'AT' }, { name:'Habacuque', chapters:3, t:'AT' }, { name:'Sofonias', chapters:3, t:'AT' },
        { name:'Ageu', chapters:2, t:'AT' }, { name:'Zacarias', chapters:14, t:'AT' }, { name:'Malaquias', chapters:4, t:'AT' },
        { name:'Mateus', chapters:28, t:'NT' }, { name:'Marcos', chapters:16, t:'NT' }, { name:'Lucas', chapters:24, t:'NT' },
        { name:'João', chapters:21, t:'NT' }, { name:'Atos', chapters:28, t:'NT' }, { name:'Romanos', chapters:16, t:'NT' },
        { name:'1 Coríntios', chapters:16, t:'NT' }, { name:'2 Coríntios', chapters:13, t:'NT' }, { name:'Gálatas', chapters:6, t:'NT' },
        { name:'Efésios', chapters:6, t:'NT' }, { name:'Filipenses', chapters:4, t:'NT' }, { name:'Colossenses', chapters:4, t:'NT' },
        { name:'1 Tessalonicenses', chapters:5, t:'NT' }, { name:'2 Tessalonicenses', chapters:3, t:'NT' }, { name:'1 Timóteo', chapters:6, t:'NT' },
        { name:'2 Timóteo', chapters:4, t:'NT' }, { name:'Tito', chapters:3, t:'NT' }, { name:'Filemom', chapters:1, t:'NT' },
        { name:'Hebreus', chapters:13, t:'NT' }, { name:'Tiago', chapters:5, t:'NT' }, { name:'1 Pedro', chapters:5, t:'NT' },
        { name:'2 Pedro', chapters:3, t:'NT' }, { name:'1 João', chapters:5, t:'NT' }, { name:'2 João', chapters:1, t:'NT' },
        { name:'3 João', chapters:1, t:'NT' }, { name:'Judas', chapters:1, t:'NT' }, { name:'Apocalipse', chapters:22, t:'NT' },
    ];

    // --- PASSAGE PICKER ---
    const openPassagePicker = (opts = {}) => {
        const { targetId = 'mainPassage', append = false, labelId = null, onSelect = null } = opts;
        const overlay = document.createElement('div');
        overlay.className = 'reading-overlay passage-picker-overlay';

        const renderBookList = (filter = '') => {
            const fl = filter.toLowerCase();
            const at = BIBLE_BOOKS.filter(b => b.t === 'AT' && (!fl || b.name.toLowerCase().includes(fl)));
            const nt = BIBLE_BOOKS.filter(b => b.t === 'NT' && (!fl || b.name.toLowerCase().includes(fl)));
            let html = '';
            if (at.length) html += `<div class="pp-testament-label">Antigo Testamento</div>${at.map(b=>`<div class="pp-book-item" data-name="${b.name}" data-ch="${b.chapters}">${b.name}</div>`).join('')}`;
            if (nt.length) html += `<div class="pp-testament-label">Novo Testamento</div>${nt.map(b=>`<div class="pp-book-item" data-name="${b.name}" data-ch="${b.chapters}">${b.name}</div>`).join('')}`;
            return html || `<div style="padding:24px 20px;color:var(--text-muted);">Nenhum livro encontrado.</div>`;
        };

        const renderChapterGrid = (book) =>
            `<div class="pp-back-row"><button type="button" class="pp-back-btn" id="ppBack"><i class="ph ph-arrow-left"></i> ${book.name}</button></div>
             <p style="padding:8px 20px;font-size:0.82rem;color:var(--text-muted);">Selecione o capítulo:</p>
             <div class="pp-chapter-grid">${Array.from({length:book.chapters},(_,i)=>`<button type="button" class="pp-chapter-btn" data-c="${i+1}">${i+1}</button>`).join('')}</div>`;

        overlay.innerHTML = `
            <div class="overlay-dialog">
            <div class="reading-toolbar">
                <button class="reading-close-btn" id="ppClose"><i class="ph ph-x"></i></button>
                <span class="analytics-overlay-title">Selecionar Passagem</span>
                <div style="width:36px;"></div>
            </div>
            <div class="pp-search-row">
                <i class="ph ph-magnifying-glass"></i>
                <input type="text" id="ppSearch" placeholder="Pesquisar livro..." autocomplete="off" autocorrect="off" spellcheck="false">
            </div>
            <div class="pp-content" id="ppContent">${renderBookList()}</div>
            </div><!-- /.overlay-dialog -->`;

        document.body.appendChild(overlay);

        const content = overlay.querySelector('#ppContent');
        const searchInput = overlay.querySelector('#ppSearch');
        let currentBook = null;
        let focusIdx = -1; // navegação por teclado (desktop)

        // --- NAVEGAÇÃO POR TECLADO ---
        const getNavItems = () => Array.from(
            content.querySelectorAll(currentBook ? '.pp-chapter-btn' : '.pp-book-item')
        );
        const clearFocus = () => content.querySelectorAll('.pp-focused').forEach(el => el.classList.remove('pp-focused'));
        const setFocus = (idx) => {
            const items = getNavItems();
            clearFocus();
            if (idx < 0 || idx >= items.length) { focusIdx = -1; return; }
            focusIdx = idx;
            items[idx].classList.add('pp-focused');
            items[idx].scrollIntoView({ block: 'nearest' });
        };
        const getCols = (items) => {
            if (items.length < 2) return 1;
            const top0 = items[0].offsetTop;
            let c = 1;
            while (c < items.length && items[c].offsetTop === top0) c++;
            return c;
        };
        const onKeydown = (e) => {
            const items = getNavItems();
            if (currentBook) {
                const cols = getCols(items);
                if (e.key === 'ArrowRight') { e.preventDefault(); setFocus(Math.min(focusIdx < 0 ? 0 : focusIdx + 1, items.length - 1)); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); setFocus(Math.max(focusIdx < 0 ? 0 : focusIdx - 1, 0)); }
                else if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(Math.min(focusIdx < 0 ? 0 : focusIdx + cols, items.length - 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setFocus(Math.max(focusIdx < 0 ? 0 : focusIdx - cols, 0)); }
                else if (e.key === 'Enter') { e.preventDefault(); if (focusIdx >= 0 && items[focusIdx]) items[focusIdx].click(); }
                else if (e.key === 'Escape' || e.key === 'Backspace') {
                    e.preventDefault();
                    const back = content.querySelector('#ppBack');
                    if (back) back.click();
                }
            } else {
                if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(Math.min(focusIdx < 0 ? 0 : focusIdx + 1, items.length - 1)); }
                else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (focusIdx <= 0) { setFocus(-1); searchInput.focus(); }
                    else setFocus(focusIdx - 1);
                }
                else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (focusIdx >= 0 && items[focusIdx]) items[focusIdx].click();
                    else if (items.length === 1) items[0].click();
                }
                else if (e.key === 'Escape') { e.preventDefault(); close(); }
            }
        };
        document.addEventListener('keydown', onKeydown);

        const close = () => {
            document.removeEventListener('keydown', onKeydown);
            const idx = window._overlayCloseStack.indexOf(close);
            if (idx > -1) window._overlayCloseStack.splice(idx, 1);
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 200);
        };
        window._overlayCloseStack.push(close);
        overlay.querySelector('#ppClose').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (window.innerWidth > 768 && e.target === overlay) close();
        });

        const bindBookClicks = () => {
            content.querySelectorAll('.pp-book-item').forEach(item => {
                item.addEventListener('click', () => {
                    currentBook = { name: item.dataset.name, chapters: parseInt(item.dataset.ch) };
                    focusIdx = -1;
                    searchInput.style.display = 'none';
                    content.innerHTML = renderChapterGrid(currentBook);
                    content.querySelector('#ppBack').addEventListener('click', () => {
                        currentBook = null;
                        focusIdx = -1;
                        searchInput.style.display = '';
                        content.innerHTML = renderBookList(searchInput.value);
                        bindBookClicks();
                    });
                    content.querySelectorAll('.pp-chapter-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const passage = `${currentBook.name} ${btn.dataset.c}`;
                            if (typeof onSelect === 'function') {
                                onSelect(passage);
                            } else {
                                const input = document.getElementById(targetId);
                                if (input) {
                                    if (append && input.value.trim()) {
                                        input.value = input.value.trim() + '; ' + passage;
                                    } else {
                                        input.value = passage;
                                    }
                                }
                                if (labelId) {
                                    const lbl = document.getElementById(labelId);
                                    if (lbl) { lbl.textContent = passage; lbl.classList.remove('passage-select-placeholder'); }
                                }
                            }
                            close();
                        });
                    });
                });
            });
        };
        bindBookClicks();

        searchInput.addEventListener('input', () => {
            currentBook = null;
            focusIdx = -1;
            content.innerHTML = renderBookList(searchInput.value);
            bindBookClicks();
        });

        setTimeout(() => searchInput.focus(), 80);
    };

    const btnPassagePicker = document.getElementById('btnOpenPassagePicker');
    if (btnPassagePicker) btnPassagePicker.addEventListener('click', () => openPassagePicker({ targetId: 'mainPassage', labelId: 'mainPassageLabel' }));

    // --- PASSAGENS RELACIONADAS (lista de até 10, via seletor) ---
    const MAX_RELATED = 10;
    let relatedPassagesArr = [];
    const parseRelated = (str) => (str || '').split(/[;,]/).map(s => s.trim()).filter(Boolean);

    const renderRelatedPassages = () => {
        const list = document.getElementById('relatedPassagesList');
        const hidden = document.getElementById('relatedPassages');
        const addBtn = document.getElementById('btnAddRelatedPassage');
        if (!list) return;
        list.innerHTML = relatedPassagesArr.map((p, i) =>
            `<span class="tag-chip related-chip">${p}<button type="button" class="tag-chip-remove" data-idx="${i}" title="Remover"><i class="ph ph-x"></i></button></span>`
        ).join('');
        list.querySelectorAll('.tag-chip-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                relatedPassagesArr.splice(parseInt(btn.dataset.idx), 1);
                renderRelatedPassages();
                saveDraftDebounced();
            });
        });
        if (hidden) hidden.value = relatedPassagesArr.join('; ');
        if (addBtn) addBtn.style.display = relatedPassagesArr.length >= MAX_RELATED ? 'none' : '';
    };

    const btnAddRelated = document.getElementById('btnAddRelatedPassage');
    if (btnAddRelated) {
        btnAddRelated.addEventListener('click', () => {
            if (relatedPassagesArr.length >= MAX_RELATED) {
                showAlert(`Você pode adicionar no máximo ${MAX_RELATED} passagens relacionadas.`);
                return;
            }
            openPassagePicker({ onSelect: (passage) => {
                if (relatedPassagesArr.length >= MAX_RELATED) return;
                relatedPassagesArr.push(passage);
                renderRelatedPassages();
                saveDraftDebounced();
            }});
        });
    }
    renderRelatedPassages();

    // --- ANALYTICS OVERLAY ---
    const extractBibleBook = (passage) => {
        const m = passage.trim().match(/^(\d?\s*[A-Za-zÀ-ÿ]+(?:[\s-][A-Za-zÀ-ÿ]+)*)/);
        return m ? m[1].trim() : 'Outros';
    };

    const openAnalyticsOverlay = () => {
        const overlay = document.createElement('div');
        overlay.className = 'reading-overlay analytics-overlay';

        const data = statsRecords;
        const now = new Date();
        const monthlyData = Array.from({length:6}, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const prefix = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            return { label: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][d.getMonth()], count: data.filter(r => r.date && r.date.startsWith(prefix)).length };
        });
        const yearCount = data.filter(r => r.date && r.date.startsWith(now.getFullYear().toString())).length;
        const monthCount = data.filter(r => r.date && r.date.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`)).length;

        overlay.innerHTML = `
            <div class="overlay-dialog">
            <div class="reading-toolbar">
                <button class="reading-close-btn" id="analyticsClose"><i class="ph ph-arrow-left"></i></button>
                <span class="analytics-overlay-title">Analytics · Registros</span>
                <div style="width:36px;"></div>
            </div>
            <div class="reading-scroll analytics-scroll">
                <div class="analytics-stats-row">
                    <div class="analytics-stat-item"><span class="analytics-stat-num">${data.length}</span><span class="analytics-stat-lbl">Total</span></div>
                    <div class="analytics-stat-item"><span class="analytics-stat-num">${monthCount}</span><span class="analytics-stat-lbl">Este mês</span></div>
                    <div class="analytics-stat-item"><span class="analytics-stat-num">${yearCount}</span><span class="analytics-stat-lbl">Este ano</span></div>
                </div>
                <div class="analytics-card"><h3 class="analytics-card-title">Por Tipo de Registro</h3><div class="analytics-chart-box"><canvas id="aTypeChart"></canvas></div></div>
                <div class="analytics-card"><h3 class="analytics-card-title">Livros Mais Frequentes</h3><div class="analytics-chart-box"><canvas id="aBooksChart"></canvas></div></div>
                <div class="analytics-card"><h3 class="analytics-card-title">Últimos 6 Meses</h3><div class="analytics-chart-box"><canvas id="aMonthlyChart"></canvas></div></div>
            </div>
            </div><!-- /.overlay-dialog -->`;

        document.body.appendChild(overlay);

        const chartPalette = ['#1B3A5C','#2A5A8C','#3D6FA3','#5B8FC7','#7FA8CC','#8CB6DE','#B8D4EC'];
        // Cores derivadas do tema atual (claro/escuro) — lidas em runtime
        const cs = getComputedStyle(document.documentElement);
        const cText = cs.getPropertyValue('--text-main').trim() || '#1B2126';
        const cMuted = cs.getPropertyValue('--text-muted').trim() || '#63707B';
        const cCardBg = cs.getPropertyValue('--secondary-color').trim() || '#E6EDF1';
        const cBorder = cs.getPropertyValue('--border-color').trim() || '#D7E1E8';
        const cBar = cs.getPropertyValue('--primary-color').trim() || '#2A5A8C';
        const chartOpts = { responsive:true, maintainAspectRatio:false };

        const typeCounts = data.reduce((acc,r) => { acc[r.recordType]=(acc[r.recordType]||0)+1; return acc; }, {});
        const bookCounts = data.reduce((acc,r) => { if(r.mainPassage){const b=extractBibleBook(r.mainPassage); acc[b]=(acc[b]||0)+1;} return acc; }, {});
        const sortedBooks = Object.entries(bookCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);

        const cA = new Chart(document.getElementById('aTypeChart'), {
            type:'doughnut', data:{ labels:Object.keys(typeCounts).map(t=>RECORD_TYPE_LABELS[t]||t), datasets:[{data:Object.values(typeCounts),backgroundColor:chartPalette,borderColor:cCardBg,borderWidth:2}] },
            options:{...chartOpts,cutout:'62%',plugins:{legend:{position:'bottom',labels:{color:cText,boxWidth:12,padding:10,font:{size:11}}}}}
        });
        const cB = new Chart(document.getElementById('aBooksChart'), {
            type:'bar', data:{ labels:sortedBooks.map(b=>b[0]), datasets:[{label:'Registros',data:sortedBooks.map(b=>b[1]),backgroundColor:cBar,borderRadius:4}] },
            options:{...chartOpts,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:cMuted,font:{size:10}},grid:{color:cBorder}},x:{ticks:{color:cMuted,font:{size:10},maxRotation:45},grid:{display:false}}}}
        });
        const cC = new Chart(document.getElementById('aMonthlyChart'), {
            type:'bar', data:{ labels:monthlyData.map(m=>m.label), datasets:[{label:'Registros',data:monthlyData.map(m=>m.count),backgroundColor:cBar,borderRadius:4}] },
            options:{...chartOpts,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:cMuted,font:{size:10}},grid:{color:cBorder}},x:{ticks:{color:cMuted,font:{size:10}},grid:{display:false}}}}
        });

        const close = () => {
            const idx = window._overlayCloseStack.indexOf(close);
            if (idx > -1) window._overlayCloseStack.splice(idx, 1);
            cA.destroy(); cB.destroy(); cC.destroy();
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 200);
        };
        window._overlayCloseStack.push(close);
        overlay.querySelector('#analyticsClose').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (window.innerWidth > 768 && e.target === overlay) close();
        });
    };

    const updateStatsCard = () => {
        const total = statsRecords.length;
        const el = document.getElementById('statsTotalReg');
        if (el) el.innerText = total;

        const now = new Date();
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        const monthCount = statsRecords.filter(r => r.date && r.date.startsWith(monthPrefix)).length;
        const elMonth = document.getElementById('statsMonthReg');
        if (elMonth) elMonth.innerText = monthCount;
    };

    // Busca a contagem completa (não paginada) para estatísticas e analytics corretos
    const refreshStats = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const snap = await getDocs(query(collection(db, "devotionals"), where("userId", "==", user.uid)));
            statsRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
            statsRecords = allRecords.slice(); // fallback: usa o que estiver carregado
        }
        updateStatsCard();
    };

    // --- PAGINAÇÃO ---
    const initSentinelObserver = () => {
        if (sentinelObserver) sentinelObserver.disconnect();
        const sentinel = document.getElementById('devotionalsSentinel');
        if (!sentinel) return;

        sentinelObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isFetching && !allLoaded) {
                fetchPage(false);
            }
        }, { rootMargin: '0px 0px 200px 0px' });

        sentinelObserver.observe(sentinel);
    };

    const fetchPage = async (isFirst = false) => {
        if (isFetching || (!isFirst && allLoaded)) return;
        const user = auth.currentUser;
        if (!user) return;
        isFetching = true;

        const feed = document.getElementById('devotionalsFeed');
        const sentinel = document.getElementById('devotionalsSentinel');

        if (isFirst && feed && !feed.dataset.loaded) {
            feed.innerHTML = feedSkeletonHTML;
        } else if (!isFirst && sentinel) {
            sentinel.innerHTML = `<div class="load-more-sentinel"><i class="ph ph-circle-notch ph-spin"></i> Carregando mais...</div>`;
        }

        try {
            let q;
            if (isFirst) {
                q = query(
                    collection(db, "devotionals"),
                    where("userId", "==", user.uid),
                    orderBy("date", "desc"),
                    limit(PAGE_SIZE)
                );
            } else {
                q = query(
                    collection(db, "devotionals"),
                    where("userId", "==", user.uid),
                    orderBy("date", "desc"),
                    startAfter(lastDoc),
                    limit(PAGE_SIZE)
                );
            }

            const snap = await getDocs(q);
            const newRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Desempate de registros no mesmo dia: mais recente (createdAt) primeiro
            newRecords.sort((a, b) => {
                if (a.date !== b.date) return a.date < b.date ? 1 : -1;
                const ta = a.createdAt || a.updatedAt || '';
                const tb = b.createdAt || b.updatedAt || '';
                return ta < tb ? 1 : (ta > tb ? -1 : 0);
            });

            if (isFirst) {
                allRecords = newRecords;
                if (feed) feed.dataset.loaded = '1';
            } else {
                allRecords = [...allRecords, ...newRecords];
            }

            if (snap.docs.length > 0) lastDoc = snap.docs[snap.docs.length - 1];
            if (snap.docs.length < PAGE_SIZE) allLoaded = true;

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
                placeholderMobile: "Adicionar autores...",
                uppercase: true
            });

            if (isFirst) {
                initAutocomplete();
                renderFeed(newRecords, true);
            } else {
                renderFeed(newRecords, false);
            }
            updateStatsCard();

            if (sentinel) {
                if (allLoaded) {
                    sentinel.innerHTML = `<div class="list-end-msg"><i class="ph ph-check-circle"></i> Você chegou ao início do seu diário.</div>`;
                    if (sentinelObserver) { sentinelObserver.disconnect(); sentinelObserver = null; }
                } else {
                    sentinel.innerHTML = '';
                    initSentinelObserver();
                }
            }
        } catch (err) {
            console.error("Erro ao carregar registros:", err);
            if (isFirst && feed) {
                feed.dataset.loaded = '1';
                feed.innerHTML = `
                    <div class="records-empty-state">
                        <i class="ph ph-book-open"></i>
                        <p>Comece seu diário espiritual.<br>Toque no <strong>+</strong> para registrar o que o Senhor falou.</p>
                    </div>`;
            }
            if (sentinel) sentinel.innerHTML = '';
        } finally {
            isFetching = false;
        }
    };

    const fetchAll = async () => {
        if (sentinelObserver) { sentinelObserver.disconnect(); sentinelObserver = null; }
        lastDoc = null;
        allLoaded = false;
        isFetching = false;
        allRecords = [];
        await fetchPage(true);
        await refreshStats();
    };

    // --- FILTROS E BUSCA ---
    const filterState = { keyword: '', type: '', author: '', dateStart: '', dateEnd: '', favorites: false };

    const hasActiveFilter = () =>
        !!(filterState.keyword || filterState.type || filterState.author || filterState.dateStart || filterState.dateEnd || filterState.favorites);

    const applyFilterToArray = (arr) => arr.filter(r => {
        if (filterState.type && r.recordType !== filterState.type) return false;
        if (filterState.keyword) {
            const k = filterState.keyword;
            if (!(r.mainPassage?.toLowerCase().includes(k) || r.title?.toLowerCase().includes(k) || r.keywords?.some(kw => kw.toLowerCase().includes(k)))) return false;
        }
        if (filterState.author && !(r.author && (Array.isArray(r.author) ? r.author.join(' ') : r.author).toLowerCase().includes(filterState.author))) return false;
        if (filterState.dateStart && r.date < filterState.dateStart) return false;
        if (filterState.dateEnd && r.date > filterState.dateEnd) return false;
        if (filterState.favorites && !r.favorito) return false;
        return true;
    });

    const getShufflePool = (excludeId = null) => {
        let pool = hasActiveFilter() ? applyFilterToArray(allRecords) : allRecords.slice();
        if (excludeId) pool = pool.filter(x => x.id !== excludeId);
        return pool;
    };

    const syncClearFiltersBtn = () => {
        const btn = document.getElementById('btnClearFilters');
        if (btn) btn.style.display = hasActiveFilter() ? 'flex' : 'none';
    };

    const btnApplyFilters = document.getElementById('btnApplyFilters');
    if (btnApplyFilters) {
        btnApplyFilters.onclick = () => {
            filterState.keyword = document.getElementById('filterKeyword').value.toLowerCase().trim();
            filterState.type = document.getElementById('filterType').value;
            filterState.author = document.getElementById('filterAuthor').value.toLowerCase().trim();
            filterState.dateStart = document.getElementById('filterDateStart').value;
            filterState.dateEnd = document.getElementById('filterDateEnd').value;
            filterState.favorites = document.getElementById('filterFavorites')?.checked || false;
            syncClearFiltersBtn();
            renderFeed(applyFilterToArray(allRecords), true);
        };
    }

    const btnClearFilters = document.getElementById('btnClearFilters');
    if (btnClearFilters) {
        btnClearFilters.onclick = () => {
            filterState.keyword = ''; filterState.type = ''; filterState.author = '';
            filterState.dateStart = ''; filterState.dateEnd = ''; filterState.favorites = false;
            const kw = document.getElementById('filterKeyword'); if (kw) kw.value = '';
            const tp = document.getElementById('filterType'); if (tp) tp.value = '';
            const au = document.getElementById('filterAuthor'); if (au) au.value = '';
            const ds = document.getElementById('filterDateStart'); if (ds) ds.value = '';
            const de = document.getElementById('filterDateEnd'); if (de) de.value = '';
            const fv = document.getElementById('filterFavorites'); if (fv) fv.checked = false;
            syncClearFiltersBtn();
            renderFeed(allRecords, true);
        };
    }

    const btnRandom = document.getElementById('btnRandom');
    if (btnRandom) {
        btnRandom.onclick = async () => {
            const user = auth.currentUser;
            if (!user) return;
            // When filters active, draw from local filtered pool
            if (hasActiveFilter()) {
                const pool = getShufflePool();
                if (pool.length === 0) return showAlert('Nenhum item disponível com os filtros atuais.');
                window.openReadingMode(pool[Math.floor(Math.random() * pool.length)].id, true);
                return;
            }
            try {
                const r = Math.random();
                // Tenta pegar um doc com randomSeed >= r (1 leitura)
                let q = query(
                    collection(db, 'devotionals'),
                    where('userId', '==', user.uid),
                    where('randomSeed', '>=', r),
                    orderBy('randomSeed'),
                    limit(1)
                );
                let snap = await getDocs(q);
                if (snap.empty) {
                    // Wrap: pega o menor randomSeed disponível
                    q = query(
                        collection(db, 'devotionals'),
                        where('userId', '==', user.uid),
                        orderBy('randomSeed'),
                        limit(1)
                    );
                    snap = await getDocs(q);
                }
                if (!snap.empty) {
                    window.openReadingMode(snap.docs[0].id, true);
                } else if (allRecords.length > 0) {
                    // Fallback: registros sem randomSeed (pré-migração)
                    window.openReadingMode(allRecords[Math.floor(Math.random() * allRecords.length)].id, true);
                } else {
                    showAlert("Nenhum registro encontrado.");
                }
            } catch (err) {
                console.error('Erro ao sortear registro:', err);
                // Fallback se o índice ainda não existe
                if (allRecords.length > 0) {
                    window.openReadingMode(allRecords[Math.floor(Math.random() * allRecords.length)].id, true);
                } else {
                    showAlert("Nenhum registro encontrado.");
                }
            }
        };
    }

    // Migração única: registros antigos não possuem randomSeed, o que faz a query
    // de sorteio (orderBy('randomSeed')) ignorá-los por completo, fazendo o "Sortear
    // Registro" sempre cair no fallback local (allRecords / itens já carregados).
    const backfillRandomSeeds = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const flagKey = `selah_rs_migrated_${user.uid}`;
        if (localStorage.getItem(flagKey)) return;
        try {
            let cursor = null;
            let batch = writeBatch(db);
            let opsInBatch = 0;
            let totalFixed = 0;
            while (true) {
                const q = cursor
                    ? query(collection(db, "devotionals"), where("userId", "==", user.uid), orderBy("__name__"), startAfter(cursor), limit(300))
                    : query(collection(db, "devotionals"), where("userId", "==", user.uid), orderBy("__name__"), limit(300));
                const snap = await getDocs(q);
                if (snap.empty) break;
                for (const d of snap.docs) {
                    if (d.data().randomSeed === undefined) {
                        batch.update(d.ref, { randomSeed: Math.random() });
                        opsInBatch++;
                        totalFixed++;
                        if (opsInBatch >= 400) {
                            await batch.commit();
                            batch = writeBatch(db);
                            opsInBatch = 0;
                        }
                    }
                }
                cursor = snap.docs[snap.docs.length - 1];
                if (snap.docs.length < 300) break;
            }
            if (opsInBatch > 0) await batch.commit();
            if (totalFixed > 0) console.log(`Migração randomSeed: ${totalFixed} registro(s) atualizado(s).`);
            localStorage.setItem(flagKey, '1');
        } catch (err) {
            console.error("Erro ao migrar randomSeed dos registros:", err);
        }
    };

    fetchAll().then(() => {
        backfillRandomSeeds();
        // Recuperação automática de rascunho (apenas se este módulo foi escolhido no login)
        if (window._restorePendingModule === 'registros') {
            window._restorePendingModule = null;
            const d = window.SelahDraft.load('registros');
            if (d && d.hasContent) {
                applyDraft(d);
                window.openCreateRegistrosOverlay();
                if (window.showToast) window.showToast('Rascunho recuperado');
            }
        }
    });
}
