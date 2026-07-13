import type { SavedDocument, DocumentFolder, TemplateCategory } from './document-types';
import { generateDocRef } from './doc-ref';
import { documentStorage, type LocalDocument } from './storage';
import type { BuilderId, BuilderLayoutId } from './builder-framework';

function toSaved(doc: LocalDocument): SavedDocument {
  return { id:doc.id,templateId:doc.templateId,templateName:doc.templateName??doc.templateId,category:(doc.category??'business') as TemplateCategory,title:doc.title,status:doc.status,fields:doc.fields,content:doc.content??'',docRef:doc.docRef,createdAt:doc.createdAt,updatedAt:doc.updatedAt,folderId:doc.folderId,version:doc.version,formData:doc.fields,generatedContent:doc.content??'' };
}

export async function getDocuments(): Promise<SavedDocument[]> { return (await documentStorage.listDocuments()).map(toSaved); }
export async function saveDocument(doc: Omit<SavedDocument,'id'|'createdAt'|'updatedAt'|'version'|'docRef'>): Promise<SavedDocument|null> {
  const fields=(doc.fields??doc.formData??{}) as Record<string,string>;
  const saved=await documentStorage.saveDocument({title:doc.title,builderId:(doc.category as BuilderId)||'letter',templateId:doc.templateId,templateName:doc.templateName,category:doc.category,status:doc.status,fields,content:doc.content??doc.generatedContent??'',branding:{color:'#1B4F8A',logoUrl:'',orgName:''},selectedCompany:'JA Group Services Ltd',layoutId:'letter' as BuilderLayoutId,docRef:generateDocRef(doc.category),folderId:doc.folderId});
  return toSaved(saved);
}
export async function updateDocument(id:string,updates:Partial<SavedDocument>):Promise<boolean>{ const current=await documentStorage.getDocument(id); if(!current)return false; await documentStorage.saveDocument({...current,...updates,id,fields:(updates.fields??current.fields) as Record<string,string>,status:updates.status??current.status}); return true; }
export async function deleteDocument(id:string):Promise<boolean>{ await documentStorage.deleteDocument(id); return true; }
export async function duplicateDocument(id:string):Promise<SavedDocument|null>{ const current=await documentStorage.getDocument(id); if(!current)return null; const {id:_id,createdAt:_created,updatedAt:_updated,version:_version,...copy}=current; void _id;void _created;void _updated;void _version; return toSaved(await documentStorage.saveDocument({...copy,title:`${current.title} (Copy)`,docRef:generateDocRef(current.category ?? 'business')})); }
export async function getFolders():Promise<DocumentFolder[]>{ return documentStorage.listFolders(); }
export async function createFolder(name:string,color:string):Promise<DocumentFolder|null>{ return documentStorage.saveFolder({name,color}); }
export async function deleteFolder(id:string):Promise<boolean>{ await documentStorage.deleteFolder(id); return true; }
