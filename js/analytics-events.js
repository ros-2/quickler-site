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

    // ---- Time on page (active engagement) ----
    // Counts seconds the tab is actually visible (pauses when backgrounded), so
    // you see real reading time, not idle tabs. Fires milestones and a final
    // total on exit. Answers "how long did this visitor actually spend here".
    var activeMs = 0, lastTick = null, milestones = [10, 30, 60, 120, 300], mHit = {};
    function nowVisible() { return document.visibilityState === 'visible'; }
    function tick() {
        var t = performance.now();
        if (lastTick !== null && nowVisible()) {
            activeMs += t - lastTick;
            var s = Math.round(activeMs / 1000);
            for (var i = 0; i < milestones.length; i++) {
                var m = milestones[i];
                if (s >= m && !mHit[m]) { mHit[m] = true; track('time_on_page', { seconds: m, page_path: window.location.pathname }); }
            }
        }
        lastTick = t;
    }
    setInterval(tick, 5000);
    document.addEventListener('visibilitychange', tick);
    // Final engaged-time on leave, so you get a total even for short visits.
    function sendFinal() {
        tick();
        track('engaged_time_total', { seconds: Math.round(activeMs / 1000), page_path: window.location.pathname });
    }
    window.addEventListener('pagehide', sendFinal);
    document.addEventListener('visibilitychange', function () { if (!nowVisible()) sendFinal(); });

    // ---- Section views (what they actually READ) ----
    // Each reel panel / major section reports once when it has been on screen
    // for >=1.5s. Tells you which parts of a page get attention and which get
    // skipped. Uses the section's eyebrow+heading as a human-readable label.
    function sectionLabel(el) {
        var eb = el.querySelector('.story-eyebrow');
        var h = el.querySelector('.story-h2, .story-h1, h1, h2');
        return ((eb ? eb.textContent + ' / ' : '') + (h ? h.textContent : (el.id || 'section'))).trim().slice(0, 90);
    }
    if ('IntersectionObserver' in window) {
        var timers = new WeakMap(), seen = new WeakSet();
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting && !seen.has(e.target)) {
                    timers.set(e.target, setTimeout(function () {
                        if (seen.has(e.target)) return;
                        seen.add(e.target);
                        track('section_view', { section: sectionLabel(e.target), page_path: window.location.pathname });
                    }, 1500));
                } else if (!e.isIntersecting && timers.has(e.target)) {
                    clearTimeout(timers.get(e.target));
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('section.story, section[id], .story-article').forEach(function (s) { io.observe(s); });
    }

    // ---- Video engagement (did they watch the walkthrough?) ----
    // The lite-YouTube facade swaps in an iframe on click; we already know a
    // click happened via the facade. Fire a video_play when a .yt-lite is
    // activated so you can see how many visitors actually start a video.
    document.addEventListener('click', function (event) {
        var lite = event.target.closest('.yt-lite, [data-yt]');
        if (!lite) return;
        var id = lite.getAttribute('data-yt') || '';
        track('video_play', { video_id: id, page_path: window.location.pathname });
    });
})();
