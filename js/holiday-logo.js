/* Holiday logo: on set days the top-left nav logo is swapped for a
 * dressed-up one (Philip 2026-10-09). ONLY the top-left logo changes.
 *
 * Same table and rules as the dashboard (quickler-dashboard
 * src/lib/holiday_logo.py). Change both together.
 * - Dates are fixed, or fixed by a rule (Easter and the days hung off it).
 * - When two windows overlap, the SHORTER one wins; on a tie, the earlier row.
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
  function one(d) { return [[d, d]]; }
  var DAYS = [
    ["new-year", function (y) { return [[D(y, 12, 31), D(y + 1, 1, 2)]]; }],
    ["burns-night", function (y) { return one(D(y, 1, 25)); }],
    ["pancake-day", function (y) { return one(add(easter(y), -47)); }],
    ["valentines-day", function (y) { return one(D(y, 2, 14)); }],
    ["st-davids-day", function (y) { return one(D(y, 3, 1)); }],
    ["first-day-of-spring", function (y) { return [[D(y, 3, 1), D(y, 3, 7)]]; }],
    ["mothers-day", function (y) { return one(add(easter(y), -21)); }],
    ["st-patricks-day", function (y) { return one(D(y, 3, 17)); }],
    ["world-water-day", function (y) { return one(D(y, 3, 22)); }],
    ["easter", function (y) { return [[add(easter(y), -2), add(easter(y), 1)]]; }],
    ["global-asbestos-awareness-week", function (y) { return [[D(y, 4, 1), D(y, 4, 7)]]; }],
    ["tartan-day", function (y) { return one(D(y, 4, 6)); }],
    ["st-georges-day", function (y) { return one(D(y, 4, 23)); }],
    ["world-health-and-safety-day", function (y) { return one(D(y, 4, 28)); }],
    ["ve-day", function (y) { return one(D(y, 5, 8)); }],
    ["first-day-of-summer", function (y) { return [[D(y, 6, 1), D(y, 6, 7)]]; }],
    ["fathers-day", function (y) { return one(nth(y, 6, 6, 3)); }],
    ["bannockburn", function (y) { return one(D(y, 6, 24)); }],
    ["action-mesothelioma-day", function (y) { return one(nth(y, 7, 4, 1)); }],
    ["independence-day", function (y) { return one(D(y, 7, 4)); }],
    ["vj-day", function (y) { return one(D(y, 8, 15)); }],
    ["world-ev-day", function (y) { return one(D(y, 9, 9)); }],
    ["battle-of-britain-day", function (y) { return one(D(y, 9, 15)); }],
    ["battle-of-hastings", function (y) { return one(D(y, 10, 14)); }],
    ["halloween", function (y) { return [[D(y, 10, 24), D(y, 10, 31)]]; }],
    ["bonfire-night", function (y) { return one(D(y, 11, 5)); }],
    ["remembrance", function (y) { return one(nth(y, 11, 6, 2)).concat(one(D(y, 11, 11))); }],
    ["st-andrews-day", function (y) { return one(D(y, 11, 30)); }],
    ["christmas", function (y) { return [[D(y, 12, 1), D(y, 12, 30)]]; }]
  ];
  function holidayFor(day) {
    var best = null, y = day.getUTCFullYear();
    DAYS.forEach(function (row, order) {
      [y - 1, y].forEach(function (yy) {
        row[1](yy).forEach(function (w) {
          if (w[0] <= day && day <= w[1]) {
            var len = (w[1] - w[0]) / 86400000;
            if (!best || len < best[0] || (len === best[0] && order < best[1])) best = [len, order, row[0]];
          }
        });
      });
    });
    return best ? best[2] : null;
  }
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
  var name = holidayFor(ukToday());
  if (!name) return;
  var img = document.querySelector("nav .nav-name img");
  if (img) img.src = "/assets/logos/holiday/" + name + ".svg";
})();
