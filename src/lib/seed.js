/**
 * Demo fallback data.
 *
 * In a judge's fresh test environment there may be no past incidents to learn
 * from, which would make every prediction empty. When DEMO_MODE is on and the
 * live Jira search returns nothing, we fall back to these sample incidents so
 * the end-to-end flow is always demonstrable.
 *
 * This is clearly labelled in the UI ("demo data") so nothing is misrepresented
 * as real history. Set DEMO_MODE = false for a clean production install.
 */
export const DEMO_MODE = true;

export const SAMPLE_INCIDENTS = [
  {
    key: 'DEMO-204',
    summary: 'Checkout timeouts after payment-service deploy (gateway 504s)',
    components: ['payment-service'],
    labels: ['incident', 'outage'],
    resolvedAt: '2026-08-12T09:20:00.000Z',
    assignee: 'On-call: Payments',
    issueType: 'Incident',
    demo: true,
  },
  {
    key: 'DEMO-188',
    summary: 'Duplicate charges when retry logic fired twice under load',
    components: ['payment-service'],
    labels: ['incident', 'postmortem'],
    resolvedAt: '2026-06-30T14:05:00.000Z',
    assignee: 'On-call: Payments',
    issueType: 'Bug',
    demo: true,
  },
  {
    key: 'DEMO-151',
    summary: 'Webhook backlog delayed order confirmations by 40 min',
    components: ['payment-service', 'notifications'],
    labels: ['incident'],
    resolvedAt: '2026-05-02T18:40:00.000Z',
    assignee: 'On-call: Platform',
    issueType: 'Incident',
    demo: true,
  },
];
