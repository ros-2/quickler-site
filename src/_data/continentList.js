// Distinct continents derived from countries.json, with url-safe slugs.
// Drives the continent drill-down pages (/pages/continent-<slug>.html).
// Each continent carries its country list ready-made so the continent page
// can render them as a real reel panel (tags block) rather than a long-form
// tail -- links in the tail get snapped away on touch and cannot be clicked.
const countries = require("./countries.json");

const order = ["Europe", "North America", "South America", "Asia", "Oceania", "Africa"];

module.exports = function () {
  const names = [...new Set(countries.map((c) => c.continent).filter(Boolean))];
  names.sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return names.map((name) => {
    const inCont = countries.filter((c) => c.continent === name);
    return {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      count: inCont.length,
      // Ready-made tags items for the continent page reel panel.
      countryTags: inCont.map((c) => ({
        label: c.name,
        href: "/pages/country-hub-" + c.slug + ".html",
      })),
    };
  });
};
