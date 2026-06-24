// Scroll reveal for .reveal-on-scroll, shared across every page. Elements
// ease in when they enter the viewport, from any scroll direction, and stay
// visible. Degrades to "everything shown" if the observer or reduced-motion
// is in play. Replaces the old homepage-only inline script.
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
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
        els.forEach(function (el) { io.observe(el); });
        // Anything already on-screen at load (e.g. landing mid-page) shows now.
        requestAnimationFrame(function () {
            els.forEach(function (el) {
                var r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) {
                    el.classList.add("is-visible");
                    io.unobserve(el);
                }
            });
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
