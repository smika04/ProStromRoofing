export function initMenuHandleScroll() {
    const header = document.querySelector('.header');
    const menuBtn = document.querySelector('#menuBtn');
    const nav = document.querySelector('#nav');
    const navLinks = document.querySelectorAll('.nav a');
    const mobileMenuMedia = window.matchMedia('(max-width: 1020px)');

    function handleScroll() {
        if (!header) return;

        if (window.scrollY > 40) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    function isMobileMenu() {
        return mobileMenuMedia.matches;
    }

    function setNavAccessibility(isOpen) {
        if (!nav) return;

        if (isMobileMenu()) {
            nav.setAttribute('aria-hidden', String(!isOpen));
            nav.inert = !isOpen;
            return;
        }

        nav.removeAttribute('aria-hidden');
        nav.inert = false;
    }

    function closeMenu() {
        if (!menuBtn || !nav) return;

        nav.classList.remove('is-open');
        menuBtn.classList.remove('is-active');
        menuBtn.setAttribute('aria-expanded', 'false');

        setNavAccessibility(false);

        document.body.classList.remove('lock');
    }

    function toggleMenu() {
        if (!menuBtn || !nav) return;

        const isOpen = nav.classList.toggle('is-open');

        menuBtn.classList.toggle('is-active', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));

        setNavAccessibility(isOpen);

        document.body.classList.toggle('lock', isOpen && isMobileMenu());
    }

    function closeMenuOnPageMove() {
        if (!nav || !nav.classList.contains('is-open')) return;

        closeMenu();
    }

    function handleMenuModeChange() {
        if (!menuBtn || !nav) return;

        if (isMobileMenu()) {
            const isOpen = nav.classList.contains('is-open');

            setNavAccessibility(isOpen);
            document.body.classList.toggle('lock', isOpen);
            return;
        }

        nav.classList.remove('is-open');
        menuBtn.classList.remove('is-active');
        menuBtn.setAttribute('aria-expanded', 'false');

        nav.removeAttribute('aria-hidden');
        nav.inert = false;

        document.body.classList.remove('lock');
    }

    handleScroll();

    window.addEventListener('scroll', function () {
        handleScroll();
        closeMenuOnPageMove();
    }, { passive: true });

    window.addEventListener('wheel', closeMenuOnPageMove, { passive: true });
    window.addEventListener('touchmove', closeMenuOnPageMove, { passive: true });

    if (mobileMenuMedia.addEventListener) {
        mobileMenuMedia.addEventListener('change', handleMenuModeChange);
    } else {
        mobileMenuMedia.addListener(handleMenuModeChange);
    }

    if (menuBtn && nav) {
        handleMenuModeChange();

        menuBtn.addEventListener('click', toggleMenu);

        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                if (isMobileMenu()) {
                    closeMenu();
                }
            });
        });
    }
}