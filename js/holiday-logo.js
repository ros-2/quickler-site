/* Holiday logo: on set days the top-left nav logo is swapped for a
 * dressed-up one (Philip 2026-10-09). ONLY the top-left logo changes.
 * Hovering it says what the day is; clicking still goes home.
 *
 * Same table and rules as the dashboard (quickler-dashboard
 * src/lib/holiday_logo.py). Change both together.
 * - Dates are fixed, or fixed by a rule (Easter and the days hung off it).
 * - When two days fall together, the MORE IMPORTANT one shows; on a tie,
 *   the earlier row.
 * - The date is the UK date (Europe/London).
 * - Preview any day with ?logo-date=YYYY-MM-DD.
 */
(function () {
  function D(y, m, d) { return new Date(Date.UTC(y, m - 1, d)); }
  function add(dt, n) { return new Date(dt.getTime() + n * 86400000); }
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var n = h + l - 7 * m + 114;
    return D(y, Math.floor(n / 31), (n % 31) + 1);
  }
  // n-th weekday (Mon=0 .. Sun=6) of a month, n from 1
  function nth(y, mo, wd, n) {
    var first = D(y, mo, 1), fw = (first.getUTCDay() + 6) % 7;
    return add(first, ((wd - fw + 7) % 7) + 7 * (n - 1));
  }
  function leap(y) { return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0); }
  function on(d, imp) { return [[d, d, imp]]; }
  function span(a, b, imp) { return [[a, b, imp]]; }
  var DAYS = [
    ["new-year", "Hogmanay and New Year", function (y) { return span(D(y, 12, 31), D(y + 1, 1, 2), 8); }],
    ["burns-night", "25 January: Burns Night, for Robert Burns (born 1759)", function (y) { return on(D(y, 1, 25), 7); }],
    ["pancake-day", "Shrove Tuesday: Pancake Day", function (y) { return on(add(easter(y), -47), 6); }],
    ["valentines-day", "14 February: Valentine's Day", function (y) { return on(D(y, 2, 14), 6.5); }],
    ["patrick-hamilton", "29 February 1528: Patrick Hamilton, first martyr of the Scottish Reformation, burned at St Andrews", function (y) { return on(leap(y) ? D(y, 2, 29) : D(y, 2, 28), 4); }],
    ["st-davids-day", "1 March: St David's Day", function (y) { return on(D(y, 3, 1), 7); }],
    ["forth-bridge", "4 March 1890: the Forth Bridge opens", function (y) { return on(D(y, 3, 4), 4); }],
    ["first-day-of-spring", "The first week of spring", function (y) { return span(D(y, 3, 1), D(y, 3, 7), 2); }],
    ["mothers-day", "Mothering Sunday", function (y) { return on(add(easter(y), -21), 7.5); }],
    ["st-patricks-day", "17 March: St Patrick's Day", function (y) { return on(D(y, 3, 17), 6); }],
    ["david-livingstone", "19 March 1813: David Livingstone is born in Blantyre", function (y) { return on(D(y, 3, 19), 4); }],
    ["world-water-day", "22 March: World Water Day", function (y) { return on(D(y, 3, 22), 4); }],
    ["covid-lockdown", "23 March 2020: the first Covid lockdown. A day of reflection", function (y) { return on(D(y, 3, 23), 5); }],
    ["slave-trade-act", "25 March 1807: the Slave Trade Act becomes law", function (y) { return on(D(y, 3, 25), 6); }],
    ["easter", "Easter", function (y) { return span(add(easter(y), -2), add(easter(y), 1), 9); }],
    ["global-asbestos-awareness-week", "Global Asbestos Awareness Week", function (y) { return span(D(y, 4, 1), D(y, 4, 7), 3); }],
    ["tartan-day", "6 April: Tartan Day, for the Declaration of Arbroath (1320)", function (y) { return on(D(y, 4, 6), 5); }],
    ["dietrich-bonhoeffer", "9 April 1945: Dietrich Bonhoeffer is executed", function (y) { return on(D(y, 4, 9), 5); }],
    ["st-georges-day", "23 April: St George's Day", function (y) { return on(D(y, 4, 23), 7); }],
    ["world-health-and-safety-day", "28 April: World Day for Safety and Health at Work", function (y) { return on(D(y, 4, 28), 5); }],
    ["union-1707", "1 May 1707: the Union of the Parliaments", function (y) { return on(D(y, 5, 1), 4); }],
    ["king-james-bible", "2 May 1611: the King James Bible is published", function (y) { return on(D(y, 5, 2), 5); }],
    ["ve-day", "8 May 1945: VE Day", function (y) { return on(D(y, 5, 8), 7); }],
    ["robert-murray-mcheyne", "21 May 1813: Robert Murray M'Cheyne is born in Edinburgh", function (y) { return on(D(y, 5, 21), 4); }],
    ["first-day-of-summer", "The first week of summer", function (y) { return span(D(y, 6, 1), D(y, 6, 7), 2); }],
    ["magna-carta", "15 June 1215: Magna Carta is sealed at Runnymede", function (y) { return on(D(y, 6, 15), 5); }],
    ["battle-of-waterloo", "18 June 1815: the Battle of Waterloo", function (y) { return on(D(y, 6, 18), 5); }],
    ["fathers-day", "Father's Day", function (y) { return on(nth(y, 6, 6, 3), 6); }],
    ["bannockburn", "24 June 1314: the Battle of Bannockburn", function (y) { return on(D(y, 6, 24), 5); }],
    ["battle-of-the-somme", "1 July 1916: the first day of the Somme", function (y) { return on(D(y, 7, 1), 6); }],
    ["action-mesothelioma-day", "Action Mesothelioma Day", function (y) { return on(nth(y, 7, 4, 1), 5); }],
    ["independence-day", "4 July: Independence Day (US)", function (y) { return on(D(y, 7, 4), 3); }],
    ["eric-liddell", "11 July 1924: Eric Liddell wins the 400 metres in Paris", function (y) { return on(D(y, 7, 11), 5); }],
    ["vj-day", "15 August 1945: VJ Day", function (y) { return on(D(y, 8, 15), 6); }],
    ["world-ev-day", "9 September: World EV Day", function (y) { return on(D(y, 9, 9), 4); }],
    ["battle-of-britain-day", "15 September 1940: Battle of Britain Day", function (y) { return on(D(y, 9, 15), 5); }],
    ["william-tyndale", "6 October 1536: William Tyndale is executed. \"Lord, open the King of England's eyes\"", function (y) { return on(D(y, 10, 6), 5); }],
    ["battle-of-hastings", "14 October 1066: the Battle of Hastings", function (y) { return on(D(y, 10, 14), 5); }],
    ["trafalgar-day", "21 October 1805: the Battle of Trafalgar", function (y) { return on(D(y, 10, 21), 5); }],
    ["halloween", "Halloween, and Reformation Day: Luther's 95 Theses, 31 October 1517", function (y) { return span(D(y, 10, 24), D(y, 10, 30), 4).concat(on(D(y, 10, 31), 7)); }],
    ["remembrance", "Remembrance: we will remember them", function (y) { return span(D(y, 11, 1), D(y, 11, 11), 4).concat(on(nth(y, 11, 6, 2), 10), on(D(y, 11, 11), 10)); }],
    ["bonfire-night", "5 November: Bonfire Night", function (y) { return on(D(y, 11, 5), 6); }],
    ["st-andrews-day", "30 November: St Andrew's Day", function (y) { return on(D(y, 11, 30), 8); }],
    ["westminster-confession", "4 December 1646: the Westminster Confession of Faith is completed", function (y) { return on(D(y, 12, 4), 4); }],
    ["christmas", "Christmas", function (y) { return span(D(y, 12, 1), D(y, 12, 30), 3).concat(span(D(y, 12, 24), D(y, 12, 26), 10)); }]
  ];
  function holidayFor(day) {
    var best = null, y = day.getUTCFullYear();
    DAYS.forEach(function (row, order) {
      [y - 1, y].forEach(function (yy) {
        row[2](yy).forEach(function (w) {
          if (w[0] <= day && day <= w[1]) {
            if (!best || w[2] > best[0] || (w[2] === best[0] && order < best[1])) best = [w[2], order, row];
          }
        });
      });
    });
    return best ? best[2] : null;
  }
  if (typeof module !== "undefined" && module.exports) { module.exports = { holidayFor: holidayFor, D: D }; return; }
  function ukToday() {
    var q = /[?&]logo-date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    if (q) return D(+q[1], +q[2], +q[3]);
    try {
      var p = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric" })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return D(+p.year, +p.month, +p.day);
    } catch (e) {
      var n = new Date();
      return D(n.getFullYear(), n.getMonth() + 1, n.getDate());
    }
  }
  var row = holidayFor(ukToday());
  if (!row) return;
  var img = document.querySelector("nav .nav-name img");
  if (!img) return;
  img.src = "/assets/logos/holiday/" + row[0] + ".svg";
  img.title = row[1];
  // The holiday picture holds the word plus its extras in a wider box
  // (viewBox -62 -32 1054 228 against the plain logo's 0 0 850 200). Scale it
  // so the letters are the plain logo's size and sit where its letters sit;
  // the extras spill outside the box and nothing else on the page moves.
  img.style.transform = "scale(1.14)";
  img.style.transformOrigin = "47.9% 114.29%";
  // On the coloured bar the logo sits in a white pill as tall as the bar,
  // filling its left end, and the bar gets a thin white edge so the two
  // read as one piece (Philip 2026-10-09). The pill reaches the bar's edges
  // by taking back the bar's own padding, so it follows the bar as it
  // shrinks on scroll and on small screens.
  var nav = img.closest("nav"), a = img.closest("a");
  if (!nav || !a) return;
  var css = document.createElement("style");
  css.textContent =
    "nav.nav-holiday{border:2px solid #fff !important}" +
    "nav.nav-holiday.nav-scrolled{border-width:0 0 2px 0 !important}" +
    "nav.nav-holiday .nav-name{background:#fff;border-radius:999px;align-self:stretch}";
  document.head.appendChild(css);
  nav.classList.add("nav-holiday");
  function fit() {
    var cs = getComputedStyle(nav), h = img.offsetHeight || 38;
    a.style.marginTop = "-" + cs.paddingTop;
    a.style.marginBottom = "-" + cs.paddingBottom;
    a.style.marginLeft = "-" + cs.paddingLeft;
    a.style.paddingLeft = cs.paddingLeft;
    a.style.paddingRight = Math.round(0.34 * h + 8) + "px";
  }
  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("scroll", function () { requestAnimationFrame(fit); }, { passive: true });
  img.addEventListener("load", fit);
  nav.addEventListener("transitionend", fit);
})();
