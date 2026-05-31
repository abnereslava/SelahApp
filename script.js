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

// --- ROTEADOR CLIENT-SIDE SPA ---
let currentUserFeatures = [];

const adjustSidebarMenu = (allowedFeatures) => {
    // Sidebar Desktop
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        const links = sidebarNav.querySelectorAll('a.nav-item');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const feature = href.substring(1); // Remove o caractere '#'
            link.style.display = allowedFeatures.includes(feature) ? 'flex' : 'none';
        });
    }

    // Bottom Nav Mobile
    const bottomNav = document.getElementById('mobileBottomNav');
    if (bottomNav) {
        const links = bottomNav.querySelectorAll('a.nav-item');
        links.forEach(link => {
            const href = link.getAttribute('href');
            const feature = href.substring(1); // Remove o caractere '#'
            link.style.display = allowedFeatures.includes(feature) ? 'flex' : 'none';
        });
    }
};

const handleRouteChange = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const hash = window.location.hash.substring(1) || 'registros';
    
    // Proteção de Rota Client-side
    if (!currentUserFeatures.includes(hash)) {
        if (currentUserFeatures.length > 0) {
            window.location.hash = currentUserFeatures[0];
        } else {
            await signOut(auth);
        }
        return;
    }

    // Atualização visual do link ativo na sidebar desktop
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.querySelectorAll('a.nav-item').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${hash}`);
        });
    }

    // Atualização visual do link ativo na bottom nav mobile
    const bottomNav = document.getElementById('mobileBottomNav');
    if (bottomNav) {
        bottomNav.querySelectorAll('a.nav-item').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${hash}`);
        });
    }

    // Fechar barra lateral mobile se aberta
    if (window.innerWidth <= 768) {
        closeMobileSidebar();
    }

    // Montagem dinâmica do conteúdo da aba
    const spaContent = document.getElementById('spaContent');
    if (spaContent) {
        // Mensagem de Carregando com ícone animado elegante
        spaContent.innerHTML = `
            <div class="text-center" style="padding: 100px 20px; color: var(--text-muted);">
                <i class="ph ph-spinner loading-icon" style="font-size: 3rem; display: inline-block; animation: spin 1s linear infinite;"></i>
                <p style="margin-top: 15px; font-weight: 500;">Carregando página...</p>
            </div>
        `;

        try {
            const modulePath = `./modules/${hash}.js`;
            const module = await import(modulePath);

            // Renderização do HTML e vinculação lógica
            module.render(spaContent);
            module.init(db, auth);
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
    }
};

// Escuta às mudanças da Hash do Roteador
window.addEventListener('hashchange', handleRouteChange);

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

                // Configura sidebar com as abas permitidas
                adjustSidebarMenu(userFeatures);

                // Executa rota inicial
                const currentHash = window.location.hash.substring(1);
                if (!currentHash || !userFeatures.includes(currentHash)) {
                    window.location.hash = userFeatures[0];
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
