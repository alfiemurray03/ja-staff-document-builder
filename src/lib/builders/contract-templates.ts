import type { BuilderTemplate } from '@/lib/builder-framework';

const CONTRACT_ACCENT = '#dc2626';

export const CONTRACT_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'contract-service-agreement',
    builderId: 'contract',
    name: 'Service Agreement',
    description: 'General services agreement between a provider and client',
    category: 'Service Agreement',
    industries: ['Business', 'Consulting', 'Professional Services'],
    planRequired: 'free',
    status: 'active',
    popular: true,
    supportsBranding: true,
    showDocHeader: true,
    accentColor: CONTRACT_ACCENT,
    fields: [
      { id: 'provider_name', label: 'Service Provider Name', type: 'text', placeholder: 'Your business name', required: true },
      { id: 'provider_address', label: 'Provider Address', type: 'textarea', placeholder: 'Full registered or trading address', required: true },
      { id: 'client_name', label: 'Client Name', type: 'text', placeholder: 'Client or company name', required: true },
      { id: 'client_address', label: 'Client Address', type: 'textarea', placeholder: 'Full registered or trading address', required: true },
      { id: 'services_description', label: 'Services Description', type: 'textarea', placeholder: 'Describe the services to be provided in detail', required: true },
      { id: 'start_date', label: 'Start Date', type: 'date', required: true },
      { id: 'end_date', label: 'End Date / Duration', type: 'text', placeholder: 'e.g. 31 December 2026 or ongoing' },
      { id: 'fee_amount', label: 'Fee / Rate', type: 'text', placeholder: 'e.g. GBP 1,500 per month or GBP 75 per hour', required: true },
      { id: 'payment_terms', label: 'Payment Terms', type: 'text', placeholder: 'e.g. 30 days from invoice date', defaultValue: '30 days from invoice date' },
      { id: 'expenses_policy', label: 'Expenses Policy', type: 'textarea', defaultValue: 'Reasonable expenses must be approved by the Client in advance and supported by receipts.' },
      { id: 'notice_period', label: 'Notice Period', type: 'text', placeholder: 'e.g. 30 days written notice', defaultValue: '30 days written notice' },
      { id: 'governing_law', label: 'Governing Law', type: 'text', placeholder: 'e.g. England and Wales', defaultValue: 'England and Wales' },
      { id: 'additional_terms', label: 'Additional Terms', type: 'textarea', placeholder: 'Any additional terms or special conditions' },
      { id: 'provider_signatory', label: 'Provider Signatory Name', type: 'text', placeholder: 'Name of person signing' },
      { id: 'provider_title', label: 'Provider Signatory Title', type: 'text', placeholder: 'e.g. Director' },
      { id: 'client_signatory', label: 'Client Signatory Name', type: 'text', placeholder: 'Name of person signing for the client' },
      { id: 'signatory_date', label: 'Date of Signing', type: 'date' },
    ],
    bodyTemplate: `# SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of {{start_date}} between:

**{{provider_name}}** of {{provider_address}} ("Service Provider")

and

**{{client_name}}** of {{client_address}} ("Client").

---

## 1. Services

The Service Provider agrees to provide the following services to the Client:

{{services_description}}

## 2. Term

This Agreement starts on {{start_date}} and continues until {{end_date}}, unless terminated earlier under this Agreement.

## 3. Fees and Payment

The Client agrees to pay the Service Provider {{fee_amount}}.

Payment terms: {{payment_terms}}.

Invoices not paid when due may attract interest at 8% above the Bank of England base rate under the Late Payment of Commercial Debts (Interest) Act 1998.

## 4. Expenses

{{expenses_policy}}

## 5. Confidentiality

Each party must keep confidential all information received from the other party that is marked confidential or would reasonably be understood to be confidential.

## 6. Intellectual Property

Unless otherwise agreed in writing, intellectual property created specifically for the Client under this Agreement transfers to the Client only after the Service Provider has received full payment of all related fees.

## 7. Limitation of Liability

The Service Provider's total liability under this Agreement shall not exceed the total fees paid by the Client in the three months before the claim arose. Nothing in this Agreement limits liability that cannot legally be limited.

## 8. Termination

Either party may terminate this Agreement by giving {{notice_period}} to the other party. Either party may terminate immediately if the other party commits a material breach and fails to remedy it within a reasonable period after written notice.

## 9. Governing Law

This Agreement is governed by and construed in accordance with the laws of {{governing_law}}.

{{additional_terms}}

---

**Signed for and on behalf of {{provider_name}}**

Name: {{provider_signatory}}

Title: {{provider_title}}

Date: {{signatory_date}}

---

**Signed for and on behalf of {{client_name}}**

Name: {{client_signatory}}

Date: {{signatory_date}}
`,
  },
];
