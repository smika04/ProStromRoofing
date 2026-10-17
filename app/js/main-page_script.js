export function main_script() {
    const header = document.querySelector('.header');
    const menuBtn = document.querySelector('#menuBtn');
    const nav = document.querySelector('#nav');
    const navLinks = document.querySelectorAll('.nav a');
    const form = document.querySelector('#estimateForm');
    const formMessage = document.querySelector('#formMessage');

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

    if (form && formMessage) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            form.reset();
            formMessage.hidden = false;

            setTimeout(function () {
                formMessage.hidden = true;
            }, 5000);
        });
    }

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