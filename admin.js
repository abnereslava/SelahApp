import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, getFirestore, getDocs, getDoc, setDoc, deleteDoc, doc, query, orderBy, where, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const getWhitelistEntryByEmail = async (email) => {
    const directSnap = await getDoc(doc(db, "whitelisted_emails", email));
    if (directSnap.exists()) {
        return directSnap.data();
    }

    const legacyQuery = query(collection(db, "whitelisted_emails"), where("email", "==", email));
    const legacySnap = await getDocs(legacyQuery);
    return legacySnap.empty ? null : legacySnap.docs[0].data();
};

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
            const docData = await getWhitelistEntryByEmail(email);

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
const getKnownUid = (item) => item.uid || item.lastKnownUid || item.userId || '';
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
        populateMigrationTargets();
        if (typeof populateImportTargets === 'function') populateImportTargets();
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
            <td><span class="badge-admin admin-type-badge" style="font-weight: 700;"><i class="ph ph-shield-check"></i> Master</span></td>
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
            ? '<span class="badge-admin admin-type-badge" style="font-weight: 600;"><i class="ph ph-shield-check"></i> Admin</span>'
            : '<span class="badge-invited admin-type-badge" style="font-weight: 600;"><i class="ph ph-user"></i> Convidado</span>';
        
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
const migrationTargetEmail = document.getElementById('migrationTargetEmail');
const migrationTargetUid = document.getElementById('migrationTargetUid');
const detectedUidsContainer = document.getElementById('detectedUidsContainer');
const detectedUidsList = document.getElementById('detectedUidsList');
const migrationLogs = document.getElementById('migrationLogs');
const btnClearMigrationLogs = document.getElementById('btnClearMigrationLogs');

const getMigrationTargetOptions = () => {
    const currentUser = auth.currentUser;
    const currentEmail = currentUser?.email ? currentUser.email.toLowerCase().trim() : '';
    const options = new Map();

    if (currentEmail) {
        options.set(currentEmail, {
            email: currentEmail,
            uid: currentUser.uid,
            label: currentEmail === ADMIN_EMAIL ? `${currentEmail} (master logado)` : `${currentEmail} (logado)`
        });
    }

    if (!options.has(ADMIN_EMAIL)) {
        options.set(ADMIN_EMAIL, {
            email: ADMIN_EMAIL,
            uid: currentEmail === ADMIN_EMAIL ? currentUser?.uid || '' : '',
            label: `${ADMIN_EMAIL} (master)`
        });
    }

    invitedEmails.forEach(item => {
        const email = item.email ? item.email.toLowerCase().trim() : '';
        if (!email || options.has(email)) return;
        options.set(email, {
            email,
            uid: getKnownUid(item),
            label: `${email} (${getProfileRole(item) === 'admin' ? 'admin' : 'usuario'})`
        });
    });

    return [...options.values()].sort((a, b) => a.email.localeCompare(b.email));
};

const populateMigrationTargets = () => {
    if (!migrationTargetEmail) return;

    const selectedValue = migrationTargetEmail.value;
    const options = getMigrationTargetOptions();
    migrationTargetEmail.innerHTML = '<option value="">Selecione o e-mail de destino...</option>';

    options.forEach(option => {
        const el = document.createElement('option');
        el.value = option.email;
        el.dataset.uid = option.uid || '';
        el.innerText = option.label;
        migrationTargetEmail.appendChild(el);
    });

    if (selectedValue && options.some(option => option.email === selectedValue)) {
        migrationTargetEmail.value = selectedValue;
    }

    syncMigrationTargetUid(false);
};

const syncMigrationTargetUid = (overwrite = true) => {
    if (!migrationTargetEmail || !migrationTargetUid) return;
    const selected = migrationTargetEmail.selectedOptions[0];
    const knownUid = selected?.dataset?.uid || '';

    if (overwrite || !migrationTargetUid.value.trim()) {
        migrationTargetUid.value = knownUid;
    }

    if (!knownUid && migrationTargetEmail.value) {
        logToMigrationConsole(`UID do destino "${migrationTargetEmail.value}" nao esta salvo no sistema. Informe manualmente o UID Google dessa conta antes de migrar.`, "warning");
    }
};

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

if (migrationTargetEmail) {
    migrationTargetEmail.addEventListener('change', () => syncMigrationTargetUid(true));
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
            
            const selectedTargetUid = migrationTargetUid ? migrationTargetUid.value.trim() : '';
            
            devotionalsSnap.forEach(dDoc => {
                const dData = dDoc.data();
                if (dData.userId && dData.userId !== selectedTargetUid) {
                    uniqueUids.add(dData.userId);
                }
            });
            
            // Também varre blessings
            const blessingsSnap = await getDocs(collection(db, "blessings"));
            blessingsSnap.forEach(bDoc => {
                const bData = bDoc.data();
                if (bData.userId && bData.userId !== selectedTargetUid) {
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
        const targetEmail = migrationTargetEmail ? migrationTargetEmail.value.trim().toLowerCase() : '';
        const targetUid = migrationTargetUid ? migrationTargetUid.value.trim() : '';
        
        if (!legacyUid) {
            return showAlert("Por favor, selecione ou digite o UID legado antigo a ser migrado.");
        }

        if (!targetEmail) {
            return showAlert("Selecione o e-mail de destino da migracao.");
        }

        if (!targetUid) {
            return showAlert("Informe o UID Google de destino. O e-mail sozinho nao e suficiente para migrar registros, porque os dados usam userId.");
        }
        
        if (legacyUid === targetUid) {
            return showAlert("O UID legado informado e igual ao UID de destino. Nada a migrar.");
        }
        
        const confirmMsg = `Deseja realmente migrar todos os registros vinculados ao UID legado "${legacyUid}" para "${targetEmail}" (UID ${targetUid})? Essa operacao nao pode ser desfeita.`;
        if (!(await showConfirm(confirmMsg))) return;
        
        btnRunMigration.disabled = true;
        btnRunMigration.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Migrando...';
        logToMigrationConsole(`Iniciando migracao dos dados de [${legacyUid}] para ${targetEmail} [${targetUid}]...`, "warning");
        
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
                        userId: targetUid,
                        migratedToEmail: targetEmail,
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
                        userId: targetUid,
                        migratedToEmail: targetEmail,
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
            showAlert(`Migracao realizada com sucesso! ${devotionalsMigrated} devocionais e ${blessingsMigrated} bencaos foram associados a ${targetEmail}.`);
            
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


// ============================================================
// IMPORTAÇÃO DE DEVOCIONAIS EM LOTE (JSON → devotionals)
// ============================================================

const VALID_RECORD_TYPES = ['devocional', 'culto_domestico', 'aula', 'ebd', 'pregacao', 'anotacoes_gerais', 'outros'];

// --- DOM ---
const importTargetEmail = document.getElementById('importTargetEmail');
const importTargetUid = document.getElementById('importTargetUid');
const importJsonInput = document.getElementById('importJsonInput');
const importFileInput = document.getElementById('importFileInput');
const btnValidateImport = document.getElementById('btnValidateImport');
const btnRunImport = document.getElementById('btnRunImport');
const importPreviewContainer = document.getElementById('importPreviewContainer');
const importPreviewList = document.getElementById('importPreviewList');
const importPreviewSummary = document.getElementById('importPreviewSummary');
const importLogs = document.getElementById('importLogs');
const btnClearImportLogs = document.getElementById('btnClearImportLogs');

// Estado validado, consumido na importação
let importValidated = null;

const logToImportConsole = (msg, type = 'info') => {
    if (!importLogs) return;
    const timestamp = new Date().toLocaleTimeString();
    let color = '#a5d6a7';
    if (type === 'error') color = '#ef9a9a';
    if (type === 'warning') color = '#ffe082';
    const div = document.createElement('div');
    div.style.color = color;
    div.innerText = `[${timestamp}] ${msg}`;
    importLogs.appendChild(div);
    importLogs.scrollTop = importLogs.scrollHeight;
};

// --- UTILITÁRIOS (Tarefa 2) ---

// Escapa caracteres perigosos antes de aplicar Markdown (sanitização mínima)
const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Conversor Markdown → HTML leve, compatível com o conteúdo do editor Quill.
// Suporta: títulos (#/##), negrito, itálico, listas (-/*), parágrafos e quebras.
const mdToHtml = (md) => {
    if (!md || typeof md !== 'string') return '';
    const lines = escapeHtml(md.replace(/\r\n/g, '\n')).split('\n');
    const html = [];
    let listOpen = false;
    const closeList = () => { if (listOpen) { html.push('</ul>'); listOpen = false; } };

    const inline = (txt) => txt
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
        .replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');

    let paragraph = [];
    const flushParagraph = () => {
        if (paragraph.length) {
            html.push(`<p>${inline(paragraph.join('<br>'))}</p>`);
            paragraph = [];
        }
    };

    lines.forEach(raw => {
        const line = raw.trimEnd();
        const trimmed = line.trim();
        if (trimmed === '') { flushParagraph(); closeList(); return; }

        const h2 = /^##\s+(.*)$/.exec(trimmed);
        const h1 = /^#\s+(.*)$/.exec(trimmed);
        const li = /^[-*]\s+(.*)$/.exec(trimmed);

        if (h2) { flushParagraph(); closeList(); html.push(`<h2>${inline(h2[1])}</h2>`); return; }
        if (h1) { flushParagraph(); closeList(); html.push(`<h1>${inline(h1[1])}</h1>`); return; }
        if (li) { flushParagraph(); if (!listOpen) { html.push('<ul>'); listOpen = true; } html.push(`<li>${inline(li[1])}</li>`); return; }
        paragraph.push(trimmed);
    });
    flushParagraph();
    closeList();
    return html.join('') || '';
};

// Extrai texto puro de um HTML (para assinatura de deduplicação)
const htmlToPlain = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

// Normaliza um item cru do JSON em um doc-parcial + avisos
const normalizeImportItem = (raw, index) => {
    const warnings = [];
    const out = {};

    out.title = typeof raw.title === 'string' ? raw.title.trim() : '';
    if (!out.title) warnings.push('sem título');

    // Data
    if (typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date.trim())) {
        out.date = raw.date.trim();
    } else {
        out.date = '';
        warnings.push('sem data (importado em branco)');
    }

    out.mainPassage = typeof raw.mainPassage === 'string' ? raw.mainPassage.trim() : '';

    // Tipo
    if (VALID_RECORD_TYPES.includes(raw.recordType)) {
        out.recordType = raw.recordType;
    } else {
        out.recordType = 'devocional';
        if (raw.recordType) warnings.push(`tipo "${raw.recordType}" inválido → devocional`);
    }

    // Formato
    const fmt = raw.recordFormat === 'orientado' ? 'orientado' : 'livre';
    if (raw.recordFormat && raw.recordFormat !== 'livre' && raw.recordFormat !== 'orientado') {
        warnings.push(`formato "${raw.recordFormat}" inválido → livre`);
    }
    out.recordFormat = fmt;

    // Conteúdo
    if (fmt === 'orientado') {
        const qs = Array.isArray(raw.questions) ? raw.questions : [];
        if (!qs.length) warnings.push('formato orientado sem perguntas');
        out.content = {
            questions: qs.map(q => ({
                q: typeof q.q === 'string' ? q.q.trim() : '',
                a: mdToHtml(q.a_md || q.a || '')
            }))
        };
    } else {
        const body = raw.content_md || (raw.content && raw.content.texto) || '';
        out.content = { texto: mdToHtml(body) || '<p><br></p>' };
        if (!htmlToPlain(out.content.texto)) warnings.push('corpo vazio');
    }

    // Listas
    const toList = (v) => {
        if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
        if (typeof v === 'string' && v.trim()) return [v.trim()];
        return [];
    };
    out.author = toList(raw.author);
    out.keywords = toList(raw.keywords).slice(0, 3);
    out.relatedPassages = typeof raw.relatedPassages === 'string' ? raw.relatedPassages.trim() : '';

    out.continuationOf = null; // resolvido após a importação (Fase 2)
    out.actions = [];
    out.links = [];

    // Referência de continuação (pelo TÍTULO do registro anterior)
    let continuationRef = null;
    const cont = raw.continuationOf || raw.continuationOfTitle;
    if (typeof cont === 'string' && cont.trim()) {
        continuationRef = { raw: cont.trim(), norm: norm(cont) };
    }

    return { doc: out, warnings, index, continuationRef };
};

// Assinatura de deduplicação
const buildSignature = (d) => {
    const plain = d.content && d.content.texto
        ? htmlToPlain(d.content.texto)
        : (d.content && Array.isArray(d.content.questions)
            ? d.content.questions.map(q => htmlToPlain(q.a)).join(' ')
            : '');
    return [norm(d.title), d.date || '', norm(d.mainPassage), plain.slice(0, 200)].join('␟');
};

// Popula o seletor de destino reutilizando a lista da migração
function populateImportTargets() {
    if (!importTargetEmail) return;
    const selectedValue = importTargetEmail.value;
    const options = (typeof getMigrationTargetOptions === 'function') ? getMigrationTargetOptions() : [];
    importTargetEmail.innerHTML = '<option value="">Selecione a conta de destino...</option>';
    options.forEach(option => {
        const el = document.createElement('option');
        el.value = option.email;
        el.dataset.uid = option.uid || '';
        el.innerText = option.label;
        importTargetEmail.appendChild(el);
    });
    if (selectedValue && options.some(o => o.email === selectedValue)) {
        importTargetEmail.value = selectedValue;
    }
}

const syncImportTargetUid = (overwrite = true) => {
    if (!importTargetEmail || !importTargetUid) return;
    const selected = importTargetEmail.selectedOptions[0];
    const knownUid = selected?.dataset?.uid || '';
    if (overwrite || !importTargetUid.value.trim()) {
        importTargetUid.value = knownUid;
    }
    if (!knownUid && importTargetEmail.value) {
        logToImportConsole(`UID da conta "${importTargetEmail.value}" não está salvo no sistema. Informe o UID manualmente antes de importar.`, 'warning');
    }
};

// --- VALIDAÇÃO + PREVIEW + DEDUP (Tarefa 3) ---

const renderImportPreview = (items, summary) => {
    if (!importPreviewList || !importPreviewContainer) return;
    importPreviewContainer.style.display = '';
    importPreviewList.innerHTML = '';
    items.forEach((it) => {
        const dup = it.duplicate;
        const row = document.createElement('div');
        row.style.cssText = 'padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:4px;';
        const dateLabel = it.doc.date || 'sem data';
        const fmtLabel = it.doc.recordFormat === 'orientado' ? 'orientado' : 'livre';
        const tags = [];
        if (dup) tags.push('<span style="color:#ffb74d;">duplicata (será pulada)</span>');
        it.warnings.forEach(w => tags.push(`<span style="color:#ffe082;">${escapeHtml(w)}</span>`));
        if (it.continuationRef) {
            const okRes = it.continuationResolvable;
            tags.push(`<span style="color:${okRes ? '#80cbc4' : '#ef9a9a'};">continuação de: ${escapeHtml(it.continuationRef.raw)}${okRes ? '' : ' (não encontrada)'}</span>`);
        }
        row.innerHTML = `
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:baseline;">
                <strong style="color: var(--text-main); font-size:0.92rem;">${(it.index + 1)}. ${escapeHtml(it.doc.title || '(sem título)')}</strong>
                <span style="color: var(--text-muted); font-size:0.78rem; white-space:nowrap;">${escapeHtml(dateLabel)} · ${escapeHtml(it.doc.recordType)} · ${fmtLabel}</span>
            </div>
            ${tags.length ? `<div style="font-size:0.78rem; display:flex; gap:10px; flex-wrap:wrap;">${tags.join('')}</div>` : ''}
        `;
        importPreviewList.appendChild(row);
    });
    if (importPreviewSummary) importPreviewSummary.innerText = summary;
};

if (btnValidateImport) {
    btnValidateImport.addEventListener('click', async () => {
        importValidated = null;
        if (btnRunImport) btnRunImport.disabled = true;

        const targetUid = importTargetUid ? importTargetUid.value.trim() : '';
        if (!targetUid) {
            return showAlert('Selecione a conta de destino (e o UID) antes de validar.');
        }

        const rawText = importJsonInput ? importJsonInput.value.trim() : '';
        if (!rawText) {
            return showAlert('Cole o JSON dos devocionais ou carregue um arquivo .json.');
        }

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (err) {
            logToImportConsole(`JSON inválido: ${err.message}`, 'error');
            return showAlert('JSON inválido. Verifique a estrutura e tente novamente.');
        }
        if (!Array.isArray(parsed)) {
            return showAlert('O conteúdo precisa ser uma lista (array) de devocionais.');
        }
        if (parsed.length === 0) {
            return showAlert('Nenhum devocional encontrado no JSON.');
        }

        logToImportConsole(`Validando ${parsed.length} item(ns)...`, 'warning');

        // Normaliza
        const items = parsed.map((raw, i) => normalizeImportItem(raw || {}, i));

        // Carrega assinaturas existentes da conta de destino (+ mapa título→ID p/ continuação)
        let existingSignatures = new Set();
        const existingTitleToId = new Map();
        try {
            logToImportConsole('Carregando registros existentes da conta de destino para deduplicação...', 'info');
            const q = query(collection(db, 'devotionals'), where('userId', '==', targetUid));
            const snap = await getDocs(q);
            snap.forEach(docSnap => {
                const d = docSnap.data();
                existingSignatures.add(buildSignature(d));
                if (d.title) existingTitleToId.set(norm(d.title), docSnap.id);
            });
            logToImportConsole(`${snap.size} registro(s) já existente(s) na conta.`, 'info');
        } catch (err) {
            logToImportConsole(`Erro ao carregar registros existentes: ${err.message}`, 'error');
            return showAlert(`Não foi possível verificar duplicatas. Detalhes: ${err.message}`);
        }

        // Marca duplicatas (existentes + intra-lote)
        const batchSignatures = new Set();
        let dupCount = 0;
        items.forEach(it => {
            const sig = buildSignature(it.doc);
            if (existingSignatures.has(sig) || batchSignatures.has(sig)) {
                it.duplicate = true;
                dupCount++;
            } else {
                it.duplicate = false;
                batchSignatures.add(sig);
            }
        });

        // Resolvibilidade da continuação (para preview): títulos do lote a importar + existentes
        const batchTitles = new Set(
            items.filter(it => !it.duplicate && it.doc.title).map(it => norm(it.doc.title))
        );
        items.forEach(it => {
            if (!it.continuationRef) return;
            it.continuationResolvable = batchTitles.has(it.continuationRef.norm) || existingTitleToId.has(it.continuationRef.norm);
        });

        const importable = items.filter(it => !it.duplicate).length;
        const summary = `${items.length} item(ns) · ${importable} a importar · ${dupCount} duplicata(s)`;
        renderImportPreview(items, summary);
        logToImportConsole(`Validação concluída. ${summary}.`, 'info');

        importValidated = { items, targetUid, targetEmail: importTargetEmail ? importTargetEmail.value : '', existingTitleToId };
        if (btnRunImport) btnRunImport.disabled = importable === 0;
        if (importable === 0) {
            logToImportConsole('Nada a importar (todos os itens são duplicatas).', 'warning');
        }
    });
}

// --- GRAVAÇÃO + LOG + RESUMO (Tarefa 4) ---

if (btnRunImport) {
    btnRunImport.addEventListener('click', async () => {
        if (!importValidated) {
            return showAlert('Valide e pré-visualize o JSON antes de importar.');
        }
        const { items, targetUid, targetEmail, existingTitleToId } = importValidated;
        const toImport = items.filter(it => !it.duplicate);
        if (toImport.length === 0) {
            return showAlert('Não há itens para importar (todos são duplicatas).');
        }

        const confirmMsg = `Importar ${toImport.length} devocional(is) para ${targetEmail || targetUid}? Esta ação grava diretamente na conta selecionada.`;
        if (!(await showConfirm(confirmMsg))) return;

        btnRunImport.disabled = true;
        btnValidateImport.disabled = true;
        const originalHtml = btnRunImport.innerHTML;
        btnRunImport.innerHTML = '<i class="ph ph-circle-notch"></i> Importando...';

        let ok = 0, fail = 0;
        const nowIso = new Date().toISOString();
        logToImportConsole(`Iniciando importação de ${toImport.length} item(ns) para ${targetEmail || targetUid}...`, 'warning');

        // --- FASE 1: cria os documentos (continuationOf resolvido na fase 2) ---
        const batchTitleToId = new Map();
        const created = []; // { it, newId }
        for (let i = 0; i < toImport.length; i++) {
            const it = toImport[i];
            const docData = {
                userId: targetUid,
                title: it.doc.title,
                date: it.doc.date,
                continuationOf: null,
                mainPassage: it.doc.mainPassage,
                recordType: it.doc.recordType,
                author: it.doc.author,
                relatedPassages: it.doc.relatedPassages,
                keywords: it.doc.keywords,
                recordFormat: it.doc.recordFormat,
                content: it.doc.content,
                actions: it.doc.actions,
                links: it.doc.links,
                createdAt: nowIso,
                updatedAt: nowIso,
                randomSeed: Math.random()
            };
            try {
                const ref = await addDoc(collection(db, 'devotionals'), docData);
                ok++;
                if (it.doc.title) batchTitleToId.set(norm(it.doc.title), ref.id);
                created.push({ it, newId: ref.id });
                if (ok % 5 === 0 || i === toImport.length - 1) {
                    logToImportConsole(`Progresso: ${ok}/${toImport.length} importado(s)...`, 'info');
                }
            } catch (err) {
                fail++;
                logToImportConsole(`Falha no item ${it.index + 1} ("${it.doc.title || 'sem título'}"): ${err.message}`, 'error');
            }
        }

        // --- FASE 2: resolve e grava os vínculos de continuação (por título) ---
        const existingMap = existingTitleToId || new Map();
        let linked = 0, unresolved = 0;
        for (const { it, newId } of created) {
            if (!it.continuationRef) continue;
            const targetId = batchTitleToId.get(it.continuationRef.norm) || existingMap.get(it.continuationRef.norm);
            if (targetId && targetId !== newId) {
                try {
                    await updateDoc(doc(db, 'devotionals', newId), { continuationOf: targetId });
                    linked++;
                } catch (err) {
                    logToImportConsole(`Falha ao vincular continuação do item ${it.index + 1}: ${err.message}`, 'error');
                }
            } else {
                unresolved++;
                logToImportConsole(`Continuação não resolvida para item ${it.index + 1} ("${it.continuationRef.raw}").`, 'warning');
            }
        }

        const skipped = items.length - toImport.length;
        logToImportConsole(`IMPORTAÇÃO CONCLUÍDA! Importados: ${ok} | Pulados (duplicatas): ${skipped} | Falhas: ${fail} | Vínculos de continuação: ${linked}${unresolved ? ` (${unresolved} não resolvido[s])` : ''}`, 'info');
        showAlert(`Importação concluída.\nImportados: ${ok}\nPulados (duplicatas): ${skipped}\nFalhas: ${fail}\nVínculos de continuação: ${linked}${unresolved ? `\nContinuações não resolvidas: ${unresolved}` : ''}`);

        btnRunImport.innerHTML = originalHtml;
        btnRunImport.disabled = true; // exige nova validação para reimportar
        btnValidateImport.disabled = false;
        importValidated = null;
    });
}

// --- BINDINGS AUXILIARES ---
if (importTargetEmail) importTargetEmail.addEventListener('change', () => syncImportTargetUid(true));

if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (importJsonInput) importJsonInput.value = reader.result;
            logToImportConsole(`Arquivo "${file.name}" carregado na área de texto. Clique em "Validar e pré-visualizar".`, 'info');
        };
        reader.onerror = () => logToImportConsole(`Erro ao ler o arquivo "${file.name}".`, 'error');
        reader.readAsText(file);
    });
}

if (btnClearImportLogs) {
    btnClearImportLogs.addEventListener('click', () => {
        if (importLogs) {
            importLogs.innerHTML = '';
            logToImportConsole('Console de logs limpo. Aguardando comandos...');
        }
    });
}

// Popula o seletor caso a whitelist já tenha sido carregada
populateImportTargets();

// ── MIGRAÇÃO: gerar randomSeed nos devocionais existentes ───────────────────
{
    const btnMigrateRandomSeed = document.getElementById('btnMigrateRandomSeed');
    const randomSeedLog        = document.getElementById('randomSeedMigrateLog');

    if (btnMigrateRandomSeed) {
        btnMigrateRandomSeed.addEventListener('click', async () => {
            const targetUid = document.getElementById('randomSeedTargetUid')?.value?.trim();
            if (!targetUid) { alert('Informe o UID de destino.'); return; }

            const log = (msg, type = 'info') => {
                if (!randomSeedLog) return;
                const el = document.createElement('p');
                el.style.color = type === 'error' ? '#f87171' : type === 'ok' ? '#86efac' : '#cbd5e1';
                el.style.margin = '2px 0';
                el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
                randomSeedLog.appendChild(el);
                randomSeedLog.scrollTop = randomSeedLog.scrollHeight;
            };

            btnMigrateRandomSeed.disabled = true;
            if (randomSeedLog) randomSeedLog.innerHTML = '';
            log('Buscando devocionais sem randomSeed...');

            try {
                const snap = await getDocs(query(
                    collection(db, 'devotionals'),
                    where('userId', '==', targetUid)
                ));
                const toMigrate = snap.docs.filter(d => d.data().randomSeed == null);
                log(`Total de registros: ${snap.size} | Sem randomSeed: ${toMigrate.length}`);
                if (toMigrate.length === 0) { log('Nada a migrar.', 'ok'); btnMigrateRandomSeed.disabled = false; return; }

                let ok = 0, fail = 0;
                for (const d of toMigrate) {
                    try {
                        await updateDoc(doc(db, 'devotionals', d.id), { randomSeed: Math.random() });
                        ok++;
                        if (ok % 10 === 0) log(`Progresso: ${ok}/${toMigrate.length}...`);
                    } catch (err) {
                        fail++;
                        log(`Falha em ${d.id}: ${err.message}`, 'error');
                    }
                }
                log(`Concluído! Migrados: ${ok} | Falhas: ${fail}`, 'ok');
            } catch (err) {
                log(`Erro: ${err.message}`, 'error');
            }
            btnMigrateRandomSeed.disabled = false;
        });
    }
}
