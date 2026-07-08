# Video Research: Personal AI Agentic OS

Last updated: 2026-06-29

## Sources

- Jack Roberts, "Claude Code Agentic OS... It self improves"  
  https://www.youtube.com/watch?v=MAuLQzcMrS0
- Julian Goldie SEO, "Claude: NEW Agentic OS is INSANE!"  
  https://www.youtube.com/watch?v=3qO6wxNknf8
- Ben AI, "Stop Using Claude Without an Agentic OS"  
  https://www.youtube.com/watch?v=1x32W8zAtrg

## Shared Patterns

- One command center should replace scattered tabs, terminals, chats, and memory folders.
- The useful unit is not a single chatbot. It is a layered system: models, memory, tools, workflows, interface, approvals, and metrics.
- The dashboard should be model-agnostic. Claude, Codex, ChatGPT, Gemini, local CLIs, and future models should appear as swappable tools.
- Persistent memory is the core advantage. Agents should use shared context and store useful outputs back into a memory layer.
- Human approval is essential. Autonomous loops can draft, score, and propose, but shipping, writing to the Vault, and external actions need explicit approval.
- The system should report value: time saved, duplicated work, inactive skills, outdated memories, recurring patterns, and model-cost waste.

## Features To Adopt

- Mission Control: status, current priorities, active projects, pending approvals, recent agent runs, and cost signal.
- Memory Galaxy: visual overview of Vault notes, AI conversations, artifacts, and relationships.
- Tool Registry: connection state for AI tools, CLIs, SaaS apps, local Bridge, and project systems.
- Dream Inbox: daily or manual insight generation from recent work, memory health, cost patterns, and opportunities.
- Agent Run Workspace: builder/judge/human approval loop with artifacts and step history.
- Artifact Gallery: generated drafts, websites, videos, reports, and code outputs with provenance.

## Adaptation For Jimi

This OS is not a generic AI dashboard. It is Jimi's operating layer for:

- Pastoral work: sermon preparation, prayer meeting exhortations, exegesis notes, Keryx.
- Second brain: JimiVault, PARA, PKM, theological notes, project memories.
- Development: portfolio, Keryx, AsterGuardMCP, Supabase, GitHub, Codex, Claude Code.
- Side business: Aster Works, Upwork/CrowdWorks proposals, product experiments.

## MVP Boundary

The first implementation should prioritize the Command Center and protected data model. It should not attempt full autonomous execution before the memory, approval, and security boundaries are reliable.

Initial actions may create records in Supabase. Vault writes, emails, deployments, payments, and external tool execution remain proposal-only until a later phase.
