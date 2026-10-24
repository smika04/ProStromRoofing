let menuHandleScrollController = null;

export function initMenuHandleScroll() {
    // Remove previous event listeners if the function is initialized again.
    menuHandleScrollController?.abort();

    const controller = new AbortController();
    menuHandleScrollController = controller;

    const { signal } = controller;

    const header = document.querySelector('.header');
    const menuBtn = document.querySelector('#menuBtn');
    const nav = document.querySelector('#nav');
    const mobileMenuMedia = window.matchMedia('(max-width: 1020px)');

    function isMobileMenu() {
        return mobileMenuMedia.matches;
    }

    // Update the header when the page scrolls.
    function handleScroll() {
        if (!header) return;

        header.classList.toggle('is-scrolled', window.scrollY > 40);
    }

    if (header) {
        handleScroll();
    }

    if (!menuBtn || !nav) {
        if (header) {
            window.addEventListener('scroll', handleScroll, {
                passive: true,
                signal
            });
        }

        return;
    }

    menuBtn.type = 'button';

    const navLinks = nav.querySelectorAll('a');

    function setNavAccessibility(isOpen) {
        if (isMobileMenu()) {
            nav.setAttribute('aria-hidden', String(!isOpen));
            nav.inert = !isOpen;
        } else {
            nav.removeAttribute('aria-hidden');
            nav.inert = false;
        }
    }

    function setMenuOpen(isOpen) {
        const shouldOpen = isMobileMenu() && isOpen;

        nav.classList.toggle('is-open', shouldOpen);
        menuBtn.classList.toggle('is-active', shouldOpen);

        menuBtn.setAttribute('aria-expanded', String(shouldOpen));

        setNavAccessibility(shouldOpen);

        document.body.classList.toggle('lock', shouldOpen);
    }

    function toggleMenu() {
        const isOpen = nav.classList.contains('is-open');

        setMenuOpen(!isOpen);
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    // Close the menu when the user scrolls the page.
    // Avoid reacting to scroll-position changes while body scrolling is locked.
    let lastScrollY = window.scrollY;

    function handlePageScroll() {
        const currentScrollY = window.scrollY;
        const hasScrolled = currentScrollY !== lastScrollY;

        handleScroll();

        if (
            hasScrolled &&
            nav.classList.contains('is-open') &&
            !document.body.classList.contains('lock')
        ) {
            closeMenu();
        }

        lastScrollY = currentScrollY;
    }

    // Close the menu when the user attempts to scroll the page.
    // Scrolling inside the navigation itself does not close the menu.
    function handleScrollIntent(event) {
        if (!nav.classList.contains('is-open')) return;

        const target = event.target;

        if (
            target instanceof Element &&
            (nav.contains(target) || menuBtn.contains(target))
        ) {
            return;
        }

        closeMenu();
    }

    function handleMenuModeChange() {
        if (!isMobileMenu()) {
            closeMenu();
            return;
        }

        setMenuOpen(nav.classList.contains('is-open'));
    }

    // Bind the menu button only once per initialization.
    menuBtn.addEventListener('click', function (event) {
        event.preventDefault();
        toggleMenu();
    }, { signal });

    // Close the menu when a navigation link is selected.
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (isMobileMenu()) {
                closeMenu();
            }
        }, { signal });
    });

    // Close the menu with Escape.
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            closeMenu();
            menuBtn.focus();
        }
    }, { signal });

    // Update header state and close the menu on actual page scrolling.
    window.addEventListener('scroll', handlePageScroll, {
        passive: true,
        signal
    });

    // Detect scrolling intent when body scrolling is locked.
    window.addEventListener('wheel', handleScrollIntent, {
        passive: true,
        capture: true,
        signal
    });

    window.addEventListener('touchmove', handleScrollIntent, {
        passive: true,
        capture: true,
        signal
    });

    // Handle resizing across the mobile/desktop breakpoint.
    if (typeof mobileMenuMedia.addEventListener === 'function') {
        mobileMenuMedia.addEventListener(
            'change',
            handleMenuModeChange,
            { signal }
        );
    } else {
        mobileMenuMedia.addListener(handleMenuModeChange);

        signal.addEventListener('abort', function () {
            mobileMenuMedia.removeListener(handleMenuModeChange);
        }, { once: true });
    }

    // Set the initial state.
    handleMenuModeChange();
}