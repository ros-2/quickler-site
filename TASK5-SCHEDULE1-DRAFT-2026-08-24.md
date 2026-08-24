# Task 5 - DRAFT ONLY - Schedule 1 clause S1.2 special-category revision

**Not published. For your solicitor, alongside the Buckreddan side letter.**
I have not touched the live `src/pages/customer-terms.njk`.

## Where it goes

`src/pages/customer-terms.njk`, clause S1.2 (line 115). Only the LAST sentence
of the current paragraph changes; everything before "The Customer must not
submit special-category data..." stays as-is.

## Current last sentence (to be replaced)

> The Customer must not submit special-category data unless it has notified
> quickler in advance and the parties have agreed appropriate additional
> safeguards.

## Drafted replacement

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

## What is and is NOT technically true in that draft

For the solicitor - every safeguard listed is one that actually exists in code.

**TRUE, verified in code:**
- **Per-customer data isolation + cross-firm bleed guard** -
  `config_api.verify_session_firm` runs on every inbound and rejects a message
  if the cached firm no longer matches the dashboard. Verified.
- **Encryption in transit to sub-processors** - all sub-processor calls are
  HTTPS (Anthropic, Groq, OpenAI, Twilio, Resend APIs).
- **Encrypted off-site backup** - Backblaze B2 via Litestream (RUNBOOK.md:107-108).
- **Access limited to the customer's authenticated dashboard users** - dashboard
  login gates the record pages.
- **Sub-processors barred from training on the data** - stated in their API/business
  terms; the privacy policy already asserts this.
- **Breach notification (S1.8)** - backed by the operational runbook
  `quickler-engine/BREACH-RESPONSE.md` (72-hour process).

**DELIBERATELY OMITTED because NOT true in code (do not let anyone add these):**
- **Anonymisation / pseudonymisation** - `anonymise.py` is NOT called on any
  care path. Citing it would be false. Left out.
- **Input masking as a control** - Clarity's masking covers form inputs, not
  rendered record text. This was the Task 1 failure. Not cited.

**The real-world gap (your item, not a wording fix):**
- The draft promises "the parties MUST record it in writing before processing".
  The live care customer (Buckreddan) is being brought into compliance via a
  side letter you have in hand. Until that is signed, the clause and reality
  still diverge for that customer. You confirmed this is being handled; noting
  it so the solicitor sees the sequence.

## One caveat on the "encryption" wording

I wrote "encryption of the data in transit ... and encryption of the off-site
backup copy". I did NOT claim **encryption at rest on the primary database**,
because I have not verified that the Hetzner SQLite volumes are encrypted at
rest. If you want an at-rest claim, confirm the disk/volume encryption on the
prod box first - otherwise this wording stays as-is (in-transit + backup only),
which is what I could verify.
