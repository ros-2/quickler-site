// Compact the floating top nav once the page scrolls. Adds .nav-scrolled
// (CSS shrinks padding + logo). The scroll happens inside the .story-scroll
// container (the full-page scroller) when present, otherwise on the window
// (normal article pages). Listens on whichever is the real scroller.
(function () {
    function init() {
        var nav = document.querySelector("nav");
        if (!nav) return;
        var scroller = document.querySelector(".story-scroll");
        function getY() {
            return scroller ? scroller.scrollTop : (window.scrollY || window.pageYOffset || 0);
        }
        var ticking = false;
        function update() {
            var y = getY();
            if (y > 24) {
                nav.classList.add("nav-scrolled");
            } else if (y < 8) {
                nav.classList.remove("nav-scrolled");
            }
            ticking = false;
        }
        var target = scroller || window;
        target.addEventListener("scroll", function () {
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
