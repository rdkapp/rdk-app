import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DbData, DecryptedKey, DriveFile, EncryptedKey, Status, StatusType } from './types';
import { decrypt, encrypt } from './services/crypto';
import * as GDrive from './services/gdrive';
import { GoogleIcon, KeyIcon, LogoutIcon, Spinner } from './components/Icons';

// --- CONSTANTS ---
const CLIENT_ID = '576080826935-2mtnj52ndc8plnsjodjevt3e2gsh4m3a.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// --- HELPER COMPONENTS (defined outside App to prevent re-renders) ---
const Header: React.FC = () => (
    <header className="bg-slate-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <KeyIcon />
            <h1 className="text-xl font-bold tracking-tight">Personal Keychain</h1>
        </div>
    </header>
);

interface StatusMessageProps {
    status: Status;
}
const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
    const colorClasses = {
        info: 'text-slate-500',
        ok: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };
    if (!status.message) return null;
    return (
        <div className={`p-3 rounded-md text-sm my-4 ${colorClasses[status.type]}`}>
            <strong>Status:</strong> {status.message}
        </div>
    );
};

interface KeyItemProps {
    dKey: DecryptedKey;
    onEdit: () => void;
    onDelete: () => void;
}

const KeyItem: React.FC<KeyItemProps> = ({ dKey, onEdit, onDelete }) => {
    const [copied, setCopied] = useState('');

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
    };
    
    const renderField = (label: string, value: string, isSecret = false) => (
        <div className="flex items-center justify-between text-sm py-1">
            <span className="font-semibold text-slate-600 w-20">{label}:</span>
            <span className={`flex-1 break-all ${isSecret ? 'font-mono' : ''}`}>{value}</span>
            <button
                onClick={() => copyToClipboard(value, label)}
                className="ml-2 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded transition-colors"
            >
                {copied === label ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg text-slate-800 mb-2">{dKey.name}</h3>
            {renderField('User', dKey.user)}
            {renderField('Password', dKey.pass, true)}
            {dKey.note && <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded break-words"><strong>Note:</strong> {dKey.note}</p>}
            {dKey.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {dKey.tags.map(tag => (
                        <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            )}
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                <button onClick={onEdit} className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md transition-colors">Edit</button>
                <button onClick={onDelete} className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-md transition-colors">Delete</button>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>({ message: 'Waiting for action...', type: 'info' });
    const [isLoading, setIsLoading] = useState(false);
    const [dbFiles, setDbFiles] = useState<DriveFile[]>([]);
    const [dbData, setDbData] = useState<DbData | null>(null);
    const [dbFileId, setDbFileId] = useState<string | null>(null);
    const [masterKey, setMasterKey] = useState<string>('');
    const [activeDbName, setActiveDbName] = useState<string>('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [editingKey, setEditingKey] = useState<DecryptedKey | null>(null);

    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
    const [sessionTimer, setSessionTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const showStatus = (message: string, type: StatusType = 'info') => {
        setStatus({ message, type });
        console.log(`[STATUS] ${type}: ${message}`);
    };

    const resetSessionTimer = useCallback(() => {
        if (sessionTimer) clearTimeout(sessionTimer);
        const newTimer = setTimeout(() => {
            alert('Session expired due to inactivity.');
            window.location.reload();
        }, SESSION_TIMEOUT);
        setSessionTimer(newTimer);
    }, [sessionTimer]);

    useEffect(() => {
        if (accessToken) {
            const events: (keyof DocumentEventMap)[] = ['click', 'input', 'keydown', 'touchstart'];
            events.forEach(evt => document.addEventListener(evt, resetSessionTimer));
            resetSessionTimer();
            
            return () => {
                if (sessionTimer) clearTimeout(sessionTimer);
                events.forEach(evt => document.removeEventListener(evt, resetSessionTimer));
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);


    const handleGsiResponse = useCallback((resp: any) => {
        if (resp.error) {
            showStatus(`Error getting token: ${resp.error}`, 'error');
            return;
        }
        setAccessToken(resp.access_token);
        showStatus('Authenticated successfully. Fetching database files...', 'ok');
    }, []);

    useEffect(() => {
        const initGsi = () => {
            try {
                const client = (window as any).google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: handleGsiResponse,
                });
                (window as any).tokenClient = client;
            } catch (error) {
                console.error("GSI client init error:", error);
                showStatus('Could not initialize Google Sign-In.', 'error');
            }
        };

        // FIX: Cast the result of querySelector to HTMLScriptElement to access the onload property.
        const script = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
        if (script) {
            script.onload = initGsi;
        } else {
             // Fallback if script is already loaded
            if((window as any).google) {
                initGsi();
            }
        }
    }, [handleGsiResponse]);

    const handleSignIn = () => {
        if ((window as any).tokenClient) {
            showStatus('Requesting permissions from Google...');
            (window as any).tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            showStatus('Google Sign-In is not ready. Please try again in a moment.', 'error');
        }
    };
    
    const handleSignOut = () => {
        if (accessToken) {
            fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
                method: 'POST',
                headers: { 'Content-type': 'application/x-www-form-urlencoded' }
            }).finally(() => window.location.reload());
        } else {
            window.location.reload();
        }
    };

    const loadDbList = useCallback(async () => {
        if (!accessToken) return;
        setIsLoading(true);
        showStatus('Loading database list from Google Drive...');
        try {
            const files = await GDrive.listDbFiles(accessToken);
            setDbFiles(files);
            showStatus(`Found ${files.length} database file(s).`, files.length > 0 ? 'info' : 'ok');
        } catch (e: any) {
            showStatus(`Error listing files: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) {
            loadDbList();
        }
    }, [accessToken, loadDbList]);


    const handleCreateDb = async (name: string, mKey: string) => {
        if (!accessToken || !name || !mKey) {
            alert('New DB name and master key are required.');
            return;
        }
        setIsLoading(true);
        showStatus(`Creating new database '${name}.db'...`);
        try {
            const newDbData: DbData = { keys: [] };
            const encryptedContent = encrypt(JSON.stringify(newDbData), mKey);
            const created = await GDrive.createFile(`${name}.db`, encryptedContent, accessToken);
            
            setDbData(newDbData);
            setMasterKey(mKey);
            setDbFileId(created.id);
            setActiveDbName(`${name}.db`);
            showStatus(`Database '${name}.db' created successfully.`, 'ok');
            loadDbList();
        } catch (e: any) {
            showStatus(`Error creating file: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDb = async (fileId: string, fileName: string, mKey: string) => {
        if (!accessToken || !mKey) {
            alert('Master key is required.');
            return;
        }
        setIsLoading(true);
        showStatus(`Opening '${fileName}'...`);
        try {
            const encryptedContent = await GDrive.getFileContent(fileId, accessToken);
            const decryptedJson = decrypt(encryptedContent, mKey);
            if (!decryptedJson) throw new Error("Decryption failed. Master key may be incorrect.");

            const data: DbData = JSON.parse(decryptedJson);

            setDbData(data);
            setMasterKey(mKey);
            setDbFileId(fileId);
            setActiveDbName(fileName);
            showStatus(`Successfully opened '${fileName}'.`, 'ok');
        } catch (e: any) {
            setDbData(null);
            showStatus(`Failed to open DB. Check master key. Error: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const saveDb = useCallback(async (dataToSave: DbData) => {
        if (!accessToken || !dbFileId || !masterKey) return;
        setIsLoading(true);
        showStatus('Saving to Google Drive...');
        try {
            const updatedContent = encrypt(JSON.stringify(dataToSave), masterKey);
            await GDrive.updateFileContent(dbFileId, updatedContent, accessToken);
            setDbData(dataToSave);
            showStatus('Saved to Drive successfully.', 'ok');
            loadDbList(); // Refresh modified time
        } catch (e: any) {
            showStatus(`Error saving to Drive: ${e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, dbFileId, masterKey, loadDbList]);


    const handleSaveKey = (keyData: Omit<DecryptedKey, 'id'>) => {
        if (!dbData) return;
        const { name, user, pass, note, tags } = keyData;
        if (!name) {
            alert('Key name is required.');
            return;
        }

        const encryptedUser = encrypt(user, masterKey);
        const encryptedPass = encrypt(pass, masterKey);

        const newKeys = [...dbData.keys];
        if (editingKey) {
            const index = newKeys.findIndex(k => k.id === editingKey.id);
            if (index > -1) {
                newKeys[index] = { ...editingKey, name, user: encryptedUser, pass: encryptedPass, note, tags };
            }
        } else {
            newKeys.push({ id: `id_${Date.now()}`, name, user: encryptedUser, pass: encryptedPass, note, tags });
        }
        
        saveDb({ keys: newKeys });
        setEditingKey(null);
    };

    const handleDeleteKey = (keyId: string) => {
        if (!dbData || !window.confirm('Are you sure you want to delete this key?')) return;
        const newKeys = dbData.keys.filter(k => k.id !== keyId);
        saveDb({ keys: newKeys });
    };

    const decryptedKeys = useMemo(() => {
        if (!dbData || !masterKey) return [];
        return dbData.keys
          .map((k): DecryptedKey | null => {
            try {
                return {
                    ...k,
                    user: decrypt(k.user, masterKey),
                    pass: decrypt(k.pass, masterKey),
                };
            } catch (e) {
                console.error(`Failed to decrypt key: ${k.name}`, e);
                return null;
            }
          })
          .filter((k): k is DecryptedKey => k !== null)
          .sort((a, b) => a.name.localeCompare(b.name));
    }, [dbData, masterKey]);

    const filteredKeys = useMemo(() => {
        if (!searchTerm) return decryptedKeys;
        const lowerCaseFilter = searchTerm.toLowerCase();
        return decryptedKeys.filter(k => 
            k.name.toLowerCase().includes(lowerCaseFilter) ||
            k.user.toLowerCase().includes(lowerCaseFilter) ||
            k.note.toLowerCase().includes(lowerCaseFilter) ||
            k.tags.some(t => t.toLowerCase().includes(lowerCaseFilter))
        );
    }, [decryptedKeys, searchTerm]);


    // RENDER LOGIC
    if (!accessToken) {
        return (
            <>
                <Header />
                <div className="container mx-auto p-4 max-w-md text-center mt-10">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-slate-700 mb-2">Welcome</h2>
                        <p className="text-slate-500 mb-6">Sign in with your Google account to access your secure keychain.</p>
                        <button onClick={handleSignIn} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">
                            <GoogleIcon />
                            Sign In with Google
                        </button>
                        <StatusMessage status={status} />
                        <div className="text-xs text-slate-400 mt-6">
                            This app will request permission to access files it creates in your Google Drive.
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto p-4">
                <div className="flex justify-end items-center gap-4 mb-4">
                    <span className="text-sm text-slate-500">Session active</span>
                    <button onClick={handleSignOut} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white text-sm py-2 px-4 rounded-md transition-colors">
                        <LogoutIcon />
                        Sign Out
                    </button>
                </div>
                
                <StatusMessage status={status} />

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: DB Management & Key Form */}
                    <div className="md:col-span-1 space-y-6">
                        <DbManager
                            files={dbFiles}
                            onOpen={handleOpenDb}
                            onCreate={handleCreateDb}
                            activeDbId={dbFileId}
                            isLoading={isLoading}
                        />
                        {dbData && (
                            <KeyForm
                                key={editingKey?.id || 'new'}
                                existingKey={editingKey}
                                onSave={handleSaveKey}
                                onCancel={() => setEditingKey(null)}
                            />
                        )}
                    </div>

                    {/* Right Column: Key List */}
                    <div className="md:col-span-2">
                        {!dbData ? (
                            <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
                                <h3 className="text-lg font-semibold mb-2">No Database Open</h3>
                                <p>Please create a new database or open an existing one from the list.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">
                                        Keys in <span className="text-blue-600">{activeDbName}</span> ({filteredKeys.length})
                                    </h3>
                                    <input
                                        type="search"
                                        placeholder="Search by name, user, note, or tag..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                {filteredKeys.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredKeys.map(dKey => (
                                            <KeyItem
                                                key={dKey.id}
                                                dKey={dKey}
                                                onEdit={() => setEditingKey(dKey)}
                                                onDelete={() => handleDeleteKey(dKey.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
                                        <p>{searchTerm ? 'No keys match your search.' : 'This database is empty. Add a new key to get started.'}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTS for App ---
interface DbManagerProps {
    files: DriveFile[];
    activeDbId: string | null;
    isLoading: boolean;
    onOpen: (fileId: string, fileName: string, mKey: string) => void;
    onCreate: (name: string, mKey: string) => void;
}

const DbManager: React.FC<DbManagerProps> = ({ files, activeDbId, isLoading, onOpen, onCreate }) => {
    const [newDbName, setNewDbName] = useState('');
    const [createMasterKey, setCreateMasterKey] = useState('');
    const [openMasterKey, setOpenMasterKey] = useState('');
    const [openingFile, setOpeningFile] = useState<DriveFile | null>(null);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(newDbName, createMasterKey);
        setNewDbName('');
        setCreateMasterKey('');
    };
    
    const handleOpenSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (openingFile) {
            onOpen(openingFile.id, openingFile.name, openMasterKey);
            setOpeningFile(null);
            setOpenMasterKey('');
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            {/* Create DB Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-3">
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-3">Create New Database</h3>
                <input
                    type="text"
                    placeholder="New DB Name (e.g., 'personal')"
                    value={newDbName}
                    onChange={e => setNewDbName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                />
                <input
                    type="password"
                    placeholder="Master Key for New DB"
                    value={createMasterKey}
                    onChange={e => setCreateMasterKey(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                />
                <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-400">
                     {isLoading ? <Spinner /> : 'Create'}
                </button>
            </form>

            <hr className="my-6" />
            
            {/* Open DB List */}
            <div>
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-3">Open Existing Database</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {files.length === 0 && <p className="text-sm text-slate-500">No .db files found in your Drive.</p>}
                    {files.map(file => (
                        <button
                            key={file.id}
                            onClick={() => setOpeningFile(file)}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${activeDbId === file.id ? 'bg-blue-100 border-blue-400 font-semibold' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                        >
                            <span className="block text-sm font-medium text-slate-700">{file.name}</span>
                            <span className="block text-xs text-slate-500">
                                Modified: {new Date(file.modifiedTime).toLocaleString()}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Open DB Modal */}
            {openingFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-2">Open '{openingFile.name}'</h3>
                        <p className="text-sm text-slate-600 mb-4">Enter the master key to decrypt this database.</p>
                        <form onSubmit={handleOpenSubmit} className="space-y-4">
                             <input
                                type="password"
                                placeholder="Master Key"
                                value={openMasterKey}
                                onChange={e => setOpenMasterKey(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md"
                                autoFocus
                                required
                            />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setOpeningFile(null)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-md">Cancel</button>
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:bg-slate-400">
                                    {isLoading ? <Spinner /> : 'Unlock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

interface KeyFormProps {
    existingKey: DecryptedKey | null;
    onSave: (keyData: Omit<DecryptedKey, 'id'>) => void;
    onCancel: () => void;
}

const KeyForm: React.FC<KeyFormProps> = ({ existingKey, onSave, onCancel }) => {
    const [name, setName] = useState(existingKey?.name || '');
    const [user, setUser] = useState(existingKey?.user || '');
    const [pass, setPass] = useState(existingKey?.pass || '');
    const [note, setNote] = useState(existingKey?.note || '');
    const [tags, setTags] = useState(existingKey?.tags.join(', ') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            user,
            pass,
            note,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        // Clear form if it was for a new key
        if (!existingKey) {
            setName(''); setUser(''); setPass(''); setNote(''); setTags('');
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-3">
                {existingKey ? `Editing '${existingKey.name}'` : 'Add New Key'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (e.g., 'Google Account')" required className="w-full p-2 border border-slate-300 rounded-md" />
                <input value={user} onChange={e => setUser(e.target.value)} placeholder="Username / Email" className="w-full p-2 border border-slate-300 rounded-md" />
                <input type="text" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" className="w-full p-2 border border-slate-300 rounded-md font-mono" />
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note" rows={3} className="w-full p-2 border border-slate-300 rounded-md" />
                <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma-separated)" className="w-full p-2 border border-slate-300 rounded-md" />
                <div className="flex gap-2 pt-2">
                    {existingKey && <button type="button" onClick={onCancel} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-md">Cancel</button>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Save Key</button>
                </div>
            </form>
        </div>
    );
};
