import { getIssue, findPastIncidents } from './jira.js';
import { checkRunbookStaleness } from './confluence.js';
import { computeConfidence } from './confidence.js';
import { DEMO_MODE, SAMPLE_INCIDENTS } from './seed.js';

/**
 * Assemble everything Hindsight needs for one issue:
 *   - the issue itself (components, labels)
 *   - resolved past incidents/bugs on the same components
 *   - runbook staleness
 *   - a transparent confidence score
 *
 * Returns a plain object that both the panel resolver and the Rovo action use.
 */
export async function assembleContext(issueKey) {
  const issue = await getIssue(issueKey);
  if (!issue) {
    return { ok: false, error: `Could not read issue ${issueKey}.` };
  }

  let pastIncidents = await findPastIncidents({
    projectKey: issue.projectKey,
    components: issue.components,
    labels: issue.labels,
  });

  let usedDemoData = false;
  if (!pastIncidents.length && DEMO_MODE) {
    pastIncidents = SAMPLE_INCIDENTS;
    usedDemoData = true;
  }

  const runbook = await checkRunbookStaleness({ components: issue.components });
  const confidence = computeConfidence({ pastIncidents, issue, runbook });
  const prediction = buildPrediction({ issue, pastIncidents, runbook });

  return {
    ok: true,
    issue,
    pastIncidents,
    runbook,
    confidence,
    prediction,
    usedDemoData,
  };
}

/**
 * Build a predicted post-mortem from retrieved history — deterministic and
 * honest (it is explicitly derived from the matched incidents, not invented).
 * The Rovo agent can take this same context and write a richer narrative; the
 * issue panel shows this template so the demo always works without an LLM call.
 */
export function buildPrediction({ issue, pastIncidents, runbook }) {
  const future = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);

  if (!pastIncidents.length) {
    return {
      headline: 'No similar past incidents on these components.',
      body:
        `This change touches ${fmtList(issue.components) || 'no tagged components'}. ` +
        `There's no incident history to learn from yet, so the main residual risk ` +
        `is the unknown. Make sure a runbook exists before shipping.`,
      blastRadius: issue.components,
      likelyOnCall: null,
      mitigations: defaultMitigations(issue, runbook),
      predictedDate: future,
    };
  }

  const top = pastIncidents[0];
  const staleRunbooks = (runbook?.pages || []).filter((p) => p.stale);

  const headline =
    `If this ships as-is, the most likely failure resembles ${top.key}: ` +
    `“${top.summary}”.`;

  const body =
    `Across ${pastIncidents.length} past incident${pastIncidents.length === 1 ? '' : 's'} ` +
    `on ${area(issue)}, failures clustered around this area. ` +
    `Predicted recurrence window: ~${future}. ` +
    (top.assignee ? `Likely paged: ${top.assignee}. ` : '') +
    (staleRunbooks.length
      ? `⚠ ${staleRunbooks.length} relevant runbook(s) are stale, so response may be slow.`
      : '');

  return {
    headline,
    body,
    blastRadius: unique([
      ...issue.components,
      ...pastIncidents.flatMap((i) => i.components || []),
    ]),
    likelyOnCall: top.assignee,
    mitigations: mitigationsFrom(pastIncidents, issue, runbook),
    predictedDate: future,
    basedOn: pastIncidents.slice(0, 3).map((i) => i.key),
  };
}

function mitigationsFrom(pastIncidents, issue, runbook) {
  const steps = [];
  const top = pastIncidents[0];
  if (top) {
    steps.push(`Add a regression check for the failure seen in ${top.key} before merge`);
    steps.push(`Verify monitoring/alerts cover ${area(issue)} under load`);
  }
  const stale = (runbook?.pages || []).filter((p) => p.stale);
  if (stale.length) {
    steps.push(`Update the stale runbook: "${stale[0].title}"`);
  } else {
    steps.push(`Confirm an on-call runbook exists for ${area(issue)}`);
  }
  steps.push(`Prepare a rollback plan and name the deploy owner`);
  return steps;
}

function defaultMitigations(issue, runbook) {
  return [
    `Create an on-call runbook for ${fmtList(issue.components) || 'this change'}`,
    `Add basic alerting before shipping`,
    `Prepare a rollback plan and name the deploy owner`,
  ];
}

// ── small helpers ──────────────────────────────────────────────────────────
// Human label for the area a change touches: components → labels → generic.
function area(issue) {
  return (
    fmtList(issue.components) ||
    fmtList(issue.labels) ||
    'this change'
  );
}
function fmtList(arr) {
  if (!arr || !arr.length) return '';
  if (arr.length === 1) return arr[0];
  return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
}
function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}
