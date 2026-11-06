import ResolverImport from '@forge/resolver';
const Resolver = ResolverImport?.default ?? ResolverImport;
import { assembleContext } from './lib/hindsight.js';
import { createSubtask, getIssue } from './lib/jira.js';

/* ──────────────────────────────────────────────────────────────────────────
 * 1) ISSUE PANEL RESOLVER  (the always-works visual path)
 *    Frontend (src/frontend/index.jsx) calls these via invoke().
 * ────────────────────────────────────────────────────────────────────────── */
const resolver = new Resolver();

resolver.define('runHindsight', async (req) => {
  const issueKey =
    req.context?.extension?.issue?.key ||
    req.payload?.issueKey;
  if (!issueKey) return { ok: false, error: 'No issue in context.' };
  return assembleContext(issueKey);
});

resolver.define('createMitigations', async (req) => {
  const issueKey =
    req.context?.extension?.issue?.key || req.payload?.issueKey;
  const steps = req.payload?.steps || [];
  if (!issueKey) return { ok: false, error: 'No issue in context.' };

  const issue = await getIssue(issueKey);
  if (!issue) return { ok: false, error: `Could not read ${issueKey}.` };

  const created = [];
  for (const summary of steps) {
    const key = await createSubtask({
      projectKey: issue.projectKey,
      parentKey: issueKey,
      summary: `[Hindsight] ${summary}`,
    });
    if (key) created.push(key);
  }
  return { ok: true, created, attempted: steps.length };
});

export const handler = resolver.getDefinitions();

/* ──────────────────────────────────────────────────────────────────────────
 * 2) ROVO ACTION: predict-incident  (the AI path → Best Agents bonus)
 *    The agent calls this, then composes a natural-language post-mortem from
 *    the structured context we return.
 * ────────────────────────────────────────────────────────────────────────── */
export async function predictIncident(payload, context) {
  const issueKey = payload?.issueKey || context?.jira?.issueKey;
  if (!issueKey) {
    return 'I need a Jira issue key to run Hindsight (e.g. PROJ-123).';
  }

  const ctx = await assembleContext(issueKey);
  if (!ctx.ok) return ctx.error;

  // Return structured JSON — the agent turns this into a readable post-mortem.
  return {
    issueKey: ctx.issue.key,
    summary: ctx.issue.summary,
    components: ctx.issue.components,
    confidence: ctx.confidence.score,
    confidenceFactors: ctx.confidence.factors,
    predictedPostMortem: {
      headline: ctx.prediction.headline,
      details: ctx.prediction.body,
      predictedDate: ctx.prediction.predictedDate,
      blastRadius: ctx.prediction.blastRadius,
      likelyOnCall: ctx.prediction.likelyOnCall,
      basedOnIncidents: ctx.prediction.basedOn || [],
    },
    recommendedMitigations: ctx.prediction.mitigations,
    staleRunbooks: (ctx.runbook?.pages || []).filter((p) => p.stale).map((p) => p.title),
    note: ctx.usedDemoData
      ? 'No real incident history found; used bundled demo incidents for this prediction.'
      : undefined,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3) ROVO ACTION: create-mitigation-subtasks
 * ────────────────────────────────────────────────────────────────────────── */
export async function createMitigationSubtasks(payload, context) {
  const issueKey = payload?.issueKey || context?.jira?.issueKey;
  const raw = payload?.steps || '';
  const steps = String(raw)
    .split('\n')
    .map((s) => s.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean);

  if (!issueKey) return 'I need the parent issue key to create subtasks.';
  if (!steps.length) return 'No mitigation steps were provided.';

  const issue = await getIssue(issueKey);
  if (!issue) return `Could not read ${issueKey}.`;

  const created = [];
  for (const summary of steps) {
    const key = await createSubtask({
      projectKey: issue.projectKey,
      parentKey: issueKey,
      summary: `[Hindsight] ${summary}`,
    });
    if (key) created.push(key);
  }

  return created.length
    ? `Created ${created.length} mitigation subtask(s) under ${issueKey}: ${created.join(', ')}.`
    : `Could not create subtasks under ${issueKey} (check that the project allows the "Subtask" type).`;
}
