# Hindsight — Demo Video Recording Guide (Windows)

A beginner-friendly, start-to-finish guide. Target: a clean < 3-minute video, public on YouTube.
Since Rovo Chat UI isn't available on this dev site, the **issue panel is the star**, and we show the **manifest** to prove the Rovo agent + MCP tool exist.

---

## STEP 0 — Prep (10 min, do this first)

**Clean up the screen:**
- Close every app you won't show. Leave only **Brave** (Jira) and **VS Code** (manifest).
- In Brave: hide the bookmarks bar (Ctrl+Shift+B), close extra tabs, zoom to ~110% (Ctrl +).
- Windows: hide desktop icons, set Do-Not-Disturb (no notifications popping mid-record).

**Reset the demo data so it looks fresh:**
- Open **KAN-1**. If it already has subtasks from testing, delete them (KAN-2…KAN-5) so you can show the "Create mitigation subtasks" click live.
  - Each subtask → ⋯ → Delete. (Or just create a brand-new issue KAN-6 with label `payment-service` and demo on that.)
- Make sure the Hindsight panel loads fully (not the spinner) before you hit record.

**Open your two shots in advance:**
- Tab 1: Jira issue (KAN-1 or a fresh one) scrolled to the Hindsight panel.
- VS Code: `manifest.yml` open, scrolled to the `rovo:agent` / `action` / `rovo:mcp` block.

---

## STEP 1 — Pick a recorder

**Option A — OBS Studio (recommended, free):** https://obsproject.com
- Records screen + mic, no watermark, no time limit.
- Setup: Sources → **+ → Display Capture** (or Window Capture for just Brave).
- Add mic: Sources → **+ → Audio Input Capture** → your mic.
- Settings → Output → Recording Format: **mp4**. Settings → Video → Base/Output resolution **1920×1080**, FPS **30**.
- Big button **Start Recording** / **Stop Recording** (bottom-right).

**Option B — Xbox Game Bar (built-in, fastest):** press **Win + G** → Capture widget → record button (or **Win+Alt+R**).
- Simple, but records one app window only and can't capture File Explorer/desktop. Fine if you only show Brave + VS Code.

> Recommendation: **OBS** — it can show both Brave and VS Code and you won't fight window limits.

---

## STEP 2 — Narration: pick ONE

1. **Live mic (fastest):** read the script while recording. One or two takes. Most natural.
2. **Silent capture + voiceover later:** record the screen silently, then add voice in the editor. Easier if English speaking makes you nervous.
3. **No voice + captions:** record silent, add on-screen text captions in the editor. 100% safe for pronunciation. Judges are fine with this.

> Tip: whichever you choose, keep the cursor **slow**. Rushing is the #1 demo mistake.

---

## STEP 3 — Record, following this shot list

Record in short clips (stop/start between sections) — easier to edit. Say the line, do the action.

| # | Duration | Say (voice or caption) | Do on screen |
|---|---|---|---|
| 1 | 0:00–0:15 | "Every post-mortem starts the same way: _we should have known this_. Hindsight puts that knowledge in front of you **before** you ship." | Title card, or talking head |
| 2 | 0:15–0:40 | "Here's a Jira issue about to ship, touching payment-service." | Show the issue KAN-1, point at the `payment-service` label |
| 3 | 0:40–1:30 | "Scroll down — Hindsight already ran. A predicted post-mortem, learned from the team's own history. 68% confidence — and it shows **why**: the incidents and the weights." | Slowly pan the panel: headline → confidence → Why this score → Learned from |
| 4 | 1:30–2:00 | "One click turns the mitigations into real Jira subtasks." | Click **Create mitigation subtasks** → scroll to Subtasks (KAN-2…5) |
| 5 | 2:00–2:35 | "Hindsight is also a Rovo agent and an MCP tool — same engine, three surfaces. Built on Forge, integrating Jira, Confluence, and Rovo." | Switch to VS Code, pan the `manifest.yml` modules: `rovo:agent`, `action`, `rovo:mcp`, `jira:issuePanel` |
| 6 | 2:35–3:00 | "Your team's own history, turned into foresight — right before you ship. Context, into confidence." | Closing card: "Hindsight · Context → Confidence" |

---

## STEP 4 — Edit (free tools)

- **Clipchamp** (built into Windows 11, search it in Start) or **CapCut** (free): https://www.capcut.com
- Do: trim dead air, stitch your clips in order, add the **title card** (0:00) and **closing card** (end).
- Add captions/text if you went the no-voice route.
- Keep it **under 3 minutes** (judges may stop at 3:00).
- Export: **1080p, mp4**.

### Title / closing card text (copy-paste)
- Opening: **Hindsight** — _the post-mortem you read before the outage._
- Closing: **Hindsight** · Context → Confidence · Codegeist 2026

---

## STEP 5 — Upload to YouTube

1. youtube.com → Create → **Upload video**.
2. Visibility: **Public** (the rules require publicly visible on YouTube). Unlisted is risky — use Public.
3. Title: `Hindsight — Predict the post-mortem before you ship | Codegeist 2026`
4. Description: paste the tagline + one line on what it does + "Built on Atlassian Forge (Jira, Confluence, Rovo)."
5. ⚠️ **No copyrighted music.** Use YouTube Audio Library (free) or no music.
6. Copy the video link → paste into the Devpost submission form.

---

## Common mistakes to avoid
- ❌ Bookmarks bar / personal tabs / notifications visible → close them.
- ❌ Panel still on the spinner when you start → wait for it to load.
- ❌ Copyrighted background music → instant disqualification risk.
- ❌ Over 5 minutes → keep it tight, ~2:30–3:00 is ideal.
- ❌ Fast cursor / tiny text → slow down, zoom in.

## Minimum viable video (if short on time)
Shots 2 → 3 → 4 → 5 with on-screen captions, 90 seconds, one title + one closing card. That alone is a strong, complete demo.
