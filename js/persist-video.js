// Keep the reel walkthrough video playing when its panel scrolls off.
//
// A YouTube iframe inside a scroll-snap panel pauses (or simply leaves the
// screen) once you flick past it. This keeps it alive: when the video panel
// scrolls out of view the iframe is re-parented into a small fixed
// "mini-player" pinned to a corner; scroll back to the panel and it docks
// home. The iframe element is never destroyed, so playback is continuous.
//
// Template-wide: works for any iframe inside .story-video-embed on a
// .story-scroll page, so every page that uses a video block gets it.
(function () {
    function init() {
        var scroller = document.querySelector(".story-scroll");
        if (!scroller) return;
        var embed = scroller.querySelector(".story-video-embed");
        if (!embed) return;
        var iframe = embed.querySelector("iframe");
        if (!iframe) return;

        // Ask YouTube to allow JS control + inline playback so the mini-player
        // can keep going on mobile. Only append params once.
        if (iframe.src.indexOf("enablejsapi") === -1) {
            var join = iframe.src.indexOf("?") === -1 ? "?" : "&";
            iframe.src = iframe.src + join + "enablejsapi=1&playsinline=1";
        }

        var mini = document.createElement("div");
        mini.className = "video-mini";
        mini.setAttribute("aria-hidden", "true");
        var close = document.createElement("button");
        close.type = "button";
        close.className = "video-mini-close";
        close.setAttribute("aria-label", "Close mini player");
        close.innerHTML = "&times;";
        document.body.appendChild(mini);

        var docked = true;       // true = in its panel; false = in mini-player
        var dismissed = false;    // user closed the mini-player this visit
        var seen = false;         // panel has been on-screen at least once

        function undock() {
            // Never pop the mini-player until the user has actually reached
            // the video panel once -- otherwise it shows on load because the
            // panel starts below the fold (off-screen).
            if (!docked || dismissed || !seen) return;
            mini.appendChild(iframe);
            mini.appendChild(close);
            mini.classList.add("is-on");
            docked = false;
        }
        function dock() {
            if (docked) return;
            embed.appendChild(iframe);
            mini.classList.remove("is-on");
            docked = true;
        }

        close.addEventListener("click", function () {
            dismissed = true;
            mini.classList.remove("is-on");
            // Park the iframe back home (hidden until you scroll to it) and
            // pause it via the IFrame API postMessage (no SDK needed).
            embed.appendChild(iframe);
            docked = true;
            try {
                iframe.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}', "*");
            } catch (e) {}
        });

        // Observe the video panel: off-screen -> mini, on-screen -> dock.
        var panel = embed.closest(".story") || embed;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting && en.intersectionRatio > 0.5) {
                    seen = true;       // they have now reached the video panel
                    dismissed = false; // re-arm once they return to the panel
                    dock();
                } else if (en.intersectionRatio < 0.15) {
                    undock();
                }
            });
        }, { root: scroller, threshold: [0, 0.15, 0.5, 1] });
        io.observe(panel);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
