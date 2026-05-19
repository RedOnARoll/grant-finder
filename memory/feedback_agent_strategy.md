---
name: Agent strategy
description: Always use agents and parallelize; optimize for speed and low token usage on all tasks
type: feedback
---

Always parallelize with multiple agents for any non-trivial task. Spawn agents for: file writing, research, exploration, SQL generation, and any work that can run in parallel.

**Why:** User explicitly prefers agent-based execution for speed and token efficiency.

**How to apply:** On every task — even moderate ones — ask: "can this be split across agents?" If yes, spawn them in parallel. Don't do sequentially what can be done in parallel. For file creation tasks (like multiple SQL inserts or multiple loading skeletons), spawn one agent per file or batch. For research + writing tasks, spawn an Explore agent and a writing agent simultaneously.
