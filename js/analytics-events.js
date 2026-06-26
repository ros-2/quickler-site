// Conversion + engagement tracking for GA4. Fires named events for the
// high-value actions (WhatsApp, demo, app/login) so they can be marked as key
// events in GA4 individually, plus generic CTA clicks, form attempts, scroll
// depth, and outbound clicks. No-ops until gtag exists (i.e. after consent).
(function () {
    function track(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, params || {});
    }

    document.addEventListener('click', function (event) {
        const link = event.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        const label = (link.getAttribute('data-cta') || link.textContent || '').trim().slice(0, 80);
        const path = window.location.pathname;

        // High-value, named conversions -- each can be a separate key event.
        if (/wa\.me|whatsapp/i.test(href)) {
            track('whatsapp_click', { link_url: href, link_label: label, page_path: path });
        } else if (/\/pages\/demo/.test(href)) {
            track('demo_click', { link_label: label, page_path: path });
        } else if (/app\.quickler\.co/.test(href)) {
            track('app_click', { link_url: href, link_label: label, page_path: path });
        }

        // Generic CTA click (any styled button), kept for funnel breadth.
        if (link.classList.contains('btn')) {
            track('cta_click', { cta_label: label, cta_target: href, page_path: path });
        }

        // Outbound clicks (different host) -- useful for spotting exit points.
        try {
            const u = new URL(href, window.location.href);
            if (u.host && u.host !== window.location.host && /^https?:/.test(u.protocol)) {
                track('outbound_click', { link_url: u.href, page_path: path });
            }
        } catch (e) { /* relative/invalid href: ignore */ }
    });

    document.addEventListener('submit', function (event) {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;
        track('form_submit_attempt', {
            form_id: form.id || 'unknown_form',
            page_path: window.location.pathname
        });
    });

    // Scroll depth: fire once each at 25/50/75/90%. Tells you whether the long
    // reel pages are actually read or bounced. Throttled via a passive listener.
    var marks = [25, 50, 75, 90], hit = {};
    function pctFrom(el) {
        var height = (el.scrollHeight - el.clientHeight) || 1;
        return Math.round((el.scrollTop / height) * 100);
    }
    function onScroll(el) {
        var pct = pctFrom(el);
        for (var i = 0; i < marks.length; i++) {
            var m = marks[i];
            if (pct >= m && !hit[m]) {
                hit[m] = true;
                track('scroll_depth', { percent: m, page_path: window.location.pathname });
            }
        }
    }
    // Reel pages scroll inside .story-scroll; normal pages scroll the document.
    // Listen on whichever exists.
    var reel = document.querySelector('.story-scroll');
    if (reel) {
        reel.addEventListener('scroll', function () { onScroll(reel); }, { passive: true });
    }
    window.addEventListener('scroll', function () { onScroll(document.documentElement); }, { passive: true });
})();
