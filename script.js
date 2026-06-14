import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- AUTENTICAÇÃO DOM ---
const btnGoogleLogin = document.getElementById('btnGoogleLogin');
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

// Swipe to close logic
let touchStartX = 0;
let touchMoveX = 0;

if (sidebar) {
    sidebar.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        sidebar.style.transition = 'none';
    }, { passive: true });

    sidebar.addEventListener('touchmove', e => {
        touchMoveX = e.touches[0].clientX;
        let diff = touchMoveX - touchStartX;

        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            if (diff < 0) {
                sidebar.style.transform = `translateX(${diff}px)`;
                const opacity = 0.7 * (1 + diff / 280);
                if (sidebarOverlay) sidebarOverlay.style.opacity = Math.max(0, opacity);
            }
        }
    }, { passive: true });

    sidebar.addEventListener('touchend', e => {
        sidebar.style.transition = '';
        sidebar.style.transform = '';
        if (sidebarOverlay) sidebarOverlay.style.opacity = '';

        let diff = touchMoveX - touchStartX;
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            if (diff < -100) {
                closeMobileSidebar();
            }
        }
        touchStartX = 0;
        touchMoveX = 0;
    }, { passive: true });
}

// --- QUILL TOOLBAR: segue o teclado via Visual Viewport API ---
const reposQuillToolbar = () => {
    const toolbar = document.getElementById('mobileQuillToolbar');
    if (!toolbar || toolbar.style.display === 'none') return;
    if (window.innerWidth > 768) return; // no desktop a posição é fixa (CSS)
    if (!window.visualViewport) return;
    const vv = window.visualViewport;
    // Distância entre o bottom do viewport visual e o bottom do layout viewport
    const offsetFromBottom = window.innerHeight - (vv.offsetTop + vv.height);
    // setProperty com 'important' para vencer o `bottom: 0 !important` do CSS
    toolbar.style.setProperty('bottom', Math.max(0, offsetFromBottom) + 'px', 'important');

    // Rola o container do formulário para manter o cursor do Quill visível acima do teclado.
    const editor = window.activeQuillEditor;
    if (!editor) return;
    const range = editor.getSelection();
    if (!range) return;
    try {
        const bounds = editor.getBounds(range.index); // posição do cursor relativa ao editor
        const editorEl = editor.root;
        const scrollEl = editorEl.closest('.create-overlay-scroll');
        if (!scrollEl) return;
        const editorRect = editorEl.getBoundingClientRect();
        // Posição vertical do cursor relativa à tela
        const cursorBottom = editorRect.top + bounds.top + bounds.height;
        // Limite inferior visível: topo do teclado menos a altura da toolbar flutuante
        const toolbarH = toolbar.offsetHeight || 48;
        const visibleBottom = vv.offsetTop + vv.height - toolbarH - 8;
        if (cursorBottom > visibleBottom) {
            scrollEl.scrollTop += cursorBottom - visibleBottom + 16;
        }
    } catch (_) {}
};
// Exposto para que os módulos reposicionem assim que a toolbar é exibida
window._reposQuillToolbar = reposQuillToolbar;
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', reposQuillToolbar);
    window.visualViewport.addEventListener('scroll', reposQuillToolbar);
}

// --- QUILL: LINHA HORIZONTAL (HR) ---
// Quill 1.3.6 não tem HR nativo; registramos um blot de bloco embutido.
if (window.Quill && !window._hrBlotRegistered) {
    const BlockEmbed = Quill.import('blots/block/embed');
    class HrBlot extends BlockEmbed {}
    HrBlot.blotName = 'hr';
    HrBlot.tagName = 'hr';
    Quill.register(HrBlot, true);
    window._hrBlotRegistered = true;
}

// Insere uma linha horizontal na posição do cursor do editor informado.
window._insertQuillHr = (editor) => {
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range ? range.index : editor.getLength();
    editor.insertText(index, '\n', 'user');
    editor.insertEmbed(index + 1, 'hr', true, 'user');
    editor.setSelection(index + 2, 'silent');
};

// Atalho markdown: uma linha contendo apenas "---" vira uma linha horizontal.
window._setupQuillHrShortcut = (editor) => {
    if (!editor || editor.__hrShortcutBound) return;
    editor.__hrShortcutBound = true;
    editor.on('text-change', (delta, oldDelta, source) => {
        if (source !== 'user' || editor.__hrConverting) return;
        const sel = editor.getSelection();
        if (!sel) return;
        const [line, offset] = editor.getLine(sel.index);
        if (!line || !line.domNode) return;
        if (line.domNode.textContent === '---') {
            const lineStart = sel.index - offset;
            editor.__hrConverting = true;
            editor.deleteText(lineStart, 3, 'user');
            editor.insertEmbed(lineStart, 'hr', true, 'user');
            editor.setSelection(lineStart + 1, 'silent');
            editor.__hrConverting = false;
        }
    });
};

// Atualiza o ícone do botão único de lista conforme o estado atual.
window._refreshFtListIcon = (format) => {
    const b = document.getElementById('ftBtnList');
    if (!b) return;
    const i = b.querySelector('i');
    if (i) i.className = (format && format.list === 'ordered') ? 'ph ph-list-numbers' : 'ph ph-list-bullets';
};


// --- RASCUNHO AUTOMÁTICO (auto-save de registros em andamento) ---
window.SelahDraft = {
    _uid() {
        try { return (auth.currentUser && auth.currentUser.uid) || 'anon'; }
        catch (e) { return 'anon'; }
    },
    key(module) { return `selah_draft_v2_${module}_${this._uid()}`; },
    save(module, data) {
        try {
            const payload = { ...data, savedAt: new Date().toISOString() };
            localStorage.setItem(this.key(module), JSON.stringify(payload));
        } catch (e) { /* cota cheia ou indisponível — ignora */ }
    },
    load(module) {
        try {
            const raw = localStorage.getItem(this.key(module));
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    },
    clear(module) {
        try { localStorage.removeItem(this.key(module)); } catch (e) { /* ignora */ }
    }
};

// --- TOAST LEVE ---
window.showToast = (msg, ms = 3200) => {
    let toast = document.getElementById('selahToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'selahToast';
        toast.className = 'selah-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="ph ph-bookmark-simple"></i> <span>${msg}</span>`;
    clearTimeout(window._selahToastTimer);
    // força reflow para reiniciar a animação
    void toast.offsetWidth;
    toast.classList.add('visible');
    window._selahToastTimer = setTimeout(() => toast.classList.remove('visible'), ms);
};

// Escolhe o módulo (registros/bencaos) com o rascunho mais recente e com conteúdo,
// limitado às features liberadas para o usuário. Retorna o nome do módulo ou null.
const pickDraftModuleToRestore = () => {
    const candidates = ['registros', 'bencaos'].filter(m => currentUserFeatures.includes(m));
    let best = null;
    candidates.forEach(m => {
        const d = window.SelahDraft.load(m);
        if (d && d.hasContent && d.savedAt) {
            if (!best || d.savedAt > best.savedAt) best = { module: m, savedAt: d.savedAt };
        }
    });
    return best ? best.module : null;
};

// Garante salvamento nos momentos críticos (app vai para segundo plano / descarrega).
// Cada módulo registra seu flush em window._draftFlushers[modulo]; cada flush só
// grava se o overlay de criação daquele módulo estiver aberto.
const initDraftFlushHandlers = () => {
    if (window._draftGlobalBound) return;
    window._draftGlobalBound = true;
    const flush = () => {
        const flushers = window._draftFlushers || {};
        Object.keys(flushers).forEach(k => { try { flushers[k](); } catch (e) {} });
    };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
    window.addEventListener('pagehide', flush);
};

// --- OVERLAY STACK (back-button handling) ---
window._overlayCloseStack = [];

const initBackButtonHandler = () => {
    if (!history.state?.selah) history.pushState({ selah: true }, '');

    window.addEventListener('popstate', () => {
        if (window._overlayCloseStack.length > 0) {
            const closeFn = window._overlayCloseStack[window._overlayCloseStack.length - 1];
            closeFn();
        } else {
            // No overlay open — stay in app
        }
        history.pushState({ selah: true }, '');
    });
};

// --- FAB / BOTTOM SHEET ---
const fabSheet = document.getElementById('fabSheet');
const fabSheetOverlay = document.getElementById('fabSheetOverlay');
const btnFab = document.getElementById('btnFab');
const btnDesktopFab = document.getElementById('btnDesktopFab');
const desktopFabDropdown = document.getElementById('desktopFabDropdown');

const openDesktopDropdown = () => {
    if (!desktopFabDropdown) return;
    const hasReg = currentUserFeatures.includes('registros');
    const hasBen = currentUserFeatures.includes('bencaos');
    const optReg = document.getElementById('desktopFabOptRegistros');
    const optBen = document.getElementById('desktopFabOptBencaos');
    if (optReg) optReg.style.display = hasReg ? '' : 'none';
    if (optBen) optBen.style.display = hasBen ? '' : 'none';

    if (hasReg && !hasBen) { window.openCreateOverlay('registros'); return; }
    if (!hasReg && hasBen) { window.openCreateOverlay('bencaos'); return; }

    desktopFabDropdown.classList.add('open');
};

const closeDesktopDropdown = () => {
    if (desktopFabDropdown) desktopFabDropdown.classList.remove('open');
};

const openFabSheet = () => {
    if (!fabSheet) return;
    const hasReg = currentUserFeatures.includes('registros');
    const hasBen = currentUserFeatures.includes('bencaos');
    const optReg = document.getElementById('fabOptRegistros');
    const optBen = document.getElementById('fabOptBencaos');
    if (optReg) optReg.style.display = hasReg ? '' : 'none';
    if (optBen) optBen.style.display = hasBen ? '' : 'none';

    if (hasReg && !hasBen) { window.openCreateOverlay('registros'); return; }
    if (!hasReg && hasBen) { window.openCreateOverlay('bencaos'); return; }

    fabSheet.classList.add('visible');
    fabSheetOverlay.classList.add('visible');
    window._overlayCloseStack.push(closeFabSheet);
};

const closeFabSheet = () => {
    if (!fabSheet) return;
    fabSheet.classList.remove('visible');
    fabSheetOverlay.classList.remove('visible');
    const idx = window._overlayCloseStack.indexOf(closeFabSheet);
    if (idx > -1) window._overlayCloseStack.splice(idx, 1);
};

window.openCreateOverlay = (type) => {
    closeFabSheet();
    closeDesktopDropdown();
    // Verifica se o elemento do overlay existe no DOM (só existe quando o tab correto está ativo)
    const overlayId = type === 'registros' ? 'createRegistrosOverlay' : 'createBencaosOverlay';
    const fn = type === 'registros' ? window.openCreateRegistrosOverlay : window.openCreateBencaosOverlay;
    if (fn && document.getElementById(overlayId)) {
        fn();
    } else {
        window._pendingCreateOverlay = type;
        window.location.hash = type;
    }
};

if (btnFab) btnFab.addEventListener('click', openFabSheet);
if (btnDesktopFab) btnDesktopFab.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.innerWidth > 768) {
        if (desktopFabDropdown && desktopFabDropdown.classList.contains('open')) {
            closeDesktopDropdown();
        } else {
            openDesktopDropdown();
        }
    } else {
        openFabSheet();
    }
});
if (fabSheetOverlay) fabSheetOverlay.addEventListener('click', closeFabSheet);

// Close desktop dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (desktopFabDropdown && desktopFabDropdown.classList.contains('open')) {
        if (!desktopFabDropdown.contains(e.target) && e.target !== btnDesktopFab) {
            closeDesktopDropdown();
        }
    }
});

// Desktop dropdown option handlers
const desktopOptReg = document.getElementById('desktopFabOptRegistros');
const desktopOptBen = document.getElementById('desktopFabOptBencaos');
if (desktopOptReg) desktopOptReg.addEventListener('click', () => window.openCreateOverlay('registros'));
if (desktopOptBen) desktopOptBen.addEventListener('click', () => window.openCreateOverlay('bencaos'));

// --- ROTEADOR CLIENT-SIDE SPA ---
let currentUserFeatures = [];
let isNavigating = false;
const loadedModules = new Set();

// Ordem visual das abas (igual ao menu): usada para swipe e direção da animação.
const NAV_ORDER = ['registros', 'bencaos', 'oracoes', 'igreja'];
// Retorna as features permitidas na ordem visual do menu.
const getOrderedFeatures = () => NAV_ORDER.filter(f => currentUserFeatures.includes(f));

const adjustSidebarMenu = (allowedFeatures) => {
    // Sidebar Desktop
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        const links = sidebarNav.querySelectorAll('a.nav-item');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const feature = href.substring(1);
            link.style.display = allowedFeatures.includes(feature) ? 'flex' : 'none';
        });
    }

    // Bottom Nav Mobile
    const bottomNav = document.getElementById('mobileBottomNav');
    if (bottomNav) {
        const links = bottomNav.querySelectorAll('a.nav-item');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const feature = href.substring(1);
            link.style.display = allowedFeatures.includes(feature) ? 'flex' : 'none';
        });
    }

    // FAB visibility: hide if neither registros nor bencaos is available
    const hasFabFeature = allowedFeatures.includes('registros') || allowedFeatures.includes('bencaos');
    if (btnFab) btnFab.style.display = hasFabFeature ? '' : 'none';
    if (btnDesktopFab) btnDesktopFab.style.display = hasFabFeature ? '' : 'none';
};

const skeletonHTML = `
    <div class="swipe-skeleton">
        ${[0,1,2].map(() => `
        <div class="swipe-skeleton-card">
            <div class="skeleton-bar sk-title"></div>
            <div class="skeleton-bar sk-meta"></div>
            <div class="skeleton-bar sk-body"></div>
            <div class="skeleton-bar sk-body-sm"></div>
        </div>`).join('')}
    </div>`;

const updateNavActive = (hash) => {
    document.querySelectorAll('.sidebar-nav a.nav-item, #mobileBottomNav a.nav-item').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
    });
};

const handleRouteChange = async (direction = null) => {
    const user = auth.currentUser;
    if (!user) return;

    const hash = window.location.hash.substring(1) || 'registros';

    if (!currentUserFeatures.includes(hash)) {
        const ordered = getOrderedFeatures();
        if (ordered.length > 0) {
            window.location.hash = ordered[0];
        } else {
            await signOut(auth);
        }
        return;
    }

    updateNavActive(hash);

    if (window.innerWidth <= 768) closeMobileSidebar();

    const spaContent = document.getElementById('spaContent');
    if (!spaContent) return;

    const isFirstLoad = !loadedModules.has(hash);

    const applyAnim = (el, cls, durationMs) => new Promise(resolve => {
        el.classList.remove('anim-slide-in-right','anim-slide-in-left','anim-slide-out-left','anim-slide-out-right','anim-snap-back');
        void el.offsetWidth;
        el.classList.add(cls);
        setTimeout(() => { el.classList.remove(cls); resolve(); }, durationMs);
    });

    if (direction && !isFirstLoad) {
        const outCls = direction === 'left' ? 'anim-slide-out-left' : 'anim-slide-out-right';
        await applyAnim(spaContent, outCls, 180);
    }

    if (isFirstLoad) {
        spaContent.innerHTML = skeletonHTML;
    }

    try {
        const module = await import(`./modules/${hash}.js?v=33`);
        loadedModules.add(hash);
        module.render(spaContent);
        module.init(db, auth);

        if (window._pendingCreateOverlay === hash) {
            const type = window._pendingCreateOverlay;
            window._pendingCreateOverlay = null;
            setTimeout(() => {
                const fn = type === 'registros' ? window.openCreateRegistrosOverlay : window.openCreateBencaosOverlay;
                if (fn) fn();
            }, 80);
        }

        if (direction) {
            const inCls = direction === 'left' ? 'anim-slide-in-right' : 'anim-slide-in-left';
            applyAnim(spaContent, inCls, 280);
        }
    } catch (err) {
        console.error(`Erro ao carregar o módulo SPA (${hash}):`, err);
        spaContent.innerHTML = `
            <div class="form-container text-center" style="padding: 60px 24px; border: 1px solid var(--border-color); background: var(--secondary-color); border-radius: var(--radius);">
                <i class="ph ph-warning-circle text-danger" style="font-size: 4rem; margin-bottom: 20px;"></i>
                <h2 style="font-size: 1.5rem; color: var(--text-main);">Falha ao carregar a página</h2>
                <p style="color: var(--text-muted); margin-top: 10px;">Verifique sua conexão ou tente recarregar.</p>
            </div>
        `;
    }
};

// Escuta às mudanças da Hash do Roteador com detecção de direção
let _prevHash = '';
window.addEventListener('hashchange', (e) => {
    const ordered = getOrderedFeatures();
    const prev = _prevHash || new URL(e.oldURL).hash.substring(1) || (ordered[0] ?? '');
    const next = window.location.hash.substring(1);
    const pi = ordered.indexOf(prev);
    const ni = ordered.indexOf(next);
    let dir = null;
    if (pi !== -1 && ni !== -1 && pi !== ni) dir = ni > pi ? 'left' : 'right';
    _prevHash = next;
    handleRouteChange(dir);
});

// --- SWIPE NAVIGATION (mobile only) ---
const initSwipeNavigation = () => {
    const spaContent = document.getElementById('spaContent');
    if (!spaContent) return;

    let tStartX = 0, tStartY = 0, tCurrX = 0, tCurrY = 0;
    let dragging = false;

    const getHash = () => window.location.hash.substring(1) || getOrderedFeatures()[0];

    spaContent.addEventListener('touchstart', (e) => {
        if (window.innerWidth > 768) return;
        if (isNavigating) return;
        if (e.target.closest('.ql-editor, .autocomplete-list, .tag-suggestions-list, select, input, textarea, .create-overlay, .reading-overlay')) return;
        tStartX = e.touches[0].clientX;
        tStartY = e.touches[0].clientY;
        tCurrX = tStartX;
        tCurrY = tStartY;
        dragging = true;
    }, { passive: true });

    spaContent.addEventListener('touchmove', (e) => {
        if (!dragging || window.innerWidth > 768) return;
        tCurrX = e.touches[0].clientX;
        tCurrY = e.touches[0].clientY;
        // Sem movement no conteúdo — swipe só detecta gesto, animação é fade
    }, { passive: true });

    spaContent.addEventListener('touchend', () => {
        if (!dragging || window.innerWidth > 768) { dragging = false; return; }
        dragging = false;

        const dx = tCurrX - tStartX;
        const dy = tCurrY - tStartY;

        if (Math.abs(dx) < Math.abs(dy) * 1.5) return;

        const threshold = window.innerWidth * 0.28;
        const features = getOrderedFeatures();
        const idx = features.indexOf(getHash());

        if (Math.abs(dx) < threshold) return;

        let nextIdx = -1;
        if (dx < 0 && idx < features.length - 1) nextIdx = idx + 1;
        if (dx > 0 && idx > 0) nextIdx = idx - 1;

        if (nextIdx === -1) return;

        spaContent.style.transition = '';
        spaContent.style.transform = '';
        if (navigator.vibrate) navigator.vibrate(20);
        isNavigating = true;
        _prevHash = features[idx];
        window.location.hash = features[nextIdx];
        setTimeout(() => { isNavigating = false; }, 400);
    }, { passive: true });
};

// --- AUTENTICAÇÃO E WHITELIST ---
const provider = new GoogleAuthProvider();
const ADMIN_EMAIL = 'abner.eslava@gmail.com';
const DEFAULT_USER_FEATURES = ['registros', 'oracoes', 'igreja', 'bencaos'];

const getWhitelistEntryByEmail = async (email) => {
    const directSnap = await getDoc(doc(db, "whitelisted_emails", email));
    if (directSnap.exists()) {
        return directSnap.data();
    }

    const legacyQuery = query(collection(db, "whitelisted_emails"), where("email", "==", email));
    const legacySnap = await getDocs(legacyQuery);
    return legacySnap.empty ? null : legacySnap.docs[0].data();
};

onAuthStateChanged(auth, async (user) => {
    try {
        if (user) {
            const userEmail = user.email ? user.email.toLowerCase().trim() : '';
            let isAuthorized = false;
            let userFeatures = DEFAULT_USER_FEATURES;
            let whitelistError = null;

            let userRole = 'user';

            if (userEmail === ADMIN_EMAIL) {
                isAuthorized = true;
                userRole = 'admin';
            } else if (userEmail) {
                try {
                    const docData = await getWhitelistEntryByEmail(userEmail);
                    if (docData) {
                        isAuthorized = true;
                        userRole = docData.role || 'user';
                        userFeatures = docData.features || DEFAULT_USER_FEATURES;
                    }
                } catch (err) {
                    console.error("Erro ao verificar whitelist no Firestore:", err);
                    whitelistError = err;
                }
            }

            if (isAuthorized) {
                // Administradores sao redirecionados diretamente para o Hub Admin isolado.
                if (userRole === 'admin') {
                    window.location.href = 'admin.html';
                    return;
                }

                currentUserFeatures = userFeatures;

                if (loginContainer) loginContainer.style.display = 'none';
                dashboardContainer.style.display = 'block';
                userGreeting.innerText = `Olá, ${user.displayName || userEmail.split('@')[0]}`;
                const avatarEl = document.getElementById('userAvatar');
                if (avatarEl) {
                    if (user.photoURL) {
                        avatarEl.src = user.photoURL;
                        avatarEl.style.display = 'block';
                        avatarEl.onerror = () => { avatarEl.style.display = 'none'; };
                    } else {
                        avatarEl.style.display = 'none';
                    }
                }

                // Configura sidebar com as abas permitidas
                adjustSidebarMenu(userFeatures);

                // Inicializa handler do botão Voltar
                initBackButtonHandler();

                // Inicializa navegação por swipe
                initSwipeNavigation();

                // Inicializa flush global de rascunho (uma única vez)
                initDraftFlushHandlers();

                // Recuperação de rascunho: escolhe o módulo com o rascunho mais recente
                const restoreModule = pickDraftModuleToRestore();
                window._restorePendingModule = restoreModule;

                // Executa rota inicial (na ordem visual do menu)
                const orderedFeatures = getOrderedFeatures();
                const currentHash = window.location.hash.substring(1);

                // Se houver rascunho a recuperar, a rota inicial vai para o módulo dele
                const initialHash = (restoreModule && orderedFeatures.includes(restoreModule))
                    ? restoreModule
                    : currentHash;

                _prevHash = initialHash || orderedFeatures[0];
                if (!initialHash || !userFeatures.includes(initialHash)) {
                    window.location.hash = orderedFeatures[0];
                } else if (window.location.hash.substring(1) === initialHash) {
                    handleRouteChange();
                } else {
                    window.location.hash = initialHash;
                }
            } else {
                await signOut(auth);
                if (loginContainer) loginContainer.style.display = 'flex';
                dashboardContainer.style.display = 'none';
                loginError.innerText = whitelistError
                    ? "Nao foi possivel verificar seu convite agora. Verifique as regras do Firestore/conexao e tente novamente."
                    : "Acesso recusado. Este e-mail não consta na lista de convidados autorizados. Entre em contato com o administrador.";
                loginError.style.display = 'block';
            }
        } else {
            currentUserFeatures = [];
            if (loginContainer) loginContainer.style.display = 'flex';
            dashboardContainer.style.display = 'none';
        }
    } catch (error) {
        console.error("Erro no manipulador onAuthStateChanged:", error);
    }
});

if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', async () => {
        try {
            btnGoogleLogin.disabled = true;
            btnGoogleLogin.innerHTML = '<span>Autenticando...</span>';
            loginError.style.display = 'none';
            const result = await signInWithPopup(auth, provider);
            
            if (result.user && result.user.email.toLowerCase().trim() === 'abner.eslava@gmail.com') {
                window.location.href = 'admin.html';
                return;
            }
        } catch (error) {
            console.error("Erro ao iniciar login com Google:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                loginError.innerText = "Login cancelado. O popup foi fechado antes de concluir.";
            } else {
                loginError.innerText = "Erro ao conectar com o serviço do Google.";
            }
            loginError.style.display = 'block';
            btnGoogleLogin.disabled = false;
            btnGoogleLogin.innerHTML = `
                <svg class="google-logo" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Entrar com o Google</span>
            `;
        }
    });
}

btnLogout.addEventListener('click', () => {
    signOut(auth);
});

// --- PWA SERVICE WORKER SETUP ---
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
