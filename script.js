
// --- CONFIGURATION ---
const CLIENT_ID = '576080826935-2mtnj52ndc8plnsjodjevt3e2gsh4m3a.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

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

// --- DOM ELEMENTS ---
const DOMElements = {
    loginView: document.getElementById('login-view'),
    appView: document.getElementById('app-view'),
    statusMessage: document.getElementById('status-message'),
    signInBtn: document.getElementById('signin-btn'),
    signOutBtn: document.getElementById('signout-btn'),
    sessionTimerInfo: document.getElementById('session-timer-info'),
    dbList: document.getElementById('db-list'),
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
};

let openingFile = null;

// --- UTILITY & HELPER FUNCTIONS ---

function showStatus(message, type = 'info') {
    console.log(`[STATUS] ${type}: ${message}`);
    DOMElements.statusMessage.innerHTML = `<strong>Status:</strong> ${message}`;
    DOMElements.statusMessage.className = 'p-3 rounded-md text-sm my-4 ';
    switch (type) {
        case 'ok': DOMElements.statusMessage.classList.add('bg-green-100', 'text-green-800'); break;
        case 'error': DOMElements.statusMessage.classList.add('bg-red-100', 'text-red-800'); break;
        default: DOMElements.statusMessage.classList.add('text-slate-500');
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
            throw new Error(error.error?.message || 'A Google Drive API error occurred.');
        }
        return response;
    },
    async listDbFiles() {
        const q = "mimeType='application/octet-stream' and trashed=false and name ends with '.db'";
        const url = `https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,modifiedTime)&q=${encodeURIComponent(q)}&orderBy=modifiedTime desc`;
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

// --- RENDER FUNCTIONS ---

function renderDbList() {
    DOMElements.dbList.innerHTML = '';
    if (activeDbFiles.length === 0) {
        DOMElements.dbList.innerHTML = '<p class="text-sm text-slate-500 text-center">No .db files found.</p>';
        return;
    }
    activeDbFiles.forEach(file => {
        const button = document.createElement('button');
        button.className = `w-full text-left p-3 rounded-md border transition-colors text-sm ${dbFileId === file.id ? 'bg-blue-100 border-blue-400 font-semibold' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`;
        button.innerHTML = `<span class="block font-medium text-slate-700">${escapeHtml(file.name)}</span><span class="block text-xs text-slate-500">Modified: ${new Date(file.modifiedTime).toLocaleString()}</span>`;
        button.onclick = () => {
            openingFile = file;
            DOMElements.modalDbName.textContent = file.name;
            DOMElements.openDbModal.classList.remove('hidden');
            DOMElements.modalMasterKeyInput.focus();
        };
        DOMElements.dbList.appendChild(button);
    });
}

function renderKeys() {
    DOMElements.keyList.innerHTML = '';
    if (!dbData) {
        DOMElements.keysPanel.classList.add('hidden');
        DOMElements.noDbOpenMessage.classList.remove('hidden');
        DOMElements.keyFormContainer.classList.add('hidden');
        return;
    }

    DOMElements.keysPanel.classList.remove('hidden');
    DOMElements.noDbOpenMessage.classList.add('hidden');
    DOMElements.keyFormContainer.classList.remove('hidden');
    DOMElements.activeDbName.textContent = currentDbName;

    const filter = DOMElements.searchInput.value.toLowerCase();
    const decryptedAndFilteredKeys = dbData.keys.map(k => {
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

    DOMElements.keyCount.textContent = decryptedAndFilteredKeys.length;
    DOMElements.emptyDbMessage.classList.toggle('hidden', dbData.keys.length > 0);
    DOMElements.noResultsMessage.classList.toggle('hidden', !filter || decryptedAndFilteredKeys.length > 0);

    decryptedAndFilteredKeys.forEach(dKey => {
        const item = document.createElement('div');
        item.className = 'bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3';
        const tagsHtml = (dKey.tags || []).map(tag => `<span class="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full">${escapeHtml(tag)}</span>`).join('');

        item.innerHTML = `
            <div class="flex justify-between items-start">
                <h3 class="font-bold text-lg text-slate-800 break-all">${escapeHtml(dKey.name)}</h3>
                <div class="flex gap-2 flex-shrink-0 ml-2">
                    <button class="edit-btn p-1 text-slate-500 hover:text-blue-600" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button class="delete-btn p-1 text-slate-500 hover:text-red-600" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            </div>
            <div class="space-y-2 text-sm">
                ${createFieldHTML('User', dKey.d_user)}
                ${createFieldHTML('Password', dKey.d_pass, true)}
                ${dKey.note ? `<div class="pt-2 text-slate-600"><strong class="font-medium text-slate-800">Note:</strong><p class="whitespace-pre-wrap break-words p-2 bg-slate-50 rounded mt-1">${escapeHtml(dKey.note)}</p></div>` : ''}
            </div>
            ${tagsHtml ? `<div class="pt-2 border-t border-slate-100 flex flex-wrap gap-2">${tagsHtml}</div>` : ''}
        `;

        item.querySelector('.edit-btn').onclick = () => populateEditForm(dKey.id);
        item.querySelector('.delete-btn').onclick = () => handleDeleteKey(dKey.id);
        item.querySelectorAll('.copy-btn').forEach(btn => {
            btn.onclick = () => {
                navigator.clipboard.writeText(btn.dataset.value);
                const originalText = btn.innerHTML;
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
                setTimeout(() => btn.innerHTML = originalText, 1500);
            };
        });
        DOMElements.keyList.appendChild(item);
    });
}

function createFieldHTML(label, value, isMono = false) {
    if (!value) return '';
    return `
        <div class="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded">
            <div class="flex-grow">
                <span class="font-medium text-slate-800">${label}:</span>
                <span class="${isMono ? 'font-mono' : ''} text-slate-700 break-all ml-1">${escapeHtml(value)}</span>
            </div>
            <button class="copy-btn p-1 text-slate-500 hover:text-blue-600 flex-shrink-0" title="Copy ${label}" data-value="${escapeHtml(value)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
        </div>`;
}

// --- CORE LOGIC ---

async function loadDbListAndRender() {
    showStatus('Loading database list...');
    try {
        const { files } = await GDriveService.listDbFiles();
        activeDbFiles = files || [];
        renderDbList();
        showStatus(`Found ${activeDbFiles.length} database(s).`);
        return activeDbFiles;
    } catch (e) {
        showStatus(`Error listing files: ${e.message}`, 'error');
        return [];
    }
}

async function handleCreateDb(event) {
    event.preventDefault();
    const name = DOMElements.newDbNameInput.value.trim();
    const mKey = DOMElements.createMasterKeyInput.value;
    if (!name || !mKey) return alert('New DB name and master key are required.');

    setLoading(true, DOMElements.createDbBtn);
    showStatus(`Creating '${name}.db'...`);
    try {
        const newDbData = { keys: [] };
        const encryptedContent = CryptoService.encrypt(JSON.stringify(newDbData), mKey);
        const created = await GDriveService.createFile(`${name}.db`, encryptedContent);
        
        dbData = newDbData;
        masterKey = mKey;
        dbFileId = created.id;
        currentDbName = `${name}.db`;
        localStorage.setItem('lastOpenedDbId', dbFileId);
        
        showStatus(`Database '${currentDbName}' created and opened.`, 'ok');
        DOMElements.createDbForm.reset();
        await loadDbListAndRender();
        renderKeys();
    } catch (e) {
        showStatus(`Error creating file: ${e.message}`, 'error');
    } finally {
        setLoading(false, DOMElements.createDbBtn);
    }
}

async function handleOpenDb(event) {
    event.preventDefault();
    if (!openingFile) return;
    const { id, name } = openingFile;
    const mKey = DOMElements.modalMasterKeyInput.value;
    if (!mKey) return alert('Master key is required.');
    
    setLoading(true, DOMElements.modalUnlockBtn);
    showStatus(`Opening '${name}'...`);
    try {
        const encryptedContent = await GDriveService.getFileContent(id);
        const decryptedJson = CryptoService.decrypt(encryptedContent, mKey);
        if (!decryptedJson) throw new Error("Decryption failed. Master key may be incorrect.");

        dbData = JSON.parse(decryptedJson);
        if (!Array.isArray(dbData.keys)) dbData.keys = [];
        
        masterKey = mKey;
        dbFileId = id;
        currentDbName = name;
        localStorage.setItem('lastOpenedDbId', dbFileId);
        
        DOMElements.openDbModal.classList.add('hidden');
        DOMElements.modalMasterKeyInput.value = '';
        openingFile = null;
        showStatus(`Successfully opened '${name}'.`, 'ok');
        renderDbList();
        renderKeys();
    } catch (e) {
        showStatus(`Failed to open DB. Check master key.`, 'error');
    } finally {
        setLoading(false, DOMElements.modalUnlockBtn);
    }
}

async function saveDb() {
    if (!dbFileId || !masterKey) return;
    showStatus('Saving to Google Drive...');
    try {
        const encryptedContent = CryptoService.encrypt(JSON.stringify(dbData), masterKey);
        await GDriveService.updateFileContent(dbFileId, encryptedContent);
        showStatus('Saved to Drive successfully.', 'ok');
        await loadDbListAndRender();
    } catch (e) {
        showStatus(`Error saving to Drive: ${e.message}`, 'error');
    }
}

function handleSaveKey(event) {
    event.preventDefault();
    if (!dbData) return;
    const name = DOMElements.keyNameInput.value.trim();
    if (!name) return alert('Key name is required.');
    
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
    resetKeyForm();
    renderKeys();
}

function handleDeleteKey(keyId) {
    if (!dbData || !confirm('Are you sure you want to delete this key?')) return;
    dbData.keys = dbData.keys.filter(k => k.id !== keyId);
    saveDb();
    renderKeys();
}

function resetKeyForm() {
    DOMElements.keyForm.reset();
    DOMElements.keyIdInput.value = '';
    DOMElements.keyFormTitle.textContent = 'Add New Key';
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
        
        DOMElements.keyFormTitle.textContent = `Editing '${key.name}'`;
        DOMElements.cancelEditBtn.classList.remove('hidden');
        DOMElements.keyFormContainer.scrollIntoView({ behavior: 'smooth' });
        DOMElements.keyNameInput.focus();
    } catch (e) {
        showStatus('Error preparing key for editing.', 'error');
    }
}

// --- AUTH & SESSION ---

function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    const expiresAt = new Date(Date.now() + SESSION_TIMEOUT);
    DOMElements.sessionTimerInfo.textContent = `Session expires at ${expiresAt.toLocaleTimeString()}`;
    sessionTimer = setTimeout(() => {
        alert('Session expired due to inactivity.');
        window.location.reload();
    }, SESSION_TIMEOUT);
}

async function onSignedIn() {
    DOMElements.loginView.classList.add('hidden');
    DOMElements.appView.classList.remove('hidden');
    document.body.addEventListener('click', resetSessionTimer, { passive: true });
    document.body.addEventListener('input', resetSessionTimer, { passive: true });
    resetSessionTimer();

    const files = await loadDbListAndRender();
    const lastDbId = localStorage.getItem('lastOpenedDbId');
    if (lastDbId) {
        const lastFile = files.find(f => f.id === lastDbId);
        if (lastFile) {
            openingFile = lastFile;
            DOMElements.modalDbName.textContent = lastFile.name;
            DOMElements.openDbModal.classList.remove('hidden');
            DOMElements.modalMasterKeyInput.focus();
        }
    }
}

function handleGsiResponse(resp) {
    if (resp.error) return showStatus(`Token error: ${resp.error}`, 'error');
    accessToken = resp.access_token;
    showStatus('Authenticated successfully. Fetching data...', 'ok');
    onSignedIn();
}

function handleSignOut() {
    if (accessToken) {
        fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-type': 'application/x-www-form-urlencoded' }
        }).finally(() => window.location.reload());
    } else {
        window.location.reload();
    }
}

// --- INITIALIZATION ---
window.onload = () => {
    DOMElements.signInBtn.onclick = () => tokenClient.requestAccessToken({ prompt: 'consent' });
    DOMElements.signOutBtn.onclick = handleSignOut;
    DOMElements.createDbForm.onsubmit = handleCreateDb;
    DOMElements.keyForm.onsubmit = handleSaveKey;
    DOMElements.cancelEditBtn.onclick = resetKeyForm;
    DOMElements.searchInput.oninput = () => renderKeys();
    DOMElements.openDbForm.onsubmit = handleOpenDb;
    DOMElements.modalCancelBtn.onclick = () => {
        DOMElements.openDbModal.classList.add('hidden');
        DOMElements.modalMasterKeyInput.value = '';
        openingFile = null;
    };

    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: handleGsiResponse,
        });
    } catch (error) {
        showStatus('Could not initialize Google Sign-In.', 'error');
    }
};
