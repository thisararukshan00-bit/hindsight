import api, { route } from '@forge/api';

const STALE_DAYS = 120; // a runbook not touched in ~4 months is "stale"

/**
 * Look for runbook-style Confluence pages related to the issue's components and
 * report how stale they are. This is one of the three confidence factors.
 *
 * Returns { checked: boolean, pages: [{ title, url, ageDays, stale }] }.
 * Degrades to { checked: false, pages: [] } if Confluence isn't reachable
 * (e.g. the app is installed only in Jira, or scopes aren't granted).
 */
export async function checkRunbookStaleness({ components }) {
  if (!components?.length) return { checked: false, pages: [] };

  // CQL: pages whose title mentions a component + "runbook"/"playbook".
  const titleTerms = components
    .map((c) => `title ~ "${c.replace(/"/g, '\\"')}"`)
    .join(' OR ');
  const cql = `type = page AND (${titleTerms}) AND (title ~ "runbook" OR title ~ "playbook" OR title ~ "on-call")`;

  try {
    const res = await api
      .asApp()
      .requestConfluence(
        route`/wiki/rest/api/content/search?cql=${cql}&limit=10&expand=version`
      );
    if (!res.ok) {
      console.warn(`checkRunbookStaleness -> ${res.status}`);
      return { checked: false, pages: [] };
    }
    const data = await res.json();
    const now = Date.now();
    const pages = (data.results || []).map((p) => {
      const when = p.version?.when ? new Date(p.version.when).getTime() : now;
      const ageDays = Math.round((now - when) / 86400000);
      return {
        title: p.title,
        url: p._links?.webui || null,
        ageDays,
        stale: ageDays > STALE_DAYS,
      };
    });
    return { checked: true, pages };
  } catch (e) {
    console.error('checkRunbookStaleness error', e);
    return { checked: false, pages: [] };
  }
}

export { STALE_DAYS };
