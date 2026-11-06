# Hindsight — Demo Video Script (~3 minutes)

**Goal:** show the project working end-to-end and make the theme land: _context → confidence_.
**Rules reminder:** < 5 min (judges may stop at 3), public on YouTube, show it functioning on-screen, English (or English subtitles).

> Tip: record at 1080p, hide bookmarks bar, zoom the browser to ~110% so text is readable. Keep the cursor slow and deliberate.

---

### 0:00–0:20 — The hook (talking head or voiceover over title card)
> "Every post-mortem starts with the same five words: _we should have known this._
> The signals are almost always already in your tools — a component that broke last quarter, a stale runbook, a bug that looked just like this one.
> Hindsight puts that knowledge in front of you **before** you ship. It's the post-mortem you read before the outage."

**On screen:** title card "Hindsight — the post-mortem you read before the outage."

---

### 0:20–0:45 — The setup (screen recording)
> "Here's a Jira issue: _Deploy payment-service timeout fix_. A normal change, about to ship."

**On screen:**
- Open issue **KAN-1** in Jira.
- Point the cursor at the **payment-service** label and the title.

---

### 0:45–1:35 — The core moment (screen recording — this is the star)
> "Scroll down, and Hindsight has already run. It read the team's history for this component and wrote a predicted post-mortem."

**On screen — slowly pan the Hindsight panel:**
- **Predicted post-mortem** headline: _"…the most likely failure resembles DEMO-204: Checkout timeouts after payment-service deploy."_
- **68% confidence** lozenge — pause on it.

> "And it's not a black box. It shows you _why_ it's 68% —"

- **Why this score**: Incident history 60% (50% weight), Component overlap 100% (30% weight), Runbook freshness 40% (20% weight).

> "— the incidents it learned from —"

- **Learned from**: DEMO-204, DEMO-188, DEMO-151.

> "— and exactly what to do about it."

- **Recommended mitigations** list.

---

### 1:35–2:05 — The action (screen recording)
> "One click turns those mitigations into real work."

**On screen:**
- Click **Create mitigation subtasks**.
- Show the confirmation, then scroll to **Subtasks**: KAN-2…KAN-5, each prefixed `[Hindsight]`.

> "Context became a plan — inside Jira, in one click."

---

### 2:05–2:35 — The agent + how it's built (screen recording or slide)
> "Hindsight is also a Rovo agent. Ask it in chat, and it calls the same predict-incident action and writes the post-mortem for you."

**On screen (pick what you can show):**
- If Rovo Chat is live: "Run Hindsight on KAN-1" in Rovo and show the reply.
- If not: show the **manifest** — the `rovo:agent` + `action` modules + `jira:issuePanel` — and say: "Built on Forge, integrating Jira, Confluence, and Rovo."

> "It runs entirely on Atlassian Forge — Jira for history and subtasks, Confluence for runbook freshness, Rovo for the agent. No data leaves Atlassian."

---

### 2:35–3:00 — The close (talking head or title card)
> "Hindsight turns your team's own history into foresight, at the one moment it matters — right before you ship.
> That's the theme in one screen: **context, into confidence.**"

**On screen:** final card "Hindsight · Context → Confidence · Codegeist 2026".

---

## Shot checklist
- [ ] Issue with `payment-service` label open (KAN-1)
- [ ] Hindsight panel fully loaded (not the spinner) before recording
- [ ] Confidence breakdown visible
- [ ] "Create mitigation subtasks" click → subtasks appear
- [ ] Manifest or Rovo chat shot for the agent
- [ ] Title + closing cards
- [ ] Audio clear; subtitles if not speaking English

## 30-second fallback version (if you want a short teaser)
Hook (0:00–0:08) → panel + confidence (0:08–0:20) → one-click subtasks (0:20–0:27) → close card (0:27–0:30).
