(function () {
    const CONSENT_KEY = "quickler_cookie_consent_v1";
    // Quickler site GA4 stream. Keep this separate from the older Lochross property.
    const GA_ID = "G-L0G13C0E52";
    const BANNER_ID = "quickler-cookie-banner";
    let navMenuIdCounter = 0;

    function getConsent() {
        try {
            return window.localStorage.getItem(CONSENT_KEY);
        } catch (error) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            window.localStorage.setItem(CONSENT_KEY, value);
        } catch (error) {
            return;
        }
    }

    function loadAnalytics() {
        if (window.__quicklerAnalyticsLoaded) return;

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, {
            anonymize_ip: true
        });

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
        document.head.appendChild(script);

        window.__quicklerAnalyticsLoaded = true;
    }

    function removeBanner() {
        const existing = document.getElementById(BANNER_ID);
        if (existing) existing.remove();
    }

    function openBanner() {
        removeBanner();

        const banner = document.createElement("div");
        banner.id = BANNER_ID;
        banner.className = "cookie-banner";
        banner.innerHTML = `
            <div class="cookie-banner-title">Cookie settings</div>
            <p class="cookie-banner-copy">
                quickler uses analytics cookies only if you allow them.
                They help me understand which pages are useful.
                See the <a href="/pages/privacy.html">Privacy Policy</a>.
            </p>
            <div class="cookie-banner-actions">
                <button type="button" class="cookie-button cookie-button-accept" data-cookie-action="accept">Accept analytics</button>
                <button type="button" class="cookie-button cookie-button-decline" data-cookie-action="decline">Decline</button>
                <button type="button" class="cookie-button cookie-button-settings" data-cookie-action="close">Close</button>
            </div>
        `;

        document.body.appendChild(banner);

        banner.addEventListener("click", function (event) {
            const button = event.target.closest("[data-cookie-action]");
            if (!button) return;

            const action = button.getAttribute("data-cookie-action");
            if (action === "accept") {
                setConsent("granted");
                loadAnalytics();
                removeBanner();
            } else if (action === "decline") {
                setConsent("denied");
                removeBanner();
            } else if (action === "close") {
                removeBanner();
            }
        });
    }

    function initNavigation() {
        const navs = document.querySelectorAll("nav");
        navs.forEach(function (nav) {
            const toggle = nav.querySelector(".nav-toggle");
            const menu = nav.querySelector(".nav-menu");
            if (!toggle || !menu) return;

            toggle.removeAttribute("onclick");

            if (!menu.id) {
                navMenuIdCounter += 1;
                menu.id = "primary-nav-menu-" + navMenuIdCounter;
            }

            toggle.setAttribute("aria-controls", menu.id);

            function syncState() {
                const isOpen = nav.classList.contains("nav-open");
                toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
                toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
            }

            function closeMenu() {
                nav.classList.remove("nav-open");
                syncState();
            }

            toggle.addEventListener("click", function () {
                nav.classList.toggle("nav-open");
                syncState();
            });

            document.addEventListener("click", function (event) {
                if (!event.target.closest("nav")) {
                    closeMenu();
                }
            });

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    closeMenu();
                }
            });

            menu.querySelectorAll("a").forEach(function (link) {
                link.addEventListener("click", closeMenu);
                const href = link.getAttribute("href") || "";
                const current = window.location.pathname.replace(/\/+$/, "") || "/";
                const target = href.replace(/^https?:\/\/[^/]+/, "").replace(/\/+$/, "") || "/";
                if (target === current) {
                    link.setAttribute("aria-current", "page");
                }
            });

            syncState();
        });
    }

    if (getConsent() === "granted") {
        loadAnalytics();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();

        if (!getConsent()) {
            openBanner();
        }

        document.addEventListener("click", function (event) {
            const trigger = event.target.closest("[data-cookie-settings]");
            if (!trigger) return;
            event.preventDefault();
            openBanner();
        });
    });
})();
