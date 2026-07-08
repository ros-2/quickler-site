// ============================================================================
// SINGLE SOURCE OF TRUTH FOR ALL PRICING.
//
// Change pricing HERE and it updates everywhere on the site that uses the
// pricing shortcodes/filters ({% pricingCards %}, {{ pricing.sentence }}, etc.)
// and anything reading `pricing.*` in a template. No more hunting prose across
// the pages.
//
// TO CHANGE THE MODEL:
//   1. Set `model` to "seat" (or "report", "firm").
//   2. Replace `plans` with the new tiers (keep the same field shape).
//   3. Update `unit`, `perUnitLine`, `included`, `trial` as needed.
//   4. Rebuild. Every page that renders pricing via the shortcodes follows.
//
// CURRENT MODEL: per ACTIVE USER. £20 per active user per month. An active user
// is a person who produced at least one report that month. Dormant users are
// free. The first active user is always charged (£20 minimum). Everything is
// unlimited on paid (reports, photos, messages, workflows). Free tier: 20
// reports a month, up to 10 photos per report, unlimited users, free forever.
// There is NO trial. Billed monthly in arrears by UK Direct Debit. No setup fee.
//
// Pages that hardcode a custom pricing sentence in prose should instead use
// {{ pricing.sentence }} / {{ pricing.shortSentence }} so they stay in sync.
// ============================================================================

const CURRENCY = "£";

// The pricing model. One of: "report" (per completed report), "seat" (per
// active user), "firm" (flat per firm). Drives the wording helpers below.
const model = "seat";

// What one unit is, in the current model. Used in generated sentences.
const unit = {
  singular: "active user",              // "£20 per active user"
  plural: "active users",               // "only pay for active users"
  perUnitPrice: "£20",                  // headline per-unit price, or "" if not per-unit
  perUnitLine: "£20 per active user per month",
};

// The plans/tiers. Keep the SAME shape if you switch model:
//   name, price (number, monthly £), quantity (number), quantityLabel (string),
//   note (optional small print). The cards + sentences read these generically.
const plans = [
  {
    name: "Free",
    price: 0,
    quantity: 20,
    quantityLabel: "reports / month",
    note: "Up to 10 photos per report. Unlimited users. Free forever.",
  },
  {
    name: "Paid",
    price: 20,
    quantity: 1,
    quantityLabel: "active user / month",
    note: "Unlimited reports, photos and workflows. Dormant users free.",
  },
];

// What's included on every paid account (rendered as the "every plan includes"
// tags).
const included = [
  "Only pay for active users",
  "Dormant users free",
  "Unlimited reports and photos",
  "Unlimited workflows",
  "Human sign-off",
  "Evidence kept with the job",
  "PDF export",
  "No setup fee",
];

// The free trial. days: 0 disables all trial wording. The free tier (below) is
// how people try Quickler now, not a time-limited trial.
const trial = {
  days: 0,
  noCard: true,
  signupUrl: "https://app.quickler.co/signup",
};

// The free tier: how people try Quickler. No clock, no card.
const freeTier = {
  reports: 20,
  photosPerReport: 10,
  line: "Free forever: 20 reports a month, up to 10 photos per report, unlimited users. No card to start.",
  shortLine: "Free forever: 20 reports a month. No card, no trial clock.",
};

// Fair-use clause. Backs the "unlimited" promise on paid accounts: unlimited is
// for normal working use; if an account runs far above a typical mix we get in
// touch rather than cut off or surprise-charge. Reads as a promise, protects us.
const fairUse =
  "Unlimited reports, photos and messages are for normal working use. We price " +
  "assuming a typical mix of heavy, regular and occasional users across your " +
  "team, with plenty of headroom. If an account runs far above that, month " +
  "after month, we will get in touch to find a plan that fits. We will not cut " +
  "you off and we will not charge you by surprise. It is just a friendly " +
  "conversation about the right plan for how you actually use it.";

// Overflow line for big teams.
const overflowLine = "Big team? Talk to us.";

// Billing line.
const billing = "Billed monthly in arrears by UK Direct Debit. No setup fee.";

// ---- Generated, reusable wording (so prose never hardcodes numbers) ----
// Trial is off; trialLine stays empty so any template reading it renders nothing.
const trialLine = trial.days
  ? `${trial.days}-day free trial.${trial.noCard ? " No card required." : ""}`
  : "";

// A full, dense pricing sentence for prose / SEO bodies / FAQ answers.
const sentence =
  model === "seat"
    ? `${unit.perUnitLine}. An active user is someone who produced at least one report that month, so you add your whole team and only pay for who actually works. Dormant users are free. Everything is unlimited on a paid account: reports, photos, messages and workflows. ${freeTier.line} ${billing}`
    : `Plans from ${CURRENCY}${plans[0].price}/mo. ${billing}`;

// A short version for tight spots (meta descriptions, cards).
const shortSentence =
  model === "seat"
    ? `${unit.perUnitPrice} per active user per month, dormant users free. Only pay for who works. ${freeTier.shortLine}`
    : `Plans from ${CURRENCY}${plans[0].price}/mo.`;

// A plain description for guide prose, reads naturally mid-paragraph, no
// trailing full stop.
const bundleList =
  model === "seat"
    ? `${unit.perUnitPrice} per active user per month with a free tier of ${freeTier.reports} reports a month, dormant users always free`
    : plans.map((p) => `${p.name} at ${CURRENCY}${p.price} a month`).join(", ");

// The pricing headline as a sentence fragment, for prose openers.
const perReportLine = unit.perUnitLine;

module.exports = {
  currency: CURRENCY,
  model,
  unit,
  plans,
  included,
  trial,
  trialLine,
  freeTier,
  fairUse,
  overflowLine,
  billing,
  sentence,
  shortSentence,
  bundleList,
  perReportLine,
};
