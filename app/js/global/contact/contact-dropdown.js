export function createServiceDropdownController(form) {
    const serviceDropdown = form.querySelector('[data-service-dropdown]');
    const serviceDropdownButton = serviceDropdown?.querySelector('.service-dropdown__button');
    const serviceDropdownText = serviceDropdown?.querySelector('[data-service-dropdown-text]');
    const serviceDropdownInput = serviceDropdown?.querySelector('[data-service-dropdown-input]');
    const serviceDropdownOptionsBox = serviceDropdown?.querySelector('.service-dropdown__options');

    function getOptions() {
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

    function setOpen(isOpen) {
        if (!serviceDropdown || !serviceDropdownButton) return;

        serviceDropdown.classList.toggle('is-open', isOpen);
        serviceDropdownButton.setAttribute('aria-expanded', String(isOpen));
    }

    function selectOption(option) {
        getOptions().forEach(function (item) {
            item.classList.remove('is-selected');
        });

        option.classList.add('is-selected');

        if (serviceDropdownText) {
            serviceDropdownText.textContent = option.textContent.trim();
        }

        if (serviceDropdownInput) {
            serviceDropdownInput.value = option.dataset.value || option.textContent.trim();
        }

        setOpen(false);
    }

    function bindOptions() {
        getOptions().forEach(function (option) {
            option.addEventListener('click', function () {
                selectOption(option);
            });
        });
    }

    function renderOptions(items) {
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

        bindOptions();
    }

    function loadJobsIntoDropdown() {
        if (!serviceDropdown || !serviceDropdownOptionsBox) return;

        const isCareersPage = window.location.pathname.includes('careers');

        if (!isCareersPage) {
            bindOptions();
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
                    bindOptions();
                    return;
                }

                renderOptions(jobs);

                if (serviceDropdownText) {
                    serviceDropdownText.textContent = 'Select a position';
                }
            })
            .catch(function () {
                bindOptions();
            });
    }

    function reset() {
        if (!serviceDropdown || !serviceDropdownText || !serviceDropdownInput) return;

        const isCareersPage = window.location.pathname.includes('careers');

        serviceDropdownText.textContent = isCareersPage ? 'Select a position' : 'Select a service';
        serviceDropdownInput.value = '';

        getOptions().forEach(function (option) {
            option.classList.remove('is-selected');
        });

        setOpen(false);
    }

    function hasValue() {
        if (!serviceDropdownInput) {
            return true;
        }

        return Boolean(serviceDropdownInput.value);
    }

    function init() {
        if (!serviceDropdown || !serviceDropdownButton || !serviceDropdownText || !serviceDropdownInput || !serviceDropdownOptionsBox) {
            return;
        }

        serviceDropdownButton.addEventListener('click', function () {
            const isOpen = !serviceDropdown.classList.contains('is-open');

            setOpen(isOpen);
        });

        document.addEventListener('click', function (event) {
            if (!serviceDropdown.contains(event.target)) {
                setOpen(false);
            }
        });

        loadJobsIntoDropdown();
    }

    return {
        init,
        reset,
        hasValue,
        setOpen
    };
}
