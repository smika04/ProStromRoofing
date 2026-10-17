export function main_script() {
    const header = document.querySelector('.header');
    const menuBtn = document.querySelector('#menuBtn');
    const nav = document.querySelector('#nav');
    const navLinks = document.querySelectorAll('.nav a');
    const forms = document.querySelectorAll('#estimateForm');

    function handleScroll() {
        if (!header) return;

        if (window.scrollY > 40) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('is-open');

            menuBtn.classList.toggle('is-active', isOpen);
            menuBtn.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('lock', isOpen);
        });

        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('is-open');
                menuBtn.classList.remove('is-active');
                menuBtn.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('lock');
            });
        });
    }

    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.14
            }
        );

        revealElements.forEach(function (element) {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(function (element) {
            element.classList.add('is-visible');
        });
    }

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

                formMessage.hidden = false;

                setTimeout(function () {
                    formMessage.hidden = true;
                }, 5000);
            });
        }
    });

    const reviewSlider = $('.review_slider');

    if (reviewSlider.length && $.fn.slick) {
        reviewSlider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            arrows: false,
            dots: true,
            autoplay: true,
            autoplaySpeed: 5000,
            draggable: true,
            swipe: true,
            touchMove: true,
            accessibility: true,
            adaptiveHeight: true,
            speed: 420,
            cssEase: 'ease',
            pauseOnHover: true,
            pauseOnFocus: true
        });
    }
}