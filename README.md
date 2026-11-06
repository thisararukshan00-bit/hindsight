# Hindsight 🔮

**The post-mortem you read _before_ the outage.**

Hindsight is an Atlassian **Forge + Rovo** app for **Codegeist 2026**
(_Build with context. Ship with confidence._). Before a change ships, it
predicts the likely post-mortem by learning from your team's **own past
incidents and bugs** on the same components — and tells you, transparently,
how confident it is and why.

- **Category:** Apps for Software Teams
- **Bonus target:** Best Agents (Rovo agent) — later: MCP, Teamwork Graph, Marketplace

---

## What it does

When you open a Jira issue (or ask the Rovo agent), Hindsight:

1. **Assembles context** — the issue's components/labels, plus resolved
   incidents & bugs that previously hit the same components, plus related
   Confluence runbooks (and whether they're stale).
2. **Predicts a post-mortem** — the most likely failure, blast radius, likely
   on-call, and a recurrence window — derived from the retrieved history
   (nothing is invented).
3. **Scores confidence transparently** — a weighted blend of three factors
   (incident history depth, component overlap, runbook freshness), each shown
   with its value and weight so you can see _why_ it's 78%.
4. **One-click mitigations** — turns its recommendations into Jira subtasks.

Two surfaces, one engine (`src/lib/`):

- **Jira issue panel** (UI Kit) — deterministic, always-works visual. Great for
  the demo and for judges' test environments.
- **Rovo agent "Hindsight"** — the AI path. The agent calls the
  `predict-incident` action and writes a natural-language post-mortem. This is
  what qualifies the app for the **Best Agents** bonus.

---

## Architecture

```
Jira issue panel ─┐
                  ├─► src/lib/hindsight.js (assembleContext)
Rovo agent  ──────┘        ├─ lib/jira.js         past incidents + bugs, subtasks
   │                       ├─ lib/confluence.js   runbook staleness
   │                       └─ lib/confidence.js   transparent 3-factor score
   └─ actions: predict-incident, create-mitigation-subtasks
```

| File | Role |
|---|---|
| `manifest.yml` | modules: `rovo:agent`, two `action`s, `jira:issuePanel` |
| `src/index.js` | panel resolver + both action handlers |
| `src/lib/hindsight.js` | core: assemble context + build prediction |
| `src/lib/jira.js` | Jira REST helpers (search, fetch, create subtask) |
| `src/lib/confluence.js` | runbook staleness via CQL |
| `src/lib/confidence.js` | the explainable confidence score |
| `src/lib/seed.js` | demo-mode fallback incidents |
| `src/frontend/index.jsx` | UI Kit issue panel |
| `static/prompt/prompt.txt` | the Rovo agent prompt |

---

## Run it locally

> Prereqs: Node 18+, a free **Atlassian Cloud developer site**, and the Forge CLI.

```bash
npm install -g @forge/cli        # install the CLI
forge login                      # authenticate
cd hindsight
npm install

forge register                   # creates an app id — paste it into manifest.yml (app.id)
forge deploy                     # build + deploy to the development environment
forge install                    # install onto your Jira site (choose Jira)
```

Then:

- Open any Jira issue → the **Hindsight** panel appears above Activity.
- Open **Rovo chat** (Chat button, top nav) → pick the **Hindsight** agent →
  _"Run Hindsight on PROJ-123"_.

### Demo data

Fresh sites have no incident history, so `src/lib/seed.js` ships `DEMO_MODE = true`:
if the live search finds no past incidents, Hindsight falls back to clearly
labelled sample incidents so the full flow is demonstrable. Set `DEMO_MODE = false`
for a clean production install.

To demo with **real** data instead: create a few resolved issues of type
**Bug**/**Incident** that share a component (e.g. `payment-service`) with the
issue you open, then run Hindsight on a new issue with that component.

---

## For judges (installation link)

An installation link will be shared via Forge's app distribution
(`forge install --list` → share link). After installing on a Jira site:

1. Open any issue and look for the **Hindsight** panel.
2. Try the **Hindsight** Rovo agent in Chat.
3. No configuration is required; demo mode guarantees a populated prediction.

---

## Scopes & privacy

- `read:jira-work`, `write:jira-work` — read the issue/history, create subtasks.
- `read:confluence-content.summary`, `search:confluence` — runbook staleness
  (optional; degrades gracefully if Confluence isn't present).
- No external services, no egress, no data leaves Atlassian. The Rovo agent is
  the only LLM involved and runs on Atlassian's platform.

---

## Roadmap (prize layers)

- [ ] **Teamwork Graph** — use the graph for true dependency blast-radius.
- [ ] **`rovo:mcp`** — expose `predict-incident` as an MCP tool.
- [ ] **Bitbucket** — enrich context with the actual code diff being shipped.
- [ ] **Marketplace** — submit a listing.
