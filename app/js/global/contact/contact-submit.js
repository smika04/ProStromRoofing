export function createSubmitController({
    form,
    config,
    messageController,
    contactFieldsController,
    serviceDropdownController,
    filesController,
    turnstileController
}) {
    const submitButton = form.querySelector('.form__submit');
    let isSubmitting = false;

    function setSubmitLoading(isLoading) {
        if (!submitButton) return;

        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Sending...' : 'Request my free estimate';
    }

    async function verifyTurnstileToken(token) {
        const response = await fetch(config.turnstileVerifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token
            })
        });

        let result = {};

        try {
            result = await response.json();
        } catch {
            result = {};
        }

        if (response.status === 429) {
            return {
                success: false,
                limited: true,
                message: result.message || config.rateLimitMessage
            };
        }

        if (!response.ok) {
            return {
                success: false,
                limited: false,
                message: result.message || config.captchaFailedMessage
            };
        }

        return {
            success: result.success === true,
            limited: result.limited === true,
            message: result.message || ''
        };
    }

    function finishSuccessfulSubmit() {
        form.reset();
        contactFieldsController.update();
        serviceDropdownController.reset();
        filesController.reset();
        turnstileController.reset();

        messageController.show(config.successMessage, false);
    }

    function init() {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (isSubmitting) {
                return;
            }

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (!serviceDropdownController.hasValue()) {
                serviceDropdownController.setOpen(true);
                return;
            }

            if (!turnstileController.renderIfNeeded()) {
                messageController.show(config.captchaLoadingMessage, true);
                return;
            }

            const token = turnstileController.getToken();

            if (!token) {
                messageController.show(config.captchaRequiredMessage, true);
                return;
            }

            isSubmitting = true;
            setSubmitLoading(true);

            try {
                const verification = await verifyTurnstileToken(token);

                if (verification.limited) {
                    turnstileController.reset();
                    messageController.show(verification.message || config.rateLimitMessage, true);
                    return;
                }

                if (!verification.success) {
                    turnstileController.reset();
                    messageController.show(verification.message || config.captchaFailedMessage, true);
                    return;
                }

                finishSuccessfulSubmit();
            } catch {
                turnstileController.reset();
                messageController.show(config.captchaUnavailableMessage, true);
            } finally {
                isSubmitting = false;
                setSubmitLoading(false);
            }
        });
    }

    return {
        init
    };
}