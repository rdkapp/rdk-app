
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
        case 'ok':
            DOMElements.statusMessage.classList.add('bg-green-100', 'text-green-800');
            break;
        case 'error':
            DOMElements.statusMessage.classList.add('bg-red-100', 'text-red-800');
            break;
        default:
            DOMElements.statusMessage.classList.add('text-slate-500');
    }
}

function setLoading(loading, element) {
    isLoading = loading;
    if (element) {
        element.disabled = loading;
        element.innerHTML = loading ? '<div class="spinner mx-auto"></div>' : element.dataset.originalText || '';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}

// --- CRYPTO SERVICE ---
const CryptoService = {
    encrypt: (text, key) => CryptoJS.AES.encrypt(text, key).toString(),
    decrypt: (ciphertext, key) => {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    },
};

// --- GDRIVE SERVICE ---
const GDriveService = {
    BASE_URL: 'https://www.googleapis.com/drive/v3',
    UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3',

    async authorizedFetch(url, options) {
        const headers = new Headers(options.headers || {});
        headers.set('Authorization', `Bearer ${accessToken}`);
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json();
            console.error('Google Drive API Error:', error);
            throw new Error(error.error?.message || 'An unknown Google Drive API error occurred.');
        }
        return response;
    },

    async listDbFiles() {
        const q = "mimeType='application/octet-stream' and trashed=false and name ends with '.db'";
        const url = `${this.BASE_URL}/files?pageSize=100&fields=files(id,name,modifiedTime)&q=${encodeURIComponent(q)}&orderBy=modifiedTime desc`;
        const res = await this.authorizedFetch(url, {});
        const data = await res.json();
        return data.files || [];
    },

    async getFileContent(fileId) {
        const url = `${this.BASE_URL}/files/${fileId}?alt=media`;
        const res = await this.authorizedFetch(url, {});
        return res.text();
    },

    async createFile(name, content) {
        const metadata = { name, mimeType: 'application/octet-stream' };
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);
        const url = `${this.UPLOAD_URL}/files?uploadType=multipart&fields=id`;
        const res = await this.authorizedFetch(url, { method: 'POST', body: form });
        return res.json();
    },

    async updateFileContent(fileId, content) {
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = `${this.UPLOAD_URL}/files/${fileId}?uploadType=media`;
        return this.authorizedFetch(url, { method: 'PATCH', body: blob });
    },
};


// --- RENDER FUNCTIONS ---

function renderDbList(files) {
    DOMElements.dbList.innerHTML = '';
    if (files.length === 0) {
        DOMElements.dbList.innerHTML = '<p class="text-sm text-slate-500">No .db files found in your Drive.</p>';
        return;
    }
    files.forEach(file => {
        const button = document.createElement('button');
        button.className = `w-full text-left p-3 rounded-md border transition-colors ${dbFileId === file.id ? 'bg-blue-100 border-blue-400 font-semibold' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`;
        button.innerHTML = `
            <span class="block text-sm font-medium text-slate-700">${escapeHtml(file.name)}</span>
            <span class="block text-xs text-slate-500">
                Modified: ${new Date(file.modifiedTime).toLocaleString()}
            </span>`;
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
    DOMElements.activeDbName.textContent = document.querySelector(`#db-list button[data-file-id="${dbFileId}"] span.text-slate-700`)?.textContent || '';
    
    const filter = DOMElements.searchInput.value.toLowerCase();
    
    const decryptedKeys = dbData.keys.map(k => {
        try {
            return {
                ...k,
                user: CryptoService.decrypt(k.user, masterKey),
                pass: CryptoService.decrypt(k.pass, masterKey),
            };
        } catch (e) {
            console.error(`Failed to decrypt key: ${k.name}`, e);
            return null; // Skip keys that fail to decrypt
        }
    }).filter(Boolean);

    const filteredKeys = decryptedKeys.filter(k => {
        if (!filter) return true;
        return k.name.toLowerCase().includes(filter) ||
               k.user.toLowerCase().includes(filter) ||
               (k.note && k.note.toLowerCase().includes(filter)) ||
               (k.tags && k.tags.some(t => t.toLowerCase().includes(filter)));
    }).sort((a,b) => a.name.localeCompare(b.name));
    
    DOMElements.keyCount.textContent = filteredKeys.length;
    DOMElements.emptyDbMessage.classList.toggle('hidden', dbData.keys.length > 0);
    DOMElements.noResultsMessage.classList.toggle('hidden', !filter || filteredKeys.length > 0);

    filteredKeys.forEach(dKey => {
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow';
        
        const tagsHtml = (dKey.tags || []).map(tag => `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${escapeHtml(tag)}</span>`).join('');
        
        div.innerHTML = `
            <h3 class="font-bold text-lg text-slate-800 mb-2">${escapeHtml(dKey.name)}</h3>
            <div class="field-row" data-value="${escapeHtml(dKey.user)}"><span>User:</span><span>${escapeHtml(dKey.user)}</span><button class="copy-btn">Copy</button></div>
            <div class="field-row" data-value="${escapeHtml(dKey.pass)}"><span>Password:</span><span class="font-mono">${escapeHtml(dKey.pass)}</span><button class="copy-btn">Copy</button></div>
            ${dKey.note ? `<p class="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded break-words"><strong>Note:</strong> ${escapeHtml(dKey.note)}</p>` : ''}
            ${tagsHtml ? `<div class="mt-3 flex flex-wrap gap-2">${tagsHtml}</div>` : ''}
            <div class="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                <button class="edit-btn w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md transition-colors">Edit</button>
                <button class="delete-btn w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-md transition-colors">Delete</button>
            </div>
        `;
        
        div.querySelector('.edit-btn').onclick = () => populateEditForm(dKey.id);
        div.querySelector('.delete-btn').onclick = () => handleDeleteKey(dKey.id);
        div.querySelectorAll('.copy-btn').forEach(btn => {
            btn.onclick = () => {
                const value = btn.parentElement.dataset.value;
                navigator.clipboard.writeText(value);
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            };
        });
        
        DOMElements.keyList.appendChild(div);
    });
}

// --- CORE LOGIC ---

async function loadDbList() {
    showStatus('Loading database list from Google Drive...');
    try {
        const files = await GDriveService.listDbFiles();
        renderDbList(files);
        showStatus(`Found ${files.length} database file(s).`);
    } catch (e) {
        showStatus(`Error listing files: ${e.message}`, 'error');
    }
}

async function handleCreateDb(event) {
    event.preventDefault();
    const name = DOMElements.newDbNameInput.value.trim();
    const mKey = DOMElements.createMasterKeyInput.value;

    if (!name || !mKey) {
        alert('New DB name and master key are required.');
        return;
    }

    setLoading(true, DOMElements.createDbBtn);
    showStatus(`Creating new database '${name}.db'...`);
    try {
        const newDbData = { keys: [] };
        const encryptedContent = CryptoService.encrypt(JSON.stringify(newDbData), mKey);
        const created = await GDriveService.createFile(`${name}.db`, encryptedContent);
        
        dbData = newDbData;
        masterKey = mKey;
        dbFileId = created.id;
        
        showStatus(`Database '${name}.db' created successfully.`, 'ok');
        DOMElements.newDbNameInput.value = '';
        DOMElements.createMasterKeyInput.value = '';
        await loadDbList();
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

    const fileId = openingFile.id;
    const fileName = openingFile.name;
    const mKey = DOMElements.modalMasterKeyInput.value;

    if (!mKey) {
        alert('Master key is required.');
        return;
    }
    
    setLoading(true, DOMElements.modalUnlockBtn);
    showStatus(`Opening '${fileName}'...`);
    try {
        const encryptedContent = await GDriveService.getFileContent(fileId);
        const decryptedJson = CryptoService.decrypt(encryptedContent, mKey);
        if (!decryptedJson) throw new Error("Decryption failed. Master key may be incorrect.");

        dbData = JSON.parse(decryptedJson);
        if (!dbData.keys) dbData.keys = []; // Ensure keys array exists
        
        masterKey = mKey;
        dbFileId = fileId;
        
        DOMElements.openDbModal.classList.add('hidden');
        DOMElements.modalMasterKeyInput.value = '';
        openingFile = null;
        
        showStatus(`Successfully opened '${fileName}'.`, 'ok');
        await loadDbList();
        renderKeys();
    } catch (e) {
        showStatus(`Failed to open DB. Check master key. Error: ${e.message}`, 'error');
        dbData = null;
        renderKeys();
    } finally {
        setLoading(false, DOMElements.modalUnlockBtn);
    }
}

async function saveDb() {
    if (!dbFileId || !masterKey) return;
    showStatus('Saving to Google Drive...');
    try {
        const dataToSave = { keys: dbData.keys.map(({user, pass, ...rest}) => rest) };
        const encryptedContent = CryptoService.encrypt(JSON.stringify(dbData), masterKey);
        await GDriveService.updateFileContent(dbFileId, encryptedContent);
        showStatus('Saved to Drive successfully.', 'ok');
        await loadDbList();
    } catch (e) {
        showStatus(`Error saving to Drive: ${e.message}`, 'error');
    }
}

function handleSaveKey(event) {
    event.preventDefault();
    if (!dbData) return;

    const id = DOMElements.keyIdInput.value;
    const name = DOMElements.keyNameInput.value.trim();
    if (!name) {
        alert('Key name is required.');
        return;
    }
    
    const keyData = {
        name,
        user: DOMElements.keyUserInput.value,
        pass: DOMElements.keyPassInput.value,
        note: DOMElements.keyNoteInput.value,
        tags: DOMElements.keyTagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    };

    const encryptedUser = CryptoService.encrypt(keyData.user, masterKey);
    const encryptedPass = CryptoService.encrypt(keyData.pass, masterKey);

    if (id) { // Editing existing key
        const index = dbData.keys.findIndex(k => k.id === id);
        if (index > -1) {
            dbData.keys[index] = { ...dbData.keys[index], ...keyData, user: encryptedUser, pass: encryptedPass };
        }
    } else { // Adding new key
        dbData.keys.push({ id: `id_${Date.now()}_${Math.random()}`, ...keyData, user: encryptedUser, pass: encryptedPass });
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
        const dKey = {
            ...key,
            user: CryptoService.decrypt(key.user, masterKey),
            pass: CryptoService.decrypt(key.pass, masterKey),
        };
        
        DOMElements.keyIdInput.value = dKey.id;
        DOMElements.keyNameInput.value = dKey.name;
        DOMElements.keyUserInput.value = dKey.user;
        DOMElements.keyPassInput.value = dKey.pass;
        DOMElements.keyNoteInput.value = dKey.note || '';
        DOMElements.keyTagsInput.value = (dKey.tags || []).join(', ');
        
        DOMElements.keyFormTitle.textContent = `Editing '${dKey.name}'`;
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
    
    const updateTimerDisplay = () => {
        const expiresAt = new Date(Date.now() + SESSION_TIMEOUT);
        DOMElements.sessionTimerInfo.textContent = `Session expires at ${expiresAt.toLocaleTimeString()}`;
    };
    
    sessionTimer = setTimeout(() => {
        alert('Session expired due to inactivity.');
        window.location.reload();
    }, SESSION_TIMEOUT);
    
    updateTimerDisplay();
}

function onUserActivity() {
    resetSessionTimer();
}

function handleGsiResponse(resp) {
    if (resp.error) {
        showStatus(`Error getting token: ${resp.error}`, 'error');
        return;
    }
    accessToken = resp.access_token;
    showStatus('Authenticated successfully. Fetching database files...', 'ok');
    onSignedIn();
}

function onSignedIn() {
    DOMElements.loginView.classList.add('hidden');
    DOMElements.appView.classList.remove('hidden');
    loadDbList();
    
    ['click', 'input', 'keydown', 'touchstart'].forEach(evt => document.addEventListener(evt, onUserActivity, { passive: true }));
    resetSessionTimer();
}

function handleSignIn() {
    if (tokenClient) {
        showStatus('Requesting permissions from Google...');
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        showStatus('Google Sign-In is not ready. Please try again.', 'error');
    }
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
    // Save original button text for loading states
    [DOMElements.createDbBtn, DOMElements.modalUnlockBtn].forEach(btn => {
        if (btn) btn.dataset.originalText = btn.innerHTML;
    });

    // Event Listeners
    DOMElements.signInBtn.onclick = handleSignIn;
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

    // Initialize Google Sign-In Client
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: handleGsiResponse,
        });
    } catch (error) {
        console.error("GSI client init error:", error);
        showStatus('Could not initialize Google Sign-In.', 'error');
    }
};
