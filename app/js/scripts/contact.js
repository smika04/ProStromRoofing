export function initContactForm() {
    const forms = document.querySelectorAll('#estimateForm');

    forms.forEach(function (form) {
        const formMessage = form.querySelector('#formMessage');
        const contactMethodInputs = form.querySelectorAll('input[name="contact_method"]');

        const phoneField = form.querySelector('[data-contact-field="phone"]');
        const emailField = form.querySelector('[data-contact-field="email"]');

        const phoneInput = phoneField?.querySelector('input[name="phone"]');
        const emailInput = emailField?.querySelector('input[name="email"]');

        const callbackFields = form.querySelector('.form__callback');
        const callbackDayInputs = form.querySelectorAll('input[name="callback_days[]"]');
        const callbackTimeInputs = form.querySelectorAll('input[name="callback_time"]');

        const serviceDropdown = form.querySelector('[data-service-dropdown]');
        const serviceDropdownButton = serviceDropdown?.querySelector('.service-dropdown__button');
        const serviceDropdownText = serviceDropdown?.querySelector('[data-service-dropdown-text]');
        const serviceDropdownInput = serviceDropdown?.querySelector('[data-service-dropdown-input]');
        const serviceDropdownOptions = serviceDropdown?.querySelectorAll('.service-dropdown__options button');

        const photoUploader = form.querySelector('[data-photo-uploader]');
        const photoList = photoUploader?.querySelector('[data-photo-list]');
        const photoAdd = photoUploader?.querySelector('[data-photo-add]');
        const photoInput = photoUploader?.querySelector('[data-photo-input]');
        const selectedPhotos = [];
        const maxPhotos = 3;

        function updatePhotoAddVisibility() {
            if (!photoAdd) return;

            photoAdd.classList.toggle('is-hidden', selectedPhotos.length >= maxPhotos);
        }

        function renderPhotos() {
            if (!photoList) return;

            photoList.innerHTML = '';

            selectedPhotos.forEach(function (file, index) {
                const photoItem = document.createElement('div');
                photoItem.className = 'form__photo-item';

                const preview = document.createElement('img');
                preview.className = 'form__photo-preview';
                preview.src = URL.createObjectURL(file);
                preview.alt = file.name;

                preview.addEventListener('load', function () {
                    URL.revokeObjectURL(preview.src);
                });

                const name = document.createElement('span');
                name.className = 'form__photo-name';
                name.textContent = file.name;

                const removeButton = document.createElement('button');
                removeButton.className = 'form__photo-remove';
                removeButton.type = 'button';
                removeButton.textContent = 'Remove';

                removeButton.addEventListener('click', function () {
                    selectedPhotos.splice(index, 1);
                    renderPhotos();
                });

                photoItem.append(preview, name, removeButton);
                photoList.append(photoItem);
            });

            updatePhotoAddVisibility();
        }

        function resetPhotos() {
            selectedPhotos.length = 0;

            if (photoInput) {
                photoInput.value = '';
            }

            renderPhotos();
        }

        if (photoInput) {
            photoInput.addEventListener('change', function () {
                const files = Array.from(photoInput.files || []);
                const availableSlots = maxPhotos - selectedPhotos.length;

                files.slice(0, availableSlots).forEach(function (file) {
                    if (file.type.startsWith('image/')) {
                        selectedPhotos.push(file);
                    }
                });

                photoInput.value = '';
                renderPhotos();
            });

            updatePhotoAddVisibility();
        }

        function setFieldVisibility(field, input, shouldShow) {
            if (!field || !input) return;

            field.classList.toggle('is-visible', shouldShow);
            input.required = shouldShow;

            if (!shouldShow) {
                input.value = '';
            }
        }

        function updateContactFields() {
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

        function setDropdownOpen(isOpen) {
            if (!serviceDropdown || !serviceDropdownButton) return;

            serviceDropdown.classList.toggle('is-open', isOpen);
            serviceDropdownButton.setAttribute('aria-expanded', String(isOpen));
        }

        function resetServiceDropdown() {
            if (!serviceDropdown || !serviceDropdownText || !serviceDropdownInput || !serviceDropdownOptions) return;

            serviceDropdownText.textContent = 'Select a service';
            serviceDropdownInput.value = '';

            serviceDropdownOptions.forEach(function (option) {
                option.classList.remove('is-selected');
            });

            setDropdownOpen(false);
        }

        contactMethodInputs.forEach(function (input) {
            input.addEventListener('change', updateContactFields);
        });

        updateContactFields();

        if (serviceDropdown && serviceDropdownButton && serviceDropdownText && serviceDropdownInput && serviceDropdownOptions) {
            serviceDropdownButton.addEventListener('click', function () {
                const isOpen = !serviceDropdown.classList.contains('is-open');

                setDropdownOpen(isOpen);
            });

            serviceDropdownOptions.forEach(function (option) {
                option.addEventListener('click', function () {
                    serviceDropdownOptions.forEach(function (item) {
                        item.classList.remove('is-selected');
                    });

                    option.classList.add('is-selected');
                    serviceDropdownText.textContent = option.textContent.trim();
                    serviceDropdownInput.value = option.dataset.value;

                    setDropdownOpen(false);
                });
            });

            document.addEventListener('click', function (event) {
                if (!serviceDropdown.contains(event.target)) {
                    setDropdownOpen(false);
                }
            });
        }

        if (formMessage) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();

                if (serviceDropdownInput && !serviceDropdownInput.value) {
                    setDropdownOpen(true);
                    return;
                }

                form.reset();
                updateContactFields();
                resetServiceDropdown();
                resetPhotos();

                formMessage.hidden = false;

                setTimeout(function () {
                    formMessage.hidden = true;
                }, 5000);
            });
        }
    });
}