# Ethos Safety — Opportunity Brief

**Date:** 8 April 2026
**Status:** Initial call done; documents received; Teams call Monday
**Director:** Graeme Clark — graeme@ethos-safety.com
**Calendly:** https://calendly.com/ethos-safety
**Registered:** Ethos Safety Ltd, Scotland No. SC735602

---

## Background

A health and safety consultancy, 5 employees. Director is Graeme Clark. Cruden is one of their clients — they run RAMS (Risk Assessments and Method Statements) for Cruden among other things. They serve companies from 1 person up to ~70 people, covering all the tech and compliance side of H&S and letting clients subscribe to make H&S easy.

Director's goals:
- Grow the company
- Eventually sell it (exit-focused)
- Uses a lot of SaaS tooling day to day
- Wants the system to be adoptable and adaptable — able to knit together H&S processes correctly

---

## What Ethos Safety Produces

Graeme provided a sample RAMS document produced for Cruden: "Nairn Academy Electrical rev3" (Ref 11814, Sep 2025, 71 pages). It contains:

- **Method Statement** — scope of works, personnel, legislation, access, PPE, site procedures
- **Sequence of Works** — step-by-step task procedures for each activity (electrical isolations, MEWP use, scaffolding, cable installation, etc.)
- **Risk Assessments** — 26 hazard entries, each with risk rating matrix, control measures, and residual risk
- **COSHH Assessments** — substance sheets with exposure limits, PPE requirements, emergency response

The document is produced per project and reviewed monthly. Graeme Clark signed off the HAV vibration calculator personally (07/03/2025) — he is doing the technical assessment work himself, not just managing others.

From section 1.16: *"External H+S Consultant (Ethos Safety) will review the RAMS monthly."*

This is the core deliverable: bespoke, project-specific RAMS that contractors (like Cruden) are legally required to have in place before site works begin.

---

## Second Product: Site Safety Inspections

Second document is a site safety inspection report — Graeme physically visiting the Cruden / Nairn Academy site on 13 March 2026, working through a structured checklist with 41 photos (fire extinguishers, first aid boxes, scissor lift thorough examination records, COSHH storage, ladder tags, signed RAMS sheets, etc.). Score 55/56 (98.21%).

The tool generating it is likely **SafetyCulture (iAuditor)** or similar inspection app — same checklist structure every visit, photos embedded, auto-generates a branded PDF. Graeme signs off digitally, site supervisor countersigns.

So Ethos Safety's two main deliverables:
1. **RAMS documents** — written per project before works begin (monthly review)
2. **Site safety inspections** — physical visits, structured audit, photo evidence, PDF report

Both are highly repetitive. The RAMS sections repeat across projects (same risk assessments for MEWPs, electrical isolations, manual handling, etc.). The inspection checklist is the same every time.

---

## The Opportunity — Self-Service / Agent

Graeme currently does both manually for every client. He wants to scale and eventually sell. The idea Philip is exploring: **could clients self-serve some of this?**

Repetitive patterns ripe for automation:
- RAMS: most sections are boilerplate — scope of works and personnel change, but 80%+ of the risk assessments, COSHH sheets and method statement content is reused
- Inspections: same checklist every visit — a client's site supervisor could walk through it themselves via WhatsApp or a simple app, submit photos, and generate the report automatically

This is directly analogous to what Philip built for Cruden (van checks, H&S incident reporting). The same WhatsApp-bot-to-PDF infrastructure could generate inspection reports without Graeme having to be on site.

**For Graeme this means:** more clients, lower cost-per-client, ability to sell the business as a platform rather than a one-man consultancy.

---

## What They Want

Director has an awareness of APIs and is interested in building an agent that handles H&S workflows automatically. The pitch is some kind of compliant/alignment system that brings together disparate H&S processes and makes them work together.

He has provided documents — to be reviewed.

---

## How the Introduction Happened

Rory Cruden gave Graeme Philip's card — Rory thought it was interesting and passed it on. Graeme then tried the demo himself before the initial call. He reacted positively — said something to the effect of "this is actually it." Interested in running it in parallel with existing systems rather than replacing them outright.

Note: as of 8 April, Cruden have not committed to the product — they've seen a demo and Philip is awaiting yes/no. Do not refer to Cruden as a live client in any conversation with Graeme.

---

## Notes / Unclear Points

- **RAMSApp has no API** — Graeme raised this himself (before being asked), then confirmed directly with RAMSApp on 8 April. This is an active pain point, not just background info. He was trying to connect RAMSApp to something else and couldn't. What specifically he was trying to do is not yet known — ask Monday.
- Exact scope of the "agent" concept not yet defined
- Whether Philip is pitching to help them grow their customer base, or build internal tooling, or both — TBC after Monday call
- Documents from director not yet reviewed
- Pricing / what they currently pay for SaaS tools — to investigate

---

## Market Pricing Context

| Tool | Model | Notes |
|------|-------|-------|
| SafetyCulture (iAuditor) | £19–24/user/month | Inspection/audit platform — likely what Graeme uses for site reports; publicly priced |
| RAMSApp | Quote-only | UK-specific RAMS tool; no API confirmed; pricing not public |
| Assure (ex-Airsweb) | ~$20k/year+ | Enterprise; EcoOnline acquisition; overkill for Ethos Safety's scale |
| Sitemate | Quote-only | Site/project safety management; broader than just RAMS |

Graeme is probably paying for both SafetyCulture (inspections) and RAMSApp (RAMS) — two separate subscriptions for what is effectively two documents per client engagement.

---

## Next Steps

1. Confirm company name
2. Review documents from director
3. Monday call — clarify scope, agent concept, and whether Philip is building for them or alongside them
4. Investigate RAMS App and comparable H&S SaaS pricing (see cruden.md for existing research)
