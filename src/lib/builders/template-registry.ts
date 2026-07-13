import type { BuilderId, BuilderTemplate } from '../builder-framework';
import { LETTER_TEMPLATES } from './letter-templates';
import { EMAIL_BUILDER_TEMPLATES } from './email-builder-templates';
import { POLICY_TEMPLATES } from './policy-templates';
import { FORM_TEMPLATES } from './form-templates';
import { INVOICE_TEMPLATES } from './invoice-templates';
import { CHECKLIST_TEMPLATES } from './checklist-templates';
import { REPORT_TEMPLATES } from './report-templates';
import { MINUTES_TEMPLATES } from './minutes-templates';
import { PROPOSAL_TEMPLATES } from './proposal-templates';
import { CONTRACT_TEMPLATES } from './contract-templates';

const TEMPLATE_REGISTRY: Partial<Record<BuilderId, BuilderTemplate[]>> = {
  letter: LETTER_TEMPLATES,
  email: EMAIL_BUILDER_TEMPLATES,
  policy: POLICY_TEMPLATES,
  form: FORM_TEMPLATES,
  invoice: INVOICE_TEMPLATES,
  checklist: CHECKLIST_TEMPLATES,
  report: REPORT_TEMPLATES,
  minutes: MINUTES_TEMPLATES,
  proposal: PROPOSAL_TEMPLATES,
  contract: CONTRACT_TEMPLATES,
};

export function getTemplatesForBuilder(builderId: BuilderId): BuilderTemplate[] {
  return (TEMPLATE_REGISTRY[builderId] ?? []).filter(template => template.status !== 'retired');
}
