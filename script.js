
/* -------- CONFIGURACIÓN -------- */
// REEMPLAZA ESTO con tu Client ID de Google Cloud
const CLIENT_ID = '576080826935-2mtnj52ndc8plnsjodjevt3e2gsh4m3a.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const LAST_DB_KEY = 'llavero_last_db_info'; // Key para localStorage
/* -------------------------------------- */

// Estado global de la aplicación
let accessToken = null;
let tokenClient = null;
let dbData = null; // Objeto con { keys: [...] }
let dbFileId = null;
let dbFileName = '';
let masterKey = '';
let sessionTimer = null;

// Referencias a elementos del DOM
const el = {
    statusMsg: document.getElementById('statusMsg'),
    loginBlock: document.getElementById('loginBlock'),
    mainPanel: document.getElementById('mainPanel'),
    btnSignIn: document.getElementById('btnSignIn'),
    btnSignInText: document.getElementById('btnSignInText'),
    btnSignInSpinner: document.getElementById('btnSignInSpinner'),
    logoutBtn: document.getElementById('logoutBtn'),
    dbList: document.getElementById('dbList'),
    newDbName: document.getElementById('newDbName'),
    createDbBtn: document.getElementById('createDbBtn'),
    searchKey: document.getElementById('searchKey'),
    keyList: document.getElementById('keyList'),
    keyFormContainer: document.getElementById('keyFormContainer'),
    formTitle: document.getElementById('formTitle'),
    keyId: document.getElementById('keyId'),
    keyName: document.getElementById('keyName'),
    keyUser: document.getElementById('keyUser'),
    keyPass: document.getElementById('keyPass'),
    keyNote: document.getElementById('keyNote'),
    keyTags: document.getElementById('keyTags'),
    saveKeyBtn: document.getElementById('saveKeyBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    masterKeyModal: document.getElementById('masterKeyModal'),
    dbNameToUnlock: document.getElementById('dbNameToUnlock'),
    masterKeyInput: document.getElementById('masterKeyInput'),
    unlockDbBtn: document.getElementById('unlockDbBtn'),
    cancelUnlockBtn: document.getElementById('cancelUnlockBtn'),
};

/**
 * Se ejecuta cuando el script de Google GSI ha cargado.
 * Esta es la forma segura de inicializar el cliente.
 */
function onGsiLoaded() {
    if (!CLIENT_ID || CLIENT_ID.includes('YOUR_')) {
        showStatus('Error: Debes configurar tu CLIENT_ID en script.js', 'error');
        return;
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: handleGoogleAuthResponse,
    });

    el.btnSignIn.disabled = false;
    el.btnSignInText.textContent = 'Iniciar Sesión con Google';
}

/**
 * Muestra un mensaje de estado al usuario.
 * @param {string} msg El mensaje a mostrar.
 * @param {'info'|'ok'|'error'} kind El tipo de mensaje.
 */
function showStatus(msg, kind = 'info') {
    console.log(`[STATUS | ${kind}]`, msg);
    const classes = {
        info: 'bg-blue-100 text-blue-800',
        ok: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };
    el.statusMsg.textContent = msg;
    el.statusMsg.className = `p-3 my-4 rounded-lg text-center transition-opacity duration-300 opacity-100 ${classes[kind]}`;
    setTimeout(() => {
        el.statusMsg.classList.remove('opacity-100');
        el.statusMsg.classList.add('opacity-0');
    }, 5000);
}

/**
 * Maneja la respuesta del flujo de autenticación de Google.
 * @param {google.accounts.oauth2.TokenResponse} resp La respuesta del token.
 */
function handleGoogleAuthResponse(resp) {
    el.btnSignInSpinner.classList.add('hidden');
    el.btnSignInText.classList.remove('hidden');

    if (resp.error) {
        showStatus('Error de autenticación: ' + resp.error, 'error');
        return;
    }
    accessToken = resp.access_token;
    showStatus('Autenticado correctamente.', 'ok');
    onSignedIn();
}

/**
 * Se ejecuta después de un inicio de sesión exitoso.
 */
async function onSignedIn() {
    el.loginBlock.classList.add('hidden');
    el.mainPanel.classList.remove('hidden');
    resetSessionTimer();

    await loadDbList();
    
    // Intenta abrir la última base de datos usada
    const lastDbInfo = JSON.parse(localStorage.getItem(LAST_DB_KEY));
    if (lastDbInfo) {
        showStatus(`Intentando reabrir "${lastDbInfo.name}"...`);
        openDbPrompt(lastDbInfo.id, lastDbInfo.name);
    }
}

/**
 * Cierra la sesión del usuario y recarga la página.
 */
function signOut() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken, () => {
            console.log('Token revocado.');
        });
    }
    accessToken = null;
    localStorage.removeItem(LAST_DB_KEY);
    location.reload();
}


// --- API de Google Drive ---

async function apiCall(url, options = {}) {
    const defaultHeaders = {
        Authorization: 'Bearer ' + accessToken
    };
    options.headers = { ...defaultHeaders, ...options.headers };
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error.message || JSON.stringify(error));
    }
    return res.json();
}

async function driveListDbFiles() {
    const q = "mimeType='application/octet-stream' and trashed=false and name ends with '.db'";
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,modifiedTime)&q=${encodeURIComponent(q)}&orderBy=modifiedTime desc`;
    const data = await apiCall(url);
    return data.files || [];
}

async function driveGetFileContent(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(url, { headers: { Authorization: 'Bearer ' + accessToken } });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error.message || JSON.stringify(error));
    }
    return res.text();
}

async function driveCreateFile(name, blob) {
    const metadata = { name, mimeType: 'application/octet-stream' };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name';
    return apiCall(url, { method: 'POST', body: form });
}

async function driveUpdateFileContent(fileId, blob) {
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    return apiCall(url, { method: 'PATCH', headers: { 'Content-Type': 'application/octet-stream' }, body: blob });
}


// --- Lógica de la Base de Datos ---

async function loadDbList() {
    try {
        const files = await driveListDbFiles();
        el.dbList.innerHTML = '';
        if (files.length === 0) {
            el.dbList.innerHTML = '<p class="text-slate-500 text-sm text-center">No hay bases de datos. ¡Crea una!</p>';
        }
        files.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'w-full text-left p-2 rounded-md hover:bg-slate-100 transition truncate';
            btn.textContent = f.name;
            btn.title = `Última modif.: ${new Date(f.modifiedTime).toLocaleString()}`;
            btn.onclick = () => openDbPrompt(f.id, f.name);
            el.dbList.appendChild(btn);
        });
    } catch (e) {
        showStatus('Error listando archivos: ' + e.message, 'error');
    }
}

async function createDb() {
    const nameBase = el.newDbName.value.trim();
    if (!nameBase) {
        return showStatus('El nombre de la base de datos es obligatorio.', 'error');
    }
    const key = prompt(`Crea una clave maestra para "${nameBase}.db".\n¡Guárdala en un lugar seguro!`);
    if (!key) return showStatus('La creación fue cancelada.', 'info');

    masterKey = key;
    dbData = { keys: [] }; // Estructura inicial
    const fileName = nameBase.endsWith('.db') ? nameBase : nameBase + '.db';
    
    try {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(dbData), masterKey).toString();
        const blob = new Blob([encrypted], { type: 'application/octet-stream' });
        const createdFile = await driveCreateFile(fileName, blob);

        dbFileId = createdFile.id;
        dbFileName = createdFile.name;
        localStorage.setItem(LAST_DB_KEY, JSON.stringify({ id: dbFileId, name: dbFileName }));

        showStatus(`Base de datos "${dbFileName}" creada y abierta.`, 'ok');
        el.newDbName.value = '';
        await loadDbList();
        el.searchKey.disabled = false;
        el.keyFormContainer.classList.remove('hidden');
        renderKeys();
    } catch (e) {
        showStatus('Error creando archivo: ' + e.message, 'error');
    }
}

function openDbPrompt(fileId, fileName) {
    el.dbNameToUnlock.textContent = fileName;
    el.masterKeyModal.classList.remove('hidden');
    el.masterKeyInput.focus();

    const unlockHandler = async () => {
        const key = el.masterKeyInput.value;
        if (!key) {
            showStatus('Debes ingresar una clave maestra.', 'error');
            return;
        }
        masterKey = key;
        el.masterKeyInput.value = '';
        el.masterKeyModal.classList.add('hidden');
        
        try {
            const encryptedContent = await driveGetFileContent(fileId);
            const decrypted = CryptoJS.AES.decrypt(encryptedContent, masterKey).toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('Clave incorrecta o datos corruptos.');

            dbData = JSON.parse(decrypted);
            dbFileId = fileId;
            dbFileName = fileName;
            localStorage.setItem(LAST_DB_KEY, JSON.stringify({ id: fileId, name: fileName }));

            showStatus(`Base de datos "${fileName}" desbloqueada.`, 'ok');
            el.searchKey.disabled = false;
            el.keyFormContainer.classList.remove('hidden');
            renderKeys();
            
        } catch (e) {
            showStatus('No se pudo abrir la base de datos. Clave incorrecta o archivo dañado.', 'error');
            dbData = null; // Limpiar estado si falla
        } finally {
            // Limpiar listeners para evitar duplicados
            el.unlockDbBtn.removeEventListener('click', unlockHandler);
            el.masterKeyInput.removeEventListener('keydown', keydownHandler);
        }
    };

    const keydownHandler = (event) => {
        if (event.key === 'Enter') unlockHandler();
    };

    // Agregar listeners, asegurándose de que sean únicos
    el.unlockDbBtn.onclick = unlockHandler;
    el.masterKeyInput.addEventListener('keydown', keydownHandler);
}

// --- Lógica de Llaves (CRUD) ---

function renderKeys(filter = '') {
    if (!dbData) {
        el.keyList.innerHTML = '<p class="text-center text-slate-500 p-4">Abre o crea una base de datos para ver tus llaves.</p>';
        return;
    }

    const lowerFilter = filter.toLowerCase();
    const filteredKeys = dbData.keys.filter(k => {
        if (!filter) return true;
        const tags = (k.tags || []).join(' ').toLowerCase();
        return k.name.toLowerCase().includes(lowerFilter) ||
               (k.note && k.note.toLowerCase().includes(lowerFilter)) ||
               tags.includes(lowerFilter);
    });

    if (filteredKeys.length === 0) {
        el.keyList.innerHTML = filter
            ? '<p class="text-center text-slate-500 p-4">No se encontraron llaves con ese filtro.</p>'
            : '<p class="text-center text-slate-500 p-4">No hay llaves. ¡Agrega una nueva!</p>';
        return;
    }

    el.keyList.innerHTML = '';
    filteredKeys.forEach((key, originalIndex) => {
        let user = '(Error al descifrar)';
        let pass = '(Error al descifrar)';
        try {
            user = CryptoJS.AES.decrypt(key.user, masterKey).toString(CryptoJS.enc.Utf8) || '<i>vacío</i>';
            pass = CryptoJS.AES.decrypt(key.pass, masterKey).toString(CryptoJS.enc.Utf8) || '<i>vacío</i>';
        } catch (e) { /* Mantener el mensaje de error */ }

        const div = document.createElement('div');
        div.className = 'bg-slate-50 p-3 rounded-lg border';
        const tagsHtml = (key.tags || []).map(t => `<span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">${escapeHtml(t)}</span>`).join('');

        div.innerHTML = `
            <div class="flex justify-between items-start">
                <h4 class="font-bold text-lg text-slate-800">${escapeHtml(key.name)}</h4>
                <div class="flex gap-2">
                    <button class="edit-btn" title="Editar">✏️</button>
                    <button class="delete-btn" title="Borrar">🗑️</button>
                </div>
            </div>
            <div class="text-sm text-slate-600 mt-2 space-y-1">
                <p><strong>Usuario:</strong> ${escapeHtml(user)} <button class="copy-btn" data-value="${escapeHtml(user)}" title="Copiar usuario">📋</button></p>
                <p><strong>Clave:</strong> ••••••••• <button class="copy-btn" data-value="${escapeHtml(pass)}" title="Copiar clave">📋</button></p>
                ${key.note ? `<p class="pt-1"><strong>Nota:</strong> ${escapeHtml(key.note)}</p>` : ''}
            </div>
            ${tagsHtml ? `<div class="mt-3">${tagsHtml}</div>` : ''}
        `;

        div.querySelector('.edit-btn').onclick = () => populateEditForm(originalIndex);
        div.querySelector('.delete-btn').onclick = () => deleteKey(originalIndex);
        
        div.querySelectorAll('.copy-btn').forEach(btn => {
            btn.onclick = () => copyToClipboard(btn.dataset.value, btn);
        });
        
        el.keyList.appendChild(div);
    });
}

function clearForm() {
    el.keyForm.reset();
    el.keyId.value = '';
    el.formTitle.textContent = 'Agregar Nueva Llave';
    el.saveKeyBtn.textContent = 'Guardar';
}

function populateEditForm(index) {
    const key = dbData.keys[index];
    try {
        el.keyId.value = index;
        el.keyName.value = key.name;
        el.keyUser.value = CryptoJS.AES.decrypt(key.user, masterKey).toString(CryptoJS.enc.Utf8);
        el.keyPass.value = CryptoJS.AES.decrypt(key.pass, masterKey).toString(CryptoJS.enc.Utf8);
        el.keyNote.value = key.note || '';
        el.keyTags.value = (key.tags || []).join(', ');
        
        el.formTitle.textContent = 'Editando Llave';
        el.saveKeyBtn.textContent = 'Actualizar';
        el.keyFormContainer.scrollIntoView({ behavior: 'smooth' });
        el.keyName.focus();
    } catch(e) {
        showStatus('Error al cargar datos para edición.', 'error');
    }
}

async function saveKey() {
    if (!dbData || !dbFileId) return showStatus('Primero abre o crea una base de datos.', 'error');
    
    const id = el.keyId.value;
    const name = el.keyName.value.trim();
    if (!name) return showStatus('El nombre de la llave es obligatorio.', 'error');

    const keyData = {
        name: name,
        user: CryptoJS.AES.encrypt(el.keyUser.value, masterKey).toString(),
        pass: CryptoJS.AES.encrypt(el.keyPass.value, masterKey).toString(),
        note: el.keyNote.value.trim(),
        tags: el.keyTags.value.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (id !== '') { // Editando
        dbData.keys[parseInt(id, 10)] = keyData;
    } else { // Creando
        dbData.keys.push(keyData);
    }
    
    dbData.keys.sort((a, b) => a.name.localeCompare(b.name));

    await saveDb();
    clearForm();
    renderKeys(el.searchKey.value);
}

function deleteKey(index) {
    const keyName = dbData.keys[index].name;
    if (confirm(`¿Estás seguro de que quieres borrar la llave "${keyName}"?`)) {
        dbData.keys.splice(index, 1);
        saveDb();
        renderKeys(el.searchKey.value);
    }
}

async function saveDb() {
    if (!dbData || !dbFileId) return;
    try {
        // Asegurar que _editing flag no se guarde
        const cleanData = JSON.parse(JSON.stringify(dbData));
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(cleanData), masterKey).toString();
        const blob = new Blob([encrypted], { type: 'application/octet-stream' });
        await driveUpdateFileContent(dbFileId, blob);
        showStatus('Guardado en Drive correctamente.', 'ok');
    } catch (e) {
        showStatus('Error guardando en Drive: ' + e.message, 'error');
    }
}


// --- Utilidades y Sesión ---

function resetSessionTimer() {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        alert('La sesión ha expirado por inactividad.');
        location.reload();
    }, 15 * 60 * 1000); // 15 minutos
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = '✅';
        setTimeout(() => {
            buttonElement.textContent = originalText;
        }, 1500);
    }).catch(err => {
        console.error('Error al copiar:', err);
        showStatus('No se pudo copiar el texto.', 'error');
    });
}

// --- Event Listeners Iniciales ---
window.onload = () => {
    // el.btnSignIn se configura en onGsiLoaded
    el.logoutBtn.onclick = signOut;
    el.createDbBtn.onclick = createDb;
    el.searchKey.addEventListener('input', e => renderKeys(e.target.value));
    el.saveKeyBtn.onclick = saveKey;
    el.cancelEditBtn.onclick = clearForm;
    el.cancelUnlockBtn.onclick = () => {
        el.masterKeyInput.value = '';
        el.masterKeyModal.classList.add('hidden');
    };
    
    el.btnSignIn.onclick = () => {
        el.btnSignInSpinner.classList.remove('hidden');
        el.btnSignInText.classList.add('hidden');
        tokenClient.requestAccessToken({ prompt: '' });
    };

    document.addEventListener('mousemove', resetSessionTimer, { passive: true });
    document.addEventListener('keydown', resetSessionTimer, { passive: true });
};
