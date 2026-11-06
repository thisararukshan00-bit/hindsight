/**
 * Transparent confidence score — NOT a black box.
 *
 * We combine three signals, each 0..1, into a weighted score and also return
 * the per-factor breakdown so the UI (and the agent) can show WHY it's 78%.
 *
 *   1. history   – how many similar past incidents we found (more = surer)
 *   2. overlap   – how strongly those incidents match this change's components
 *   3. runbook   – whether the relevant runbooks are fresh (stale = less sure
 *                  the team is prepared, which we treat as HIGHER risk but the
 *                  prediction itself is more confident that something's off)
 *
 * The weights are intentionally simple and explainable.
 */
const WEIGHTS = { history: 0.5, overlap: 0.3, runbook: 0.2 };

export function computeConfidence({ pastIncidents, issue, runbook }) {
  // 1. history depth: saturates at 5 incidents
  const n = pastIncidents.length;
  const history = Math.min(n / 5, 1);

  // 2. component/label overlap strength: of the matched incidents, average
  //    fraction of the issue's components they share.
  const issueTags = new Set([...(issue.components || []), ...(issue.labels || [])]);
  let overlap = 0;
  if (n && issueTags.size) {
    const scores = pastIncidents.map((inc) => {
      const incTags = new Set([...(inc.components || []), ...(inc.labels || [])]);
      let shared = 0;
      issueTags.forEach((t) => incTags.has(t) && shared++);
      return shared / issueTags.size;
    });
    overlap = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // 3. runbook signal: if we checked and found stale runbooks, the prediction
  //    is MORE confident there's exposure. If all fresh, slightly less.
  let runbookSignal = 0.4; // neutral default when not checked
  if (runbook?.checked && runbook.pages.length) {
    const staleCount = runbook.pages.filter((p) => p.stale).length;
    runbookSignal = staleCount / runbook.pages.length; // 0 (all fresh)..1 (all stale)
  }

  const raw =
    WEIGHTS.history * history +
    WEIGHTS.overlap * overlap +
    WEIGHTS.runbook * runbookSignal;

  const score = Math.round(raw * 100);

  return {
    score, // 0..100
    factors: [
      {
        label: 'Incident history',
        detail: `${n} similar past incident${n === 1 ? '' : 's'} found`,
        value: Math.round(history * 100),
        weight: WEIGHTS.history,
      },
      {
        label: 'Component overlap',
        detail: `${Math.round(overlap * 100)}% average match to this change`,
        value: Math.round(overlap * 100),
        weight: WEIGHTS.overlap,
      },
      {
        label: 'Runbook freshness',
        detail: runbook?.checked
          ? `${runbook.pages.filter((p) => p.stale).length}/${runbook.pages.length} runbooks stale`
          : 'runbooks not checked',
        value: Math.round(runbookSignal * 100),
        weight: WEIGHTS.runbook,
      },
    ],
  };
}
