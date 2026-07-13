export interface PortalNavItem { id:string; label:string; href:string; defaultVisible:boolean }
export interface PortalNavSection { id:string; label:string; items:PortalNavItem[]; defaultVisible:boolean }
export interface PortalNavOverrides { visibility:Record<string,boolean> }
const item=(id:string,label:string,href:string):PortalNavItem=>({id,label,href,defaultVisible:true});
export const DEFAULT_PORTAL_NAV:PortalNavSection[]=[
 {id:'workspace',label:'WORKSPACE',defaultVisible:true,items:[item('nav-dashboard','Home','/'),item('nav-work','My Work','/work'),item('nav-tasks','Tasks & Actions','/tasks'),item('nav-calendar','Calendar','/calendar')]},
 {id:'documents',label:'DOCUMENTS',defaultVisible:true,items:[item('nav-builders-hub','Document Studio','/document-studio'),item('nav-my-documents','Documents','/documents'),item('nav-resources','Policies & Resources','/resources')]},
 {id:'company',label:'COMPANY',defaultVisible:true,items:[item('nav-board','Board Workspace','/board'),item('nav-governance','Company Governance','/governance'),item('nav-portals','Websites & Portals','/portals'),item('nav-staff','Staff Directory','/staff')]},
 {id:'system',label:'SYSTEM',defaultVisible:true,items:[item('nav-search','Portal Search','/search'),item('nav-settings','Staff Account','/settings'),item('nav-admin','Administration','/admin/dashboard')]},
 {id:'core-builders',label:'DOCUMENT BUILDERS',defaultVisible:true,items:[item('nav-letter-builder','Letter Builder','/letter-builder'),item('nav-email-builder','Email Builder','/email-builder'),item('nav-policy-builder','Policy Builder','/policy-builder'),item('nav-form-builder','Form Builder','/form-builder'),item('nav-invoice-builder','Invoice Builder','/invoice-builder'),item('nav-checklist-builder','Checklist Builder','/checklist-builder'),item('nav-report-builder','Report Builder','/report-builder'),item('nav-minutes-builder','Minutes Builder','/minutes-builder'),item('nav-proposal-builder','Proposal Builder','/proposal-builder'),item('nav-contract-builder','Contract Builder','/contract-builder')]},
];
export function applyPortalNavOverrides(sections:PortalNavSection[],overrides:PortalNavOverrides){return sections.filter(s=>overrides.visibility[s.id]??s.defaultVisible).map(s=>({...s,items:s.items.filter(i=>overrides.visibility[i.id]??i.defaultVisible)})).filter(s=>s.items.length);}
