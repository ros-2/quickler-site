// Demo page: render the WhatsApp QR code and wire the "Open in WhatsApp"
// button. The wa.me link is read from data-wa on #qr-canvas so the number
// lives in one place (site.json -> the template), not hardcoded here.
(function () {
    function init() {
        var canvas = document.getElementById("qr-canvas");
        var link = document.getElementById("wa-link");
        if (!canvas) return;
        var wa = canvas.getAttribute("data-wa");
        if (!wa) return;

        if (link) {
            link.setAttribute("href", wa);
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener");
        }

        if (typeof QRCode === "function") {
            // Clear any placeholder, then draw.
            canvas.innerHTML = "";
            try {
                new QRCode(canvas, {
                    text: wa,
                    width: 200,
                    height: 200,
                    colorDark: "#0b1f4d",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (e) {
                showFallback(canvas);
            }
        } else {
            // QR library did not load (blocked CDN, network). Never leave a
            // blank box: point the visitor straight at the button instead.
            showFallback(canvas);
        }
    }

    function showFallback(canvas) {
        // QR could not render: hide the empty card and the "scan" divider so
        // the "Open in WhatsApp" button is cleanly the only call to action.
        var card = canvas.closest(".qr-card");
        if (card) { card.style.display = "none"; }
        var divider = document.querySelector(".demo-or");
        if (divider) { divider.style.display = "none"; }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
