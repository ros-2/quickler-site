// Handle async form submission for Quickler enquiry forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[data-async-form]');

    forms.forEach(function(form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formStatus = form.querySelector('[id$="-status"]') || document.getElementById('contact-form-status');
            const submitBtnSelector = form.dataset.submitButton || 'button[type="submit"]';
            const submitBtn = form.querySelector(submitBtnSelector) || document.querySelector(submitBtnSelector);
            const feedbackTarget = form.dataset.feedbackTarget ? document.querySelector(form.dataset.feedbackTarget) : null;
            const originalText = submitBtn ? submitBtn.textContent : 'Send';
            const successMessage = form.dataset.successMessage || 'Sent';
            const successStatus = form.dataset.successStatus || 'Form submitted successfully';
            const resetDelay = Number(form.dataset.resetDelay || 10000);

            form.dataset.formState = 'submitting';
            if (formStatus) {
                formStatus.textContent = 'Submitting form';
            }
            if (feedbackTarget) {
                feedbackTarget.textContent = '';
            }

            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Form submission failed');
                }

                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'form_submit_success', {
                        form_id: form.id || form.dataset.asyncForm || 'quickler-form',
                        page_path: window.location.pathname
                    });
                }

                form.dataset.formState = 'success';
                if (formStatus) {
                    formStatus.textContent = successStatus;
                }
                if (submitBtn) {
                    submitBtn.textContent = successMessage;
                }
                if (feedbackTarget) {
                    feedbackTarget.textContent = successMessage;
                }

                setTimeout(() => {
                    form.reset();
                    form.dataset.formState = 'idle';
                    if (formStatus) {
                        formStatus.textContent = 'Form ready';
                    }
                    if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                    if (feedbackTarget) {
                        feedbackTarget.textContent = '';
                    }
                }, resetDelay);
            } catch (error) {
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'form_submit_error', {
                        form_id: form.id || form.dataset.asyncForm || 'quickler-form',
                        page_path: window.location.pathname
                    });
                }

                form.dataset.formState = 'error';
                if (formStatus) {
                    formStatus.textContent = 'Form submission failed';
                }
                if (submitBtn) {
                    submitBtn.textContent = 'Failed - try again';
                }
                if (feedbackTarget) {
                    feedbackTarget.textContent = 'Failed - try again';
                }

                setTimeout(() => {
                    form.dataset.formState = 'idle';
                    if (formStatus) {
                        formStatus.textContent = 'Form ready';
                    }
                    if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                    if (feedbackTarget) {
                        feedbackTarget.textContent = '';
                    }
                }, 3000);
            }
        });
    });
});
