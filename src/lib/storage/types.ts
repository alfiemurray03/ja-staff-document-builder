import type { BuilderId, BuilderLayoutId } from '../builder-framework';

export type LocalDocumentStatus = 'draft' | 'complete' | 'completed' | 'archived';
export interface LocalDocument {
  id: string; title: string; builderId: BuilderId; templateId: string;
  templateName?: string; category?: string; status: LocalDocumentStatus;
  fields: Record<string, string>; content?: string; branding: { color: string; logoUrl: string; orgName: string };
  selectedCompany: 'JA Group Services Ltd' | 'JSDS Group Ltd'; layoutId: BuilderLayoutId;
  docRef: string; folderId?: string | null; createdAt: string; updatedAt: string; version: number;
}
export interface LocalFolder { id: string; name: string; color?: string | null; createdAt: string; updatedAt: string; }
export type AuditAction = 'created'|'updated'|'opened'|'completed'|'archived'|'restored'|'deleted'|'exported'|'printed';
export interface LocalAuditRecord { id: string; documentId: string; action: AuditAction; timestamp: string; detail?: string; }
export interface LocalBackup { version: 1; exportedAt: string; documents: LocalDocument[]; folders: LocalFolder[]; auditRecords: LocalAuditRecord[]; staffPreferences: unknown; companyPreferences: unknown; templateOverrides: unknown[]; }
export interface DocumentStorage {
  listDocuments(builderId?: BuilderId): Promise<LocalDocument[]>; getDocument(id: string): Promise<LocalDocument|undefined>;
  saveDocument(document: Omit<LocalDocument,'id'|'createdAt'|'updatedAt'|'version'> & { id?: string }): Promise<LocalDocument>;
  deleteDocument(id: string): Promise<void>; setDocumentStatus(id: string, status: LocalDocumentStatus): Promise<void>;
  listFolders(): Promise<LocalFolder[]>; saveFolder(folder: Pick<LocalFolder,'name'> & Partial<LocalFolder>): Promise<LocalFolder>; deleteFolder(id: string): Promise<void>;
  addAudit(documentId: string, action: AuditAction, detail?: string): Promise<void>; listAudit(): Promise<LocalAuditRecord[]>;
  exportBackup(): Promise<LocalBackup>; importBackup(backup: LocalBackup): Promise<void>;
}
