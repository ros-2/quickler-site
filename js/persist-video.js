// Keep the reel walkthrough video playing after you scroll past it.
//
// What the user wants: press play, then keep flicking through the reel and
// the video keeps playing in the BACKGROUND (audio continues). You do NOT
// see a floating player; the video stays in its own panel and you only see
// it again by scrolling back. No picture-in-picture, no mini-player.
//
// A plain YouTube iframe already keeps playing when its panel scrolls out of
// a scroll container (it is still in the DOM, just off-screen). The only
// thing needed is enablejsapi/playsinline so mobile allows continued inline
// playback, and to make sure nothing re-parents or hides the iframe. So this
// script does the minimum: append the params once. The iframe is never
// moved, so playback is naturally continuous.
(function () {
    function init() {
        var scroller = document.querySelector(".story-scroll");
        if (!scroller) return;
        var embed = scroller.querySelector(".story-video-embed");
        if (!embed) return;
        var iframe = embed.querySelector("iframe");
        if (!iframe) return;

        // Allow JS control + inline playback so a phone keeps playing the
        // audio once the panel is scrolled off. Append once.
        if (iframe.src.indexOf("enablejsapi") === -1) {
            var join = iframe.src.indexOf("?") === -1 ? "?" : "&";
            iframe.src = iframe.src + join + "enablejsapi=1&playsinline=1";
        }
        // Nothing else: the iframe stays docked in its panel and keeps
        // playing in the background while you scroll the reel.
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
