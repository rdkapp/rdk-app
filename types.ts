
export interface EncryptedKey {
  id: string;
  name: string;
  user: string; // encrypted
  pass: string; // encrypted
  note: string;
  tags: string[];
  _editing?: boolean; // internal flag
}

export interface DecryptedKey extends Omit<EncryptedKey, 'user' | 'pass'> {
  user: string; // decrypted
  pass: string; // decrypted
}

export interface DbData {
  keys: EncryptedKey[];
}

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export type StatusType = 'info' | 'ok' | 'error';

export interface Status {
  message: string;
  type: StatusType;
}
