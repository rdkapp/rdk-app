// --- CONFIGURATION ---
const CLIENT_ID = '576080826935-2mtnj52ndc8plnsjodjevt3e2gsh4m3a.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// --- SVG ICONS ---
const ICONS = {
    chevronDown: `<svg class="key-item-chevron w-5 h-5 text-slate-400 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`,
    eye: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243l-4.243-4.243zM8 10.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M4.75 4.75l14.5 14.5" /></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`,
};

// --- GLOBAL STATE ---
let accessToken = null;
let tokenClient = null;
let dbData = null; // { keys: [] }
let dbFileId = null;
let masterKey = '';
let sessionTimer = null;
let isLoading = false;
let currentDbName = '';
let activeDbFiles = [];
let keyViewMode = 'list'; // 'list' or 'card'

// --- DOM ELEMENTS ---
let DOMElements;
let openingFile = null;

// --- UTILITY & HELPER FUNCTIONS ---

function showStatus(message, type = 'info') {
    console.log(`[STATUS] ${type}: ${message}`);
    if (DOMElements && DOMElements.statusMessage) {
        DOMElements.statusMessage.innerHTML = `<strong>Estado:</strong> ${message}`;
        DOMElements.statusMessage.className = 'p-3 rounded-md text-sm my-4 ';
        switch (type) {
            case 'ok': DOMElements.statusMessage.classList.add('bg-green-100', 'text-green-800'); break;
            case 'error': DOMElements.statusMessage.classList.add('bg-red-100', 'text-red-800'); break;
            default: DOMElements.statusMessage.classList.add('text-slate-500');
        }
    }
}

function setLoading(loading, element) {
    isLoading = loading;
    if (element) {
        element.disabled = loading;
        if (loading) {
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = '<div class="spinner mx-auto"></div>';
        } else {
            element.innerHTML = element.dataset.originalText || '';
        }
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[match]);
}

// --- SERVICES (Crypto, GDrive) ---
const CryptoService = {
    encrypt: (text, key) => CryptoJS.AES.encrypt(text, key).toString(),
    decrypt: (ciphertext, key) => CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8),
};

const GDriveService = {
    async authorizedFetch(url, options = {}) {
        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${accessToken}`);
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Ocurrió un error en la API de Google Drive.');
        }
        return response;
    },
    async listDbFiles() {
        const q = "mimeType='application/octet-stream' and trashed=false and fileExtension='db'";
        const url = `https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,modifiedTime)&q=${encodeURIComponent(q)}`;
        const res = await this.authorizedFetch(url);
        return res.json();
    },
    async getFileContent(fileId) {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const res = await this.authorizedFetch(url);
        return res.text();
    },
    async createFile(name, content) {
        const metadata = { name, mimeType: 'application/octet-stream' };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([content], { type: 'application/octet-stream' }));
        const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id`;
        const res = await this.authorizedFetch(url, { method: 'POST', body: form });
        return res.json();
    },
    async updateFileContent(fileId, content) {
        const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
        return this.authorizedFetch(url, { method: 'PATCH', body: new Blob([content], { type: 'application/octet-stream' }) });
    },
};

// --- RENDER FUNCTIONS & VIEW MANAGEMENT ---

function showKeyListView() {
    DOMElements.keyListView.classList.remove('-translate-x-full');
    DOMElements.keyListView.classList.add('translate-x-0');
    DOMElements.keyFormView.classList.remove('translate-x-0');
    DOMElements.keyFormView.classList.add('translate-x-full');
    resetKeyForm();
}

function showKeyFormView(isEditing = false) {
    if (!isEditing) {
        resetKeyForm();
    }
    DOMElements.keyListView.classList.add('-translate-x-full');
    DOMElements.keyListView.classList.remove('translate-x-0');
    DOMElements.keyFormView.classList.add('translate-x-0');
    DOMElements.keyFormView.classList.remove('translate-x-full');
    DOMElements.keyNameInput.focus();
}

function renderDbList() {
    const select = DOMElements.dbSelect;
    select.innerHTML = '';
    
    // Sort files alphabetically by name
    const sortedFiles = [...activeDbFiles].sort((a, b) => a.name.localeCompare(b.name));

    if (sortedFiles.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No se encontraron llaveros';
        option.disabled = true;
        select.appendChild(option);
        DOMElements.openDbBtn.disabled = true;
        return;
    }
    
    DOMElements.openDbBtn.disabled = false;
    sortedFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = file.id;
        option.textContent = file.name;
        option.dataset.name = file.name;
        if (dbFileId === file.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function getDecryptedAndFilteredKeys() {
    const filter = DOMElements.searchInput.value.toLowerCase();
    return dbData.keys.map(k => {
        try {
            return {
                ...k,
                d_user: CryptoService.decrypt(k.user, masterKey),
                d_pass: CryptoService.decrypt(k.pass, masterKey),
            };
        } catch (e) { return null; }
    }).filter(Boolean).filter(k => {
        if (!filter) return true;
        const searchCorpus = [k.name, k.d_user, k.note, ...(k.tags || [])].join(' ').toLowerCase();
        return searchCorpus.includes(filter);
    }).sort((a, b) => a.name.localeCompare(b.name));
}

function renderKeys() {
    DOMElements.keyList.innerHTML = '';
    if (!dbData) {
        DOMElements.keysPanel.classList.add('hidden');
        DOMElements.noDbOpenMessage.classList.remove('hidden');
        return;
    }

    DOMElements.keysPanel.classList.remove('hidden');
    DOMElements.noDbOpenMessage.classList.add('hidden');
    DOMElements.activeDbName.textContent = currentDbName;

    const decryptedAndFilteredKeys = getDecryptedAndFilteredKeys();

    DOMElements.keyCount.textContent = decryptedAndFilteredKeys.length;
    DOMElements.emptyDbMessage.classList.toggle('hidden', dbData.keys.length > 0 || decryptedAndFilteredKeys.length > 0);
    DOMElements.noResultsMessage.classList.toggle('hidden', decryptedAndFilteredKeys.length > 0 || dbData.keys.length === 0);

    decryptedAndFilteredKeys.forEach(dKey => {
        const item = createKeyListItem(dKey); // Defaulting to list view
        DOMElements.keyList.appendChild(item);
    });
}

function createKeyListItem(dKey) {
    const item = document.createElement('div');
    item.className = 'key-item bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden';
    
    const tagsHtml = (dKey.tags || []).map(tag => `<span class="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full">${escapeHtml(tag)}</span>`).join('');

    item.innerHTML = `
        <button class="key-item-header w-full flex justify-between items-center text-left p-3 hover:bg-slate-50 transition-colors">
            <span class="font-bold text-slate-800 break-all">${escapeHtml(dKey.name)}</span>
            ${ICONS.chevronDown}
        </button>
        <div class="key-item-body">
            <div class="p-3 border-t border-slate-100 space-y-2 text-sm">
                ${createRevealingFieldHTML('Usuario', dKey.d_user)}
                ${createRevealingFieldHTML('Contraseña', dKey.d_pass, true)}
                ${dKey.note ? `<div class="pt-2 text-slate-600"><strong class="font-medium text-slate-800">Nota:</strong><p class="whitespace-pre-wrap break-words p-2 bg-slate-50 rounded mt-1">${escapeHtml(dKey.note)}</p></div>` : ''}
                ${tagsHtml ? `<div class="pt-2 border-t border-slate-100 flex flex-wrap gap-2">${tagsHtml}</div>` : ''}
                <div class="flex gap-2 pt-2 border-t border-slate-100">
                    <button class="edit-btn text-sm flex items-center gap-1.5 text-blue-600 hover:underline">${ICONS.edit} Editar</button>
                    <button class="delete-btn text-sm flex items-center gap-1.5 text-red-600 hover:underline">${ICONS.delete} Eliminar</button>
                </div>
            </div>
        </div>
    `;

    item.querySelector('.key-item-header').onclick = () => item.classList.toggle('expanded');
    item.querySelector('.edit-btn').onclick = () => populateEditForm(dKey.id);
    item.querySelector('.delete-btn').onclick = () => handleDeleteKey(dKey.id);
    attachRevealingFieldListeners(item);
    return item;
}

function createRevealingFieldHTML(label, value, isMono = false) {
    if (!value) return '';
    const maskedValue = '••••••••';
    return `
        <div class="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded">
            <div class="flex-grow min-w-0">
                <span class="font-medium text-slate-800">${label}:</span>
                <span class="value-span ${isMono ? 'font-mono' : ''} text-slate-700 break-all ml-1" data-value="${escapeHtml(value)}">${maskedValue}</span>
            </div>
            <div class="flex-shrink-0 flex items-center gap-2">
                <button class="reveal-btn p-1 text-slate-500 hover:text-slate-800 transition-colors" title="Mostrar/Ocultar">${ICONS.eye}</button>
                <button class="copy-btn p-1 text-slate-500 hover:text-slate-800 transition-colors" title="Copiar ${label}">${ICONS.copy}</button>
            </div>
        </div>`;
}

function attachRevealingFieldListeners(parentElement) {
    parentElement.querySelectorAll('.reveal-btn').forEach(btn => {
        btn.onclick = (e) => {
            const currentBtn = e.currentTarget;
            const container = currentBtn.closest('div');
            const valueSpan = container.querySelector('.value-span');
            if (valueSpan.textContent === '••••••••') {
                valueSpan.textContent = valueSpan.dataset.value;
                currentBtn.innerHTML = ICONS.eyeOff;
            } else {
                valueSpan.textContent = '••••••••';
                currentBtn.innerHTML = ICONS.eye;
            }
        };
    });
    parentElement.querySelectorAll('.copy-btn').forEach(btn => {
        btn.onclick = (e) => {
            const currentBtn = e.currentTarget;
            const container = currentBtn.closest('div');
            const valueSpan = container.querySelector('.value-span');
            navigator.clipboard.writeText(valueSpan.dataset.value);
            const originalIcon = currentBtn.innerHTML;
            currentBtn.innerHTML = ICONS.check;
            setTimeout(() => currentBtn.innerHTML = originalIcon, 1500);
        };
    });
}

// --- CORE LOGIC ---

async function loadDbListAndRender() {
    showStatus('Cargando lista de llaveros...');
    try {
        const { files } = await GDriveService.listDbFiles();
        activeDbFiles = files || [];
        renderDbList();
        showStatus(`Se encontraron ${activeDbFiles.length} llavero(s).`);
        return activeDbFiles;
    } catch (e) {
        showStatus(`Error al listar archivos: ${e.message}`, 'error');
        return [];
    }
}

async function handleCreateDb(event) {
    event.preventDefault();
    const name = DOMElements.newDbNameInput.value.trim();
    const mKey = DOMElements.createMasterKeyInput.value;
    if (!name || !mKey) return alert('El nombre del nuevo llavero y la clave maestra son requeridos.');

    setLoading(true, DOMElements.createDbBtn);
    showStatus(`Creando '${name}.db'...`);
    try {
        const newDbData = { keys: [] };
        const encryptedContent = CryptoService.encrypt(JSON.stringify(newDbData), mKey);
        const created = await GDriveService.createFile(`${name}.db`, encryptedContent);
        
        dbData = newDbData;
        masterKey = mKey;
        dbFileId = created.id;
        currentDbName = `${name}.db`;
        
        showStatus(`Llavero '${currentDbName}' creado y abierto.`, 'ok');
        DOMElements.createDbForm.reset();
        await loadDbListAndRender();
        renderKeys();
        showKeyListView();
    } catch (e) {
        showStatus(`Error al crear archivo: ${e.message}`, 'error');
    } finally {
        setLoading(false, DOMElements.createDbBtn);
    }
}

async function handleOpenDb(event) {
    event.preventDefault();
    if (!openingFile) return;
    const { id, name } = openingFile;
    const mKey = DOMElements.modalMasterKeyInput.value;
    if (!mKey) return alert('La clave maestra es requerida.');
    
    setLoading(true, DOMElements.modalUnlockBtn);
    showStatus(`Abriendo '${name}'...`);
    try {
        const encryptedContent = await GDriveService.getFileContent(id);
        const decryptedJson = CryptoService.decrypt(encryptedContent, mKey);
        if (!decryptedJson) throw new Error("El descifrado falló. La clave maestra podría ser incorrecta.");

        dbData = JSON.parse(decryptedJson);
        if (!Array.isArray(dbData.keys)) dbData.keys = [];
        
        masterKey = mKey;
        dbFileId = id;
        currentDbName = name;
        
        DOMElements.openDbModal.classList.add('hidden');
        DOMElements.modalMasterKeyInput.value = '';
        openingFile = null;
        showStatus(`'${name}' abierto correctamente.`, 'ok');
        renderDbList(); // Re-render to show selection
        renderKeys();
        showKeyListView();
    } catch (e) {
        showStatus(`No se pudo abrir el llavero. Revisa la clave maestra.`, 'error');
    } finally {
        setLoading(false, DOMElements.modalUnlockBtn);
    }
}

async function saveDb() {
    if (!dbFileId || !masterKey) return;
    showStatus('Guardando en Google Drive...');
    try {
        const encryptedContent = CryptoService.encrypt(JSON.stringify(dbData), masterKey);
        await GDriveService.updateFileContent(dbFileId, encryptedContent);
        showStatus('Guardado en Drive correctamente.', 'ok');
        await loadDbListAndRender();
    } catch (e) {
        showStatus(`Error al guardar en Drive: ${e.message}`, 'error');
    }
}

function handleSaveKey(event) {
    event.preventDefault();
    if (!dbData) return;
    const name = DOMElements.keyNameInput.value.trim();
    if (!name) return alert('El nombre de la llave es requerido.');
    
    const keyData = {
        name,
        user: CryptoService.encrypt(DOMElements.keyUserInput.value, masterKey),
        pass: CryptoService.encrypt(DOMElements.keyPassInput.value, masterKey),
        note: DOMElements.keyNoteInput.value,
        tags: DOMElements.keyTagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    };

    const existingId = DOMElements.keyIdInput.value;
    if (existingId) { // Editing
        const index = dbData.keys.findIndex(k => k.id === existingId);
        if (index > -1) dbData.keys[index] = { ...dbData.keys[index], ...keyData };
    } else { // Adding
        dbData.keys.push({ id: `id_${Date.now()}_${Math.random()}`, ...keyData });
    }
    
    saveDb();
    renderKeys();
    showKeyListView();
}

function handleDeleteKey(keyId) {
    if (!dbData || !confirm('¿Estás seguro de que quieres eliminar esta llave?')) return;
    dbData.keys = dbData.keys.filter(k => k.id !== keyId);
    saveDb();
    renderKeys();
}

function resetKeyForm() {
    DOMElements.keyForm.reset();
    DOMElements.keyIdInput.value = '';
    DOMElements.keyFormTitle.textContent = 'Añadir llave nueva';
    DOMElements.cancelEditBtn.classList.add('hidden');
}

function populateEditForm(keyId) {
    const key = dbData.keys.find(k => k.id === keyId);
    if (!key) return;
    
    try {
        DOMElements.keyIdInput.value = key.id;
        DOMElements.keyNameInput.value = key.name;
        DOMElements.keyUserInput.value = CryptoService.decrypt(key.user, masterKey);
        DOMElements.keyPassInput.value = CryptoService.decrypt(key.pass, masterKey);
        DOMElements.keyNoteInput.value = key.note || '';
        DOMElements.keyTagsInput.value = (key.tags || []).join(', ');
        
        DOMElements.keyFormTitle.textContent = `Editando '${key.name}'`;
        DOMElements.cancelEditBtn.classList.remove('hidden');
        showKeyFormView(true);
    } catch (e) {
        showStatus('Error al preparar la llave para edición.', 'error');
    }
}

// --- AUTH & SESSION ---

function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    const expiresAt = new Date(Date.now() + SESSION_TIMEOUT);
    DOMElements.sessionTimerInfo.textContent = `La sesión expira a las ${expiresAt.toLocaleTimeString()}`;
    sessionTimer = setTimeout(() => {
        alert('La sesión expiró por inactividad.');
        window.location.reload();
    }, SESSION_TIMEOUT);
}

async function onSignedIn() {
    DOMElements.loginView.classList.add('hidden');
    DOMElements.appView.classList.remove('hidden');
    document.body.addEventListener('click', resetSessionTimer, { passive: true });
    document.body.addEventListener('input', resetSessionTimer, { passive: true });
    resetSessionTimer();
    await loadDbListAndRender();
}

function handleGsiResponse(resp) {
    if (resp.error) return showStatus(`Error de token: ${resp.error}`, 'error');
    accessToken = resp.access_token;
    showStatus('Autenticación correcta. Obteniendo datos...', 'ok');
    onSignedIn();
}

function handleSignOut() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken, () => {
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    DOMElements = {
        loginView: document.getElementById('login-view'),
        appView: document.getElementById('app-view'),
        statusMessage: document.getElementById('status-message'),
        signInBtn: document.getElementById('signin-btn'),
        signOutBtn: document.getElementById('signout-btn'),
        sessionTimerInfo: document.getElementById('session-timer-info'),
        dbSelect: document.getElementById('db-select'),
        openDbBtn: document.getElementById('open-db-btn'),
        keyList: document.getElementById('key-list'),
        createDbForm: document.getElementById('create-db-form'),
        newDbNameInput: document.getElementById('new-db-name-input'),
        createMasterKeyInput: document.getElementById('create-master-key-input'),
        createDbBtn: document.getElementById('create-db-btn'),
        keyFormContainer: document.getElementById('key-form-container'),
        keyForm: document.getElementById('key-form'),
        keyFormTitle: document.getElementById('key-form-title'),
        keyIdInput: document.getElementById('key-id-input'),
        keyNameInput: document.getElementById('key-name-input'),
        keyUserInput: document.getElementById('key-user-input'),
        keyPassInput: document.getElementById('key-pass-input'),
        keyNoteInput: document.getElementById('key-note-input'),
        keyTagsInput: document.getElementById('key-tags-input'),
        cancelEditBtn: document.getElementById('cancel-edit-btn'),
        searchInput: document.getElementById('search-input'),
        activeDbName: document.getElementById('active-db-name'),
        keyCount: document.getElementById('key-count'),
        noDbOpenMessage: document.getElementById('no-db-open-message'),
        keysPanel: document.getElementById('keys-panel'),
        emptyDbMessage: document.getElementById('empty-db-message'),
        noResultsMessage: document.getElementById('no-results-message'),
        openDbModal: document.getElementById('open-db-modal'),
        openDbForm: document.getElementById('open-db-form'),
        modalDbName: document.getElementById('modal-db-name'),
        modalMasterKeyInput: document.getElementById('modal-master-key-input'),
        modalCancelBtn: document.getElementById('modal-cancel-btn'),
        modalUnlockBtn: document.getElementById('modal-unlock-btn'),
        addFirstKeyBtn: document.getElementById('add-first-key-btn'),
        addNewKeyBtn: document.getElementById('add-new-key-btn'),
        backToListBtn: document.getElementById('back-to-list-btn'),
        keyListView: document.getElementById('key-list-view'),
        keyFormView: document.getElementById('key-form-view'),
    };
    
    // --- EVENT LISTENERS ---
    DOMElements.signOutBtn.onclick = handleSignOut;
    DOMElements.createDbForm.onsubmit = handleCreateDb;
    DOMElements.keyForm.onsubmit = handleSaveKey;
    DOMElements.cancelEditBtn.onclick = showKeyListView;
    DOMElements.backToListBtn.onclick = showKeyListView;
    DOMElements.addNewKeyBtn.onclick = () => showKeyFormView();
    DOMElements.addFirstKeyBtn.onclick = () => showKeyFormView();
    DOMElements.searchInput.oninput = () => renderKeys();
    
    DOMElements.openDbBtn.onclick = () => {
        const selected = DOMElements.dbSelect.options[DOMElements.dbSelect.selectedIndex];
        if (!selected || selected.disabled) return;
        openingFile = { id: selected.value, name: selected.dataset.name };
        DOMElements.modalDbName.textContent = openingFile.name;
        DOMElements.openDbModal.classList.remove('hidden');
        DOMElements.modalMasterKeyInput.focus();
    };

    DOMElements.openDbForm.onsubmit = handleOpenDb;
    DOMElements.modalCancelBtn.onclick = () => {
        DOMElements.openDbModal.classList.add('hidden');
        DOMElements.modalMasterKeyInput.value = '';
        openingFile = null;
    };
    
    document.querySelectorAll('[data-toggle-password]').forEach(btn => {
        const input = document.getElementById(btn.dataset.togglePassword);
        btn.innerHTML = ICONS.eye; // Initial icon
        btn.onclick = () => {
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.innerHTML = isPassword ? ICONS.eyeOff : ICONS.eye;
            }
        };
    });

    // --- DYNAMIC SCRIPT LOADING FOR GOOGLE SIGN-IN ---
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = () => {
        // This function runs only after the GSI script is loaded and ready.
        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: handleGsiResponse,
            });
            DOMElements.signInBtn.disabled = false;
            DOMElements.signInBtn.onclick = () => {
                if (tokenClient) tokenClient.requestAccessToken({ prompt: 'consent' });
            };
            showStatus('Listo para iniciar sesión.', 'ok');
        } catch (error) {
            console.error("GSI initialization error:", error);
            showStatus('No se pudo inicializar el inicio de sesión de Google.', 'error');
        }
    };
    gsiScript.onerror = () => {
        showStatus('Error al cargar el script de inicio de sesión de Google.', 'error');
    };
    document.body.appendChild(gsiScript);
});
