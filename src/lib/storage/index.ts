import type { DocumentStorage } from './types';
import { IndexedDbDocumentStorage } from './indexeddb-storage';
export type * from './types';

const mode = import.meta.env.VITE_STORAGE_MODE || 'local';
if (mode !== 'local') console.warn(`Storage mode "${mode}" is unavailable; using browser-local IndexedDB.`);
export const documentStorage: DocumentStorage = new IndexedDbDocumentStorage();
