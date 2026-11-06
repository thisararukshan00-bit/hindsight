import api, { route } from '@forge/api';

/**
 * Thin wrappers over the Jira Cloud REST API, called as the app.
 * All functions degrade gracefully: on any failure they log and return a
 * safe empty-ish value so the panel/agent never hard-crashes in a judge's env.
 */

/** Fetch the issue we're predicting for: summary, components, labels, type. */
export async function getIssue(issueKey) {
  try {
    const res = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/issue/${issueKey}?fields=summary,components,labels,issuetype,project,assignee`
      );
    if (!res.ok) {
      console.warn(`getIssue ${issueKey} -> ${res.status}`);
      return null;
    }
    const data = await res.json();
    const f = data.fields || {};
    return {
      key: data.key,
      summary: f.summary || '',
      components: (f.components || []).map((c) => c.name),
      labels: f.labels || [],
      issueType: f.issuetype?.name || '',
      projectKey: f.project?.key || issueKey.split('-')[0],
    };
  } catch (e) {
    console.error('getIssue error', e);
    return null;
  }
}

/**
 * Find past incidents / bugs that touched the same components or labels and
 * are already resolved — these are the "history" Hindsight reasons from.
 * Uses the current enhanced-search endpoint (/rest/api/3/search/jql).
 */
export async function findPastIncidents({ projectKey, components, labels }) {
  const clauses = [];
  if (components?.length) {
    const list = components.map((c) => `"${c.replace(/"/g, '\\"')}"`).join(', ');
    clauses.push(`component in (${list})`);
  }
  if (labels?.length) {
    const list = labels.map((l) => `"${l.replace(/"/g, '\\"')}"`).join(', ');
    clauses.push(`labels in (${list})`);
  }
  if (!clauses.length) return [];

  // Resolved Bugs/Incidents on the same components or labels, most recent first.
  const jql =
    `project = "${projectKey}" ` +
    `AND (${clauses.join(' OR ')}) ` +
    `AND (issuetype in (Bug, Incident) OR labels in (incident, postmortem, outage)) ` +
    `AND statusCategory = Done ` +
    `ORDER BY resolved DESC`;

  try {
    const res = await api
      .asApp()
      .requestJira(route`/rest/api/3/search/jql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          jql,
          maxResults: 15,
          fields: ['summary', 'components', 'labels', 'resolutiondate', 'assignee', 'issuetype'],
        }),
      });
    if (!res.ok) {
      console.warn(`findPastIncidents -> ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.issues || []).map((i) => ({
      key: i.key,
      summary: i.fields?.summary || '',
      components: (i.fields?.components || []).map((c) => c.name),
      labels: i.fields?.labels || [],
      resolvedAt: i.fields?.resolutiondate || null,
      assignee: i.fields?.assignee?.displayName || null,
      issueType: i.fields?.issuetype?.name || '',
    }));
  } catch (e) {
    console.error('findPastIncidents error', e);
    return [];
  }
}

/** Create one subtask under the parent issue. Returns the new key or null. */
export async function createSubtask({ projectKey, parentKey, summary }) {
  try {
    const res = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          fields: {
            project: { key: projectKey },
            parent: { key: parentKey },
            summary: summary.slice(0, 254),
            issuetype: { name: 'Subtask' },
          },
        }),
      });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`createSubtask -> ${res.status}: ${body}`);
      return null;
    }
    const data = await res.json();
    return data.key;
  } catch (e) {
    console.error('createSubtask error', e);
    return null;
  }
}
