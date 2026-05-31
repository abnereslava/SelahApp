import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

let db;
let auth;

export function render(container) {
    container.innerHTML = `
        <details class="collapsible-section" open>
            <summary class="collapsible-summary">
                <div class="summary-content">
                    <i class="ph ph-gift"></i>
                    <span>Nova Bênção</span>
                </div>
                <i class="ph ph-caret-down caret-icon"></i>
            </summary>
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
                                <input type="text" id="blessingTagInputField" class="tag-input-field"
                                    placeholder="Adicione tags separadas por vírgula..."
                                    autocomplete="off">
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
                        <button type="submit" class="btn-primary" id="btnSubmitBlessing"><i
                                class="ph ph-floppy-disk"></i> Registrar Gratidão</button>
                        <button type="button" class="btn-secondary" id="btnCancelBlessingEdit"
                            style="display: none;">Cancelar Edição</button>
                    </div>
                </form>
            </main>
        </details>

        <details class="collapsible-section">
            <summary class="collapsible-summary">
                <div class="summary-content">
                    <i class="ph ph-heart"></i>
                    <span>Minhas Bênçãos (Diário)</span>
                </div>
                <i class="ph ph-caret-down caret-icon"></i>
            </summary>
            <main class="data-container mt-4">
                <!-- Painel de Estatísticas de Gratidão -->
                <div class="charts-grid mb-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div class="chart-wrapper text-center" style="padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase;">Total de Bênçãos</span>
                        <h2 id="statsTotalBlessings" style="font-size: 2.5rem; color: var(--text-main); margin: 0; font-family: 'Playfair Display', serif;">0</h2>
                    </div>
                    <div class="chart-wrapper text-center" style="padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase;">Este Mês</span>
                        <h2 id="statsMonthBlessings" style="font-size: 2.5rem; color: var(--text-main); margin: 0; font-family: 'Playfair Display', serif;">0</h2>
                    </div>
                    <div class="chart-wrapper text-center" style="padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                        <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase;">Tag Principal</span>
                        <h2 id="statsTopTag" style="font-size: 1.25rem; color: var(--text-main); margin: 0; font-weight: 600; text-transform: capitalize;">Nenhuma</h2>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
                    <details class="optional-fields" style="border: 1px solid var(--border-color); border-radius: var(--radius); flex: 1; min-width: 280px; margin: 0; background: var(--secondary-color);">
                        <summary style="font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; padding: 12px; cursor: pointer; color: var(--text-muted);"><i class="ph ph-funnel"></i> Filtrar Bênçãos</summary>
                        <div class="details-content" style="padding: 15px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px;">
                            <input type="text" id="filterBlessingKeyword" placeholder="Buscar no diário de bênçãos..." style="width: 100%;">
                            <div class="filter-dates" style="display: flex; gap: 10px; width: 100%;">
                                <input type="date" id="filterBlessingDateStart" title="Data Inicial" style="flex: 1;">
                                <input type="date" id="filterBlessingDateEnd" title="Data Final" style="flex: 1;">
                            </div>
                            <button type="button" id="btnApplyBlessingFilters" class="btn-primary" style="width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-funnel"></i> Aplicar Filtros</button>
                        </div>
                    </details>
                    <button type="button" id="btnRandomBlessing" class="btn-secondary" style="height: 48px; border-radius: var(--radius); display: flex; align-items: center; gap: 8px; justify-content: center; padding: 0 20px; font-weight: 500; margin: 0;" title="Recordar Bênção Aleatória">
                        <i class="ph ph-shuffle"></i> Recordar Bênção
                    </button>
                </div>

                <!-- Feed do Diário de Bênçãos (Estilo Timeline Premium) -->
                <div id="blessingsFeed" class="feed-grid mt-4"></div>
            </main>
        </details>

        <!-- Modais da tela de bênçãos -->
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
        const dateInput = document.getElementById('blessingDate');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
    };
    setTodayDate();

    const resetFormFields = () => {
        const form = document.getElementById('blessingForm');
        if (!form) return;
        form.reset();
        document.getElementById('editBlessingId').value = "";
        document.getElementById('btnCancelBlessingEdit').style.display = 'none';
        document.getElementById('btnSubmitBlessing').innerHTML = '<i class="ph ph-floppy-disk"></i> Registrar Gratidão';

        const draft = localStorage.getItem('selah_draft_bencaos');
        if (editor) {
            editor.root.innerHTML = draft ? draft : "<p><br></p>";
        }
        setTodayDate();
        if (tagManager) tagManager.clear();
    };

    // --- EDITOR QUILL INDEPENDENTE ---
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
    const editor = new Quill('#quillEditorBencaos', { theme: 'snow', modules: { toolbar } });

    const savedDraft = localStorage.getItem('selah_draft_bencaos');
    if (savedDraft && editor) {
        editor.root.innerHTML = savedDraft;
    }

    if (editor) {
        editor.on('text-change', () => {
            const editId = document.getElementById('editBlessingId');
            if (editId && !editId.value) {
                localStorage.setItem('selah_draft_bencaos', editor.root.innerHTML);
            }
        });
    }

    // --- MOBILE DOCKED TOOLBAR INTEGRATION ---
    const mobileToolbar = document.getElementById('mobileQuillToolbar');
    
    if (editor && mobileToolbar) {
        editor.on('selection-change', (range) => {
            if (window.innerWidth > 768) return; // only for mobile!

            if (range) {
                // Editor gained focus
                window.activeQuillEditor = editor;
                
                // Hide bottom nav to avoid clashing
                const bottomNav = document.getElementById('mobileBottomNav');
                if (bottomNav) bottomNav.style.display = 'none';
                
                // Show mobile toolbar docked at bottom
                mobileToolbar.style.display = 'flex';
                
                // Update button format states
                const format = editor.getFormat(range);
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
                    if (window.activeQuillEditor === editor && !editor.hasFocus()) {
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

    // --- TAGS INDEX & TAGMANAGER ---
    const globalBlessingTagIndex = new Map();
    let allBlessings = [];

    const buildTagIndex = () => {
        globalBlessingTagIndex.clear();
        allBlessings.forEach(b => {
            if (b.tags) {
                b.tags.forEach(t => {
                    if (t && !globalBlessingTagIndex.has(t.toLowerCase())) {
                        globalBlessingTagIndex.set(t.toLowerCase(), t);
                    }
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

    const tagManager = new TagManager();

    // --- CRUD OPERATING SYSTEM ---
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

    const fetchBlessings = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const feed = document.getElementById('blessingsFeed');
            if (feed && !feed.dataset.loaded) {
                feed.innerHTML = feedSkeletonHTML;
            }

            const q = query(
                collection(db, "blessings"),
                where("userId", "==", user.uid),
                orderBy("date", "desc")
            );

            const snap = await getDocs(q);
            allBlessings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            if (feed) feed.dataset.loaded = '1';

            buildTagIndex();
            renderStats();
            renderFeed(allBlessings);
        } catch (err) {
            console.error("Erro ao carregar diário de bênçãos:", err);
        }
    };

    const formatDateParts = (dateStr) => {
        const [y, m, d] = dateStr.split('-');
        const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        return { day: d, month: months[parseInt(m,10)-1], year: y };
    };

    const renderFeed = (arr) => {
        const feed = document.getElementById('blessingsFeed');
        if (!feed) return;

        if (arr.length === 0) {
            feed.innerHTML = `
                <div class="records-empty-state">
                    <i class="ph ph-hands-praying"></i>
                    <p>Registre as bênçãos que o Senhor derramou sobre você.<br>A gratidão transforma o coração.</p>
                </div>`;
            return;
        }

        feed.className = 'records-feed mt-2';
        feed.innerHTML = arr.map(b => {
            const dp = formatDateParts(b.date);
            const tagChips = (b.tags && b.tags.length)
                ? `<div class="record-card-keywords">${b.tags.map(t => `<span class="card-tag">${globalBlessingTagIndex.get(t) || t}</span>`).join('')}</div>`
                : '';
            return `
            <div class="record-card" id="bc-${b.id}">
                <div class="record-card-header" onclick="window.toggleBlessingCard('${b.id}')">
                    <div class="record-card-date">
                        <span class="rc-day">${dp.day}</span>
                        <span class="rc-month">${dp.month}</span>
                        <span class="rc-year">${dp.year}</span>
                    </div>
                    <div class="record-card-info">
                        <div class="record-card-title">${b.title}</div>
                    </div>
                    <div class="record-card-right">
                        <i class="ph ph-gift" style="color:var(--primary-color);opacity:0.7;font-size:1.1rem;"></i>
                        <i class="ph ph-caret-down record-card-chevron"></i>
                    </div>
                </div>
                <div class="record-card-body">
                    <div class="record-card-body-inner">
                        <div class="record-card-content">
                            <div class="record-card-text">${b.description || ''}</div>
                            ${tagChips}
                            <div class="record-card-actions">
                                <button class="rc-btn rc-btn-read" onclick="window.openBlessingReadingMode('${b.id}')"><i class="ph ph-book-open-text"></i> Ler</button>
                                <button class="rc-btn" onclick="editBlessing('${b.id}')"><i class="ph ph-pencil"></i> Editar</button>
                                <button class="rc-btn rc-btn-delete" onclick="deleteBlessing('${b.id}')"><i class="ph ph-trash"></i> Excluir</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
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
            <div class="reading-toolbar">
                <button class="reading-close-btn" id="readingCloseBencaos"><i class="ph ph-arrow-left"></i></button>
                <div class="reading-actions-row">
                    <button class="rc-btn" onclick="editBlessing('${b.id}'); document.getElementById('readingOverlayBencaos')?.remove()"><i class="ph ph-pencil"></i> Editar</button>
                </div>
            </div>
            <div class="reading-scroll">
                <div class="reading-meta">${dp.day} ${dp.month} ${dp.year}</div>
                <h1 class="reading-title">${b.title}</h1>
                ${tagChips ? `<div style="margin-bottom:20px;display:flex;flex-wrap:wrap;gap:6px;">${tagChips}</div>` : ''}
                <hr class="reading-divider">
                <div class="reading-body">${b.description || ''}</div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = () => {
            overlay.classList.add('closing');
            setTimeout(() => overlay.remove(), 200);
        };

        document.getElementById('readingCloseBencaos').addEventListener('click', close);
        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
        });
    };

    const renderStats = () => {
        const total = allBlessings.length;
        document.getElementById('statsTotalBlessings').innerText = total;

        // Bênçãos no mês atual
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const monthPrefix = `${year}-${month}`;

        const monthCount = allBlessings.filter(b => b.date.startsWith(monthPrefix)).length;
        document.getElementById('statsMonthBlessings').innerText = monthCount;

        // Tag mais frequente
        const tagCounts = {};
        allBlessings.forEach(b => {
            if (b.tags) {
                b.tags.forEach(t => {
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
        const statsTopTagEl = document.getElementById('statsTopTag');
        if (sortedTags.length > 0) {
            const topTag = globalBlessingTagIndex.get(sortedTags[0][0]) || sortedTags[0][0];
            statsTopTagEl.innerText = `${topTag} (${sortedTags[0][1]}x)`;
            statsTopTagEl.style.color = "var(--text-main)";
        } else {
            statsTopTagEl.innerText = "Nenhuma";
            statsTopTagEl.style.color = "var(--text-muted)";
        }
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
                    localStorage.removeItem('selah_draft_bencaos');
                }

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
            const tagHtml = b.tags.map(t => `<span class="meta-value tag capitalize" style="background: rgba(212, 175, 55, 0.15); color: var(--primary-color); border: 1px solid var(--border-color);">${globalBlessingTagIndex.get(t) || t}</span>`).join('');
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

        // Rolagem e abertura do formulário
        const coll = document.querySelector('.collapsible-section');
        if (coll && !coll.hasAttribute('open')) {
            coll.setAttribute('open', '');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteBlessing = async (id) => {
        if (await showConfirm("Tem certeza de que deseja apagar este registro de bênção permanentemente? Recordar a bondade de Deus fortalece nossa fé!")) {
            await deleteDoc(doc(db, "blessings", id));

            const modal = document.getElementById('viewBlessingModal');
            if (modal && modal.open) modal.close();

            fetchBlessings();
        }
    };

    const btnCancelBlessingEdit = document.getElementById('btnCancelBlessingEdit');
    if (btnCancelBlessingEdit) {
        btnCancelBlessingEdit.onclick = () => {
            resetFormFields();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // --- FILTERS & RECORDING (RANDOM) ---
    const btnApplyFilters = document.getElementById('btnApplyBlessingFilters');
    if (btnApplyFilters) {
        btnApplyFilters.onclick = () => {
            const k = document.getElementById('filterBlessingKeyword').value.toLowerCase();
            const dStart = document.getElementById('filterBlessingDateStart').value;
            const dEnd = document.getElementById('filterBlessingDateEnd').value;

            const filtered = allBlessings.filter(b => {
                let match = true;
                if (k && !(b.title.toLowerCase().includes(k) || b.description.toLowerCase().includes(k) || b.tags?.some(t => t.includes(k)))) match = false;
                if (dStart && b.date < dStart) match = false;
                if (dEnd && b.date > dEnd) match = false;
                return match;
            });

            renderFeed(filtered);
        };
    }

    const btnRandom = document.getElementById('btnRandomBlessing');
    if (btnRandom) {
        btnRandom.onclick = () => {
            if (allBlessings.length === 0) return showAlert("Registre algumas bênçãos antes de sortear!");
            const randomIdx = Math.floor(Math.random() * allBlessings.length);
            window.viewBlessing(allBlessings[randomIdx].id);
        };
    }

    // Carregar bênçãos na inicialização
    fetchBlessings();
}
