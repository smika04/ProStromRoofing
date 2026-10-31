export function createTurnstileController(form, config, messageController) {
    const turnstileContainer = form.querySelector('.cf-turnstile');

    let turnstileWidgetId = null;
    let turnstileToken = '';
    let hasShownTurnstileReadyMessage = false;

    function getTurnstile() {
        if (!window || !window['turnstile']) {
            return null;
        }

        return window['turnstile'];
    }

    function renderIfNeeded() {
        const turnstile = getTurnstile();

        if (!turnstileContainer) {
            return false;
        }

        if (!turnstile || typeof turnstile['render'] !== 'function') {
            return false;
        }

        if (turnstileWidgetId !== null) {
            return true;
        }

        turnstileContainer.innerHTML = '';
        turnstileToken = '';
        hasShownTurnstileReadyMessage = false;

        turnstileWidgetId = turnstile['render'](turnstileContainer, {
            sitekey: config.turnstileSiteKey,
            theme: 'light',
            size: 'normal',
            appearance: 'always',
            execution: 'render',
            retry: 'auto',
            'retry-interval': 8000,
            callback: function (token) {
                turnstileToken = token;

                if (!hasShownTurnstileReadyMessage) {
                    hasShownTurnstileReadyMessage = true;
                    messageController.show('Human check completed. You can send the form now.', false, true);
                }
            },
            'expired-callback': function () {
                turnstileToken = '';
                hasShownTurnstileReadyMessage = false;
            },
            'error-callback': function () {
                turnstileToken = '';
                hasShownTurnstileReadyMessage = false;
                messageController.show(config.captchaUnavailableMessage, true);
            },
            'unsupported-callback': function () {
                turnstileToken = '';
                hasShownTurnstileReadyMessage = false;
                messageController.show(config.captchaUnavailableMessage, true);
            }
        });

        return true;
    }

    function init() {
        if (renderIfNeeded()) {
            return;
        }

        let attempts = 0;

        const intervalId = setInterval(function () {
            attempts += 1;

            if (renderIfNeeded() || attempts >= 80) {
                clearInterval(intervalId);
            }
        }, 100);
    }

    function getToken() {
        const turnstile = getTurnstile();

        if (turnstileToken) {
            return turnstileToken;
        }

        if (
            !turnstile ||
            turnstileWidgetId === null ||
            typeof turnstile['getResponse'] !== 'function'
        ) {
            return '';
        }

        return turnstile['getResponse'](turnstileWidgetId);
    }

    function reset() {
        const turnstile = getTurnstile();

        turnstileToken = '';
        hasShownTurnstileReadyMessage = false;

        if (
            turnstile &&
            turnstileWidgetId !== null &&
            typeof turnstile['reset'] === 'function'
        ) {
            turnstile['reset'](turnstileWidgetId);
        }
    }

    return {
        init,
        renderIfNeeded,
        getToken,
        reset
    };
}