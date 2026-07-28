(function () {
    const CONSENT_KEY = "quickler_cookie_consent_v1";
    // Quickler site GA4 stream.
    const GA_ID = "G-NM61T48RDV";
    // Microsoft Clarity project ID — heatmaps + session recordings. Free.
    // Clarity sets cookies, so it stays behind explicit consent (loaded on grant).
    const CLARITY_ID = "xd0e3wnnxe";
    const BANNER_ID = "quickler-cookie-banner";
    let navMenuIdCounter = 0;

    // --- Google Consent Mode v2 ---
    // GA loads for EVERY visitor immediately, but starts in a cookieless,
    // anonymised state (analytics_storage denied). In that state GA sends
    // aggregate, non-identifying pings only — no cookie, no device ID — which
    // is lawful under UK PECR without a banner click. When the visitor clicks
    // "Yes", we upgrade analytics_storage to granted and GA starts full,
    // cookie-based tracking (and Clarity loads). This gives us traffic data
    // from everyone, and full analytics from those who consent.
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };

    function loadGtagScript() {
        if (window.__quicklerGtagScript) return;
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
        document.head.appendChild(script);
        window.__quicklerGtagScript = true;
    }

    function initConsentMode() {
        if (window.__quicklerConsentInit) return;
        const prior = getConsent();
        // Default everything to denied EXCEPT we still want anonymous pings.
        window.gtag("consent", "default", {
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            analytics_storage: prior === "granted" ? "granted" : "denied",
            wait_for_update: 500
        });
        window.gtag("js", new Date());
        // url_passthrough + ads_data_redaction keep measurement working without
        // cookies while consent is denied.
        window.gtag("set", "url_passthrough", true);
        window.gtag("set", "ads_data_redaction", true);
        window.gtag("config", GA_ID, { anonymize_ip: true });
        loadGtagScript();
        if (prior === "granted") loadClarity();
        window.__quicklerConsentInit = true;
    }

    function getConsent() {
        try {
            const fromStorage = window.localStorage.getItem(CONSENT_KEY);
            if (fromStorage) return fromStorage;
        } catch (error) {
            // fall through to the shared cookie
        }
        // Shared .quickler.co cookie - lets a choice made on any subdomain count here.
        try {
            const match = document.cookie.match(
                new RegExp("(?:^|; )" + CONSENT_KEY + "=([^;]*)")
            );
            return match ? decodeURIComponent(match[1]) : null;
        } catch (error) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            window.localStorage.setItem(CONSENT_KEY, value);
        } catch (error) {
            // localStorage may be unavailable; the cookie below still carries consent.
        }
        // Also write a cookie scoped to the parent domain so the choice is shared
        // with app.quickler.co / lab.quickler.co. The app reads this and never
        // shows its own banner. One accept here counts everywhere.
        try {
            const oneYear = 365 * 24 * 60 * 60;
            document.cookie =
                CONSENT_KEY + "=" + value +
                "; path=/; domain=.quickler.co; max-age=" + oneYear +
                "; SameSite=Lax; Secure";
        } catch (error) {
            return;
        }
    }

    // Called when the visitor clicks "Yes". GA is already running (cookieless);
    // this upgrades it to full cookie-based tracking and loads Clarity.
    function grantAnalytics() {
        window.gtag("consent", "update", {
            analytics_storage: "granted"
        });
        loadClarity();
    }

    // Microsoft Clarity — heatmaps, click maps, and session recordings.
    // Only loads behind the same consent gate as GA, and only if CLARITY_ID is set.
    function loadClarity() {
        if (!CLARITY_ID) return;
        if (window.clarity) return;
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () {
                (c[a].q = c[a].q || []).push(arguments);
            };
            t = l.createElement(r);
            t.async = 1;
            t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", CLARITY_ID);
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
            <p class="cookie-banner-copy">
                Allow analytics cookies to help us improve the site? Anonymous usage stats are collected either way. <a href="/pages/privacy.html">Privacy</a>.
            </p>
            <div class="cookie-banner-actions">
                <button type="button" class="cookie-button cookie-button-accept" data-cookie-action="accept">Yes</button>
                <button type="button" class="cookie-button cookie-button-decline" data-cookie-action="decline">No</button>
            </div>
        `;

        document.body.appendChild(banner);

        banner.addEventListener("click", function (event) {
            const button = event.target.closest("[data-cookie-action]");
            if (!button) return;

            const action = button.getAttribute("data-cookie-action");
            if (action === "accept") {
                setConsent("granted");
                grantAnalytics();
                removeBanner();
            } else if (action === "decline") {
                setConsent("denied");
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

    // Start Consent Mode on every load: GA runs immediately (cookieless if no
    // prior grant, full if previously granted). The banner only handles the
    // upgrade from denied -> granted.
    initConsentMode();

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
