// Scroll reveal for .reveal-on-scroll, shared across every page. Elements
// ease in when they enter the viewport and re-hide when they leave, so the
// animation re-triggers on every scroll direction. Degrades to "everything
// shown" if the observer or reduced-motion is in play.
//
// On full-page-scroll pages the scrolling happens inside .story-scroll, so
// the observer must use that element as its root (not the window) or it
// never sees the intersections.
(function () {
    function showAll(els) {
        els.forEach(function (el) { el.classList.add("is-visible"); });
    }
    function init() {
        var els = document.querySelectorAll(".reveal-on-scroll");
        if (!els.length) return;
        var reduce = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce || !("IntersectionObserver" in window)) {
            showAll(els);
            return;
        }
        var scroller = document.querySelector(".story-scroll");
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                } else {
                    entry.target.classList.remove("is-visible");
                }
            });
        }, { root: scroller || null, threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
        els.forEach(function (el) { io.observe(el); });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
