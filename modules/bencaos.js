import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, limit, orderBy, query, startAfter, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let db;
let auth;

export function render(container) {
    container.innerHTML = `
        <div class="tab-page-header">
            <h2 class="tab-page-title"><i class="ph ph-gift"></i> Bênçãos</h2>
        </div>
        <!-- Stats Card -->
        <div class="stats-card" id="statsCardBencaos">
            <div class="stats-card-header" id="statsCardBencaosHeader" style="cursor:pointer;justify-content:center;">
                <div class="stats-quick">
                    <div class="stats-quick-item">
                        <span class="stats-quick-number" id="statsTotalBlessings">0</span>
                        <span class="stats-quick-label">Total</span>
                    </div>
                    <div class="stats-quick-item">
                        <span class="stats-quick-number" id="statsMonthBlessings">0</span>
                        <span class="stats-quick-label">Este mês</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros + Feed -->
        <div class="data-container mt-4">
            <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
                <details class="optional-fields" style="border: 1px solid var(--border-color); border-radius: var(--radius); flex: 1; min-width: 280px; margin: 0;">
                    <summary style="font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; padding: 12px; cursor: pointer; color: var(--text-muted);"><i class="ph ph-funnel"></i> Filtrar Bênçãos</summary>
                    <div class="details-content" style="padding: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px;">
                        <input type="text" id="filterBlessingKeyword" placeholder="Buscar no diário de bênçãos..." style="width: 100%;">
                        <div class="filter-dates" style="display: flex; gap: 10px; width: 100%;">
                            <input type="date" id="filterBlessingDateStart" title="Data Inicial" style="flex: 1;">
                            <input type="date" id="filterBlessingDateEnd" title="Data Final" style="flex: 1;">
                        </div>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-muted); cursor: pointer;">
                            <input type="checkbox" id="filterBlessingFavorites" style="width: auto; accent-color: var(--primary-color);">
                            <i class="ph ph-star" style="color:#3D6FA3;"></i> Apenas favoritas
                        </label>
                        <button type="button" id="btnApplyBlessingFilters" class="btn-primary" style="width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-funnel"></i> Aplicar Filtros</button>
                        <button type="button" id="btnClearBlessingFilters" class="btn-clear-filters" style="display: none;"><i class="ph ph-x-circle"></i> Limpar Filtros</button>
                    </div>
                </details>
                <button type="button" id="btnRandomBlessing" class="btn-secondary" style="height: 48px; border-radius: var(--radius); display: flex; align-items: center; gap: 8px; justify-content: center; padding: 0 20px; font-weight: 500; margin: 0;" title="Recordar Bênção Aleatória">
                    <i class="ph ph-shuffle"></i> Recordar Bênção
                </button>
            </div>

            <div id="blessingsFeed" class="feed-grid mt-4"></div>
            <div id="blessingsSentinel"></div>
        </div>

        <!-- Modal de visualização -->
        <dialog id="viewBlessingModal" class="modal view-modal">
            <div class="modal-content">
                <header class="modal-header" style="flex-direction: column; align-items: stretch;">
                    <div style="display: flex; justify-content: flex-end; align-items: center; width: 100%;">
                        <div id="viewBlessingModalActions" style="display: flex; gap: 12px; margin-right: 15px;"></div>
                        <button type="button" onclick="this.closest('dialog').close()" class="btn-icon"><i class="ph ph-x"></i></button>
                    </div>
                    <h2 id="viewBlessingTitle" style="margin-top: 5px;">Título da Bênção</h2>
                </header>
                <div id="viewBlessingBody" class="modal-body read-content"></div>
            </div>
        </dialog>

        <!-- Create / Edit Overlay -->
        <div class="create-overlay" id="createBencaosOverlay">
            <div class="overlay-dialog">
            <div class="create-overlay-header">
                <button type="button" class="create-overlay-close" id="btnCloseCreateBencaos">
                    <i class="ph ph-arrow-left"></i>
                </button>
                <h2 id="createBencaosTitleLabel">Nova Bênção</h2>
            </div>
            <div class="create-overlay-scroll">
                <main class="form-container">
                    <form id="blessingForm">
                        <input type="hidden" id="editBlessingId">

                        <div class="form-group">
                            <label for="blessingTitle"><i class="ph ph-text-t"></i> Título da Bênção</label>
                            <input type="text" id="blessingTitle" placeholder="Ex: Provisão de Trabalho / Cura da Família" required>
                        </div>

                        <div class="form-group date-group">
                            <label for="blessingDate"><i class="ph ph-calendar-blank"></i> Data do Acontecimento</label>
                            <input type="date" id="blessingDate" required>
                        </div>

                        <details class="optional-fields" id="blessingKeywordsSection" open style="border: 1px solid var(--border-color); border-radius: var(--radius); margin-bottom: 20px;">
                            <summary style="font-weight: 600;"><i class="ph ph-tag"></i> Tags / Palavras-chave</summary>
                            <div class="details-content" style="padding: 15px;">
                                <div class="tag-input-wrapper" id="blessingTagWrapper">
                                    <div class="tag-chips" id="blessingTagChips"></div>
                                    <input type="text" id="blessingTagInputField" class="tag-input-field" placeholder="Adicione tags separadas por vírgula..." autocomplete="off">
                                </div>
                                <ul id="blessingTagSuggestions" class="tag-suggestions-list" style="display:none;"></ul>
                            </div>
                        </details>

                        <div class="form-group">
                            <label><i class="ph ph-pen-nib"></i> Relato e Testemunho</label>
                            <div class="guided-question mt-2">
                                <div id="quillEditorBencaos" class="editor-container" style="min-height: 200px;"></div>
                            </div>
                        </div>

                        <div class="action-buttons mt-4">
                            <button type="submit" class="btn-primary" id="btnSubmitBlessing"><i class="ph ph-floppy-disk"></i> Registrar Gratidão</button>
                            <button type="button" class="btn-secondary" id="btnCancelBlessingEdit" style="display: none;">Cancelar Edição</button>
                        </div>
                        <button type="button" class="btn-danger" id="btnDeleteBlessingFromEdit" style="display:none;"><i class="ph ph-trash"></i> Excluir Bênção</button>
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

    // --- UTILS ---
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
        const dateInput = document.getElementById('blessingDate');
        if (dateInput) dateInput.valueAsDate = new Date();
    };
    setTodayDate();

    // --- OVERLAY OPEN/CLOSE ---
    window.openCreateBencaosOverlay = () => {
        const overlay = document.getElementById('createBencaosOverlay');
        if (!overlay) return;
        overlay.classList.add('open');
        if (!window._overlayCloseStack.includes(window._closeBencaos)) {
            window._overlayCloseStack.push(window._closeBencaos);
        }
    };

    // Desktop backdrop click
    (() => {
        const overlay = document.getElementById('createBencaosOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (window.innerWidth > 768 && e.target === overlay) {
                    window._requestCloseBencaos();
                }
            });
        }
    })();

    window.closeCreateBencaosOverlay = () => {
        const overlay = document.getElementById('createBencaosOverlay');
        if (overlay) overlay.classList.remove('open');
        const mobileToolbar = document.getElementById('mobileQuillToolbar');
        if (mobileToolbar) { mobileToolbar.style.display = 'none'; mobileToolbar.style.bottom = ''; }
        const bottomNav = document.getElementById('mobileBottomNav');
        if (bottomNav) bottomNav.style.display = '';
        window.activeQuillEditor = null;
        // Fechar/cancelar/salvar é uma saída intencional → descarta o rascunho
        if (window.SelahDraft) window.SelahDraft.clear('bencaos');
        const idx = window._overlayCloseStack.indexOf(window._closeBencaos);
        if (idx > -1) window._overlayCloseStack.splice(idx, 1);
    };

    const btnCloseCreate = document.getElementById('btnCloseCreateBencaos');
    if (btnCloseCreate) {
        btnCloseCreate.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        btnCloseCreate.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window._requestCloseBencaos();
        }, { passive: false });
        btnCloseCreate.addEventListener('click', () => {
            window._requestCloseBencaos();
        });
    }

    // --- STATS CARD → analytics overlay ---
    const statsHeader = document.getElementById('statsCardBencaosHeader');
    if (statsHeader) statsHeader.addEventListener('click', () => openBlessingAnalyticsOverlay());

    const resetFormFields = () => {
        const form = document.getElementById('blessingForm');
        if (!form) return;
        form.reset();
        document.getElementById('editBlessingId').value = "";
        document.getElementById('btnCancelBlessingEdit').style.display = 'none';
        document.getElementById('btnSubmitBlessing').innerHTML = '<i class="ph ph-floppy-disk"></i> Registrar Gratidão';
        document.getElementById('createBencaosTitleLabel').innerText = "Nova Bênção";
        const btnDelB = document.getElementById('btnDeleteBlessingFromEdit');
        if (btnDelB) btnDelB.style.display = 'none';

        if (editor) editor.root.innerHTML = "<p><br></p>";
        setTodayDate();
        if (tagManager) tagManager.clear();
    };

    const doCloseBencaos = () => {
        window.closeCreateBencaosOverlay();
        resetFormFields();
    };

    // Fecha pedindo confirmação quando há conteúdo não salvo (evita perda acidental)
    window._requestCloseBencaos = async () => {
        const ov = document.getElementById('createBencaosOverlay');
        const open = ov && ov.classList.contains('open');
        if (open) {
            let hasStuff = false;
            try { hasStuff = collectDraft().hasContent || !!document.getElementById('editBlessingId')?.value; } catch (e) {}
            if (hasStuff) {
                const ok = await showConfirm('Descartar este registro de bênção? As anotações não salvas serão perdidas.');
                if (!ok) return;
            }
        }
        doCloseBencaos();
    };

    // Usado pelo botão Voltar do sistema (popstate) e pelo botão de fechar do overlay
    window._closeBencaos = window._requestCloseBencaos;

    // --- EDITOR QUILL INDEPENDENTE ---
    const customColors = [false, '#e60000', '#ff9900', '#2A5A8C', '#008a00', '#0066cc', '#9933ff'];
    const toolbar = [['bold', 'italic', 'underline'], [{ 'color': customColors }], [{ 'header': [1, 2, false] }], ['clean']];
    const editor = new Quill('#quillEditorBencaos', { theme: 'snow', modules: { toolbar } });

    // Atalho "---" → linha horizontal
    if (editor) window._setupQuillHrShortcut && window._setupQuillHrShortcut(editor);

    if (editor) {
        editor.on('text-change', () => {
            const editId = document.getElementById('editBlessingId');
            if (editId && !editId.value) saveDraftDebounced();
        });
    }

    // --- MOBILE DOCKED TOOLBAR INTEGRATION ---
    const mobileToolbar = document.getElementById('mobileQuillToolbar');

    if (editor && mobileToolbar) {
        // Atualiza o botão "refazer" ao digitar (digitar limpa a pilha de redo)
        editor.on('text-change', () => {
            if (window.activeQuillEditor === editor) {
                window._refreshFtRedoBtn && window._refreshFtRedoBtn(editor);
            }
        });

        editor.on('selection-change', (range) => {
            if (range) {
                window.activeQuillEditor = editor;
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    const bottomNav = document.getElementById('mobileBottomNav');
                    if (bottomNav) bottomNav.style.display = 'none';
                }
                mobileToolbar.style.display = 'flex';
                if (isMobile && window._reposQuillToolbar) {
                    window._reposQuillToolbar();
                    setTimeout(window._reposQuillToolbar, 150);
                    setTimeout(window._reposQuillToolbar, 350);
                }

                const format = editor.getFormat(range);
                mobileToolbar.querySelectorAll('button').forEach(btn => {
                    const f = btn.dataset.format;
                    const v = btn.dataset.value;
                    if (f === 'clean') return;
                    let isActive = v ? (format[f] == v) : format[f];
                    btn.classList.toggle('active-format', !!isActive);
                });
                window._refreshFtListIcon && window._refreshFtListIcon(format);
                window._refreshFtHeaderIcon && window._refreshFtHeaderIcon(format);
                window._refreshFtRedoBtn && window._refreshFtRedoBtn(editor);
            } else {
                setTimeout(() => {
                    if (window.activeQuillEditor === editor && !editor.hasFocus()) {
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
    }

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

    // --- TAGS INDEX & TAGMANAGER ---
    const globalBlessingTagIndex = new Map();
    let allBlessings = [];
    let statsBlessings = []; // todas as bênçãos do usuário (estatísticas/analytics corretos)
    let lastDoc = null;
    let allLoaded = false;
    let isFetching = false;
    let sentinelObserver = null;
    const PAGE_SIZE = 15;

    const buildTagIndex = () => {
        globalBlessingTagIndex.clear();
        allBlessings.forEach(b => {
            if (b.tags) {
                b.tags.forEach(t => {
                    if (t && !globalBlessingTagIndex.has(t.toLowerCase())) globalBlessingTagIndex.set(t.toLowerCase(), t);
                });
            }
        });
    };

    class TagManager {
        constructor(config) {
            this.tags = [];
            this.activeIdx = -1;
            this.config = Object.assign({
                wrapperId: 'blessingTagWrapper',
                chipsId: 'blessingTagChips',
                inputId: 'blessingTagInputField',
                sugListId: 'blessingTagSuggestions',
                sectionId: 'blessingKeywordsSection',
                maxTags: 5,
                maxTagsMsg: "Você pode adicionar no máximo 5 tags.",
                indexMap: globalBlessingTagIndex,
                iconClass: 'ph-tag',
                placeholderMobile: "Tags de bênçãos..."
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
                const highlighted = label.replace(
                    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                    '<mark>$1</mark>'
                );
                li.innerHTML = `<i class="ph ${this.config.iconClass}"></i>${highlighted}`;
                li.addEventListener('mousedown', (e) => { e.preventDefault(); this._acceptSuggestion(key); });
                this.sugList.appendChild(li);
            });
            this.sugList.style.display = 'block';
        }

        _highlightSuggestion(items) { items.forEach((el, i) => el.classList.toggle('active', i === this.activeIdx)); }
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
                const label = this.config.indexMap.get(tag) || tag;
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

    const tagManager = new TagManager();

    // --- RASCUNHO AUTOMÁTICO ---
    let _draftTimer = null;

    const isBenOverlayOpen = () => {
        const ov = document.getElementById('createBencaosOverlay');
        return ov && ov.classList.contains('open');
    };

    const stripTags = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

    const collectDraft = () => {
        const titleV = document.getElementById('blessingTitle')?.value || '';
        const descHtml = editor ? editor.root.innerHTML : '';
        const tags = tagManager ? tagManager.getTags() : [];
        const hasContent = !!(titleV.trim() || stripTags(descHtml) !== '' || tags.length);
        return {
            hasContent,
            title: titleV,
            date: document.getElementById('blessingDate')?.value || '',
            tags,
            description: descHtml
        };
    };

    const saveDraftNow = () => {
        if (!isBenOverlayOpen()) return;
        if (document.getElementById('editBlessingId')?.value) return; // só novos
        const d = collectDraft();
        if (!d.hasContent) { window.SelahDraft.clear('bencaos'); return; }
        window.SelahDraft.save('bencaos', d);
    };

    const saveDraftDebounced = () => {
        clearTimeout(_draftTimer);
        _draftTimer = setTimeout(saveDraftNow, 800);
    };

    window._draftFlushers = window._draftFlushers || {};
    window._draftFlushers.bencaos = saveDraftNow;

    const blessingFormDraft = document.getElementById('blessingForm');
    if (blessingFormDraft) {
        blessingFormDraft.addEventListener('input', saveDraftDebounced);
        blessingFormDraft.addEventListener('change', saveDraftDebounced);
    }

    const applyDraft = (d) => {
        document.getElementById('blessingTitle').value = d.title || '';
        document.getElementById('blessingDate').value = d.date || '';
        if (tagManager) tagManager.setTags(d.tags || []);
        if (editor) editor.root.innerHTML = d.description || '<p><br></p>';
    };

    // --- FEED SKELETON ---
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
                    <div style="width:30px;"><div class="skeleton-bar sk-meta" style="width:30px;height:30px;border-radius:50%;"></div></div>
                </div>
            </div>`).join('')}
        </div>`;

    const formatDateParts = (dateStr) => {
        const [y, m, d] = dateStr.split('-');
        const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        return { day: d, month: months[parseInt(m,10)-1], year: y };
    };

    const renderFeed = (arr, replace = true) => {
        const feed = document.getElementById('blessingsFeed');
        if (!feed) return;

        if (replace && arr.length === 0) {
            feed.innerHTML = `
                <div class="records-empty-state">
                    <i class="ph ph-hands-praying"></i>
                    <p>Registre as bênçãos que o Senhor derramou sobre você.<br>Toque no <strong>+</strong> para começar.</p>
                </div>`;
            return;
        }

        const html = arr.map(b => {
            const dp = formatDateParts(b.date);
            const tagChips = (b.tags && b.tags.length)
                ? `<div class="record-card-keywords">${b.tags.map(t => `<span class="card-tag">${globalBlessingTagIndex.get(t) || t}</span>`).join('')}</div>`
                : '';
            const firstTag = (b.tags && b.tags.length) ? (globalBlessingTagIndex.get(b.tags[0]) || b.tags[0]) : '';
            return `
            <div class="record-card" id="bc-${b.id}" data-blessing-id="${b.id}">
                <div class="record-card-header" onclick="window.openBlessingReadingMode('${b.id}')">
                    <div class="record-card-date">
                        <span class="rc-day">${dp.day}</span>
                        <span class="rc-month">${dp.month}</span>
                        <span class="rc-year">${dp.year}</span>
                    </div>
                    <div class="record-card-info">
                        <div class="record-card-title">${b.title}</div>
                        <div class="record-card-meta">
                            <span class="record-type-chip chip-devocional"><i class="ph ph-gift" style="margin-right:3px;"></i>${firstTag || 'Bênção'}</span>
                        </div>
                    </div>
                    <i class="ph-fill ph-star card-fav-star${b.favorito ? ' active' : ''}" data-fav-id="${b.id}" title="Favoritar"></i>
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

    window.toggleBlessingCard = (id) => {
        const card = document.getElementById(`bc-${id}`);
        if (card) card.classList.toggle('expanded');
    };

    window.openBlessingReadingMode = (id) => {
        const b = allBlessings.find(x => x.id === id);
        if (!b) return;
        const dp = formatDateParts(b.date);
        const tagChips = (b.tags && b.tags.length)
            ? b.tags.map(t => `<span class="card-tag">${globalBlessingTagIndex.get(t) || t}</span>`).join(' ')
            : '';

        const overlay = document.createElement('div');
        overlay.className = 'reading-overlay';
        overlay.id = 'readingOverlayBencaos';
        overlay.innerHTML = `
            <div class="overlay-dialog">
            <div class="reading-scroll">
                <div class="reading-meta">${dp.day} ${dp.month} ${dp.year}</div>
                <h1 class="reading-title">${b.title}</h1>
                ${tagChips ? `<div style="margin-bottom:20px;display:flex;flex-wrap:wrap;gap:6px;">${tagChips}</div>` : ''}
                <hr class="reading-divider">
                <div class="reading-body">${b.description || ''}</div>
            </div>
            <div class="reading-bottom-bar">
                <button class="reading-close-btn" id="readingCloseBencaos"><i class="ph ph-arrow-left"></i></button>
                <div class="reading-actions-row">
                    <button class="rc-btn rc-btn-fav${b.favorito ? ' active' : ''}" id="readingFavBencaos" data-id="${b.id}"><i class="ph-fill ph-star"></i> Favorito</button>
                    <button class="rc-btn rc-btn-shuffle" id="readingShuffleBencaos"><i class="ph ph-shuffle"></i> Aleatório</button>
                    <button class="rc-btn" id="readingEditBencaos"><i class="ph ph-pencil"></i> Editar</button>
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

        overlay.addEventListener('click', (e) => {
            if (window.innerWidth > 768 && e.target === overlay) close();
        });

        document.getElementById('readingCloseBencaos').addEventListener('click', close);
        document.getElementById('readingFavBencaos').addEventListener('click', () => toggleFavoritoBlessing(b.id));
        document.getElementById('readingEditBencaos').addEventListener('click', () => {
            close();
            setTimeout(() => editBlessing(b.id), 210);
        });
        document.getElementById('readingShuffleBencaos').addEventListener('click', () => {
            close();
            setTimeout(() => {
                const pool = getBlessingShufflePool(b.id);
                if (pool.length === 0) return showAlert('Nenhuma bênção disponível com os filtros atuais.');
                window.openBlessingReadingMode(pool[Math.floor(Math.random() * pool.length)].id);
            }, 210);
        });
        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
        });
    };

    const renderStats = () => {
        const total = statsBlessings.length;
        const elTotal = document.getElementById('statsTotalBlessings');
        if (elTotal) elTotal.innerText = total;

        const now = new Date();
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        const monthCount = statsBlessings.filter(b => b.date && b.date.startsWith(monthPrefix)).length;
        const elMonth = document.getElementById('statsMonthBlessings');
        if (elMonth) elMonth.innerText = monthCount;
    };

    // Busca a contagem completa (não paginada) para estatísticas/analytics corretos
    const refreshStats = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const snap = await getDocs(query(collection(db, "blessings"), where("userId", "==", user.uid)));
            statsBlessings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
            console.error("Erro ao carregar estatísticas de bênçãos:", err);
            statsBlessings = allBlessings.slice();
        }
        renderStats();
    };

    // --- PAGINAÇÃO ---
    const initSentinelObserver = () => {
        if (sentinelObserver) sentinelObserver.disconnect();
        const sentinel = document.getElementById('blessingsSentinel');
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

        const feed = document.getElementById('blessingsFeed');
        const sentinel = document.getElementById('blessingsSentinel');

        if (isFirst && feed && !feed.dataset.loaded) {
            feed.innerHTML = feedSkeletonHTML;
        } else if (!isFirst && sentinel) {
            sentinel.innerHTML = `<div class="load-more-sentinel"><i class="ph ph-circle-notch ph-spin"></i> Carregando mais...</div>`;
        }

        try {
            let q;
            if (isFirst) {
                q = query(
                    collection(db, "blessings"),
                    where("userId", "==", user.uid),
                    orderBy("date", "desc"),
                    limit(PAGE_SIZE)
                );
            } else {
                q = query(
                    collection(db, "blessings"),
                    where("userId", "==", user.uid),
                    orderBy("date", "desc"),
                    startAfter(lastDoc),
                    limit(PAGE_SIZE)
                );
            }

            const snap = await getDocs(q);
            const newBlessings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Desempate de bênçãos no mesmo dia: mais recente (createdAt) primeiro
            newBlessings.sort((a, b) => {
                if (a.date !== b.date) return (a.date || '') < (b.date || '') ? 1 : -1;
                const ta = a.createdAt || a.updatedAt || '';
                const tb = b.createdAt || b.updatedAt || '';
                return ta < tb ? 1 : (ta > tb ? -1 : 0);
            });

            if (isFirst) {
                allBlessings = newBlessings;
                if (feed) feed.dataset.loaded = '1';
            } else {
                allBlessings = [...allBlessings, ...newBlessings];
            }

            if (snap.docs.length > 0) lastDoc = snap.docs[snap.docs.length - 1];
            if (snap.docs.length < PAGE_SIZE) allLoaded = true;

            buildTagIndex();

            if (isFirst) {
                renderFeed(newBlessings, true);
            } else {
                renderFeed(newBlessings, false);
            }
            renderStats();

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
            console.error("Erro ao carregar bênçãos:", err);
            // Fallback: query sem orderBy para evitar erro de índice composto ausente
            let fallbackOk = false;
            if (isFirst) {
                try {
                    const fallbackQ = query(
                        collection(db, "blessings"),
                        where("userId", "==", user.uid)
                    );
                    const snap = await getDocs(fallbackQ);
                    const newBlessings = snap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .sort((a, b) => {
                            if ((a.date || '') !== (b.date || '')) return (b.date || '').localeCompare(a.date || '');
                            const ta = a.createdAt || a.updatedAt || '';
                            const tb = b.createdAt || b.updatedAt || '';
                            return ta < tb ? 1 : (ta > tb ? -1 : 0);
                        });
                    allBlessings = newBlessings;
                    allLoaded = true;
                    if (feed) feed.dataset.loaded = '1';
                    buildTagIndex();
                    renderFeed(newBlessings, true);
                    renderStats();
                    if (sentinel) sentinel.innerHTML = '';
                    fallbackOk = true;
                } catch (fallbackErr) {
                    console.error("Fallback de bênçãos também falhou:", fallbackErr);
                }
            }
            if (!fallbackOk) {
                if (isFirst && feed) {
                    feed.dataset.loaded = '1';
                    feed.innerHTML = `
                        <div class="records-empty-state">
                            <i class="ph ph-hands-praying"></i>
                            <p>Registre as bênçãos que o Senhor derramou sobre você.<br>Toque no <strong>+</strong> para começar.</p>
                        </div>`;
                }
                if (sentinel) sentinel.innerHTML = '';
            }
        } finally {
            isFetching = false;
        }
    };

    const fetchBlessings = async () => {
        if (sentinelObserver) { sentinelObserver.disconnect(); sentinelObserver = null; }
        lastDoc = null;
        allLoaded = false;
        isFetching = false;
        allBlessings = [];
        await fetchPage(true);
        await refreshStats();
    };

    // --- FORM SUBMIT (CREATE & UPDATE) ---
    const blessingForm = document.getElementById('blessingForm');
    if (blessingForm) {
        blessingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btnSubmitBlessing');
            const editId = document.getElementById('editBlessingId').value;
            submitBtn.disabled = true;

            const data = {
                userId: auth.currentUser.uid,
                title: document.getElementById('blessingTitle').value.trim(),
                date: document.getElementById('blessingDate').value,
                tags: tagManager.getTags(),
                description: editor.root.innerHTML,
                updatedAt: new Date().toISOString()
            };

            try {
                if (editId) {
                    await updateDoc(doc(db, "blessings", editId), data);
                    showAlert("Testemunho atualizado com sucesso!");
                } else {
                    data.createdAt = data.updatedAt;
                    await addDoc(collection(db, "blessings"), data);
                    showAlert("Bênção registrada! Guarde e recorde a fidelidade de Deus.");
                }

                window.closeCreateBencaosOverlay();
                resetFormFields();
                fetchBlessings();
            } catch (err) {
                console.error("Erro ao registrar bênção:", err);
                showAlert("Ocorreu um erro ao salvar o registro no banco.");
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // --- INTERACTIVE ACTIONS ---
    window.viewBlessing = (id) => {
        const b = allBlessings.find(x => x.id === id);
        if (!b) return;

        document.getElementById('viewBlessingTitle').innerText = b.title;

        let html = '<div class="view-meta-grid" style="margin-bottom: 20px;">';
        html += `<div class="meta-item"><span class="meta-label">Data</span><span class="meta-value">${b.date.split('-').reverse().join('/')}</span></div>`;

        if (b.tags && b.tags.length > 0) {
            const tagHtml = b.tags.map(t => `<span class="meta-value tag capitalize" style="background: rgba(42, 90, 140, 0.15); color: var(--primary-color); border: 1px solid var(--border-color);">${globalBlessingTagIndex.get(t) || t}</span>`).join('');
            html += `<div class="meta-item full-width"><span class="meta-label">Tags</span><div style="display:flex; gap:5px; flex-wrap:wrap;">${tagHtml}</div></div>`;
        }
        html += '</div>';
        html += `<div class="view-content-area" style="border-top: 1px solid var(--border-color); padding-top: 15px;">${b.description}</div>`;

        document.getElementById('viewBlessingBody').innerHTML = html;
        document.getElementById('viewBlessingModalActions').innerHTML = `
            <button type="button" onclick="editBlessing('${b.id}')" class="btn-icon" title="Editar Bênção"><i class="ph ph-pencil"></i></button>
            <button type="button" onclick="deleteBlessing('${b.id}')" class="btn-icon text-danger" title="Excluir Bênção"><i class="ph ph-trash"></i></button>
        `;
        document.getElementById('viewBlessingModal').showModal();
    };

    window.editBlessing = (id) => {
        const modal = document.getElementById('viewBlessingModal');
        if (modal && modal.open) modal.close();

        const b = allBlessings.find(x => x.id === id);
        if (!b) return;

        document.getElementById('editBlessingId').value = b.id;
        document.getElementById('blessingTitle').value = b.title;
        document.getElementById('blessingDate').value = b.date;
        tagManager.setTags(b.tags || []);
        editor.root.innerHTML = b.description;

        document.getElementById('btnSubmitBlessing').innerHTML = '<i class="ph ph-check"></i> Atualizar Gratidão';
        document.getElementById('btnCancelBlessingEdit').style.display = 'block';
        document.getElementById('createBencaosTitleLabel').innerText = "Editando Bênção";
        const btnDelB = document.getElementById('btnDeleteBlessingFromEdit');
        if (btnDelB) btnDelB.style.display = 'flex';

        window.openCreateBencaosOverlay();
    };

    window.deleteBlessing = async (id) => {
        if (await showConfirm("Tem certeza de que deseja apagar este registro de bênção?")) {
            await deleteDoc(doc(db, "blessings", id));
            const modal = document.getElementById('viewBlessingModal');
            if (modal && modal.open) modal.close();
            fetchBlessings();
        }
    };

    const btnCancelBlessingEdit = document.getElementById('btnCancelBlessingEdit');
    if (btnCancelBlessingEdit) {
        btnCancelBlessingEdit.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        btnCancelBlessingEdit.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window._requestCloseBencaos();
        }, { passive: false });
        btnCancelBlessingEdit.onclick = () => {
            window._requestCloseBencaos();
        };
    }

    const btnDeleteBlessingFromEdit = document.getElementById('btnDeleteBlessingFromEdit');
    if (btnDeleteBlessingFromEdit) {
        btnDeleteBlessingFromEdit.addEventListener('click', async () => {
            const editId = document.getElementById('editBlessingId').value;
            if (!editId) return;
            if (!await showConfirm("Tem certeza de que deseja apagar este registro de bênção?")) return;
            window.closeCreateBencaosOverlay();
            resetFormFields();
            setTimeout(async () => {
                await deleteDoc(doc(db, "blessings", editId));
                fetchBlessings();
            }, 210);
        });
    }

    // --- FAVORITOS (BÊNÇÃOS) ---
    const toggleFavoritoBlessing = async (id) => {
        const b = allBlessings.find(x => x.id === id);
        if (!b) return;
        const newVal = !b.favorito;
        b.favorito = newVal;
        try {
            await updateDoc(doc(db, 'blessings', id), { favorito: newVal });
        } catch (err) {
            b.favorito = !newVal;
            console.error('Erro ao atualizar favorito:', err);
            return;
        }
        const star = document.querySelector(`.card-fav-star[data-fav-id="${id}"]`);
        if (star) star.classList.toggle('active', newVal);
        const favBtn = document.getElementById('readingFavBencaos');
        if (favBtn && favBtn.dataset.id === id) {
            favBtn.classList.toggle('active', newVal);
        }
        navigator.vibrate?.(30);
        if (blessingFilterState.favorites && !newVal) {
            const card = document.getElementById(`bc-${id}`);
            if (card) { card.style.transition = 'opacity 0.2s'; card.style.opacity = '0'; setTimeout(() => card.remove(), 200); }
        }
    };

    // Long-press on blessing cards
    const blessingFeed = document.getElementById('blessingsFeed');
    if (blessingFeed) {
        let lpTimer = null;
        let lpStartX = 0, lpStartY = 0;

        blessingFeed.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.card-fav-star')) return;
            const card = e.target.closest('[data-blessing-id]');
            if (!card) return;
            lpStartX = e.clientX; lpStartY = e.clientY;
            lpTimer = setTimeout(() => { lpTimer = null; toggleFavoritoBlessing(card.dataset.blessingId); }, 500);
        });
        blessingFeed.addEventListener('pointermove', (e) => {
            if (!lpTimer) return;
            if (Math.abs(e.clientX - lpStartX) > 8 || Math.abs(e.clientY - lpStartY) > 8) { clearTimeout(lpTimer); lpTimer = null; }
        });
        blessingFeed.addEventListener('pointerup', () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } });
        blessingFeed.addEventListener('pointercancel', () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } });
        blessingFeed.addEventListener('click', (e) => {
            const star = e.target.closest('.card-fav-star');
            if (!star) return;
            e.stopPropagation();
            toggleFavoritoBlessing(star.dataset.favId);
        }, true);
    }

    // --- FILTERS & RANDOM ---
    const blessingFilterState = { keyword: '', dateStart: '', dateEnd: '', favorites: false };

    const hasBlessingActiveFilter = () =>
        !!(blessingFilterState.keyword || blessingFilterState.dateStart || blessingFilterState.dateEnd || blessingFilterState.favorites);

    const applyBlessingFilter = (arr) => arr.filter(b => {
        if (blessingFilterState.keyword) {
            const k = blessingFilterState.keyword;
            if (!(b.title?.toLowerCase().includes(k) || b.description?.toLowerCase().includes(k) || b.tags?.some(t => t.toLowerCase().includes(k)))) return false;
        }
        if (blessingFilterState.dateStart && b.date < blessingFilterState.dateStart) return false;
        if (blessingFilterState.dateEnd && b.date > blessingFilterState.dateEnd) return false;
        if (blessingFilterState.favorites && !b.favorito) return false;
        return true;
    });

    const getBlessingShufflePool = (excludeId = null) => {
        let pool = hasBlessingActiveFilter() ? applyBlessingFilter(allBlessings) : allBlessings.slice();
        if (excludeId) pool = pool.filter(x => x.id !== excludeId);
        return pool;
    };

    const syncClearBlessingFiltersBtn = () => {
        const btn = document.getElementById('btnClearBlessingFilters');
        if (btn) btn.style.display = hasBlessingActiveFilter() ? 'flex' : 'none';
    };

    const btnApplyFilters = document.getElementById('btnApplyBlessingFilters');
    if (btnApplyFilters) {
        btnApplyFilters.onclick = () => {
            blessingFilterState.keyword = document.getElementById('filterBlessingKeyword').value.toLowerCase().trim();
            blessingFilterState.dateStart = document.getElementById('filterBlessingDateStart').value;
            blessingFilterState.dateEnd = document.getElementById('filterBlessingDateEnd').value;
            blessingFilterState.favorites = document.getElementById('filterBlessingFavorites')?.checked || false;
            syncClearBlessingFiltersBtn();
            renderFeed(applyBlessingFilter(allBlessings), true);
        };
    }

    const btnClearBlessingFilters = document.getElementById('btnClearBlessingFilters');
    if (btnClearBlessingFilters) {
        btnClearBlessingFilters.onclick = () => {
            blessingFilterState.keyword = ''; blessingFilterState.dateStart = ''; blessingFilterState.dateEnd = ''; blessingFilterState.favorites = false;
            const kw = document.getElementById('filterBlessingKeyword'); if (kw) kw.value = '';
            const ds = document.getElementById('filterBlessingDateStart'); if (ds) ds.value = '';
            const de = document.getElementById('filterBlessingDateEnd'); if (de) de.value = '';
            const fv = document.getElementById('filterBlessingFavorites'); if (fv) fv.checked = false;
            syncClearBlessingFiltersBtn();
            renderFeed(allBlessings, true);
        };
    }

    const btnRandom = document.getElementById('btnRandomBlessing');
    if (btnRandom) {
        btnRandom.onclick = () => {
            const pool = getBlessingShufflePool();
            if (pool.length === 0) return showAlert(hasBlessingActiveFilter() ? 'Nenhuma bênção disponível com os filtros atuais.' : 'Registre algumas bênçãos antes de sortear!');
            window.openBlessingReadingMode(pool[Math.floor(Math.random() * pool.length)].id);
        };
    }

    // --- ANALYTICS OVERLAY (BÊNÇÃOS) ---
    const openBlessingAnalyticsOverlay = () => {
        const overlay = document.createElement('div');
        overlay.className = 'reading-overlay analytics-overlay';

        const data = statsBlessings;
        const now = new Date();
        const monthlyData = Array.from({length:6}, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const prefix = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            return { label: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][d.getMonth()], count: data.filter(b => b.date && b.date.startsWith(prefix)).length };
        });
        const yearCount = data.filter(b => b.date && b.date.startsWith(now.getFullYear().toString())).length;
        const monthCount = data.filter(b => b.date && b.date.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`)).length;

        const tagCounts = {};
        data.forEach(b => (b.tags||[]).forEach(t => { tagCounts[t] = (tagCounts[t]||0)+1; }));
        const sortedTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
        const hasTagChart = sortedTags.length > 0;

        overlay.innerHTML = `
            <div class="overlay-dialog">
            <div class="reading-toolbar">
                <button class="reading-close-btn" id="bAnalyticsClose"><i class="ph ph-arrow-left"></i></button>
                <span class="analytics-overlay-title">Analytics · Bênçãos</span>
                <div style="width:36px;"></div>
            </div>
            <div class="reading-scroll analytics-scroll">
                <div class="analytics-stats-row">
                    <div class="analytics-stat-item"><span class="analytics-stat-num">${data.length}</span><span class="analytics-stat-lbl">Total</span></div>
                    <div class="analytics-stat-item"><span class="analytics-stat-num">${monthCount}</span><span class="analytics-stat-lbl">Este mês</span></div>
                    <div class="analytics-stat-item"><span class="analytics-stat-num">${yearCount}</span><span class="analytics-stat-lbl">Este ano</span></div>
                </div>
                ${hasTagChart ? `<div class="analytics-card"><h3 class="analytics-card-title">Por Tag</h3><div class="analytics-chart-box"><canvas id="bTagChart"></canvas></div></div>` : ''}
                <div class="analytics-card"><h3 class="analytics-card-title">Últimos 6 Meses</h3><div class="analytics-chart-box"><canvas id="bMonthlyChart"></canvas></div></div>
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
        const base = { responsive:true, maintainAspectRatio:false };

        let cA, cB;
        if (hasTagChart) {
            cA = new Chart(document.getElementById('bTagChart'), {
                type:'doughnut', data:{ labels:sortedTags.map(t=>(globalBlessingTagIndex.get(t[0])||t[0])), datasets:[{data:sortedTags.map(t=>t[1]),backgroundColor:chartPalette,borderColor:cCardBg,borderWidth:2}] },
                options:{...base,cutout:'62%',plugins:{legend:{position:'bottom',labels:{color:cText,boxWidth:12,padding:10,font:{size:11}}}}}
            });
        }
        cB = new Chart(document.getElementById('bMonthlyChart'), {
            type:'bar', data:{ labels:monthlyData.map(m=>m.label), datasets:[{label:'Bênçãos',data:monthlyData.map(m=>m.count),backgroundColor:cBar,borderRadius:4}] },
            options:{...base,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:cMuted,font:{size:10}},grid:{color:cBorder}},x:{ticks:{color:cMuted,font:{size:10}},grid:{display:false}}}}
        });

        const close = () => {
            const idx = window._overlayCloseStack.indexOf(close);
            if (idx > -1) window._overlayCloseStack.splice(idx, 1);
            if (cA) cA.destroy();
            cB.destroy();
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 200);
        };
        window._overlayCloseStack.push(close);
        overlay.querySelector('#bAnalyticsClose').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (window.innerWidth > 768 && e.target === overlay) close();
        });
    };

    fetchBlessings().then(() => {
        if (window._restorePendingModule === 'bencaos') {
            window._restorePendingModule = null;
            const d = window.SelahDraft.load('bencaos');
            if (d && d.hasContent) {
                applyDraft(d);
                window.openCreateBencaosOverlay();
                if (window.showToast) window.showToast('Rascunho recuperado');
            }
        }
    });
}
