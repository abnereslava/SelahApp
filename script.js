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

// --- FAB / BOTTOM SHEET ---
const fabSheet = document.getElementById('fabSheet');
const fabSheetOverlay = document.getElementById('fabSheetOverlay');
const btnFab = document.getElementById('btnFab');
const btnDesktopFab = document.getElementById('btnDesktopFab');

const openFabSheet = () => {
    if (!fabSheet) return;
    // Visibility based on features (will be applied after auth)
    const hasReg = currentUserFeatures.includes('registros');
    const hasBen = currentUserFeatures.includes('bencaos');
    const optReg = document.getElementById('fabOptRegistros');
    const optBen = document.getElementById('fabOptBencaos');
    if (optReg) optReg.style.display = hasReg ? '' : 'none';
    if (optBen) optBen.style.display = hasBen ? '' : 'none';

    // If only one feature available, skip sheet and open directly
    if (hasReg && !hasBen) { window.openCreateOverlay('registros'); return; }
    if (!hasReg && hasBen) { window.openCreateOverlay('bencaos'); return; }

    fabSheet.classList.add('visible');
    fabSheetOverlay.classList.add('visible');
};

const closeFabSheet = () => {
    if (!fabSheet) return;
    fabSheet.classList.remove('visible');
    fabSheetOverlay.classList.remove('visible');
};

window.openCreateOverlay = (type) => {
    closeFabSheet();
    const fn = type === 'registros' ? window.openCreateRegistrosOverlay : window.openCreateBencaosOverlay;
    if (fn) {
        fn();
    } else {
        window._pendingCreateOverlay = type;
        window.location.hash = type;
    }
};

if (btnFab) btnFab.addEventListener('click', openFabSheet);
if (btnDesktopFab) btnDesktopFab.addEventListener('click', openFabSheet);
if (fabSheetOverlay) fabSheetOverlay.addEventListener('click', closeFabSheet);

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
        const module = await import(`./modules/${hash}.js`);
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
        const dx = tCurrX - tStartX;
        const dy = tCurrY - tStartY;
        if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
        const features = getOrderedFeatures();
        const idx = features.indexOf(getHash());
        const atStart = idx === 0 && dx > 0;
        const atEnd   = idx === features.length - 1 && dx < 0;
        const factor  = (atStart || atEnd) ? 0.25 : 1;
        requestAnimationFrame(() => {
            spaContent.style.transform = `translateX(${dx * factor}px)`;
            spaContent.style.transition = 'none';
        });
    }, { passive: true });

    spaContent.addEventListener('touchend', () => {
        const snapBack = (animated) => {
            if (animated) {
                spaContent.style.transition = 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)';
                spaContent.style.transform = '';
                setTimeout(() => { spaContent.style.transition = ''; }, 260);
            } else {
                spaContent.style.transition = '';
                spaContent.style.transform = '';
            }
        };

        if (!dragging || window.innerWidth > 768) {
            snapBack(false);
            dragging = false;
            return;
        }
        dragging = false;

        const dx = tCurrX - tStartX;
        const dy = tCurrY - tStartY;

        if (Math.abs(dx) < Math.abs(dy) * 1.5) {
            snapBack(false);
            return;
        }

        const threshold = window.innerWidth * 0.28;
        const features = getOrderedFeatures();
        const idx = features.indexOf(getHash());

        if (Math.abs(dx) < threshold) {
            snapBack(true);
            return;
        }

        let nextIdx = -1;
        if (dx < 0 && idx < features.length - 1) nextIdx = idx + 1;
        if (dx > 0 && idx > 0) nextIdx = idx - 1;

        if (nextIdx === -1) {
            snapBack(true);
            return;
        }

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

                // Inicializa navegação por swipe
                initSwipeNavigation();

                // Executa rota inicial (na ordem visual do menu)
                const orderedFeatures = getOrderedFeatures();
                const currentHash = window.location.hash.substring(1);
                _prevHash = currentHash || orderedFeatures[0];
                if (!currentHash || !userFeatures.includes(currentHash)) {
                    window.location.hash = orderedFeatures[0];
                } else {
                    handleRouteChange();
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
