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

        // The footer is a .story element but opts OUT of snap (height:auto,
        // scroll-snap-align:none) -- it is part of the free-scrolling tail, NOT
        // a reel panel. Long-form .story-seo regions also sit in that tail and
        // are not .story at all. The snap behaviour must key off the last REAL
        // reel panel, not the footer: otherwise mandatory snap stays on through
        // the whole tail and traps you at the last real panel, so the seoBody
        // and footer (the bottom of the page) are unreachable. This is the
        // "can't scroll to the bottom" bug on BOTH desktop and mobile.
        var snapPanels = panels.filter(function (p) {
            return !p.classList.contains("story-footer");
        });
        if (!snapPanels.length) snapPanels = panels;

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

        // --- Anchor nav inside the snap container ---
        // A native #anchor jump sets scrollTop instantly and fights the
        // scroll-snap engine, leaving the panel half-loaded with the nav
        // clipping it. Intercept same-page anchor clicks and smooth-scroll
        // the CONTAINER to the panel that holds the target instead.
        function panelFor(el) {
            while (el && el !== scroller) {
                if (el.classList && el.classList.contains("story")) return el;
                el = el.parentElement;
            }
            return null;
        }
        function scrollToHash(hash) {
            if (!hash || hash === "#") return false;
            var target;
            try { target = scroller.querySelector(hash); } catch (e) { return false; }
            if (!target) return false;
            var panel = panelFor(target) || target;
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
            return true;
        }
        document.addEventListener("click", function (e) {
            var a = e.target.closest && e.target.closest('a[href*="#"]');
            if (!a) return;
            var url = a.getAttribute("href");
            // Only same-page anchors (start with # or current path + #).
            var hash = url.indexOf("#") === 0 ? url : null;
            if (!hash && url.indexOf(location.pathname + "#") === 0) {
                hash = url.slice(url.indexOf("#"));
            }
            if (!hash) return;
            if (scrollToHash(hash)) {
                e.preventDefault();
                if (history.replaceState) history.replaceState(null, "", hash);
                // Close the mobile menu if it was open.
                var nav = document.querySelector("nav");
                if (nav) nav.classList.remove("nav-open");
            }
        });
        // Honour a hash already in the URL on load (e.g. arriving at
        // services.html#pricing from another page).
        if (location.hash) {
            setTimeout(function () { scrollToHash(location.hash); }, 200);
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
            var nearEnd = scroller.scrollTop >= (snapPanels.length - 1) * h - h * 0.25;
            btn.classList.toggle("is-hidden", nearEnd);
        }

        // --- 2) Reel-flick clamp (touch only) ---
        var startIndex = 0;
        // When a touch begins on (or inside) a link or button, the user is
        // tapping, not flicking. The clamp's "settle back to a panel" scroll
        // fires a smooth-scroll that steals the tap and reads as "the link
        // does nothing / it jumps back up". Track that and skip the clamp for
        // that gesture so every link -- including ones in the long-form tail --
        // is reliably clickable. This is the whole-site fix for "can't click
        // articles": it is independent of which panel the link sits in.
        var touchedInteractive = false;
        if (!canHover) {
            scroller.addEventListener("touchstart", function (e) {
                startIndex = currentIndex();
                touchedInteractive = !!(e.target && e.target.closest &&
                    e.target.closest('a, button, [role="button"], input, label, summary'));
            }, { passive: true });
        }

        // The last reel panel; everything below it (seoBody + footer) is the
        // free-scrolling long-form tail. Its top is where the clamp must stop
        // interfering -- otherwise scrolling into the tail gets yanked back up
        // to the last panel (the "jumps back up at the bottom" bug).
        function tailTop() {
            var last = snapPanels[snapPanels.length - 1];
            return last ? last.offsetTop + last.offsetHeight - scroller.clientHeight * 0.5 : Infinity;
        }

        // Mandatory CSS snap gives the Instagram/TikTok lock between panels,
        // but it also traps you at the last panel -- it will not release into
        // the long-form tail (seoBody + footer), so the bottom is unreachable.
        // Fix: toggle snap OFF once the last panel's bottom is near the top of
        // the viewport (entering the tail), and back ON above it. So panels
        // snap hard, and the tail scrolls like a normal document.
        var lastPanel = snapPanels[snapPanels.length - 1];
        function tailEntry() {
            // Release snap as soon as you reach the LAST panel's top (not its
            // bottom): from there down -- through the last panel into the
            // seoBody + footer -- scroll is free, so mandatory can never pin
            // you before the handler runs. Above it, panels snap hard.
            return lastPanel ? lastPanel.offsetTop - 4 : Infinity;
        }
        var snapOn = true;
        function updateSnap() {
            var inTail = scroller.scrollTop >= tailEntry();
            if (inTail && snapOn) { scroller.style.scrollSnapType = "none"; snapOn = false; }
            else if (!inTail && !snapOn) { scroller.style.scrollSnapType = "y mandatory"; snapOn = true; }
        }

        var settleTimer = null;
        scroller.addEventListener("scroll", function () {
            updateArrow();
            updateSnap();
            if (canHover) return;
            // The gesture started on a link/button: it is a tap, not a flick.
            // Never re-snap, or we steal the tap and the link "does nothing".
            if (touchedInteractive) return;
            // Once you are at/below the last panel, you are in the long-form
            // tail: do NOT clamp or re-snap. Let it scroll like a document so
            // the bottom and footer are reachable.
            if (scroller.scrollTop >= tailTop()) return;
            if (settleTimer) clearTimeout(settleTimer);
            settleTimer = setTimeout(function () {
                if (scroller.scrollTop >= tailTop()) return;
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
