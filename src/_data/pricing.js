// ============================================================================
// SINGLE SOURCE OF TRUTH FOR ALL PRICING.
//
// Change pricing HERE and it updates everywhere on the site that uses the
// pricing shortcodes/filters ({% pricingCards %}, {{ pricing.sentence }}, etc.)
// and anything reading `pricing.*` in a template. No more hunting prose across
// 20 pages.
//
// TO CHANGE THE MODEL (e.g. go per-seat):
//   1. Set `model` to "seat" (or "report", "firm").
//   2. Replace `plans` with the new tiers (keep the same field shape).
//   3. Update `unit`, `headline`, `perUnitLine`, `included`, `trial` as needed.
//   4. Rebuild. Every page that renders pricing via the shortcodes follows.
//
// Pages that hardcode a custom pricing sentence in prose should instead use
// {{ pricing.sentence }} / {{ pricing.shortSentence }} so they stay in sync.
// ============================================================================

const CURRENCY = "£";

// The pricing model. One of: "report" (per completed report), "seat" (per
// engineer/user), "firm" (flat per firm). Drives the wording helpers below.
const model = "report";

// What one unit is, in the current model. Used in generated sentences.
const unit = {
  singular: "report",          // "one pound per report"
  plural: "reports",           // "50 reports a month"
  perUnitPrice: "£1",          // headline per-unit price, or "" if not per-unit
  perUnitLine: "One pound per completed report",
};

// The plans/bundles/tiers. Keep the SAME shape if you switch model:
//   name, price (number, monthly £), quantity (number), quantityLabel (string),
//   note (optional small print). For per-seat you'd set quantityLabel to
//   "engineers" etc. The cards + sentences read these generically.
const plans = [
  { name: "Quickler 50",  price: 50,  quantity: 50,  quantityLabel: "reports / month" },
  { name: "Quickler 100", price: 100, quantity: 100, quantityLabel: "reports / month" },
  { name: "Quickler 250", price: 250, quantity: 250, quantityLabel: "reports / month" },
  { name: "Quickler 500", price: 500, quantity: 500, quantityLabel: "reports / month" },
];

// What's included on every plan (rendered as the "every plan includes" tags).
const included = [
  "Unlimited users",
  "Unlimited workflows",
  "Human sign-off",
  "Evidence kept with the job",
  "PDF export",
  "No setup fee",
];

// The free trial. Set days to 0 to disable trial wording everywhere.
const trial = {
  days: 14,
  noCard: true,
  signupUrl: "https://app.quickler.co/signup",
};

// Over-the-top-tier overflow line (e.g. "need more than 500 a month?").
const topPlan = plans[plans.length - 1];
const overflowLine =
  model === "report"
    ? `Need more than ${topPlan.quantity} ${unit.plural} a month? Talk to us.`
    : "Need a bigger plan? Talk to us.";

// Billing line.
const billing = "Billed monthly by UK Direct Debit. No setup fee.";

// ---- Generated, reusable wording (so prose never hardcodes numbers) ----
const trialLine = trial.days
  ? `${trial.days}-day free trial.${trial.noCard ? " No card required." : ""}`
  : "";

// A full, dense pricing sentence for prose / SEO bodies / FAQ answers.
const planList = plans
  .map((p) => `${p.name} (${CURRENCY}${p.price}/mo, ${p.quantity} ${unit.plural})`)
  .join(", ");
const sentence =
  model === "report"
    ? `Priced per report, not per seat. ${unit.perUnitLine}, with ${included[0].toLowerCase()} and ${included[1].toLowerCase()} on every bundle. Bundles: ${planList}. ${overflowLine} ${trialLine} ${billing}`
    : `Plans: ${planList}. ${trialLine} ${billing}`;

// A short version for tight spots (meta descriptions, cards).
const shortSentence =
  model === "report"
    ? `One pound per completed report, unlimited users and workflows. Bundles from ${CURRENCY}${plans[0].price} to ${CURRENCY}${topPlan.price}/mo. ${trialLine}`
    : `Plans from ${CURRENCY}${plans[0].price}/mo. ${trialLine}`;

module.exports = {
  currency: CURRENCY,
  model,
  unit,
  plans,
  included,
  trial,
  trialLine,
  overflowLine,
  billing,
  sentence,
  shortSentence,
};
