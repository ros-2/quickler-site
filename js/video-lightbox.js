// Video lightbox: opens the Quickler walkthrough in a popup overlay instead
// of a new tab. The YouTube iframe is injected only on open (no load cost
// until used) and torn down on close (stops playback).
(function () {
    var VIDEO_ID = "q8qgenxcM3w";
    var box = document.getElementById("video-lightbox");
    var frame = document.getElementById("video-lightbox-frame");
    if (!box || !frame) return;
    var lastFocus = null;

    function open() {
        lastFocus = document.activeElement;
        frame.innerHTML =
            '<iframe src="https://www.youtube-nocookie.com/embed/' + VIDEO_ID +
            '?rel=0&autoplay=1" title="Quickler walkthrough" ' +
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
            'allowfullscreen></iframe>';
        box.hidden = false;
        document.body.style.overflow = "hidden";
        var closeBtn = box.querySelector(".video-lightbox-close");
        if (closeBtn) closeBtn.focus();
    }

    function close() {
        box.hidden = true;
        frame.innerHTML = "";
        document.body.style.overflow = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
        if (e.target.closest("[data-video-open]")) { e.preventDefault(); open(); }
        else if (e.target.closest("[data-video-close]")) { e.preventDefault(); close(); }
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !box.hidden) close();
    });
})();
