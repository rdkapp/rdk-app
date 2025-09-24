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
    keychainIcon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`,
    keyIcon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>`,
    toastSuccess: `<svg class="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    toastInfo: `<svg class="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
};

// --- GLOBAL STATE ---
let accessToken = null;
let tokenClient = null;
let dbData = null; // { keys: [], tags: [] }
let dbFileId = null;
let masterKey = '';
let sessionTimer = null;
let isLoading = false;
let currentDbName = '';
let activeDbFiles = [];

// --- DOM ELEMENTS ---
let DOMElements;
let openingFile = null;

// --- UTILITY & HELPER FUNCTIONS ---

function showStatus(message, type = 'info') {
    console.log(`[STATUS] ${type}: ${message}`);
    if (DOMElements && DOMElements.statusMessage) {
        DOMElements.statusMessage.innerHTML = `<strong>Estado:</strong> ${message}`;
        const baseClasses = ['p-3', 'rounded-md', 'text-sm', 'my-4'];
        let typeClasses = [];
        switch (type) {
            case 'ok': typeClasses = ['bg-green-100', 'text-green-800', 'dark:bg-green-900/50', 'dark:text-green-300']; break;
            case 'error': typeClasses = ['bg-red-100', 'text-red-800', 'dark:bg-red-900/50', 'dark:text-red-300']; break;
            default: typeClasses = ['text-slate-500', 'dark:text-slate-400'];
        }
        DOMElements.statusMessage.className = [...baseClasses, ...typeClasses].join(' ');
    }
}

function showToast(message, type = 'success', duration = 3000) {
    const container = DOMElements.toastContainer;
    const toast = document.createElement('div');
    const icon = type === 'success' ? ICONS.toastSuccess : ICONS.toastInfo;
    const typeClass = type === 'success' ? 'toast-success' : 'toast-info';

    toast.className = `toast ${typeClass}`;
    toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}


function setLoading(loading, element) {
    isLoading = loading;
    if (element) {
        element.disabled = loading;
        if (loading) {
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = '<div class="spinner mx-auto"></div>';
        } else if (element.dataset.originalText) {
            element.innerHTML = element.dataset.originalText;
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
    decrypt: (ciphertext, key) => {
        if(!ciphertext || !key) return '';
        try {
            return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error("Decryption failed:", e);
            return ''; // Return empty string on failure
        }
    }
};

const GDriveService = {
    async authorizedFetch(url, options = {}) {
        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${accessToken}`);
        const response = await fetch(url, { ...options, headers });
        if (response.status === 204) return response; // Handle no-content responses like DELETE
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: `HTTP Error ${response.status}` } }));
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
    async renameFile(fileId, newName) {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
        const metadata = { name: newName };
        return this.authorizedFetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata)
        });
    },
    async deleteFile(fileId) {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
        return this.authorizedFetch(url, { method: 'DELETE' });
    }
};

// --- RENDER FUNCTIONS & VIEW MANAGEMENT ---

function toggleMenu(forceClose = false) {
    const isOpen = !DOMElements.sideMenu.classList.contains('-translate-x-full');
    if (forceClose || isOpen) {
        DOMElements.sideMenu.classList.add('-translate-x-full');
        DOMElements.menuOverlay.classList.add('opacity-0');
        setTimeout(() => DOMElements.menuOverlay.classList.add('hidden'), 300);
    } else {
        DOMElements.sideMenu.classList.remove('-translate-x-full');
        DOMElements.menuOverlay.classList.remove('hidden');
        DOMElements.menuOverlay.classList.remove('opacity-0');
    }
}

function showKeyListView() {
    DOMElements.keyListView.classList.remove('-translate-x-full');
    DOMElements.keyListView.classList.add('translate-x-0');
    DOMElements.keyFormView.classList.remove('translate-x-0');
    DOMElements.keyFormView.classList.add('translate-x-full');
    resetKeyForm();
}

function showKeyFormView(isEditing = false) {
    if (!isEditing) resetKeyForm();
    populateTagSelect();
    toggleMenu(true);
    DOMElements.keyListView.classList.add('-translate-x-full');
    DOMElements.keyListView.classList.remove('translate-x-0');
    DOMElements.keyFormView.classList.add('translate-x-0');
    DOMElements.keyFormView.classList.remove('translate-x-full');
    DOMElements.keyNameInput.focus();
}

function renderDbList() {
    const select = DOMElements.dbSelect;
    select.innerHTML = '';
    const sortedFiles = [...activeDbFiles].sort((a, b) => a.name.localeCompare(b.name));
    if (sortedFiles.length === 0) {
        select.innerHTML = '<option disabled>No se encontraron llaveros</option>';
        DOMElements.openDbBtn.disabled = true;
        return;
    }
    DOMElements.openDbBtn.disabled = false;
    sortedFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = file.id;
        option.textContent = file.name;
        option.dataset.name = file.name;
        select.appendChild(option);
    });
}

function getFilteredKeys() {
    if (!dbData?.keys) return [];
    const filter = DOMElements.searchInput.value.toLowerCase();
    if (!filter) return [...dbData.keys].sort((a, b) => a.name.localeCompare(b.name));

    const tagMap = new Map(dbData.tags.map(t => [t.id, t.name.toLowerCase()]));

    return dbData.keys.filter(k => {
        const tag_name = k.tagId ? tagMap.get(k.tagId) || '' : '';
        // Search is now limited to non-encrypted fields for security
        return [k.name.toLowerCase(), k.note?.toLowerCase(), tag_name].join(' ').includes(filter);
    }).sort((a, b) => a.name.localeCompare(b.name));
}


function renderKeys() {
    DOMElements.keyList.innerHTML = '';
    if (!dbData) {
        DOMElements.viewsContainer.classList.add('hidden');
        DOMElements.noDbOpenMessage.classList.remove('hidden');
        DOMElements.addNewKeyHeaderBtn.disabled = true;
        DOMElements.manageTagsBtn.disabled = true;
        return;
    }

    DOMElements.viewsContainer.classList.remove('hidden');
    DOMElements.noDbOpenMessage.classList.add('hidden');
    DOMElements.addNewKeyHeaderBtn.disabled = false;
    DOMElements.manageTagsBtn.disabled = false;
    
    const filteredKeys = getFilteredKeys();
    const nameWithoutExt = currentDbName.replace(/\.db$/, '');
    
    DOMElements.keychainTitleName.innerHTML = `${ICONS.keychainIcon} Llavero: <span class="text-blue-600 dark:text-blue-400 font-semibold">"${escapeHtml(nameWithoutExt)}"</span>`;
    DOMElements.keychainTitleCount.innerHTML = `${ICONS.keyIcon} Cantidad de llaves: <span class="font-semibold">${filteredKeys.length}</span>`;

    DOMElements.emptyDbMessage.classList.toggle('hidden', dbData.keys.length > 0);
    DOMElements.noResultsMessage.classList.toggle('hidden', filteredKeys.length > 0 || dbData.keys.length === 0 || !DOMElements.searchInput.value);

    filteredKeys.forEach(key => {
        const item = createKeyListItem(key);
        DOMElements.keyList.appendChild(item);
    });
}

function createKeyListItem(key) {
    const item = document.createElement('div');
    item.className = 'key-item bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden';
    
    const tag = dbData.tags.find(t => t.id === key.tagId);
    const tagHtml = tag ? `<span class="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full dark:bg-sky-900/70 dark:text-sky-300 ml-2 flex-shrink-0">${escapeHtml(tag.name)}</span>` : '';

    item.innerHTML = `
        <button class="key-item-header w-full flex justify-between items-center text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div class="flex items-center min-w-0">
                <span class="font-bold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(key.name)}</span>
                ${tagHtml}
            </div>
            ${ICONS.chevronDown}
        </button>
        <div class="key-item-body"><div class="p-3 border-t border-slate-100 dark:border-slate-700 space-y-2 text-sm">
            ${createRevealingFieldHTML('Usuario', key.user)}
            ${createRevealingFieldHTML('Contraseña', key.pass, true)}
            ${key.note ? `<div class="pt-2 text-slate-600 dark:text-slate-300"><strong class="font-medium text-slate-800 dark:text-slate-200">Nota:</strong><p class="whitespace-pre-wrap break-words p-2 bg-slate-50 dark:bg-slate-700/50 rounded mt-1">${escapeHtml(key.note)}</p></div>` : ''}
            <div class="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button class="edit-btn text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">${ICONS.edit} Editar</button>
                <button class="delete-btn text-sm flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:underline">${ICONS.delete} Eliminar</button>
            </div>
        </div></div>`;
    item.querySelector('.key-item-header').onclick = () => item.classList.toggle('expanded');
    item.querySelector('.edit-btn').onclick = () => populateEditForm(key.id);
    item.querySelector('.delete-btn').onclick = () => handleDeleteKey(key.id);
    attachRevealingFieldListeners(item);
    return item;
}

function createRevealingFieldHTML(label, encryptedValue, isMono = false) {
    if (!encryptedValue) return '';
    const maskedValue = '••••••••';
    // Store the ENCRYPTED value in data-value for just-in-time decryption
    return `<div class="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
        <div class="flex-grow min-w-0">
            <span class="font-medium text-slate-800 dark:text-slate-200">${label}:</span>
            <span class="value-span ${isMono ? 'font-mono' : ''} text-slate-700 dark:text-slate-300 break-all ml-1" data-encrypted-value="${escapeHtml(encryptedValue)}">${maskedValue}</span>
        </div>
        <div class="flex-shrink-0 flex items-center gap-2">
            <button class="reveal-btn p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title="Mostrar/Ocultar">${ICONS.eye}</button>
            <button class="copy-btn p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" title="Copiar ${label}">${ICONS.copy}</button>
        </div>
    </div>`;
}

function attachRevealingFieldListeners(parentElement) {
    parentElement.querySelectorAll('.reveal-btn').forEach(btn => btn.onclick = (e) => {
        const valueSpan = e.currentTarget.closest('div').parentElement.querySelector('.value-span');
        const isMasked = valueSpan.textContent === '••••••••';
        if (isMasked) {
            const encryptedValue = valueSpan.dataset.encryptedValue;
            const decryptedValue = CryptoService.decrypt(encryptedValue, masterKey);
            valueSpan.textContent = decryptedValue || '[Error al descifrar]';
        } else {
            valueSpan.textContent = '••••••••';
        }
        e.currentTarget.innerHTML = isMasked ? ICONS.eyeOff : ICONS.eye;
    });
    parentElement.querySelectorAll('.copy-btn').forEach(btn => btn.onclick = (e) => {
        const valueSpan = e.currentTarget.closest('div').parentElement.querySelector('.value-span');
        const encryptedValue = valueSpan.dataset.encryptedValue;
        const decryptedValue = CryptoService.decrypt(encryptedValue, masterKey);
        navigator.clipboard.writeText(decryptedValue);
        const originalIcon = e.currentTarget.innerHTML;
        e.currentTarget.innerHTML = ICONS.check;
        setTimeout(() => e.currentTarget.innerHTML = originalIcon, 1500);
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
    } catch (e) { showStatus(`Error al listar archivos: ${e.message}`, 'error'); }
}

async function handleCreateDb(event) {
    event.preventDefault();
    const name = DOMElements.newDbNameInput.value.trim();
    const mKey = DOMElements.createMasterKeyInput.value;
    if (!name || !mKey) return alert('El nombre del nuevo llavero y la clave maestra son requeridos.');
    setLoading(true, DOMElements.createDbBtn);
    showStatus(`Creando '${name}.db'...`);
    try {
        const newDbData = { keys: [], tags: [] };
        const encryptedContent = CryptoService.encrypt(JSON.stringify(newDbData), mKey);
        const created = await GDriveService.createFile(`${name}.db`, encryptedContent);
        dbData = newDbData; masterKey = mKey; dbFileId = created.id; currentDbName = `${name}.db`;
        showStatus(`Llavero '${currentDbName}' creado y abierto.`, 'ok');
        saveSessionState();
        DOMElements.createDbForm.reset();
        await loadDbListAndRender();
        renderKeys();
        showKeyListView();
        toggleMenu(true);
    } catch (e) { showStatus(`Error al crear archivo: ${e.message}`, 'error'); } finally { setLoading(false, DOMElements.createDbBtn); }
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
        if (!decryptedJson) throw new Error("Descifrado falló. Clave maestra incorrecta o archivo corrupto.");
        
        let parsedData = JSON.parse(decryptedJson);
        // --- Backward Compatibility ---
        if (Array.isArray(parsedData)) { // Very old format was just an array of keys
            parsedData = { keys: parsedData, tags: [] };
        }
        if (!parsedData.tags) {
            parsedData.tags = [];
        }
        parsedData.tags.forEach(t => { if(!t.id) t.id = `tag_${Date.now()}_${Math.random()}`; });

        dbData = (parsedData && Array.isArray(parsedData.keys)) ? parsedData : { keys: [], tags: [] };
        // --- End Compatibility ---

        masterKey = mKey; dbFileId = id; currentDbName = name;
        saveSessionState();
        DOMElements.openDbModal.classList.add('hidden');
        DOMElements.modalMasterKeyInput.value = '';
        openingFile = null;
        showStatus(`'${name}' abierto correctamente.`, 'ok');
        renderKeys();
        showKeyListView();
        toggleMenu(true);
    } catch (e) { showStatus(e.message, 'error'); } finally { setLoading(false, DOMElements.modalUnlockBtn); }
}


async function saveDb() {
    if (!dbFileId || !masterKey) return;
    showStatus('Guardando...');
    try {
        const encryptedContent = CryptoService.encrypt(JSON.stringify(dbData), masterKey);
        await GDriveService.updateFileContent(dbFileId, encryptedContent);
        saveSessionState();
        showToast('Guardado en Drive correctamente.');
    } catch (e) { showStatus(`Error al guardar: ${e.message}`, 'error'); }
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
        tagId: DOMElements.keyTagSelect.value || null,
    };
    const existingId = DOMElements.keyIdInput.value;
    if (existingId) {
        const index = dbData.keys.findIndex(k => k.id === existingId);
        if (index > -1) dbData.keys[index] = { ...dbData.keys[index], ...keyData };
    } else {
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

async function handleRenameDb(event) {
    event.preventDefault();
    let newName = DOMElements.renameDbInput.value.trim();
    if (!newName) return alert('El nuevo nombre no puede estar vacío.');
    if (!newName.endsWith('.db')) newName += '.db';
    
    setLoading(true, DOMElements.renameConfirmBtn);
    try {
        await GDriveService.renameFile(dbFileId, newName);
        currentDbName = newName;
        DOMElements.renameDbModal.classList.add('hidden');
        showStatus(`Llavero renombrado a '${newName}'.`, 'ok');
        renderKeys(); // Re-render to show new name immediately
        await loadDbListAndRender();
        saveSessionState();
    } catch(e) { showStatus(`Error al renombrar: ${e.message}`, 'error'); }
    finally { setLoading(false, DOMElements.renameConfirmBtn); }
}

async function handleDeleteDb() {
    setLoading(true, DOMElements.deleteConfirmBtn);
    try {
        await GDriveService.deleteFile(dbFileId);
        DOMElements.deleteDbModal.classList.add('hidden');
        showStatus(`Llavero '${currentDbName}' eliminado.`, 'ok');
        dbData = null; dbFileId = null; masterKey = ''; currentDbName = '';
        sessionStorage.removeItem('keychainSession');
        renderKeys();
        await loadDbListAndRender();
    } catch(e) { showStatus(`Error al eliminar: ${e.message}`, 'error'); }
    finally { setLoading(false, DOMElements.deleteConfirmBtn); }
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
        // Decrypt only when populating the edit form
        DOMElements.keyUserInput.value = CryptoService.decrypt(key.user, masterKey);
        DOMElements.keyPassInput.value = CryptoService.decrypt(key.pass, masterKey);
        DOMElements.keyNoteInput.value = key.note || '';
        DOMElements.keyFormTitle.textContent = `Editando '${key.name}'`;
        DOMElements.cancelEditBtn.classList.remove('hidden');
        showKeyFormView(true);
        DOMElements.keyTagSelect.value = key.tagId || '';
    } catch (e) { showStatus('Error al preparar la llave para edición.', 'error'); }
}


// --- TAG MANAGEMENT ---

function openTagsModal() {
    DOMElements.tagsModal.classList.remove('hidden');
    renderTagsInModal();
    toggleMenu(true);
}

function renderTagsInModal() {
    DOMElements.tagsList.innerHTML = '';
    if (!dbData || dbData.tags.length === 0) {
        DOMElements.tagsList.innerHTML = '<p class="text-slate-500 text-sm">No hay etiquetas. Añade una nueva abajo.</p>';
        return;
    }
    dbData.tags.sort((a,b) => a.name.localeCompare(b.name)).forEach(tag => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded';
        div.innerHTML = `
            <span class="text-slate-800 dark:text-slate-200">${escapeHtml(tag.name)}</span>
            <div class="flex gap-2">
                <button class="edit-tag-btn text-blue-600 dark:text-blue-400 hover:underline text-sm">Editar</button>
                <button class="delete-tag-btn text-red-600 dark:text-red-400 hover:underline text-sm">Eliminar</button>
            </div>
        `;
        div.querySelector('.edit-tag-btn').onclick = () => openEditTagModal(tag.id, tag.name);
        div.querySelector('.delete-tag-btn').onclick = () => handleDeleteTag(tag.id);
        DOMElements.tagsList.appendChild(div);
    });
}

function handleAddTag(e) {
    e.preventDefault();
    const newTagName = DOMElements.addTagInput.value.trim();
    if (!newTagName || !dbData) return;
    if (dbData.tags.some(t => t.name.toLowerCase() === newTagName.toLowerCase())) {
        return alert('Esa etiqueta ya existe.');
    }
    dbData.tags.push({ id: `tag_${Date.now()}_${Math.random()}`, name: newTagName });
    DOMElements.addTagInput.value = '';
    saveDb();
    renderTagsInModal();
}

function openEditTagModal(tagId, tagName) {
    DOMElements.editTagIdInput.value = tagId;
    DOMElements.editTagNameInput.value = tagName;
    DOMElements.editTagModal.classList.remove('hidden');
}

function handleUpdateTag(e) {
    e.preventDefault();
    const tagId = DOMElements.editTagIdInput.value;
    const newTagName = DOMElements.editTagNameInput.value.trim();
    if (!tagId || !newTagName || !dbData) return;

    if (dbData.tags.some(t => t.name.toLowerCase() === newTagName.toLowerCase() && t.id !== tagId)) {
        return alert('Ya existe otra etiqueta con ese nombre.');
    }
    const tag = dbData.tags.find(t => t.id === tagId);
    if (tag) {
        tag.name = newTagName;
        saveDb();
        renderTagsInModal();
        renderKeys();
        DOMElements.editTagModal.classList.add('hidden');
    }
}

function handleDeleteTag(tagId) {
    if (!dbData || !confirm('¿Seguro que quieres eliminar esta etiqueta? Se quitará de todas las llaves asociadas.')) return;
    dbData.tags = dbData.tags.filter(t => t.id !== tagId);
    dbData.keys.forEach(k => { if (k.tagId === tagId) k.tagId = null; });
    saveDb();
    renderTagsInModal();
    renderKeys();
}

function populateTagSelect() {
    const select = DOMElements.keyTagSelect;
    select.innerHTML = '<option value="">Sin etiqueta</option>';
    if (!dbData) return;
    dbData.tags.sort((a,b) => a.name.localeCompare(b.name)).forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.name;
        select.appendChild(option);
    });
}

// --- AUTH & SESSION ---

function saveSessionState() {
    if (!accessToken || !dbFileId || !masterKey) return;
    const sessionState = {
        accessToken,
        dbFileId,
        masterKey,
        currentDbName,
        dbData,
        expiresAt: Date.now() + SESSION_TIMEOUT,
    };
    sessionStorage.setItem('keychainSession', JSON.stringify(sessionState));
}

function tryRestoreSession() {
    const savedSession = sessionStorage.getItem('keychainSession');
    if (!savedSession) return false;

    try {
        const sessionState = JSON.parse(savedSession);
        if (sessionState.expiresAt < Date.now()) {
            sessionStorage.removeItem('keychainSession');
            return false;
        }

        accessToken = sessionState.accessToken;
        dbFileId = sessionState.dbFileId;
        masterKey = sessionState.masterKey;
        currentDbName = sessionState.currentDbName;
        dbData = sessionState.dbData;

        const timeRemaining = sessionState.expiresAt - Date.now();
        onSignedIn(timeRemaining);
        return true;
    } catch (e) {
        console.error("Fallo al restaurar la sesión:", e);
        sessionStorage.removeItem('keychainSession');
        return false;
    }
}


function resetSessionTimer(timeout = SESSION_TIMEOUT) {
    clearTimeout(sessionTimer);
    const expiresAt = new Date(Date.now() + timeout);
    const timeString = expiresAt.toLocaleTimeString();
    if (DOMElements.sessionTimerTimeMobile) DOMElements.sessionTimerTimeMobile.textContent = timeString;

    const savedSession = sessionStorage.getItem('keychainSession');
    if (savedSession) {
        try {
            const sessionState = JSON.parse(savedSession);
            sessionState.expiresAt = Date.now() + SESSION_TIMEOUT;
            sessionStorage.setItem('keychainSession', JSON.stringify(sessionState));
        } catch(e) { console.error("No se pudo actualizar la expiración de la sesión", e); }
    }

    sessionTimer = setTimeout(() => { alert('La sesión expiró por inactividad.'); handleSignOut(); }, timeout);
}

async function onSignedIn(sessionTimeoutOverride) {
    DOMElements.loginView.classList.add('hidden');
    DOMElements.appView.classList.remove('hidden');
    DOMElements.menuBtn.classList.remove('hidden');

    document.body.addEventListener('click', () => resetSessionTimer(), { passive: true });
    document.body.addEventListener('input', () => resetSessionTimer(), { passive: true });
    
    resetSessionTimer(sessionTimeoutOverride || SESSION_TIMEOUT);
    renderKeys();
    await loadDbListAndRender();
}

function handleSignOut() {
    showToast('Cerrando sesión...', 'info');
    sessionStorage.removeItem('keychainSession');
    setTimeout(() => {
        if (accessToken) {
            google.accounts.oauth2.revoke(accessToken, () => {
                console.log('Token revoked.');
                window.location.reload();
            });
        } else {
            window.location.reload();
        }
    }, 1500);
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    DOMElements = {
        loginView: document.getElementById('login-view'),
        appView: document.getElementById('app-view'),
        statusMessage: document.getElementById('status-message'),
        signInBtn: document.getElementById('signin-btn'),
        mobileSessionControls: document.getElementById('mobile-session-controls'),
        sessionTimerTimeMobile: document.getElementById('session-timer-time-mobile'),
        signOutBtnMobile: document.getElementById('signout-btn-mobile'),
        dbSelect: document.getElementById('db-select'),
        openDbBtn: document.getElementById('open-db-btn'),
        keyList: document.getElementById('key-list'),
        createDbForm: document.getElementById('create-db-form'),
        newDbNameInput: document.getElementById('new-db-name-input'),
        createMasterKeyInput: document.getElementById('create-master-key-input'),
        createDbBtn: document.getElementById('create-db-btn'),
        keyForm: document.getElementById('key-form'),
        keyFormTitle: document.getElementById('key-form-title'),
        keyIdInput: document.getElementById('key-id-input'),
        keyNameInput: document.getElementById('key-name-input'),
        keyUserInput: document.getElementById('key-user-input'),
        keyPassInput: document.getElementById('key-pass-input'),
        keyNoteInput: document.getElementById('key-note-input'),
        keyTagSelect: document.getElementById('key-tag-select'),
        cancelEditBtn: document.getElementById('cancel-edit-btn'),
        searchInput: document.getElementById('search-input'),
        keychainTitleName: document.getElementById('keychain-title-name'),
        keychainTitleCount: document.getElementById('keychain-title-count'),
        noDbOpenMessage: document.getElementById('no-db-open-message'),
        viewsContainer: document.getElementById('views-container'),
        emptyDbMessage: document.getElementById('empty-db-message'),
        noResultsMessage: document.getElementById('no-results-message'),
        openDbModal: document.getElementById('open-db-modal'),
        openDbForm: document.getElementById('open-db-form'),
        modalDbName: document.getElementById('modal-db-name'),
        modalMasterKeyInput: document.getElementById('modal-master-key-input'),
        modalUnlockBtn: document.getElementById('modal-unlock-btn'),
        backToListBtn: document.getElementById('back-to-list-btn'),
        keyListView: document.getElementById('key-list-view'),
        keyFormView: document.getElementById('key-form-view'),
        menuBtn: document.getElementById('menu-btn'),
        sideMenu: document.getElementById('side-menu'),
        menuOverlay: document.getElementById('menu-overlay'),
        closeMenuBtn: document.getElementById('close-menu-btn'),
        addNewKeyHeaderBtn: document.getElementById('add-new-key-header-btn'),
        dbManagementBtn: document.getElementById('db-management-btn'),
        dbManagementDropdown: document.getElementById('db-management-dropdown'),
        renameDbBtn: document.getElementById('rename-db-btn'),
        deleteDbBtn: document.getElementById('delete-db-btn'),
        renameDbModal: document.getElementById('rename-db-modal'),
        renameDbForm: document.getElementById('rename-db-form'),
        renameDbInput: document.getElementById('rename-db-input'),
        renameConfirmBtn: document.getElementById('rename-confirm-btn'),
        deleteDbModal: document.getElementById('delete-db-modal'),
        deleteDbName: document.getElementById('delete-db-name'),
        deleteConfirmBtn: document.getElementById('delete-confirm-btn'),
        manageTagsBtn: document.getElementById('manage-tags-btn'),
        tagsModal: document.getElementById('tags-modal'),
        tagsList: document.getElementById('tags-list'),
        addTagForm: document.getElementById('add-tag-form'),
        addTagInput: document.getElementById('add-tag-input'),
        editTagModal: document.getElementById('edit-tag-modal'),
        editTagForm: document.getElementById('edit-tag-form'),
        editTagIdInput: document.getElementById('edit-tag-id'),
        editTagNameInput: document.getElementById('edit-tag-name-input'),
        toastContainer: document.getElementById('toast-container'),
    };
    
    if (tryRestoreSession()) {
        return; // Session restored, skip login flow
    }
    
    // --- EVENT LISTENERS ---
    DOMElements.signOutBtnMobile.onclick = handleSignOut;
    DOMElements.createDbForm.onsubmit = handleCreateDb;
    DOMElements.keyForm.onsubmit = handleSaveKey;
    DOMElements.cancelEditBtn.onclick = showKeyListView;
    DOMElements.backToListBtn.onclick = showKeyListView;
    DOMElements.searchInput.oninput = () => renderKeys();
    DOMElements.menuBtn.onclick = () => toggleMenu();
    DOMElements.closeMenuBtn.onclick = () => toggleMenu(true);
    DOMElements.menuOverlay.onclick = () => toggleMenu(true);
    DOMElements.addNewKeyHeaderBtn.onclick = () => showKeyFormView();
    DOMElements.dbManagementBtn.onclick = () => DOMElements.dbManagementDropdown.classList.toggle('hidden');
    
    DOMElements.openDbBtn.onclick = () => {
        const selected = DOMElements.dbSelect.options[DOMElements.dbSelect.selectedIndex];
        if (!selected || selected.disabled) return;
        openingFile = { id: selected.value, name: selected.dataset.name };
        DOMElements.modalDbName.textContent = openingFile.name;
        DOMElements.openDbModal.classList.remove('hidden');
        DOMElements.modalMasterKeyInput.focus();
    };
    DOMElements.openDbForm.onsubmit = handleOpenDb;
    
    document.querySelectorAll('.modal-cancel-btn').forEach(btn => {
        btn.onclick = () => btn.closest('.modal-container').classList.add('hidden');
    });

    DOMElements.renameDbBtn.onclick = () => {
        DOMElements.renameDbInput.value = currentDbName.replace('.db', '');
        DOMElements.renameDbModal.classList.remove('hidden');
        DOMElements.dbManagementDropdown.classList.add('hidden');
        DOMElements.renameDbInput.focus();
    };
    DOMElements.renameDbForm.onsubmit = handleRenameDb;

    DOMElements.deleteDbBtn.onclick = () => {
        DOMElements.deleteDbName.textContent = currentDbName;
        DOMElements.deleteDbModal.classList.remove('hidden');
        DOMElements.dbManagementDropdown.classList.add('hidden');
    };
    DOMElements.deleteConfirmBtn.onclick = handleDeleteDb;

    DOMElements.manageTagsBtn.onclick = openTagsModal;
    DOMElements.addTagForm.onsubmit = handleAddTag;
    DOMElements.editTagForm.onsubmit = handleUpdateTag;

    document.querySelectorAll('[data-toggle-password]').forEach(btn => {
        const input = document.getElementById(btn.dataset.togglePassword);
        btn.innerHTML = ICONS.eye;
        btn.onclick = () => { if(input) { const isPwd = input.type === 'password'; input.type = isPwd ? 'text' : 'password'; btn.innerHTML = isPwd ? ICONS.eyeOff : ICONS.eye; }};
    });
    
    // Hide dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!DOMElements.dbManagementBtn.contains(e.target) && !DOMElements.dbManagementDropdown.contains(e.target)) {
            DOMElements.dbManagementDropdown.classList.add('hidden');
        }
    });

    const initializeGoogleSignIn = () => {
        try {
            if (!window.google || !google.accounts || !google.accounts.oauth2) {
                throw new Error("La biblioteca de Google no se cargó correctamente.");
            }
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (resp) => {
                    if (resp.error) return showStatus(`Error de token: ${resp.error}`, 'error');
                    accessToken = resp.access_token;
                    showStatus('Autenticado.', 'ok');
                    onSignedIn();
                }
            });
            DOMElements.signInBtn.disabled = false;
            DOMElements.signInBtn.onclick = () => tokenClient.requestAccessToken();
            showStatus('Listo para iniciar sesión.', 'ok');
        } catch (error) {
            console.error("Error al inicializar GSI:", error);
            showStatus(error.message || 'No se pudo inicializar el inicio de sesión de Google.', 'error');
        }
    };
    
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = initializeGoogleSignIn;
    gsiScript.onerror = () => showStatus('Error al cargar el script de Google.', 'error');
    document.body.appendChild(gsiScript);
});
