export function initMenuHandleScroll() {
    function handleScroll() {
        const header = document.querySelector('.header');
        const menuBtn = document.querySelector('#menuBtn');
        const nav = document.querySelector('#nav');
        const navLinks = document.querySelectorAll('.nav a');

        if (!header) return;

        if (window.scrollY > 40) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const menuBtn = document.querySelector('#menuBtn');
    const nav = document.querySelector('#nav');
    const navLinks = document.querySelectorAll('.nav a');

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
}