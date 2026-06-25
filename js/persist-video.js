// Lite YouTube facade + background playback for the reel walkthrough.
//
// WHY: a YouTube iframe pulls ~1.5MB+ of player JS over a dozen third-party
// requests before it shows anything -- that is the "video is slow to load".
// So we do NOT embed the iframe on page load. We render only a thumbnail and
// a play button (the facade, built in the template). Nothing hits YouTube
// until the user clicks play.
//
// ON CLICK: swap the facade for the real iframe with autoplay. It then keeps
// playing in the BACKGROUND as you flick through the reel -- it stays docked
// in its own panel, is never re-parented, so playback is naturally continuous
// (audio carries on; you see it again by scrolling back). No mini-player, no
// picture-in-picture.
(function () {
    function activate(facade) {
        if (!facade || facade.dataset.activated) return;
        var id = facade.getAttribute("data-yt");
        if (!id) return;
        facade.dataset.activated = "1";
        var iframe = document.createElement("iframe");
        // autoplay=1 so the click goes straight into playback; playsinline so
        // a phone keeps playing inline (and in the background) once scrolled
        // off; enablejsapi for completeness.
        iframe.src = "https://www.youtube-nocookie.com/embed/" + id +
            "?rel=0&autoplay=1&playsinline=1&enablejsapi=1";
        iframe.title = "Quickler walkthrough";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        // Replace the thumbnail + button with the live player.
        facade.innerHTML = "";
        facade.appendChild(iframe);
        facade.classList.add("yt-lite-live");
    }

    function init() {
        var facades = document.querySelectorAll(".yt-lite[data-yt]");
        Array.prototype.forEach.call(facades, function (facade) {
            facade.addEventListener("click", function () { activate(facade); });
            facade.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activate(facade);
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
