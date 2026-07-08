/* Eleventy config - Quickler module-based site build.
 *
 * Output goes to _site/. During the staged migration, _site/ is NOT yet
 * what GitHub Pages serves - the live site is still the hand-written HTML
 * at the repo root. We build into _site/ and SEO-diff it against the
 * current live pages until a stage is proven, then cut over.
 *
 * Permalinks are pinned per template so generated files land at the exact
 * same paths as the current site (no URL changes, no redirects).
 */
module.exports = function (eleventyConfig) {
  // Complete index of every content page (reel pages under /pages/), so the
  // guides/all-articles page can list ALL articles and none get orphaned.
  // Excludes utility pages (demo, redirects) and the index pages themselves.
  eleventyConfig.addCollection("allArticles", (api) => {
    const skip = /\/(demo|guides|all|sitemap|404|legal|dpa)\.html$/;
    return api.getAll()
      .filter((p) => {
        const url = p.url || "";
        return url.startsWith("/pages/") && url.endsWith(".html") && !skip.test(url);
      })
      .map((p) => ({
        url: p.url,
        title: (p.data.seo && p.data.seo.title) || (p.data.hero && p.data.hero.heading) || p.fileSlug,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  });

  // Every indexable page, for the auto-generated sitemap. Excludes noindexed
  // pages (robots contains "noindex"), utility/redirect pages, and the legal
  // pages we do not want crawled as priorities. Keeps the sitemap from ever
  // going stale: it is rebuilt from the live page set on every deploy.
  eleventyConfig.addCollection("sitemapPages", (api) => {
    const skipUrl = /\/(404|sitemap)\.html$/;
    // Utility / thin / internal pages that should not be in the sitemap even
    // though they are not formally noindexed.
    const skipSlug = new Set([
      "demo", "custom", "process", "process-detail", "products", "about-detail",
    ]);
    return api.getAll()
      .filter((p) => {
        const url = p.url || "";
        if (!url.endsWith(".html")) return false;
        if (skipUrl.test(url)) return false;
        const robots = (p.data.seo && p.data.seo.robots) || p.data.robots || "";
        if (/noindex/i.test(robots)) return false;
        if (skipSlug.has(p.fileSlug)) return false;
        // Pagination-generated pages (country-hub, continent) are emitted
        // explicitly in the sitemap template from their data, because getAll()
        // collapses each paginated template to a single entry. Skip them here.
        if (/\/pages\/(country-hub|continent)-/.test(url)) return false;
        return true;
      })
      .map((p) => {
        const url = p.url === "/" ? "https://quickler.co/" : "https://quickler.co" + p.url;
        // Home + core menu pages rank highest; guides next; everything else default.
        const slug = p.fileSlug;
        let priority = "0.6";
        if (p.url === "/") priority = "1.0";
        else if (["services", "pricing", "about", "guides", "help"].includes(slug)) priority = "0.9";
        else if (/-uk$|^eicr|^cp12|^van|^dvsa|^fire|^near-miss|^risk|^coshh|^lone|^site-safety|^construction|^plumbing|^hvac|^facilities|^property|^inspection|^field-/.test(slug)) priority = "0.8";
        return { loc: url, priority };
      })
      .sort((a, b) => a.loc.localeCompare(b.loc));
  });

  // ISO date (YYYY-MM-DD) for sitemap <lastmod>.
  eleventyConfig.addFilter("isoDate", (d) => {
    const dt = d instanceof Date ? d : new Date();
    return dt.toISOString().slice(0, 10);
  });

  // ---- Pricing render helpers (single source of truth: src/_data/pricing.js) ----
  // {% pricingCards %} renders the plan/bundle grid straight from pricing.plans,
  // so a pricing change in the data file restyles every page that uses it. No
  // hardcoded prices in markup.
  const _pricing = require("./src/_data/pricing.js");
  eleventyConfig.addShortcode("pricingCards", () => {
    const cards = _pricing.plans
      .map(
        (p) =>
          `<div class="price-card"><div class="price-name">${p.name}</div>` +
          `<div class="price-figure"><span>${_pricing.currency}</span>${p.price}<span>${p.priceSuffix || "/mo"}</span></div>` +
          `<div class="price-unit">${p.quantity ? p.quantity + " " : ""}${p.quantityLabel.replace(/^[0-9]+\s*/, "")}</div>` +
          (p.note ? `<div class="price-note">${p.note}</div>` : "") +
          `</div>`
      )
      .join("");
    const n = _pricing.plans.length;
    // Cap the grid width for a small plan set so two cards centre instead of
    // stretching across the full page. --n drives the column count from data.
    const style = n <= 2 ? ` style="--n:${n};max-width:620px"` : ` style="--n:${n}"`;
    return `<div id="plans" class="story-prices"${style}>${cards}</div>`;
  });

  // {% pricingTags %} renders the "every plan includes" items as tag chips.
  eleventyConfig.addShortcode("pricingTags", () => {
    return _pricing.included
      .map((i) => `<span class="story-tag">${i}</span>`)
      .join("");
  });

  // {{ someString | priceTokens }} resolves [[price:KEY]] placeholders against
  // the pricing data file. This is the ONLY way to keep pricing single-sourced
  // inside JSON front-matter (seoBody, block text, articlePanels HTML), because
  // Nunjucks does NOT re-evaluate {{ pricing.* }} written inside a front-matter
  // string - by the time the layout renders it, it is a literal. So guide prose
  // carries stable [[price:...]] tokens; this filter fills them at build time.
  // Add a new token by adding a key here that maps to a pricing.js value.
  const _PRICE_TOKENS = {
    bundles: _pricing.bundleList,        // "£20 per active user per month with a free tier of 20 reports..."
    sentence: _pricing.sentence,         // full dense pricing sentence
    short: _pricing.shortSentence,       // tight one-liner
    trial: _pricing.trialLine,           // "" (no trial; free tier replaces it)
    free: _pricing.freeTier.line,        // "Free forever: 20 reports a month, up to 10 photos..."
    freeShort: _pricing.freeTier.shortLine, // "Free forever: 20 reports a month. No card, no trial clock."
    fairUse: _pricing.fairUse,           // fair-use clause backing every "unlimited" promise
    perReport: _pricing.perReportLine,   // "£20 per active user per month"
    overflow: _pricing.overflowLine,     // "Big team? Talk to us."
  };
  eleventyConfig.addFilter("priceTokens", (str) =>
    String(str || "").replace(/\[\[price:([a-zA-Z]+)\]\]/g, (m, key) =>
      key in _PRICE_TOKENS ? _PRICE_TOKENS[key] : m
    )
  );

  // ---- Structured data (JSON-LD) generated from content already on the page ----
  // Strip tags + decode the handful of entities our content uses, to plain text.
  const _plain = (html) =>
    String(html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // Build a schema.org FAQPage object from any articlePanels whose kind is
  // "faq". The FAQ HTML is authored as repeated <h3>question</h3><p>answer</p>
  // pairs, so we parse those into mainEntity Q/A nodes. Returns "" when there is
  // no FAQ panel, so the template emits nothing. Gives Google FAQ rich results
  // and feeds AI search engines clean Q/A pairs.
  eleventyConfig.addFilter("faqSchema", (panels) => {
    if (!Array.isArray(panels)) return "";
    const faq = panels.find((p) => p && p.kind === "faq" && p.html);
    if (!faq) return "";
    const qa = [];
    const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*((?:(?!<h3)[\s\S])*)/gi;
    let m;
    while ((m = re.exec(faq.html)) !== null) {
      const q = _plain(m[1]);
      const a = _plain(m[2]);
      if (q && a) qa.push({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      });
    }
    if (!qa.length) return "";
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: qa,
    });
  });

  // Build a schema.org Article object for a guide page from its own SEO fields.
  // Marks the page as editorial content authored by Quickler, which helps it
  // qualify for Article rich results and signals authorship to AI crawlers.
  eleventyConfig.addFilter("articleSchema", (seo) => {
    if (!seo || !seo.canonical || !seo.title) return "";
    // Freshness signals. datePublished from the page (seo.datePublished) when
    // set, else a stable default; dateModified is the build date, so every
    // rebuild/deploy refreshes it. AI engines and Google down-rank undated
    // content, so an Article without these reads as possibly stale.
    const buildDate = new Date().toISOString().slice(0, 10);
    const published = seo.datePublished || seo.dateModified || buildDate;
    const modified = seo.dateModified || buildDate;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: _plain(seo.title).slice(0, 110),
      description: _plain(seo.description),
      datePublished: published,
      dateModified: modified,
      mainEntityOfPage: { "@type": "WebPage", "@id": seo.canonical },
      url: seo.canonical,
      author: { "@type": "Organization", name: "Quickler Ltd", url: "https://quickler.co" },
      publisher: {
        "@type": "Organization",
        name: "Quickler",
        url: "https://quickler.co",
        logo: { "@type": "ImageObject", url: "https://quickler.co/assets/icons/apple-touch-icon.png" },
      },
      inLanguage: "en-GB",
    });
  });

  // Pass static assets straight through, unchanged.
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  // Speed: minify the built CSS in-place after the build. Zero dependency,
  // strips comments and collapses whitespace. The authored CSS stays readable;
  // only the deployed _site/css/*.css is minified. Safe, conservative regex.
  eleventyConfig.on("eleventy.after", async () => {
    const fs = require("fs");
    const path = require("path");
    const dir = path.join(__dirname, "_site", "css");
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".css")) continue;
      const p = path.join(dir, file);
      let css = fs.readFileSync(p, "utf8");
      const before = css.length;
      css = css
        .replace(/\/\*[\s\S]*?\*\//g, "")      // comments
        .replace(/\s*([{}:;,>])\s*/g, "$1")    // space around separators
        .replace(/;}/g, "}")                    // trailing semicolons
        .replace(/\s+/g, " ")                   // collapse whitespace
        .trim();
      fs.writeFileSync(p, css);
      console.log(`[minify-css] ${file}: ${before} -> ${css.length} bytes`);
    }
  });

  // Root-level SEO/static files copied verbatim.
  ["robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt", "CNAME",
   "site.json", "site.webmanifest", "favicon.ico", "favicon.svg",
   "privacy.html"].forEach(f =>
    eleventyConfig.addPassthroughCopy(f));

  // Static directories served verbatim (not module pages).
  eleventyConfig.addPassthroughCopy("print");
  eleventyConfig.addPassthroughCopy("docs");

  // Redirect stub pages (meta-refresh, no nav/footer) - copy verbatim.
  eleventyConfig.addPassthroughCopy("pages/contact.html");
  eleventyConfig.addPassthroughCopy("pages/custom.html");
  eleventyConfig.addPassthroughCopy("pages/dpa.html");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    // We author templates in Nunjucks + Markdown; output plain HTML.
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
