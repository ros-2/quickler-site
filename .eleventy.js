/* Eleventy config — Quickler module-based site build.
 *
 * Output goes to _site/. During the staged migration, _site/ is NOT yet
 * what GitHub Pages serves — the live site is still the hand-written HTML
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

  // Pass static assets straight through, unchanged.
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  // Speed: minify the built CSS in-place after the build. Zero dependency —
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

  // Redirect stub pages (meta-refresh, no nav/footer) — copy verbatim.
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
