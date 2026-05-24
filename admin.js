import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, getFirestore, getDocs, getDoc, setDoc, deleteDoc, doc, query, orderBy, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const ADMIN_EMAIL = 'abner.eslava@gmail.com';

// --- PROTEÇÃO DE ROTA & CONTROLES ---
const dashboardContainer = document.getElementById('dashboardContainer');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const email = user.email ? user.email.toLowerCase().trim() : '';
        if (email === ADMIN_EMAIL) {
            // Acesso liberado
            dashboardContainer.style.display = 'block';
            fetchInvitedEmails();
            return;
        }

        try {
            const q = query(collection(db, "whitelisted_emails"), where("email", "==", email));
            const snap = await getDocs(q);
            const docData = snap.empty ? null : snap.docs[0].data();

            if (docData && docData.role === 'admin') {
                dashboardContainer.style.display = 'block';
                fetchInvitedEmails();
                return;
            }

            window.location.href = 'index.html';
        } catch (err) {
            console.error("Erro ao verificar permissÃ£o administrativa:", err);
            window.location.href = 'index.html';
        }

    } else {
        // Redireciona se deslogado
        window.location.href = 'index.html';
    }
});

// A barra lateral foi removida do Hub Administrativo para isolá-lo da interface de usuário padrão.

// --- CUSTOM DIALOGS ---
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

// --- CRUD: GERENCIAMENTO DE CONVITADOS ---
let invitedEmails = [];
let permissionConfigDocId = null;

const getProfileRole = (item) => item.role || 'user';
const DEFAULT_FEATURES = ['registros', 'oracoes', 'igreja', 'bencaos'];
const FEATURE_CONTROLS = [
    { id: 'configPermRegistros', value: 'registros' },
    { id: 'configPermOracoes', value: 'oracoes' },
    { id: 'configPermIgreja', value: 'igreja' },
    { id: 'configPermBencaos', value: 'bencaos' }
];

const normalizeFeatures = (features) => [...(features || DEFAULT_FEATURES)].sort();

const hasDefaultPermissions = (item) => {
    if (getProfileRole(item) === 'admin') return true;
    const current = normalizeFeatures(item.features);
    const defaults = normalizeFeatures(DEFAULT_FEATURES);
    return current.length === defaults.length && current.every((feature, index) => feature === defaults[index]);
};

const renderPermissionSummary = (item) => {
    const isDefault = hasDefaultPermissions(item);
    const label = isDefault ? 'Padrao' : 'Customizadas';
    const icon = isDefault ? 'ph-check-circle' : 'ph-sliders';
    const badgeClass = isDefault ? 'badge-admin' : 'badge-invited';

    return `
        <div class="perm-summary-wrapper" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="${badgeClass}" style="font-weight: 700;"><i class="ph ${icon}"></i> ${label}</span>
            <button type="button" class="btn-secondary" onclick="openPermissionConfig('${item.id}')" style="padding: 6px 12px; font-size: 0.78rem; border-radius: var(--radius-md); width: auto; display: inline-flex; align-items: center; gap: 6px;">
                <i class="ph ph-gear-six"></i> Configurar
            </button>
        </div>
    `;
};

window.openPermissionConfig = (docId) => {
    const item = invitedEmails.find(x => x.id === docId);
    if (!item) return;

    permissionConfigDocId = docId;
    const role = getProfileRole(item);
    const modal = document.getElementById('permissionConfigModal');
    const emailLabel = document.getElementById('permissionConfigEmail');
    const adminNotice = document.getElementById('permissionAdminNotice');
    const userControls = document.getElementById('permissionUserControls');
    const saveButton = document.getElementById('btnSavePermissionConfig');

    emailLabel.innerText = item.email;

    if (role === 'admin') {
        adminNotice.style.display = 'block';
        userControls.style.display = 'none';
        saveButton.style.display = 'none';
    } else {
        const currentFeatures = item.features || DEFAULT_FEATURES;
        adminNotice.style.display = 'none';
        userControls.style.display = 'flex';
        saveButton.style.display = 'inline-flex';

        FEATURE_CONTROLS.forEach(({ id, value }) => {
            const control = document.getElementById(id);
            if (control) control.checked = currentFeatures.includes(value);
        });
    }

    modal.showModal();
};

const closePermissionConfig = () => {
    const modal = document.getElementById('permissionConfigModal');
    permissionConfigDocId = null;
    if (modal && modal.open) modal.close();
};

const savePermissionConfig = async () => {
    if (!permissionConfigDocId) return;

    const item = invitedEmails.find(x => x.id === permissionConfigDocId);
    if (!item) return closePermissionConfig();

    if (getProfileRole(item) === 'admin') {
        closePermissionConfig();
        return;
    }

    const selectedFeatures = FEATURE_CONTROLS
        .filter(({ id }) => document.getElementById(id)?.checked)
        .map(({ value }) => value);

    if (!selectedFeatures.length) {
        showAlert("Selecione pelo menos uma aba para este usuario.");
        return;
    }

    const saveButton = document.getElementById('btnSavePermissionConfig');
    const originalHtml = saveButton.innerHTML;

    try {
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Salvando...';

        await updateDoc(doc(db, "whitelisted_emails", permissionConfigDocId), {
            features: selectedFeatures
        });

        invitedEmails = invitedEmails.map(current => (
            current.id === permissionConfigDocId
                ? { ...current, features: selectedFeatures }
                : current
        ));

        applyInvitedFilters();
        closePermissionConfig();
        showAlert("Permissoes salvas com sucesso.");
    } catch (err) {
        console.error("Erro ao salvar permissoes:", err);
        showAlert(`Nao foi possivel salvar as permissoes. Detalhes: ${err.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = originalHtml;
    }
};

const fetchInvitedEmails = async () => {
    try {
        const q = query(collection(db, "whitelisted_emails"), orderBy("addedAt", "desc"));
        const snap = await getDocs(q);
        invitedEmails = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        applyInvitedFilters();
    } catch (err) {
        console.error("Erro ao carregar whitelist:", err);
        showAlert(`Erro ao carregar a lista de e-mails convidados. Detalhes: ${err.message}`);
    }
};

// Função global para alternar permissões em tempo real via clique no chip
window.togglePermission = async (docId, feature, hasPerm) => {
    try {
        const item = invitedEmails.find(x => x.id === docId);
        if (!item) return;

        // Fallback: se features não existir, assume acesso a tudo (incluindo bencaos)
        let currentFeatures = item.features || ['registros', 'oracoes', 'igreja', 'bencaos'];
        let newFeatures = [];

        if (hasPerm) {
            // Revogar permissão
            newFeatures = currentFeatures.filter(f => f !== feature);
        } else {
            // Conceder permissão
            newFeatures = [...currentFeatures, feature];
        }

        await updateDoc(doc(db, "whitelisted_emails", docId), {
            features: newFeatures
        });

        // Recarrega a lista silenciosamente com o novo estado
        fetchInvitedEmails();
    } catch (err) {
        console.error("Erro ao atualizar permissão:", err);
        showAlert("Erro ao atualizar a permissão do usuário.");
    }
};

const renderPermChip = (docId, feature, label, featuresArray) => {
    const hasPerm = !featuresArray || featuresArray.includes(feature);
    const activeClass = hasPerm ? 'chip-active' : 'chip-inactive';
    const titleText = hasPerm ? `Clique para revogar acesso a ${label}` : `Clique para conceder acesso a ${label}`;
    
    let iconClass = 'ph-check-circle';
    if (feature === 'registros') iconClass = 'ph-notebook';
    else if (feature === 'oracoes') iconClass = 'ph-hands-praying';
    else if (feature === 'igreja') iconClass = 'ph-church';
    else if (feature === 'bencaos') iconClass = 'ph-gift';
    
    const icon = `<i class="ph ${iconClass}"></i>`;
    
    return `
        <span class="badge-perm ${activeClass}" 
              onclick="togglePermission('${docId}', '${feature}', ${hasPerm})" 
              title="${titleText}">
            ${icon} ${label}
        </span>
    `;
};

const renderInvitedList = (arr) => {
    const listDOM = document.getElementById('invitedEmailsList');
    const cardsDOM = document.getElementById('invitedEmailsCards');
    document.getElementById('invitedCount').innerText = arr.length;
    const includeMaster = !profileFilter || profileFilter.value !== 'user';

    // --- 1. RENDERIZAÇÃO DA TABELA DESKTOP ---
    let tableHtml = includeMaster ? `
        <tr>
            <td><span style="font-weight: 600; color: var(--primary-color);">abner.eslava@gmail.com</span></td>
            <td><i class="ph ph-infinity" style="color: var(--primary-color); font-size: 1.25rem;" title="Acesso Permanente"></i></td>
            <td>
                <span class="badge-admin" style="font-weight: 700;"><i class="ph ph-check-circle"></i> Padrao</span>
                <div class="perm-chips-wrapper" style="display: none;">
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-notebook"></i> Registros</span>
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-hands-praying"></i> Orações</span>
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-church"></i> Igreja</span>
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-gift"></i> Bênçãos</span>
                </div>
            </td>
            <td><span class="badge-admin" style="font-weight: 700;"><i class="ph ph-shield-check"></i> Master</span></td>
            <td style="text-align: right;">
                <span class="badge-admin" style="opacity: 0.85; border-style: dashed; font-size: 0.75rem; background: rgba(0,0,0,0.1);"><i class="ph ph-lock"></i> Vitalício</span>
            </td>
        </tr>
    ` : '';

    tableHtml += arr.map(item => {
        const addedDate = new Date(item.addedAt);
        const dateStr = addedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = addedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const role = item.role || 'user';
        const typeBadge = role === 'admin'
            ? '<span class="badge-admin" style="font-weight: 600;"><i class="ph ph-shield-check"></i> Admin</span>'
            : '<span class="badge-invited" style="font-weight: 600;"><i class="ph ph-user"></i> Convidado</span>';
        
        return `
            <tr>
                <td><span style="font-weight: 500;">${item.email}</span></td>
                <td><span style="font-size: 0.88rem; color: var(--text-muted);">${dateStr} <span style="opacity: 0.5; font-size: 0.78rem;">${timeStr}</span></span></td>
                <td>
                    ${renderPermissionSummary(item)}
                    <div class="perm-chips-wrapper" style="display: none;">
                        ${renderPermChip(item.id, 'registros', 'Registros', item.features)}
                        ${renderPermChip(item.id, 'oracoes', 'Orações', item.features)}
                        ${renderPermChip(item.id, 'igreja', 'Igreja', item.features)}
                        ${renderPermChip(item.id, 'bencaos', 'Bênçãos', item.features)}
                    </div>
                </td>
                <td>${typeBadge}</td>
                <td style="text-align: right;">
                    <button type="button" class="btn-icon text-danger" onclick="removeInvited('${item.id}', '${item.email}')" title="Revogar Convite" style="padding: 6px; font-size: 1.15rem; border: none; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; transition: var(--transition);" onmouseover="this.style.background='rgba(232, 93, 68, 0.1)'" onmouseout="this.style.background='transparent'">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    listDOM.innerHTML = tableHtml;

    // --- 2. RENDERIZAÇÃO DOS CARTÕES MOBILE ---
    let cardsHtml = includeMaster ? `
        <div class="admin-mobile-card" style="border-left: 3px solid var(--primary-color);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-weight: 700; color: var(--primary-color); font-size: 1.05rem;">abner.eslava@gmail.com</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px;"><i class="ph ph-infinity"></i> Vínculo Vitalício</span>
                </div>
                <span class="badge-admin"><i class="ph ph-shield-check"></i> Master</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;"><i class="ph ph-sliders"></i> Permissoes</span>
                <span class="badge-admin" style="font-weight: 700; width: fit-content;"><i class="ph ph-check-circle"></i> Padrao</span>
                <div class="perm-chips-wrapper" style="display: none;">
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-notebook"></i> Registros</span>
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-hands-praying"></i> Orações</span>
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-church"></i> Igreja</span>
                    <span class="badge-perm chip-active" style="cursor: default;" title="Acesso permanente"><i class="ph ph-gift"></i> Bênçãos</span>
                </div>
            </div>
        </div>
    ` : '';

    cardsHtml += arr.map(item => {
        const role = item.role || 'user';
        const typeBadge = role === 'admin'
            ? '<span class="badge-admin"><i class="ph ph-shield-check"></i> Admin</span>'
            : '<span class="badge-invited"><i class="ph ph-user"></i> Convidado</span>';

        return `
        <div class="admin-mobile-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-weight: 700; color: var(--text-main); font-size: 1.05rem; word-break: break-all;">${item.email}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px;"><i class="ph ph-calendar-blank"></i> Convite: ${new Date(item.addedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
                ${typeBadge}
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;"><i class="ph ph-sliders"></i> Permissoes</span>
                ${renderPermissionSummary(item)}
                <div class="perm-chips-wrapper" style="display: none;">
                    ${renderPermChip(item.id, 'registros', 'Registros', item.features)}
                    ${renderPermChip(item.id, 'oracoes', 'Orações', item.features)}
                    ${renderPermChip(item.id, 'igreja', 'Igreja', item.features)}
                    ${renderPermChip(item.id, 'bencaos', 'Bênçãos', item.features)}
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 5px;">
                <button type="button" class="btn-secondary text-danger" onclick="removeInvited('${item.id}', '${item.email}')" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 0.82rem; border-radius: var(--radius-md); font-weight: 600; width: auto; border: 1px solid var(--border-color); background: transparent; transition: var(--transition);">
                    <i class="ph ph-trash"></i> Revogar Acesso
                </button>
            </div>
        </div>
    `;
    }).join('');

    cardsDOM.innerHTML = cardsHtml;
};

// Inserir Novo Convidado
const inviteForm = document.getElementById('inviteForm');
inviteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('inviteEmail');
    const email = emailInput.value.toLowerCase().trim();
    const btn = document.getElementById('btnInvite');
    const selectedRole = document.querySelector('input[name="inviteRole"]:checked');
    const role = selectedRole ? selectedRole.value : '';

    if (!email) return;
    if (!role) return showAlert("Selecione o tipo de perfil do convite.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showAlert("Por favor, insira um e-mail com formato valido.");
    }

    if (email === ADMIN_EMAIL) {
        return showAlert("O e-mail abner.eslava@gmail.com ja e o administrador master do Selah.");
    }

    const features = [];
    if (document.getElementById('permRegistros').checked) features.push('registros');
    if (document.getElementById('permOracoes').checked) features.push('oracoes');
    if (document.getElementById('permIgreja').checked) features.push('igreja');
    if (document.getElementById('permBencaos').checked) features.push('bencaos');

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Gravando...';

        const inviteRef = doc(db, "whitelisted_emails", email);
        const existingById = await getDoc(inviteRef);
        const legacyQuery = query(collection(db, "whitelisted_emails"), where("email", "==", email));
        const existingLegacy = await getDocs(legacyQuery);

        if (existingById.exists() || !existingLegacy.empty || invitedEmails.some(x => x.email === email)) {
            return showAlert("Este e-mail ja foi convidado anteriormente.");
        }

        await setDoc(inviteRef, {
            email: email,
            addedAt: new Date().toISOString(),
            role: role,
            features: features
        });

        emailInput.value = '';
        document.getElementById('roleUser').checked = true;
        document.getElementById('permRegistros').checked = true;
        document.getElementById('permOracoes').checked = true;
        document.getElementById('permIgreja').checked = true;
        document.getElementById('permBencaos').checked = true;

        showAlert("E-mail convidado com sucesso!");
        fetchInvitedEmails();
    } catch (err) {
        console.error("Erro ao salvar convite:", err);
        showAlert(`Nao foi possivel salvar o convite. Detalhes: ${err.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Convidar';
    }
});

// Revogar Acesso / Deletar Convidado
window.removeInvited = async (id, email) => {
    if (await showConfirm(`Deseja realmente revogar o acesso de ${email}? Este usuário não conseguirá mais entrar no Selah.`)) {
        try {
            await deleteDoc(doc(db, "whitelisted_emails", id));
            showAlert("Acesso revogado com sucesso.");
            fetchInvitedEmails();
        } catch (err) {
            console.error("Erro ao remover da whitelist:", err);
            showAlert("Erro ao remover usuário. Verifique suas regras do Firestore.");
        }
    }
};

// Busca e filtro client-side
const searchInput = document.getElementById('searchInvited');
const profileFilter = document.getElementById('profileFilter');

const applyInvitedFilters = () => {
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const profileValue = profileFilter ? profileFilter.value : 'all';

    const filtered = invitedEmails.filter(item => {
        const matchesSearch = !searchValue || item.email.includes(searchValue);
        const matchesProfile = profileValue === 'all' || getProfileRole(item) === profileValue;
        return matchesSearch && matchesProfile;
    });

    renderInvitedList(filtered);
};

if (searchInput) searchInput.addEventListener('input', applyInvitedFilters);
if (profileFilter) profileFilter.addEventListener('change', applyInvitedFilters);

// Ação de Logout do Administrador
const btnClosePermissionConfig = document.getElementById('btnClosePermissionConfig');
const btnCancelPermissionConfig = document.getElementById('btnCancelPermissionConfig');
const btnSavePermissionConfig = document.getElementById('btnSavePermissionConfig');
const permissionConfigModal = document.getElementById('permissionConfigModal');

if (btnClosePermissionConfig) btnClosePermissionConfig.addEventListener('click', closePermissionConfig);
if (btnCancelPermissionConfig) btnCancelPermissionConfig.addEventListener('click', closePermissionConfig);
if (btnSavePermissionConfig) btnSavePermissionConfig.addEventListener('click', savePermissionConfig);
if (permissionConfigModal) {
    permissionConfigModal.addEventListener('cancel', () => {
        permissionConfigDocId = null;
    });
}

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        signOut(auth);
    });
}

// ==========================================
// // INÍCIO DA ÁREA DE MIGRAÇÃO TEMPORÁRIA //
// ==========================================

const btnDetectLegacyUid = document.getElementById('btnDetectLegacyUid');
const btnRunMigration = document.getElementById('btnRunMigration');
const legacyUidInput = document.getElementById('legacyUidInput');
const detectedUidsContainer = document.getElementById('detectedUidsContainer');
const detectedUidsList = document.getElementById('detectedUidsList');
const migrationLogs = document.getElementById('migrationLogs');
const btnClearMigrationLogs = document.getElementById('btnClearMigrationLogs');

// Helper para logar mensagens no console visual
const logToMigrationConsole = (msg, type = 'info') => {
    if (!migrationLogs) return;
    const timestamp = new Date().toLocaleTimeString();
    let color = '#a5d6a7'; // verde para info/sucesso
    if (type === 'error') color = '#ef9a9a'; // vermelho para erro
    if (type === 'warning') color = '#ffe082'; // amarelo para alerta
    
    const div = document.createElement('div');
    div.style.color = color;
    div.innerText = `[${timestamp}] ${msg}`;
    migrationLogs.appendChild(div);
    migrationLogs.scrollTop = migrationLogs.scrollHeight;
};

// Limpar logs
if (btnClearMigrationLogs) {
    btnClearMigrationLogs.addEventListener('click', () => {
        if (migrationLogs) {
            migrationLogs.innerHTML = '';
            logToMigrationConsole("Console de logs limpo. Aguardando comandos...");
        }
    });
}

// 1. Lógica para DETECTAR UIDs Antigos (Varre devotionals e blessings buscando criadores legados)
if (btnDetectLegacyUid) {
    btnDetectLegacyUid.addEventListener('click', async () => {
        logToMigrationConsole("Iniciando escaneamento de UIDs antigos...", "warning");
        btnDetectLegacyUid.disabled = true;
        btnDetectLegacyUid.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Escaneando...';
        
        try {
            const devotionalsSnap = await getDocs(collection(db, "devotionals"));
            const uniqueUids = new Set();
            
            // UID atual de Abner
            const currentUid = auth.currentUser ? auth.currentUser.uid : '';
            
            devotionalsSnap.forEach(dDoc => {
                const dData = dDoc.data();
                if (dData.userId && dData.userId !== currentUid) {
                    uniqueUids.add(dData.userId);
                }
            });
            
            // Também varre blessings
            const blessingsSnap = await getDocs(collection(db, "blessings"));
            blessingsSnap.forEach(bDoc => {
                const bData = bDoc.data();
                if (bData.userId && bData.userId !== currentUid) {
                    uniqueUids.add(bData.userId);
                }
            });
            
            if (uniqueUids.size > 0) {
                logToMigrationConsole(`Escaneamento concluído. Encontrado(s) ${uniqueUids.size} UID(s) legado(s) no banco de dados.`, "info");
                
                // Exibe os UIDs na tela como tags clicáveis
                if (detectedUidsContainer && detectedUidsList) {
                    detectedUidsList.innerHTML = '';
                    uniqueUids.forEach(uid => {
                        const span = document.createElement('span');
                        span.className = 'badge-perm chip-active';
                        span.style.cursor = 'pointer';
                        span.style.padding = '4px 10px';
                        span.style.borderRadius = '12px';
                        span.innerText = uid;
                        
                        span.addEventListener('click', () => {
                            if (legacyUidInput) {
                                legacyUidInput.value = uid;
                                logToMigrationConsole(`UID selecionado: ${uid}. Pronto para migração.`, "info");
                            }
                        });
                        
                        detectedUidsList.appendChild(span);
                    });
                    detectedUidsContainer.style.display = 'block';
                }
            } else {
                logToMigrationConsole("Escaneamento concluído. Nenhum UID legado antigo foi localizado nas timelines.", "info");
                if (detectedUidsContainer) detectedUidsContainer.style.display = 'none';
            }
        } catch (err) {
            console.error("Erro ao detectar UIDs antigos:", err);
            logToMigrationConsole(`Erro ao escanear banco de dados: ${err.message}`, "error");
        } finally {
            btnDetectLegacyUid.disabled = false;
            btnDetectLegacyUid.innerHTML = '<i class="ph ph-magnifying-glass"></i> Detectar UID Antigo';
        }
    });
}

// 2. Lógica para EXECUTAR a Migração (atualiza devotionals e blessings em lote)
if (btnRunMigration) {
    btnRunMigration.addEventListener('click', async () => {
        const legacyUid = legacyUidInput ? legacyUidInput.value.trim() : '';
        const currentUid = auth.currentUser ? auth.currentUser.uid : '';
        
        if (!legacyUid) {
            return showAlert("Por favor, selecione ou digite o UID legado antigo a ser migrado.");
        }
        
        if (legacyUid === currentUid) {
            return showAlert("O UID legado informado é igual ao seu UID Google atual. Nada a migrar.");
        }
        
        const confirmMsg = `Deseja realmente migrar todos os registros vinculados ao UID legado "${legacyUid}" para o seu novo UID do Google "${currentUid}"? Essa operação não pode ser desfeita.`;
        if (!(await showConfirm(confirmMsg))) return;
        
        btnRunMigration.disabled = true;
        btnRunMigration.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Migrando...';
        logToMigrationConsole(`Iniciando migração dos dados de [${legacyUid}] para [${currentUid}]...`, "warning");
        
        try {
            let devotionalsMigrated = 0;
            let blessingsMigrated = 0;
            
            // 1. Migração de Devocionais
            logToMigrationConsole("Buscando devocionais legados no Firestore...", "info");
            const dQuery = query(collection(db, "devotionals"), where("userId", "==", legacyUid));
            const dSnap = await getDocs(dQuery);
            
            if (!dSnap.empty) {
                logToMigrationConsole(`Identificados ${dSnap.size} devocionais. Atualizando registros...`, "info");
                for (const dDoc of dSnap.docs) {
                    await updateDoc(doc(db, "devotionals", dDoc.id), {
                        userId: currentUid,
                        migratedFromLegacy: true,
                        migratedAt: new Date().toISOString()
                    });
                    devotionalsMigrated++;
                    if (devotionalsMigrated % 5 === 0 || devotionalsMigrated === dSnap.size) {
                        logToMigrationConsole(`Progresso Devocionais: ${devotionalsMigrated}/${dSnap.size} migrados...`, "info");
                    }
                }
            } else {
                logToMigrationConsole("Nenhum devocional histórico localizado para este UID legado.", "info");
            }
            
            // 2. Migração de Bênçãos
            logToMigrationConsole("Buscando bênçãos legadas no Firestore...", "info");
            const bQuery = query(collection(db, "blessings"), where("userId", "==", legacyUid));
            const bSnap = await getDocs(bQuery);
            
            if (!bSnap.empty) {
                logToMigrationConsole(`Identificadas ${bSnap.size} bênçãos. Atualizando registros...`, "info");
                for (const bDoc of bSnap.docs) {
                    await updateDoc(doc(db, "blessings", bDoc.id), {
                        userId: currentUid,
                        migratedFromLegacy: true,
                        migratedAt: new Date().toISOString()
                    });
                    blessingsMigrated++;
                    if (blessingsMigrated % 5 === 0 || blessingsMigrated === bSnap.size) {
                        logToMigrationConsole(`Progresso Bênçãos: ${blessingsMigrated}/${bSnap.size} migradas...`, "info");
                    }
                }
            } else {
                logToMigrationConsole("Nenhuma bênção histórica localizada para este UID legado.", "info");
            }
            
            logToMigrationConsole(`MIGRAÇÃO CONCLUÍDA! Devocionais atualizados: ${devotionalsMigrated} | Bênçãos atualizadas: ${blessingsMigrated}`, "info");
            showAlert(`Migração realizada com sucesso! ${devotionalsMigrated} devocionais e ${blessingsMigrated} bênçãos foram associados à sua conta ativa.`);
            
            // Reseta detecções e campo
            if (legacyUidInput) legacyUidInput.value = '';
            if (detectedUidsContainer) detectedUidsContainer.style.display = 'none';
            
        } catch (err) {
            console.error("Erro durante a migração:", err);
            logToMigrationConsole(`FALHA CRÍTICA NA MIGRAÇÃO: ${err.message}`, "error");
            showAlert("Erro durante a migração. Alguns registros podem não ter sido atualizados. Detalhes no console de logs.");
        } finally {
            btnRunMigration.disabled = false;
            btnRunMigration.innerHTML = '<i class="ph ph-play"></i> Iniciar Migração';
        }
    });
}

// ==========================================
// // FIM DA ÁREA DE MIGRAÇÃO TEMPORÁRIA   //
// ==========================================
