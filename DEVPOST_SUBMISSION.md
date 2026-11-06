# Hindsight — Devpost Submission

> Copy each section into the matching field on the Codegeist 2026 "Enter a Submission" page.

---

## Tagline (one line)
**The post-mortem you read _before_ the outage.**

---

## Inspiration
Every incident post-mortem starts with the same sentence: _"We should have known this would happen."_ The signals were almost always already in the team's own tools — a component that broke last quarter, a runbook nobody updated, a bug that looked exactly like this one. The knowledge existed; it just wasn't in front of the person clicking "Deploy." Codegeist 2026's theme is _Build with context. Ship with confidence._ — so we built the app that turns a team's own history into foresight at the exact moment it matters.

## What it does
**Hindsight** predicts the post-mortem for a change **before** it ships. When you open a Jira issue (or ask the Rovo agent), Hindsight:

1. **Assembles context** — the issue's components/labels, resolved incidents & bugs that previously hit the same components, and related Confluence runbooks (checking if they're stale).
2. **Predicts a post-mortem** — the most likely failure, blast radius, likely on-call, and a recurrence window — derived from the retrieved history, not invented.
3. **Scores confidence transparently** — a weighted blend of three factors (incident-history depth, component overlap, runbook freshness), each shown with its value and weight so you can see _why_ it's 68%.
4. **Turns advice into action** — one click converts the recommended mitigations into Jira subtasks.

Two surfaces, one engine:
- A **Jira issue panel** (UI Kit) — the deterministic, always-works visual.
- A **Rovo agent "Hindsight"** — calls the `predict-incident` action and writes a natural-language post-mortem.

## How we built it
- **Atlassian Forge** (serverless), Node.js runtime, UI Kit (`@forge/react`) for the panel.
- `@forge/resolver` resolver for the panel; two Rovo **actions** (`predict-incident`, `create-mitigations`) the agent can invoke.
- Jira Cloud REST (enhanced JQL search `/rest/api/3/search/jql`) to retrieve past incidents and create subtasks; Confluence CQL to gauge runbook staleness.
- A small, **explainable** confidence model (no black-box ML) — retrieval + weighted scoring + LLM reasoning via the Rovo agent.
- Graceful demo-mode fallback so a fresh judge environment always shows a populated prediction.

## Challenges we ran into
- A UI Kit resolver bundling quirk (`@forge/resolver`'s default export arriving as a namespace object) — solved with an interop-safe unwrap.
- Keeping the prediction **honest**: everything shown is derived from retrieved issues, and demo incidents are clearly labelled as demo data — never passed off as real history.

## What we learned
Context only creates confidence when it's **explainable**. Showing _why_ the score is what it is — the exact incidents and the weights — matters more than the number itself.

## What's next
Teamwork Graph for true dependency blast-radius, an `rovo:mcp` tool so other agents can call `predict-incident`, Bitbucket diff enrichment, and a Marketplace listing.

---

## How it meets the main technology requirement
Hindsight is built entirely on **Atlassian Forge** and integrates **multiple Atlassian products/capabilities**:
- **Jira** — reads the issue, searches historical incidents/bugs via enhanced JQL, and creates mitigation subtasks (`read:jira-work`, `write:jira-work`).
- **Confluence** — searches runbook pages via CQL to measure staleness (`read:confluence-content.summary`, `search:confluence`).
- **Rovo** — a `rovo:agent` with two `action` modules the agent invokes as tools.

Forge modules used: `rovo:agent`, two `action`s, `jira:issuePanel`, and `function` handlers — a non-trivial, working implementation with a real resolver, live REST calls, and a functioning write path.

---

## Category
**Apps for Software Teams**

## Bonus prizes selected
- **Best Agents** — includes the `rovo:agent` module plus reusable `action` modules (`predict-incident`, `create-mitigations`) the agent invokes as tools.
  - _(Planned/if added before submission: **Best app with Atlassian MCP** via `rovo:mcp`; **Best Teamwork Graph integration**; **Best Marketplace published app**.)_

---

## Testing instructions (for judges)
1. Install via the provided installation link onto a Jira Cloud site (Confluence optional).
2. Open any Jira issue → the **Hindsight** panel appears below the issue content.
   - It shows a predicted post-mortem, a transparent confidence score, the incidents it learned from, and recommended mitigations.
   - Click **Create mitigation subtasks** → subtasks are created under the issue.
3. No configuration required. If the site has no incident history, **demo mode** (clearly labelled) guarantees a populated prediction. To test with real data, create a few resolved **Bug/Incident** issues sharing a component (e.g. `payment-service`), then open a new issue with that component.
4. _(If Rovo Chat is enabled on the site)_ open Rovo chat → **Hindsight** agent → "Run Hindsight on PROJ-1".

## Links to include
- **Installation link:** _(from `forge install --list` / your distribution link)_
- **Demo video (YouTube, public, < 5 min):** _(add after recording)_
- **Repository:** _(optional — your GitHub)_
