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
  // Pass static assets straight through, unchanged.
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  // Root-level SEO/static files copied verbatim.
  ["robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt", "CNAME",
   "site.json", "site.webmanifest", "favicon.ico", "favicon.svg"].forEach(f =>
    eleventyConfig.addPassthroughCopy(f));

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
