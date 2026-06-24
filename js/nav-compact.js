// Compact the floating top nav once the page scrolls. Adds .nav-scrolled
// (CSS shrinks padding + logo ~20%). The nav is already position:sticky,
// so it stays pinned at the top -- this only changes its height. Runs on
// every page (loaded from head.njk). Uses rAF so the scroll listener stays
// cheap, and a small hysteresis so it does not flicker at the threshold.
(function () {
    function init() {
        var nav = document.querySelector("nav");
        if (!nav) return;
        var ticking = false;
        function update() {
            var y = window.scrollY || window.pageYOffset || 0;
            if (y > 24) {
                nav.classList.add("nav-scrolled");
            } else if (y < 8) {
                nav.classList.remove("nav-scrolled");
            }
            ticking = false;
        }
        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
        update();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
