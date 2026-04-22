// Bounded on-page question router for the contact page.
document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-faq-assistant]');
    if (!root) return;

    const log = root.querySelector('[data-faq-log]');
    const form = root.querySelector('[data-faq-form]');
    const input = root.querySelector('[data-faq-input]');
    const remaining = root.querySelector('[data-faq-remaining]');
    const chips = root.querySelectorAll('[data-faq-chip]');
    const maxAnswers = 4;
    let answersUsed = 0;

    const answers = {
        fit: 'quickler is a fit for teams with repeated workflows where the work happens first and the report, paperwork, or follow-up still gets rebuilt later.',
        product: 'quickler is about repeated workflows where the work happens first and the report, paperwork, or next action still gets rebuilt later.',
        start: 'Work usually starts with one repeated workflow, a short explanation of how it runs now, and a few real examples if those can be shared.',
        ai_agents: 'Some quickler workflows need more context than a normal form or chatbot can hold. In those cases the system should load the right files, rules, and workflow role before doing useful work.',
        stage: 'quickler is early. The current focus is a few narrow workflows done properly rather than a wide platform with thin claims.',
        engineers: 'No. Engineers can be a fit, but the broader pattern is any repeated workflow where useful work gets followed by too much manual write-up or admin.',
        not_ai_writer: 'No. The goal is grounded workflow help with structure, evidence, memory, and review points, not open-ended AI copy generation.',
        contact: 'This one is better handled properly. Use the contact form below and describe the workflow in plain English.',
        limit: 'That is the limit for the quick-answer tool. If you want to go further, use the contact form below.'
    };

    const intents = [
        { key: 'fit', patterns: ['who is quickler for', 'who is this for', 'fit', 'good fit', 'who is it for', 'best fit'] },
        { key: 'product', patterns: ['what does quickler do', 'what do you do', 'what actually do', 'what is quickler', 'what does it do'] },
        { key: 'start', patterns: ['how does work start', 'how do you start', 'start', 'workflow start'] },
        { key: 'ai_agents', patterns: ['ai agent', 'ai agents', 'agent', 'agents', 'copilot', 'assistant'] },
        { key: 'stage', patterns: ['what stage', 'how early', 'early', 'current stage', 'mvp'] },
        { key: 'engineers', patterns: ['engineer', 'engineers only', 'only for engineers'] },
        { key: 'not_ai_writer', patterns: ['ai writing tool', 'writing tool', 'chatgpt', 'just another ai', 'just ai'] },
        { key: 'contact', patterns: ['price', 'cost', 'quote', 'my workflow', 'my business', 'book', 'speak', 'talk', 'contact'] }
    ];

    function normalise(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function findIntent(text) {
        const value = normalise(text);
        if (!value) return null;

        for (const intent of intents) {
            if (intent.patterns.some((pattern) => value.includes(pattern))) {
                return intent.key;
            }
        }

        return null;
    }

    function appendMessage(kind, text) {
        const item = document.createElement('article');
        item.className = 'ask-message ' + (kind === 'user' ? 'ask-message-user' : 'ask-message-assistant');
        const p = document.createElement('p');
        p.textContent = text;
        item.appendChild(p);
        log.appendChild(item);
        log.scrollTop = log.scrollHeight;
    }

    function updateRemaining() {
        const left = Math.max(maxAnswers - answersUsed, 0);
        remaining.textContent = left === 1 ? '1 answer left' : left + ' answers left';
    }

    function answerQuestion(question) {
        const text = question.trim();
        if (!text) return;

        appendMessage('user', text);

        if (answersUsed >= maxAnswers) {
            appendMessage('assistant', answers.limit);
            return;
        }

        answersUsed += 1;
        updateRemaining();

        const intent = findIntent(text);
        const reply = intent ? answers[intent] : answers.contact;
        appendMessage('assistant', reply);

        if (typeof window.gtag === 'function') {
            window.gtag('event', 'faq_assistant_answer', {
                faq_intent: intent || 'fallback',
                page_path: window.location.pathname
            });
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        answerQuestion(input.value);
        input.value = '';
    });

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            answerQuestion(chip.getAttribute('data-faq-chip') || chip.textContent || '');
        });
    });

    updateRemaining();
});
