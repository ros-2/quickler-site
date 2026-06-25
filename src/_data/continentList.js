// Distinct continents derived from countries.json, with url-safe slugs.
// Drives the continent drill-down pages (/pages/continent-<slug>.html).
const countries = require("./countries.json");

const order = ["Europe", "North America", "South America", "Asia", "Oceania", "Africa"];

module.exports = function () {
  const names = [...new Set(countries.map((c) => c.continent).filter(Boolean))];
  names.sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return names.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    count: countries.filter((c) => c.continent === name).length,
  }));
};
