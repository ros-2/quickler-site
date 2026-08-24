# Policy wording for review — GDPR audit, 21 Aug 2026

Nothing below is published. Read, amend, and tell me to proceed. Every claim is
checked against the code; where I could not verify a fact I have flagged it as
**[VERIFY]** rather than assert it.

Files affected:
- `src/pages/privacy.njk` (Tasks 2, 3, 6, and the DPA-access line in Task 4)
- `pages/dpa.html` (Task 4 — static file, no .njk source)
- `src/pages/customer-terms.njk` (Task 5, clause S1.2)

---

## TASK 2 — correct the false "cascading delete" claim (privacy.njk line 97)

The audit said two claims were wrong. Reading the live page, only ONE is:
line 97 still says removing an engineer "triggers a cascading delete". Line 116
was already corrected at some point and says the opposite (records are
retained). So the fix is narrow: make line 97 agree with line 116 and with the
code.

Code truth (verified): the roster "remove engineer" button
(`dashboard.py:498` → `delete_engineer`, default `wipe_engine=False`) only
stamps `deleted_at` (a 30-day recycle bin) and cancels scheduled messages. It
does NOT delete reports, PDFs, photos or transcripts. Real erasure is a separate
admin-only path (`admin_delete_engineer`), triggered operationally by emailing
support — and even that wipes the engine-side sessions/photos/transcripts for
the phone; it does not hard-purge the dashboard's own rows (those stay
soft-deleted). Whole-record destruction only happens on a full firm delete.

**BEFORE (line 97, last sentence):**
> A customer can delete any engineer's data immediately by removing them from
> the Engineers list in the dashboard, which triggers a cascading delete of
> their WhatsApp sessions, recordings, and PDFs.

**AFTER (replace that last sentence with):**
> Removing an engineer from the Engineers list in the dashboard stops their
> conversations and cancels their scheduled messages, and takes them off the
> active roster within a 30-day restore window. It deliberately keeps their
> filed reports and records, so the customer's compliance history stays intact.
> Full erasure of an individual's captured data - their WhatsApp sessions,
> photos, voice notes and transcripts - is carried out on request by emailing
> hello@quickler.co.

This now matches line 116 exactly and matches the code. No overstatement: I do
not claim the dashboard rows are purged, only the captured data.

---

## TASK 3 — add the missing sub-processors (privacy.njk lines 77-91) and fix the Data Bridge list (line 102)

Verified data flows (evidence in the audit findings):
- **Resend** — engine POSTs email body + base64 PDF report attachments to
  `api.resend.com` (`email_smtp.py:126`). PDFs contain resident data. US.
- **Backblaze B2** — Litestream continuously replicates all three SQLite
  databases (`RUNBOOK.md:107`, ~1 sec RPO). A full offsite copy of every
  record. US.
- **Microsoft (Clarity)** — session analytics. Per Task 1 it is now removed
  from every record page; it runs only on marketing and non-record app pages.
  Must be listed as such. US.

Two more the audit did not name but the code shows receive request traffic /
minimal personal data (I recommend listing them for completeness, your call):
- **Cloudflare** — CDN/proxy in front of the public domains; sees inbound IPs.
- **UptimeRobot** — health-check pings; no record content, but it is a US
  processor touching the service. (Lower priority; happy to omit if you'd
  rather keep the list to data-bearing processors.)

**New list entries to ADD to the `<ul>` at lines 77-91** (same house style,
` - ` separators, British spelling):

```html
                    <li><strong>Resend (Plusdocs, Inc.)</strong> (United States) - transactional email delivery. Report emails, including their PDF attachments, are sent through Resend.</li>
                    <li><strong>Backblaze, Inc.</strong> (United States) - encrypted off-site database backup. A continuous replica of the product databases is held for disaster recovery.</li>
                    <li><strong>Microsoft Corporation (Clarity)</strong> (United States) - anonymised usage analytics (heatmaps and session replay) on the marketing site and on non-record pages of the dashboard only. It is not loaded on any page that displays captured records or resident data.</li>
                    <li><strong>Cloudflare, Inc.</strong> (United States) - content-delivery network and DNS in front of the Quickler domains; processes connection metadata such as IP addresses to route and protect traffic.</li>
```

**[VERIFY — Resend legal entity]** I have used "Resend (Plusdocs, Inc.)" as the
operating entity name. Confirm the exact registered name on your Resend DPA
before publishing; if unsure I will write just "Resend" with no entity suffix.

**Data Bridge fix (line 102).** Groq is listed as a sub-processor (line 82) and
receives raw resident voice audio, but is missing from the transfer-mechanism
paragraph. Also the three new US processors need a stated mechanism.

**[VERIFY — DPF certification]** The Data Bridge only applies to processors that
are actually DPF-certified. I have NOT independently confirmed the DPF status of
Groq, Resend, Backblaze or Microsoft-Clarity. Two honest options:

- If they ARE certified: add them to the Data Bridge list at line 102.
- If they are NOT (or unconfirmed): they fall under the IDTA/UK-Addendum bullet
  (line 103) instead. That bullet already exists and is the correct catch-all.

Safest publishable wording that does not assert an unverified certification —
**AFTER (line 102):**
> **UK-US Data Bridge** (an extension of the EU-US Data Privacy Framework, in
> force since 12 October 2023) for transfers to US-based sub-processors that are
> certified under the Framework. Where a US sub-processor is DPF-certified -
> which currently includes Anthropic, OpenAI, and Google - transfers rely on
> this mechanism. Twilio, Sentry (Functional Software), GitHub, Formspree, Groq,
> Resend, Backblaze and Microsoft are relied on under the UK International Data
> Transfer Agreement or UK Addendum below except where and to the extent they
> hold current DPF certification.

**[VERIFY]** I moved Twilio/Sentry/GitHub/Formspree out of the flat DPF list
because I have not re-confirmed each one's live certification and the old
sentence asserted it for all of them. If you know they are certified, I will
put them back in the first sentence. I would rather under-claim certification
than state one that has lapsed.

**Langfuse [VERIFY].** The engine `.env` on the box had no `LANGFUSE_*` keys, so
Langfuse may be disabled in production. The policy currently lists it (line 84,
"call metadata only"). I have left it as-is. If it is switched off in prod, we
should either remove it or keep it with a note. Tell me which and I will adjust.

---

## TASK 4 — make the DPA reachable to ANY customer, not just paying ones

Two changes.

**(a) privacy.njk line 108** — remove the "paying customers" qualifier.

**BEFORE:**
> ...A standalone Data Processing Agreement is available to paying customers on
> request from hello@quickler.co for sharing with their own compliance or
> procurement team.

**AFTER:**
> ...The standalone Data Processing Agreement is Schedule 1 of the Customer
> Terms and is published in full at
> <a href="/pages/dpa.html">quickler.co/pages/dpa.html</a>. It is available to
> any customer, free or paying, and a signable copy for a compliance or
> procurement team can be requested from hello@quickler.co.

**(b) pages/dpa.html** — it is currently a 0-second meta-refresh stub that
bounces to `customer-terms.html#schedule-1-data-processing-terms`. That is
technically "reachable" but reads as a dead redirect and is `noindex`. Schedule
1 is genuinely good (satisfies Article 28(3)). The cleanest fix that keeps a
single source of truth: keep the DPA content living in Schedule 1, but make
dpa.html a real, readable landing page that links straight to it rather than an
instant bounce, and let it be indexed.

Proposed dpa.html (replaces the meta-refresh with a short readable page):

> **Data Processing Agreement**
> Quickler's Data Processing Agreement is Schedule 1 of our Customer Terms. It
> forms part of every customer contract where Quickler processes personal data
> on the customer's behalf, and it satisfies the processor obligations in
> Article 28 of the UK GDPR.
> It applies to every customer, free tier or paid.
> Read it here: [Schedule 1 - Data Processing Terms](/pages/customer-terms.html#schedule-1-data-processing-terms)
> Need a countersigned copy for your compliance or procurement team? Email
> hello@quickler.co.
> Quickler Ltd. ICO registration C1910464.

**[DECISION]** Do you want dpa.html indexed (remove the `noindex`)? I recommend
yes — a reachable DPA is the point. Say the word and I will drop the noindex; if
you prefer it stays noindex I will leave that line.

---

## TASK 5 — DRAFT ONLY — customer-terms.njk clause S1.2 special-category wording

Do not publish. Solicitor to review. The current clause forbids special-category
data unless pre-agreed, while we are in fact processing resident health data
with no such agreement — the clause protects us on paper and is contradicted in
practice.

Code truth for the safeguards list (verified): `anonymise.py` is NOT called on
any care path, so I do **not** cite anonymisation. The controls that DO exist in
code: per-firm data isolation with a cross-firm bleed guard
(`config_api.verify_session_firm`), encryption in transit to all sub-processors
(HTTPS) and encrypted off-site backup, input masking is NOT reliable on record
pages so I do not cite it, access limited to the customer's own dashboard login,
sub-processors under DPA terms that bar training on the data, and the breach-
notification commitment in S1.8.

**BEFORE (last sentence of S1.2):**
> The Customer must not submit special-category data unless it has notified
> quickler in advance and the parties have agreed appropriate additional
> safeguards.

**AFTER (draft — replaces that sentence):**
> **Special-category data.** By default the Customer must not submit
> special-category data (Article 9 UK GDPR), such as health data. Where the
> Customer's use of the Service involves special-category data - for example
> care records - the parties must record that in writing in a schedule or side
> letter to the Order that names the categories of special-category data and the
> agreed safeguards, before that data is processed. Where such an agreement is in
> place, quickler will apply the following safeguards to that data: strict
> per-customer data isolation, so one customer's records are never accessible to
> another; encryption of the data in transit to and from every sub-processor, and
> encryption of the off-site backup copy; access limited to the Customer's own
> authenticated dashboard users; processing by sub-processors only under terms
> that prohibit using the data to train their models; and breach notification in
> line with clause S1.8. Absent such a written agreement, the prohibition in this
> clause applies and the Customer must not submit special-category data.

**What is and is NOT technically true in that draft (for your solicitor):**
- TRUE, in code: per-customer isolation + cross-firm bleed guard; HTTPS to
  sub-processors; encrypted Backblaze backup; dashboard auth; sub-processor
  no-train API terms; S1.8 breach process (backed by BREACH-RESPONSE.md).
- DELIBERATELY OMITTED because NOT true in code: anonymisation/pseudonymisation
  of care data (anonymise.py is dead on this path); input masking as a control
  (it does not mask rendered record text — this was Task 1).
- The draft makes a promise ("the parties MUST record it in writing before
  processing") that we are currently NOT meeting for the live care customers.
  That gap is a real-world action for you, not a wording fix: either get that
  side letter signed with the care customers, or stop processing until you do.
  I am flagging it; it is your decision.

---

## TASK 6 — add an honest health-data section to privacy.njk

Zero occurrences of "special category", "Article 9" or "health data" today.
Propose adding this `<h3>` block. Best placed right after the "Automated
decisions and AI processing" section (after line 112), before "Your rights".

```html
                <h3>Special-category and health data</h3>
                <p>Some customers use the workflow product to keep care and welfare records. When they do, the content they capture can include special-category data within the meaning of Article 9 UK GDPR - for example health information about a named person, such as weight, food and fluid intake, medication, or personal-care notes.</p>
                <p>In these cases the customer is the data controller and decides what to record and why; quickler is the data processor and handles that data only on the customer's documented instructions, under Schedule 1 of the <a href="/pages/customer-terms.html">Customer Terms</a>. A customer who intends to capture special-category data must agree that in writing with quickler in advance, including the categories involved and the safeguards that apply, before that data is processed.</p>
                <p>If you are a person written about in these records - for example a resident of a care service that uses Quickler - the service you receive care from is the controller of your data. Requests to see, correct, or erase your information are usually made to them, and they can pass an erasure instruction to quickler. You can also contact quickler directly at hello@quickler.co and we will route your request to the right controller.</p>
```

**[VERIFY]** The third paragraph tells a data subject to approach the care
provider (controller) first. That is the correct GDPR position for a processor.
Confirm you are happy with that framing.

---

## Summary of what needs YOUR input before I publish anything

1. **[VERIFY]** Resend's registered legal entity name for the sub-processor list.
2. **[VERIFY]** DPF certification status of Groq, Resend, Backblaze, Microsoft,
   Twilio, Sentry, GitHub, Formspree — decides Data Bridge vs IDTA wording. I can
   web-check these if you want; say so.
3. **[VERIFY]** Is Langfuse actually enabled in prod? (No keys were on the box.)
4. **[DECISION]** dpa.html — drop the `noindex` so the DPA is indexable? (I
   recommend yes.)
5. **[DECISION]** List Cloudflare and UptimeRobot as processors, or keep the list
   to data-bearing processors only?
6. **Task 5 is a draft for your solicitor**, and it surfaces a real-world gap:
   the live care customers have no signed special-category side letter. That is
   an operational decision for you.

Once you have answered those, I will make the edits, show you the rendered pages,
and only publish on your go.
