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
        const serviceDropdownOptionsBox = serviceDropdown?.querySelector('.service-dropdown__options');

        const photoUploader = form.querySelector('[data-photo-uploader]');
        const photoList = photoUploader?.querySelector('[data-photo-list]');
        const photoAdd = photoUploader?.querySelector('[data-photo-add]');
        const photoInput = photoUploader?.querySelector('[data-photo-input]');
        const selectedFiles = [];

        const isResumeUploader = photoInput?.accept.includes('.pdf') ||
            photoInput?.accept.includes('.doc') ||
            photoInput?.accept.includes('.docx');

        const maxFiles = isResumeUploader ? 1 : 3;

        function getServiceDropdownOptions() {
            if (!serviceDropdownOptionsBox) return [];

            return Array.from(serviceDropdownOptionsBox.querySelectorAll('button'));
        }

        function createValueFromTitle(title) {
            return title
                .toLowerCase()
                .trim()
                .replace(/&/g, 'and')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        function setDropdownOpen(isOpen) {
            if (!serviceDropdown || !serviceDropdownButton) return;

            serviceDropdown.classList.toggle('is-open', isOpen);
            serviceDropdownButton.setAttribute('aria-expanded', String(isOpen));
        }

        function selectDropdownOption(option) {
            const serviceDropdownOptions = getServiceDropdownOptions();

            serviceDropdownOptions.forEach(function (item) {
                item.classList.remove('is-selected');
            });

            option.classList.add('is-selected');

            if (serviceDropdownText) {
                serviceDropdownText.textContent = option.textContent.trim();
            }

            if (serviceDropdownInput) {
                serviceDropdownInput.value = option.dataset.value || option.textContent.trim();
            }

            setDropdownOpen(false);
        }

        function bindServiceDropdownOptions() {
            const serviceDropdownOptions = getServiceDropdownOptions();

            serviceDropdownOptions.forEach(function (option) {
                option.addEventListener('click', function () {
                    selectDropdownOption(option);
                });
            });
        }

        function renderServiceDropdownOptions(items) {
            if (!serviceDropdownOptionsBox) return;

            serviceDropdownOptionsBox.innerHTML = '';

            items.forEach(function (item) {
                const title = item.Title || item.title || item.name || item.label;

                if (!title) return;

                const option = document.createElement('button');
                option.type = 'button';
                option.dataset.value = createValueFromTitle(title);
                option.textContent = title;

                serviceDropdownOptionsBox.append(option);
            });

            bindServiceDropdownOptions();
        }

        function loadJobsIntoDropdown() {
            if (!serviceDropdown || !serviceDropdownOptionsBox) return;

            const isCareersPage = window.location.pathname.includes('careers');

            if (!isCareersPage) {
                bindServiceDropdownOptions();
                return;
            }

            fetch('../json/jobs.json')
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Failed to load jobs.json');
                    }

                    return response.json();
                })
                .then(function (jobs) {
                    if (!Array.isArray(jobs) || jobs.length === 0) {
                        bindServiceDropdownOptions();
                        return;
                    }

                    renderServiceDropdownOptions(jobs);

                    if (serviceDropdownText) {
                        serviceDropdownText.textContent = 'Select a position';
                    }
                })
                .catch(function () {
                    bindServiceDropdownOptions();
                });
        }

        function resetServiceDropdown() {
            if (!serviceDropdown || !serviceDropdownText || !serviceDropdownInput) return;

            const isCareersPage = window.location.pathname.includes('careers');

            serviceDropdownText.textContent = isCareersPage ? 'Select a position' : 'Select a service';
            serviceDropdownInput.value = '';

            getServiceDropdownOptions().forEach(function (option) {
                option.classList.remove('is-selected');
            });

            setDropdownOpen(false);
        }

        function updateFileAddVisibility() {
            if (!photoAdd) return;

            photoAdd.classList.toggle('is-hidden', selectedFiles.length >= maxFiles);
        }

        function renderFiles() {
            if (!photoList) return;

            photoList.innerHTML = '';

            selectedFiles.forEach(function (file, index) {
                const fileItem = document.createElement('div');
                fileItem.className = 'form__photo-item';

                if (file.type.startsWith('image/')) {
                    const preview = document.createElement('img');
                    preview.className = 'form__photo-preview';
                    preview.src = URL.createObjectURL(file);
                    preview.alt = file.name;

                    preview.addEventListener('load', function () {
                        URL.revokeObjectURL(preview.src);
                    });

                    fileItem.append(preview);
                } else {
                    const fileIcon = document.createElement('span');
                    fileIcon.className = 'form__photo-preview';
                    fileIcon.textContent = '📄';

                    fileItem.append(fileIcon);
                }

                const name = document.createElement('span');
                name.className = 'form__photo-name';
                name.textContent = file.name;

                const removeButton = document.createElement('button');
                removeButton.className = 'form__photo-remove';
                removeButton.type = 'button';
                removeButton.textContent = 'Remove';

                removeButton.addEventListener('click', function () {
                    selectedFiles.splice(index, 1);
                    renderFiles();
                });

                fileItem.append(name, removeButton);
                photoList.append(fileItem);
            });

            updateFileAddVisibility();
        }

        function resetFiles() {
            selectedFiles.length = 0;

            if (photoInput) {
                photoInput.value = '';
            }

            renderFiles();
        }

        function isAllowedFile(file) {
            if (!photoInput) return false;

            const accept = photoInput.accept;

            if (!accept) return true;

            if (file.type.startsWith('image/') && accept.includes('image/*')) {
                return true;
            }

            const fileName = file.name.toLowerCase();

            return accept
                .split(',')
                .map(function (type) {
                    return type.trim().toLowerCase();
                })
                .some(function (type) {
                    return fileName.endsWith(type);
                });
        }

        if (photoInput) {
            photoInput.addEventListener('change', function () {
                const files = Array.from(photoInput.files || []);
                const availableSlots = maxFiles - selectedFiles.length;

                files.slice(0, availableSlots).forEach(function (file) {
                    if (isAllowedFile(file)) {
                        selectedFiles.push(file);
                    }
                });

                photoInput.value = '';
                renderFiles();
            });

            updateFileAddVisibility();
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

        contactMethodInputs.forEach(function (input) {
            input.addEventListener('change', updateContactFields);
        });

        updateContactFields();

        if (serviceDropdown && serviceDropdownButton && serviceDropdownText && serviceDropdownInput && serviceDropdownOptionsBox) {
            serviceDropdownButton.addEventListener('click', function () {
                const isOpen = !serviceDropdown.classList.contains('is-open');

                setDropdownOpen(isOpen);
            });

            document.addEventListener('click', function (event) {
                if (!serviceDropdown.contains(event.target)) {
                    setDropdownOpen(false);
                }
            });

            loadJobsIntoDropdown();
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
                resetFiles();

                formMessage.hidden = false;

                setTimeout(function () {
                    formMessage.hidden = true;
                }, 5000);
            });
        }
    });
}