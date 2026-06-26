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

    // ---- Rage clicks (frustration) ----
    // 3+ clicks in the same ~30px spot within 1s = the user is jabbing at
    // something that is not responding. Strong signal of a broken/confusing UI.
    var clickBuf = [];
    document.addEventListener('click', function (event) {
        var t = performance.now();
        clickBuf = clickBuf.filter(function (c) { return t - c.t < 1000; });
        clickBuf.push({ x: event.clientX, y: event.clientY, t: t });
        var near = clickBuf.filter(function (c) {
            return Math.abs(c.x - event.clientX) < 30 && Math.abs(c.y - event.clientY) < 30;
        });
        if (near.length >= 3) {
            clickBuf = [];
            var el = event.target.closest('a,button,[role=button]') || event.target;
            track('rage_click', {
                label: (el.getAttribute && (el.getAttribute('data-cta') || el.textContent) || '').trim().slice(0, 60),
                page_path: window.location.pathname
            });
        }
    });

    // ---- Dead clicks (confusion) ----
    // A click on something that is NOT interactive (not a link/button/input).
    // Often means a user expected something to be clickable and it was not.
    document.addEventListener('click', function (event) {
        if (event.target.closest('a,button,input,textarea,select,label,[role=button],[onclick],.yt-lite,[data-yt],summary,details')) return;
        // Ignore clicks on empty page background; only count clicks on text/headings/cards.
        var meaningful = event.target.closest('h1,h2,h3,p,li,.story-card,.story-inner,img,span');
        if (!meaningful) return;
        track('dead_click', {
            tag: event.target.tagName.toLowerCase(),
            text: (event.target.textContent || '').trim().slice(0, 50),
            page_path: window.location.pathname
        });
    });

    // ---- Copy events (what they take away) ----
    // Fires when the visitor copies text. The WhatsApp number, email, or a
    // pricing figure being copied is a strong intent signal.
    document.addEventListener('copy', function () {
        var sel = (window.getSelection ? window.getSelection().toString() : '').trim();
        if (!sel) return;
        track('text_copied', { snippet: sel.slice(0, 80), length: sel.length, page_path: window.location.pathname });
    });

    // ---- Form field engagement (started but abandoned?) ----
    // First focus on any form field = the visitor began filling it. Combined
    // with form_submit_attempt, you can see start-vs-submit drop-off.
    var formStarted = {};
    document.addEventListener('focusin', function (event) {
        var field = event.target.closest('input,textarea,select');
        if (!field) return;
        var form = field.closest('form');
        var fid = (form && form.id) || 'unknown_form';
        if (formStarted[fid]) return;
        formStarted[fid] = true;
        track('form_start', { form_id: fid, page_path: window.location.pathname });
    });

    // ---- Internal navigation depth (how many pages this visit) ----
    // Counts page views within the session via sessionStorage, so you can see
    // bounce (1 page) vs genuine exploration (many pages).
    try {
        var depth = parseInt(sessionStorage.getItem('q_depth') || '0', 10) + 1;
        sessionStorage.setItem('q_depth', String(depth));
        track('page_in_session', { depth: depth, page_path: window.location.pathname });
    } catch (e) { /* private mode: skip */ }

    // ---- Landing context (how they arrived) ----
    // Referrer host + any UTM tags, reported once per page. Tells you where the
    // traffic actually comes from (search, a directory, a direct share).
    (function () {
        var params = new URLSearchParams(window.location.search);
        var ref = '';
        try { ref = document.referrer ? new URL(document.referrer).host : 'direct'; } catch (e) { ref = 'direct'; }
        track('arrival', {
            referrer_host: ref,
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            landing_path: window.location.pathname
        });
    })();
})();
