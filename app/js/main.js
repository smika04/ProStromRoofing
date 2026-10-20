import { anim_scroll } from './scripts/anim_scroll.js';
import { initLogoScroll } from './scripts/logo_scroll.js';
import { initMenuHandleScroll } from './scripts/menu_hangle_scroll.js';
import { initContactForm } from './scripts/contact.js';
import { initSvgInject } from './scripts/svg-inject.js';

$(function () {
    function runMainScripts() {
        anim_scroll();
        initLogoScroll();
        initMenuHandleScroll();
        initContactForm();

        if (typeof window.mainPageScript === 'function') {
            window.mainPageScript();
        }
    }

    initSvgInject(runMainScripts);
});