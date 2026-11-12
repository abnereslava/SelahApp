import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const VERSION = '1.0.0';
const BLUE = '#0066cc';
const SAFE_BYTES = 850000;

const account = document.getElementById('account');
const analyzeButton = document.getElementById('analyze');
const applyButton = document.getElementById('apply');
const summary = document.getElementById('summary');
const log = document.getElementById('log');

let currentUser = null;
let preview = null;

const writeLog = message => {
    const prefix = log.textContent.startsWith('[') ? '' : '\n';
    log.textContent += `${prefix}[${new Date().toLocaleTimeString()}] ${message}`;
    log.scrollTop = log.scrollHeight;
};

const statsTemplate = () => ({ cursors: 0, empty: 0, markdown: 0, headings: 0, verses: 0, separators: 0 });
const addStats = (target, source) => Object.keys(target).forEach(key => { target[key] += source[key] || 0; });
const clone = value => JSON.parse(JSON.stringify(value || {}));

const replaceTag = (element, tag) => {
    const replacement = element.ownerDocument.createElement(tag);
    [...element.attributes].forEach(attribute => replacement.setAttribute(attribute.name, attribute.value));
    while (element.firstChild) replacement.appendChild(element.firstChild);
    element.replaceWith(replacement);
};

const unwrap = element => {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) parent.insertBefore(element.firstChild, element);
    element.remove();
};

const startsWithReference = text => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const verseMarker = /^(?:vv?\.?\s*)?\d+\s*(?:[-–—]\s*\d+)?\s*[:：]/iu;
    const bookReference = /^(?:(?:[1-3]|I{1,3})\s*)?[\p{L}.]+(?:\s+[\p{L}.]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–—]\s*\d+)?\s*[:：-]?/iu;
    return verseMarker.test(normalized) || bookReference.test(normalized);
};

const normalizeHtml = html => {
    if (typeof html !== 'string' || !html.trim()) return { html: html || '', changed: false, stats: statsTemplate() };
    const stats = statsTemplate();
    const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const body = parsed.body;

    body.querySelectorAll('.ql-cursor').forEach(node => { node.remove(); stats.cursors++; });
    body.querySelectorAll('h1').forEach(node => { replaceTag(node, 'h2'); stats.headings++; });
    body.querySelectorAll('h4, h5, h6').forEach(node => { replaceTag(node, 'h3'); stats.headings++; });

    body.querySelectorAll('p').forEach(paragraph => {
        const text = (paragraph.textContent || '').replace(/[\u200B\uFEFF]/g, '').trim();
        const match = text.match(/^(#{2,3})\s*(.*?)\s*$/s);
        if (!match) return;
        if (!match[2]) { paragraph.remove(); stats.empty++; return; }
        const heading = parsed.createElement(match[1].length === 2 ? 'h2' : 'h3');
        heading.textContent = match[2];
        paragraph.replaceWith(heading);
        stats.markdown++;
    });

    body.querySelectorAll('p, h2, h3').forEach(element => {
        const text = (element.textContent || '').replace(/[\u200B\uFEFF\u00A0]/g, ' ').trim();
        if (!text && !element.querySelector('img, video, audio, iframe')) { element.remove(); stats.empty++; }
    });

    body.querySelectorAll('p').forEach(paragraph => {
        const text = (paragraph.textContent || '').replace(/\s+/g, ' ').trim();
        const formatted = paragraph.querySelector('[style*="color"]') || (paragraph.querySelector('strong') && paragraph.querySelector('em'));
        if (!startsWithReference(text) || (!/[“”"«»]/u.test(text) && !formatted)) return;
        paragraph.querySelectorAll('strong, em').forEach(unwrap);
        paragraph.querySelectorAll('[style]').forEach(node => {
            node.style.removeProperty('color');
            if (!node.getAttribute('style')?.trim()) node.removeAttribute('style');
        });
        const strong = parsed.createElement('strong');
        const em = parsed.createElement('em');
        strong.style.color = BLUE;
        while (paragraph.firstChild) em.appendChild(paragraph.firstChild);
        strong.appendChild(em);
        paragraph.appendChild(strong);
        stats.verses++;
    });

    body.querySelectorAll('hr').forEach(separator => {
        const previous = separator.previousElementSibling;
        const next = separator.nextElementSibling;
        const adjacentHeading = (previous && /^(H2|H3)$/u.test(previous.tagName)) || (next && /^(H2|H3)$/u.test(next.tagName));
        if (!previous || !next || previous.tagName === 'HR' || next.tagName === 'HR' || adjacentHeading) { separator.remove(); stats.separators++; }
    });

    const normalized = body.innerHTML.trim();
    return { html: normalized, changed: normalized !== html.trim(), stats };
};

const normalizeContent = content => {
    const next = clone(content);
    const stats = statsTemplate();
    let changed = false;
    const field = (object, key) => {
        if (!object || typeof object[key] !== 'string') return;
        const result = normalizeHtml(object[key]);
        if (result.changed) { object[key] = result.html; changed = true; }
        addStats(stats, result.stats);
    };
    field(next, 'texto');
    ['c1', 'c2', 'c3', 'c4', 'c5'].forEach(key => field(next, key));
    if (Array.isArray(next.questions)) next.questions.forEach(question => field(question, 'a'));
    return { content: next, changed, stats };
};

const estimateBytes = (data, content) => new TextEncoder().encode(JSON.stringify({
    ...data,
    content,
    typographyNormalizationV1: { version: VERSION, migratedAt: new Date().toISOString(), originalContent: data.content }
})).length;

onAuthStateChanged(auth, user => {
    currentUser = user;
    if (!user) {
        account.textContent = 'Nenhuma conta autenticada. Entre no Selah e volte a esta página.';
        return;
    }
    account.textContent = `Conta autenticada: ${user.email}`;
    analyzeButton.disabled = false;
    log.textContent = '[Pronto para analisar.]';
});

analyzeButton.addEventListener('click', async () => {
    if (!currentUser) return;
    analyzeButton.disabled = true;
    applyButton.disabled = true;
    summary.style.display = 'none';
    log.textContent = '';
    writeLog('Buscando os registros da conta autenticada…');
    try {
        const snapshot = await getDocs(query(collection(db, 'devotionals'), where('userId', '==', currentUser.uid)));
        const state = { total: snapshot.size, changes: [], unchanged: 0, migrated: 0, oversized: 0, stats: statsTemplate() };
        snapshot.docs.forEach(record => {
            const data = record.data();
            if (data.typographyNormalizationV1?.version === VERSION) { state.migrated++; return; }
            const result = normalizeContent(data.content);
            if (!result.changed) { state.unchanged++; return; }
            if (estimateBytes(data, result.content) > SAFE_BYTES) { state.oversized++; return; }
            addStats(state.stats, result.stats);
            state.changes.push({ id: record.id, title: data.title || data.mainPassage || record.id, content: result.content, originalContent: clone(data.content) });
        });
        preview = state;
        summary.innerHTML = `Encontrados: <strong>${state.total}</strong> · A alterar: <strong>${state.changes.length}</strong> · Sem alteração: <strong>${state.unchanged}</strong> · Já normalizados: <strong>${state.migrated}</strong> · Grandes demais: <strong>${state.oversized}</strong><br>Versículos: ${state.stats.verses} · Markdown: ${state.stats.markdown} · Títulos: ${state.stats.headings} · Vazios: ${state.stats.empty} · Resíduos: ${state.stats.cursors} · Separadores: ${state.stats.separators}`;
        summary.style.display = 'block';
        applyButton.disabled = state.changes.length === 0;
        writeLog(`Análise concluída. ${state.changes.length} registro(s) serão alterados.`);
    } catch (error) {
        writeLog(`ERRO: ${error.message}`);
    } finally {
        analyzeButton.disabled = false;
    }
});

applyButton.addEventListener('click', async () => {
    if (!currentUser || !preview?.changes?.length) return;
    applyButton.disabled = true;
    analyzeButton.disabled = true;
    let success = 0;
    let failures = 0;
    writeLog(`Aplicando ${preview.changes.length} alteração(ões)…`);
    for (let index = 0; index < preview.changes.length; index++) {
        const item = preview.changes[index];
        try {
            await updateDoc(doc(db, 'devotionals', item.id), {
                content: item.content,
                typographyNormalizationV1: { version: VERSION, migratedAt: new Date().toISOString(), originalContent: item.originalContent }
            });
            success++;
        } catch (error) {
            failures++;
            writeLog(`ERRO em “${item.title}”: ${error.message}`);
        }
        if ((index + 1) % 25 === 0 || index === preview.changes.length - 1) writeLog(`Progresso ${index + 1}/${preview.changes.length} · sucesso ${success} · falhas ${failures}`);
    }
    writeLog(`Concluído: ${success} atualizado(s), ${failures} falha(s).`);
    preview = null;
    analyzeButton.disabled = false;
});
