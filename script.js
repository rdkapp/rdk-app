// --- CONFIGURATION ---
const CLIENT_ID = '576080826935-2mtnj52ndc8plnsjodjevt3e2gsh4m3a.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const BIO_STORAGE_KEY = 'rdk_biometric_data';
const BIO_ENCRYPTION_KEY = 'a-not-so-secret-key-for-local-encryption'; // Used only to obfuscate master key in localStorage

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
    grid: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`,
    list: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>`,
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
let currentView = 'list';
let isBiometricSupported = false;


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

function showToast(message, type = 'success', duration = 3000, actions = []) {
    const container = DOMElements.toastContainer;
    const toast = document.createElement('div');
    const icon = type === 'success' ? ICONS.toastSuccess : ICONS.toastInfo;
    const typeClass = type === 'success' ? 'toast-success' : 'toast-info';

    toast.className = `toast ${typeClass}`;
    let actionsHTML = '';
    if (actions.length > 0) {
        actionsHTML = '<div class="flex gap-2 mt-2 pt-2 border-t border-black/20">';
        actions.forEach(action => {
            const btnId = `toast-action-${Date.now()}-${Math.random()}`;
            actionsHTML += `<button id="${btnId}" class="text-sm font-bold hover:underline">${escapeHtml(action.label)}</button>`;
            document.addEventListener('click', function handler(e) {
                if (e.target.id === btnId) {
                    action.callback();
                    toast.classList.add('removing');
                    toast.addEventListener('animationend', () => toast.remove());
                    e.stopImmediatePropagation();
                    document.removeEventListener('click', handler);
                }
            }, { once: true });
        });
        actionsHTML += '</div>';
    }

    toast.innerHTML = `<div class="flex items-start">${icon}<div class="flex-grow"><span>${escapeHtml(message)}</span>${actionsHTML}</div></div>`;
    
    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
          toast.classList.add('removing');
          toast.addEventListener('animationend', () => toast.remove());
      }, duration);
    }
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
            const bytes = CryptoJS.AES.decrypt(ciphertext, key);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedText) { // This can happen if the key is wrong
                throw new Error("Decrypted to empty string. Likely wrong key.");
            }
            return decryptedText;
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
    
    const searchFilter = DOMElements.searchInput.value.toLowerCase();
    const tagFilter = DOMElements.tagFilterSelect.value;
    const tagMap = new Map(dbData.tags.map(t => [t.id, t.name.toLowerCase()]));

    let filtered = dbData.keys;

    // 1. Filter by tag
    if (tagFilter !== 'all') {
        filtered = filtered.filter(k => k.tagId === tagFilter);
    }

    // 2. Filter by search term
    if (searchFilter) {
        filtered = filtered.filter(k => {
            const tagName = k.tagId ? tagMap.get(k.tagId) || '' : '';
            // Search is now limited to non-encrypted fields for security
            return [k.name.toLowerCase(), k.note?.toLowerCase(), tagName].join(' ').includes(searchFilter);
        });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
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

    // Update view classes (list vs card)
    if (currentView === 'list') {
        DOMElements.keyList.className = 'space-y-3';
    } else {
        DOMElements.keyList.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    }
    
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
    item.className = 'key-item bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col';
    
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
            ${createUrlLinkHTML('URL', key.url)}
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

function createUrlLinkHTML(label, encryptedUrl) {
    if (!encryptedUrl) return '';
    
    const decryptedUrl = CryptoService.decrypt(encryptedUrl, masterKey);
    if (!decryptedUrl) return '';
    
    const urlContainer = document.createElement('div');
    urlContainer.className = 'flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded';
    urlContainer.innerHTML = `
        <div class="flex-grow min-w-0">
            <span class="font-medium text-slate-800 dark:text-slate-200">${label}:</span>
            <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline break-all ml-1">${escapeHtml(decryptedUrl)}</a>
        </div>`;
    
    const link = urlContainer.querySelector('a');
    link.onclick = (e) => {
        e.preventDefault();
        if (confirm(`¿Quieres abrir esta URL en una nueva pestaña?\n\n${decryptedUrl}`)) {
            window.open(decryptedUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return urlContainer.outerHTML;
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
        populateTagFilterSelect();
        showKeyListView();
        toggleMenu(true);
        promptToSetupBiometrics();
    } catch (e) { showStatus(`Error al crear archivo: ${e.message}`, 'error'); } finally { setLoading(false, DOMElements.createDbBtn); }
}

async function handleOpenDb(event) {
    if (event) event.preventDefault();
    if (!openingFile) return;
    
    const mKey = DOMElements.modalMasterKeyInput.value;
    if (!mKey) return alert('La clave maestra es requerida.');
    
    await unlockDbWithMasterKey(openingFile.id, openingFile.name, mKey);
}

async function unlockDbWithMasterKey(fileId, fileName, mKey) {
    setLoading(true, DOMElements.modalUnlockBtn);
    showStatus(`Abriendo '${fileName}'...`);
    try {
        const encryptedContent = await GDriveService.getFileContent(fileId);
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

        masterKey = mKey; dbFileId = fileId; currentDbName = fileName;
        saveSessionState();
        DOMElements.openDbModal.classList.add('hidden');
        DOMElements.modalMasterKeyInput.value = '';
        openingFile = null;
        showStatus(`'${fileName}' abierto correctamente.`, 'ok');
        renderKeys();
        populateTagFilterSelect();
        showKeyListView();
        toggleMenu(true);
        
        promptToSetupBiometrics();

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
        url: CryptoService.encrypt(DOMElements.keyUrlInput.value, masterKey),
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
        
        // Update biometric data if it exists
        const bioData = getBiometricData();
        if (bioData[dbFileId]) {
            bioData[dbFileId].name = newName;
            saveBiometricData(bioData);
        }

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
        
        // Remove biometric data
        const bioData = getBiometricData();
        if (bioData[dbFileId]) {
            delete bioData[dbFileId];
            saveBiometricData(bioData);
        }

        DOMElements.deleteDbModal.classList.add('hidden');
        showStatus(`Llavero '${currentDbName}' eliminado.`, 'ok');
        dbData = null; dbFileId = null; masterKey = ''; currentDbName = '';
        sessionStorage.removeItem('keychainSession');
        renderKeys();
        populateTagFilterSelect();
        await loadDbListAndRender();
    } catch(e) { showStatus(`Error al eliminar: ${e.message}`, 'error'); }
    finally { setLoading(false, DOMElements.deleteConfirmBtn); }
}

function resetKeyForm() {
    DOMElements.keyForm.reset();
    DOMElements.keyIdInput.value = '';
    DOMElements.keyFormTitle.textContent = 'Añadir llave nueva';
    DOMElements.cancelEditBtn.classList.add('hidden');
    updatePasswordStrengthUI('');
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
        DOMElements.keyUrlInput.value = CryptoService.decrypt(key.url, masterKey);
        DOMElements.keyNoteInput.value = key.note || '';
        DOMElements.keyFormTitle.textContent = `Editando '${key.name}'`;
        DOMElements.cancelEditBtn.classList.remove('hidden');
        showKeyFormView(true);
        DOMElements.keyTagSelect.value = key.tagId || '';
        updatePasswordStrengthUI(DOMElements.keyPassInput.value);
    } catch (e) { showStatus('Error al preparar la llave para edición.', 'error'); }
}

// --- PASSWORD STRENGTH ---
function checkPasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, strength: 'weak', emoji: '', className: '' };

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score < 3) return { score, strength: 'weak', emoji: '🔴', className: 'strength-weak' };
    if (score < 5) return { score, strength: 'medium', emoji: '🟠', className: 'strength-medium' };
    return { score, strength: 'strong', emoji: '🟢', className: 'strength-strong' };
}

function updatePasswordStrengthUI(password) {
    const { emoji, className } = checkPasswordStrength(password);
    DOMElements.passwordStrengthIndicator.textContent = emoji;
    DOMElements.keyPassInput.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
    if (className) {
        DOMElements.keyPassInput.classList.add(className);
    }
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
    populateTagFilterSelect();
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
        populateTagFilterSelect();
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
    populateTagFilterSelect();
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

function populateTagFilterSelect() {
    const select = DOMElements.tagFilterSelect;
    select.innerHTML = '<option value="all">Todas las etiquetas</option>';
    if (!dbData) return;
    dbData.tags.sort((a, b) => a.name.localeCompare(b.name)).forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.name;
        select.appendChild(option);
    });
}

// --- BIOMETRIC AUTHENTICATION (WEBAUTHN) ---

function checkBiometricSupport() {
    isBiometricSupported = (navigator.credentials && window.PublicKeyCredential && /Mobi/i.test(navigator.userAgent));
    DOMElements.manageBiometricsBtn.disabled = !isBiometricSupported;
    console.log(`Biometric support: ${isBiometricSupported}`);
}

function getBiometricData() {
    try {
        const data = localStorage.getItem(BIO_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveBiometricData(data) {
    localStorage.setItem(BIO_STORAGE_KEY, JSON.stringify(data));
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function setupBiometrics() {
    if (!isBiometricSupported || !dbFileId || !masterKey) return;
    
    try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: { name: "Llavero RDK" },
                user: {
                    id: new TextEncoder().encode(dbFileId),
                    name: currentDbName,
                    displayName: currentDbName,
                },
                pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                },
                timeout: 60000,
            }
        });

        if (credential) {
            const data = getBiometricData();
            data[dbFileId] = {
                credentialId: arrayBufferToBase64(credential.rawId),
                name: currentDbName,
                encryptedMasterKey: CryptoService.encrypt(masterKey, BIO_ENCRYPTION_KEY),
            };
            saveBiometricData(data);
            showToast('¡Desbloqueo biométrico activado para este llavero!', 'success');
        }
    } catch (err) {
        console.error("Error al configurar biometría:", err);
        showStatus(`Error al configurar biometría: ${err.message}`, 'error');
    }
}

function promptToSetupBiometrics() {
    const bioData = getBiometricData();
    if (isBiometricSupported && !bioData[dbFileId]) {
        showToast('¿Quieres desbloquear este llavero con tu huella la próxima vez?', 'info', 10000, [
            { label: 'Sí, configurar', callback: setupBiometrics },
        ]);
    }
}

async function handleBiometricUnlock() {
    if (!openingFile || !isBiometricSupported) return;

    const bioData = getBiometricData();
    const fileBioInfo = bioData[openingFile.id];
    if (!fileBioInfo) return;
    
    setLoading(true, DOMElements.modalBiometricBtn);

    try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge,
                allowCredentials: [{
                    type: 'public-key',
                    id: base64ToArrayBuffer(fileBioInfo.credentialId),
                }],
                userVerification: 'required',
                timeout: 60000,
            }
        });

        if (assertion) {
            const decryptedMasterKey = CryptoService.decrypt(fileBioInfo.encryptedMasterKey, BIO_ENCRYPTION_KEY);
            if (decryptedMasterKey) {
                await unlockDbWithMasterKey(openingFile.id, openingFile.name, decryptedMasterKey);
            } else {
                throw new Error("No se pudo descifrar la clave maestra guardada.");
            }
        }
    } catch (err) {
        console.error("Error de desbloqueo biométrico:", err);
        showStatus(`Fallo biométrico: ${err.message}`, 'error');
    } finally {
        setLoading(false, DOMElements.modalBiometricBtn);
    }
}


function openBiometricsManager() {
    DOMElements.biometricsModal.classList.remove('hidden');
    renderBiometricsInModal();
    toggleMenu(true);
}

function renderBiometricsInModal() {
    const list = DOMElements.biometricsList;
    list.innerHTML = '';
    const bioData = getBiometricData();
    const fileIds = Object.keys(bioData);

    if (fileIds.length === 0) {
        list.innerHTML = '<p class="text-slate-500 text-sm">No hay llaveros con desbloqueo biométrico activado.</p>';
        return;
    }

    fileIds.forEach(fileId => {
        const fileInfo = bioData[fileId];
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded';
        div.innerHTML = `
            <span class="text-slate-800 dark:text-slate-200 truncate pr-4">${escapeHtml(fileInfo.name)}</span>
            <button class="remove-bio-btn text-red-600 dark:text-red-400 hover:underline text-sm" data-file-id="${escapeHtml(fileId)}">Eliminar</button>
        `;
        list.appendChild(div);
    });

    list.querySelectorAll('.remove-bio-btn').forEach(btn => {
        btn.onclick = (e) => {
            const idToRemove = e.target.dataset.fileId;
            if (confirm('¿Seguro que quieres quitar el desbloqueo biométrico para este llavero?')) {
                const currentData = getBiometricData();
                delete currentData[idToRemove];
                saveBiometricData(currentData);
                renderBiometricsInModal();
                showToast('Desbloqueo biométrico eliminado.', 'info');
            }
        };
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
        populateTagFilterSelect();
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
    // We don't clear localStorage (biometric data) on sign out
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
        keyUrlInput: document.getElementById('key-url-input'),
        keyNoteInput: document.getElementById('key-note-input'),
        keyTagSelect: document.getElementById('key-tag-select'),
        passwordStrengthIndicator: document.getElementById('password-strength-indicator'),
        cancelEditBtn: document.getElementById('cancel-edit-btn'),
        searchInput: document.getElementById('search-input'),
        tagFilterSelect: document.getElementById('tag-filter-select'),
        viewToggleBtn: document.getElementById('view-toggle-btn'),
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
        modalBiometricBtn: document.getElementById('modal-biometric-btn'),
        biometricDivider: document.getElementById('biometric-divider'),
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
        manageBiometricsBtn: document.getElementById('manage-biometrics-btn'),
        biometricsModal: document.getElementById('biometrics-modal'),
        biometricsList: document.getElementById('biometrics-list'),
        toastContainer: document.getElementById('toast-container'),
    };
    
    // --- EVENT LISTENERS (ATTACHED UNCONDITIONALLY) ---
    DOMElements.signOutBtnMobile.onclick = handleSignOut;
    DOMElements.createDbForm.onsubmit = handleCreateDb;
    DOMElements.keyForm.onsubmit = handleSaveKey;
    DOMElements.cancelEditBtn.onclick = showKeyListView;
    DOMElements.backToListBtn.onclick = showKeyListView;
    DOMElements.searchInput.oninput = () => renderKeys();
    DOMElements.tagFilterSelect.onchange = () => renderKeys();
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
        
        // Check for biometric data
        const bioData = getBiometricData();
        const hasBio = isBiometricSupported && bioData[openingFile.id];
        DOMElements.modalBiometricBtn.classList.toggle('hidden', !hasBio);
        DOMElements.biometricDivider.classList.toggle('hidden', !hasBio);
        
        DOMElements.openDbModal.classList.remove('hidden');
        DOMElements.modalMasterKeyInput.focus();
    };
    DOMElements.openDbForm.onsubmit = handleOpenDb;
    DOMElements.modalBiometricBtn.onclick = handleBiometricUnlock;

    
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

    DOMElements.manageBiometricsBtn.onclick = openBiometricsManager;

    // View toggle logic
    const toggleView = () => {
        currentView = currentView === 'list' ? 'card' : 'list';
        DOMElements.viewToggleBtn.innerHTML = currentView === 'list' ? ICONS.grid : ICONS.list;
        renderKeys();
    };
    DOMElements.viewToggleBtn.innerHTML = ICONS.grid;
    DOMElements.viewToggleBtn.onclick = toggleView;

    // Show/hide view toggle button based on screen
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleViewToggleVisibility = () => {
        DOMElements.viewToggleBtn.style.display = mediaQuery.matches ? 'flex' : 'none';
    };
    mediaQuery.addEventListener('change', handleViewToggleVisibility);
    handleViewToggleVisibility();
    
    // User/Pass field visibility on focus/blur
    [DOMElements.keyUserInput, DOMElements.keyPassInput].forEach(input => {
        input.addEventListener('focus', () => { input.type = 'text'; });
        input.addEventListener('blur', () => { input.type = 'password'; });
    });

    // Password strength indicator
    DOMElements.keyPassInput.addEventListener('input', (e) => updatePasswordStrengthUI(e.target.value));

    // Password show/hide button
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

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('#menu-accordion .accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const isExpanded = accordionItem.classList.contains('expanded');
            
            document.querySelectorAll('#menu-accordion .accordion-item').forEach(item => {
                item.classList.remove('expanded');
            });
            
            if (!isExpanded) {
                accordionItem.classList.add('expanded');
            }
        });
    });

    // --- CHECK BIOMETRIC SUPPORT ---
    checkBiometricSupport();

    // --- SESSION & LOGIN FLOW ---
    if (tryRestoreSession()) {
        // Session restored, UI is active, and listeners are attached. Nothing more to do.
    } else {
        // No session found, proceed with Google Sign-In initialization.
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
    }
});
