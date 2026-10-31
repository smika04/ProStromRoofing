import { CONTACT_FORM_CONFIG } from './contact/contact-config.js';
import { createMessageController } from './contact/contact-message.js';
import { createContactFieldsController } from './contact/contact-fields.js';
import { createServiceDropdownController } from './contact/contact-dropdown.js';
import { createFilesController } from './contact/contact-files.js';
import { createTurnstileController } from './contact/contact-turnstile.js';
import { createSubmitController } from './contact/contact-submit.js';

export function initContactForm() {
    const forms = document.querySelectorAll('#estimateForm');

    forms.forEach(function (form) {
        const messageController = createMessageController(form);
        const contactFieldsController = createContactFieldsController(form);
        const serviceDropdownController = createServiceDropdownController(form);
        const filesController = createFilesController(form);
        const turnstileController = createTurnstileController(
            form,
            CONTACT_FORM_CONFIG,
            messageController
        );

        contactFieldsController.init();
        serviceDropdownController.init();
        filesController.init();
        turnstileController.init();

        createSubmitController({
            form,
            config: CONTACT_FORM_CONFIG,
            messageController,
            contactFieldsController,
            serviceDropdownController,
            filesController,
            turnstileController
        }).init();
    });
}