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
            new QRCode(canvas, {
                text: wa,
                width: 200,
                height: 200,
                colorDark: "#0b1f4d",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
