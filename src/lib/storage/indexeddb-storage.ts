import type { AuditAction, DocumentStorage, LocalAuditRecord, LocalBackup, LocalDocument, LocalDocumentStatus, LocalFolder } from './types';
import type { BuilderId } from '../builder-framework';

const DB_NAME = 'ja-staff-document-builder';
const DB_VERSION = 1;
type StoreName = 'documents'|'folders'|'audit'|'templateOverrides';
const request = <T>(value: IDBRequest<T>) => new Promise<T>((resolve,reject) => { value.onsuccess=()=>resolve(value.result); value.onerror=()=>reject(value.error); });
async function db(): Promise<IDBDatabase> { return new Promise((resolve,reject) => { const open=indexedDB.open(DB_NAME,DB_VERSION); open.onupgradeneeded=()=>{ for(const name of ['documents','folders','audit','templateOverrides']) if(!open.result.objectStoreNames.contains(name)) open.result.createObjectStore(name,{keyPath:'id'}); }; open.onsuccess=()=>resolve(open.result); open.onerror=()=>reject(open.error); }); }
async function all<T>(store: StoreName): Promise<T[]> { const database=await db(); return request(database.transaction(store).objectStore(store).getAll()) as Promise<T[]>; }
async function put<T>(store: StoreName, value: T): Promise<void> { const database=await db(); await request(database.transaction(store,'readwrite').objectStore(store).put(value)); }
async function remove(store: StoreName,id:string): Promise<void>{ const database=await db(); await request(database.transaction(store,'readwrite').objectStore(store).delete(id)); }

export class IndexedDbDocumentStorage implements DocumentStorage {
  async listDocuments(builderId?: BuilderId){ return (await all<LocalDocument>('documents')).filter(d=>!builderId||d.builderId===builderId).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)); }
  async getDocument(id:string){ const database=await db(); return request(database.transaction('documents').objectStore('documents').get(id)) as Promise<LocalDocument|undefined>; }
  async saveDocument(input: Omit<LocalDocument,'id'|'createdAt'|'updatedAt'|'version'> & {id?:string}) { const existing=input.id?await this.getDocument(input.id):undefined; const now=new Date().toISOString(); const document:LocalDocument={...input,id:existing?.id??crypto.randomUUID(),createdAt:existing?.createdAt??now,updatedAt:now,version:(existing?.version??0)+1}; await put('documents',document); await this.addAudit(document.id,existing?'updated':'created'); if(document.status==='complete'||document.status==='completed') await this.addAudit(document.id,'completed'); return document; }
  async deleteDocument(id:string){ await remove('documents',id); await this.addAudit(id,'deleted'); }
  async setDocumentStatus(id:string,status:LocalDocumentStatus){ const document=await this.getDocument(id); if(!document)return; await put('documents',{...document,status,updatedAt:new Date().toISOString()}); await this.addAudit(id,status==='archived'?'archived':status==='draft'?'restored':'completed'); }
  async listFolders(){ return all<LocalFolder>('folders'); }
  async saveFolder(input:Pick<LocalFolder,'name'>&Partial<LocalFolder>){ const now=new Date().toISOString(); const folder:LocalFolder={id:input.id??crypto.randomUUID(),name:input.name,color:input.color??null,createdAt:input.createdAt??now,updatedAt:now}; await put('folders',folder); return folder; }
  async deleteFolder(id:string){ await remove('folders',id); }
  async addAudit(documentId:string,action:AuditAction,detail?:string){ await put<LocalAuditRecord>('audit',{id:crypto.randomUUID(),documentId,action,timestamp:new Date().toISOString(),detail}); }
  async listAudit(){ return (await all<LocalAuditRecord>('audit')).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)); }
  async exportBackup():Promise<LocalBackup>{ return {version:1,exportedAt:new Date().toISOString(),documents:await this.listDocuments(),folders:await this.listFolders(),auditRecords:await this.listAudit(),staffPreferences:JSON.parse(localStorage.getItem('ja-development-staff-profile')||'{}'),companyPreferences:JSON.parse(localStorage.getItem('ja-company-preferences')||'{}'),templateOverrides:await all('templateOverrides')}; }
  async importBackup(backup:LocalBackup){ if(backup?.version!==1||!Array.isArray(backup.documents)||!Array.isArray(backup.folders)||!Array.isArray(backup.auditRecords)) throw new Error('Invalid JA Staff Document Builder backup'); for(const item of backup.documents) await put('documents',item); for(const item of backup.folders) await put('folders',item); for(const item of backup.auditRecords) await put('audit',item); localStorage.setItem('ja-development-staff-profile',JSON.stringify(backup.staffPreferences??{})); localStorage.setItem('ja-company-preferences',JSON.stringify(backup.companyPreferences??{})); }
}
