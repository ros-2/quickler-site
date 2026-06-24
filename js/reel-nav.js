// Reel-style navigation for the full-page scroller.
//
// 1) Down-arrow (desktop affordance): injects a .story-next button into
//    every .story panel except the last. Click smooth-scrolls to the next
//    panel. CSS only shows it on hover/fine-pointer devices.
// 2) Reel flick (touch): the scroller already uses scroll-snap mandatory +
//    snap-stop:always, so a flick lands on exactly one panel. This adds a
//    light guard so a very hard flick (momentum spanning >1 panel) is
//    clamped back to the single next/prev panel -- the Instagram-reel feel
//    of "one flick, one card".
(function () {
    var ARROW =
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="none" stroke="currentColor" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>';

    function init() {
        var scroller = document.querySelector(".story-scroll");
        if (!scroller) return;
        var panels = Array.prototype.slice.call(scroller.querySelectorAll(".story"));
        if (!panels.length) return;

        // 1) Inject the down-arrow into every panel but the last.
        panels.forEach(function (panel, i) {
            if (i === panels.length - 1) return;
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "story-next";
            btn.setAttribute("aria-label", "Scroll to the next section");
            btn.innerHTML = ARROW;
            btn.addEventListener("click", function () {
                panels[i + 1].scrollIntoView({ behavior: "smooth", block: "start" });
            });
            panel.appendChild(btn);
        });

        // 2) Reel-flick clamp on touch. If a flick's momentum would carry
        //    the scroller more than one panel past where it started, pull it
        //    back to a single step. Native snap handles the common case; this
        //    only intervenes on hard flicks.
        var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
        if (canHover) return; // desktop: arrows + wheel, no flick clamp needed

        var startIndex = 0;
        function currentIndex() {
            var y = scroller.scrollTop;
            var h = scroller.clientHeight || 1;
            return Math.round(y / h);
        }
        scroller.addEventListener("touchstart", function () {
            startIndex = currentIndex();
        }, { passive: true });

        var settleTimer = null;
        scroller.addEventListener("scroll", function () {
            if (settleTimer) clearTimeout(settleTimer);
            settleTimer = setTimeout(function () {
                var idx = currentIndex();
                var maxStep = startIndex + 1;
                var minStep = startIndex - 1;
                var clamped = Math.max(minStep, Math.min(maxStep, idx));
                clamped = Math.max(0, Math.min(panels.length - 1, clamped));
                if (clamped !== idx && panels[clamped]) {
                    panels[clamped].scrollIntoView({ behavior: "smooth", block: "start" });
                }
                startIndex = clamped;
            }, 90);
        }, { passive: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
