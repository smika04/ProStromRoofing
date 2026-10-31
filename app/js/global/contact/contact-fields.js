export function createContactFieldsController(form) {
    const contactMethodInputs = form.querySelectorAll('input[name="contact_method"]');

    const phoneField = form.querySelector('[data-contact-field="phone"]');
    const emailField = form.querySelector('[data-contact-field="email"]');

    const phoneInput = phoneField?.querySelector('input[name="phone"]');
    const emailInput = emailField?.querySelector('input[name="email"]');

    const callbackFields = form.querySelector('.form__callback');
    const callbackDayInputs = form.querySelectorAll('input[name="callback_days[]"]');
    const callbackTimeInputs = form.querySelectorAll('input[name="callback_time"]');

    function setFieldVisibility(field, input, shouldShow) {
        if (!field || !input) return;

        field.classList.toggle('is-visible', shouldShow);
        input.required = shouldShow;

        if (!shouldShow) {
            input.value = '';
        }
    }

    function update() {
        const selectedContactMethod = form.querySelector('input[name="contact_method"]:checked');
        const contactMethod = selectedContactMethod?.value;

        const shouldShowPhone = contactMethod === 'phone' || contactMethod === 'both';
        const shouldShowEmail = contactMethod === 'email' || contactMethod === 'both';
        const shouldShowCallbackFields = shouldShowPhone;

        setFieldVisibility(phoneField, phoneInput, shouldShowPhone);
        setFieldVisibility(emailField, emailInput, shouldShowEmail);

        if (callbackFields) {
            callbackFields.classList.toggle('is-visible', shouldShowCallbackFields);
        }

        callbackDayInputs.forEach(function (input) {
            if (!shouldShowCallbackFields) {
                input.checked = false;
            }
        });

        callbackTimeInputs.forEach(function (input) {
            input.required = shouldShowCallbackFields;

            if (!shouldShowCallbackFields) {
                input.checked = false;
            }
        });
    }

    function init() {
        contactMethodInputs.forEach(function (input) {
            input.addEventListener('change', update);
        });

        update();
    }

    return {
        init,
        update
    };
}
