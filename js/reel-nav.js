// Reel-style navigation for the full-page scroller.
//
// 1) ONE fixed down-arrow (desktop affordance): a single button pinned to
//    the viewport bottom-centre. It always points at the NEXT panel from
//    wherever you are, and hides (.is-hidden) once you reach the last panel
//    or scroll into the trailing footer region. Fixed positioning means it
//    is identical on every panel and never clipped by tall content.
// 2) Reel flick (touch): scroll-snap + snap-stop:always already land one
//    panel per flick; a light momentum clamp keeps a very hard flick to a
//    single step (Instagram-reel feel).
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

        var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

        // --- 0) TikTok-style "flick up" hint (touch + home page only) ---
        // A pulsing cue pinned over the hero that says: this scrolls. It
        // bounces a couple of times to draw the eye, lives ONLY on the first
        // panel, and disappears the instant the user scrolls. Home only so
        // it does not nag on every page; touch only because it is a flick
        // affordance, not a desktop one.
        var isHome = location.pathname === "/" || location.pathname === "/index.html";
        if (!canHover && isHome) {
            var hint = document.createElement("div");
            hint.className = "reel-hint";
            hint.setAttribute("aria-hidden", "true");
            // A vertical pill on the right edge: an upward chevron that
            // travels up the pill (the "swipe" animation) above a rotated
            // SWIPE label. Reads as a TikTok-style flick affordance.
            hint.innerHTML =
                '<span class="reel-hint-arrow">' +
                '<svg viewBox="0 0 24 24" focusable="false"><path fill="none" ' +
                'stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
                'stroke-linejoin="round" d="M6 14l6-6 6 6"/></svg></span>' +
                '<span class="reel-hint-text">Swipe</span>';
            document.body.appendChild(hint);
            var killHint = function () {
                hint.classList.add("is-gone");
                scroller.removeEventListener("scroll", killHint);
                scroller.removeEventListener("touchstart", killHint);
                setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 600);
            };
            scroller.addEventListener("scroll", killHint, { passive: true });
            scroller.addEventListener("touchstart", killHint, { passive: true });
            // Auto-retire after a few bounces even if untouched, so it is a
            // hint, not permanent furniture.
            setTimeout(killHint, 9000);
        }

        // --- 1) Single fixed down-arrow (pointer devices only) ---
        var btn = null;
        if (canHover) {
            btn = document.createElement("button");
            btn.type = "button";
            btn.className = "story-next";
            btn.setAttribute("aria-label", "Scroll to the next section");
            btn.innerHTML = ARROW;
            document.body.appendChild(btn);

            btn.addEventListener("click", function () {
                var i = currentIndex();
                if (i < panels.length - 1) {
                    panels[i + 1].scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }

        function currentIndex() {
            var h = scroller.clientHeight || 1;
            return Math.round(scroller.scrollTop / h);
        }

        function updateArrow() {
            if (!btn) return;
            var h = scroller.clientHeight || 1;
            // Hide once we are on (or past) the last panel -- i.e. when the
            // bottom of the scroll has reached the last panel / the tail.
            var nearEnd = scroller.scrollTop >= (panels.length - 1) * h - h * 0.25;
            btn.classList.toggle("is-hidden", nearEnd);
        }

        // --- 2) Reel-flick clamp (touch only) ---
        var startIndex = 0;
        if (!canHover) {
            scroller.addEventListener("touchstart", function () {
                startIndex = currentIndex();
            }, { passive: true });
        }

        var settleTimer = null;
        scroller.addEventListener("scroll", function () {
            updateArrow();
            if (canHover) return;
            if (settleTimer) clearTimeout(settleTimer);
            settleTimer = setTimeout(function () {
                var idx = currentIndex();
                var clamped = Math.max(startIndex - 1, Math.min(startIndex + 1, idx));
                clamped = Math.max(0, Math.min(panels.length - 1, clamped));
                if (clamped !== idx && panels[clamped]) {
                    panels[clamped].scrollIntoView({ behavior: "smooth", block: "start" });
                }
                startIndex = clamped;
            }, 90);
        }, { passive: true });

        updateArrow();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
