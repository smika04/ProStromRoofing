import { anim_scroll } from './global/anim_scroll.js';
import { initLogoScroll } from './global/logo_scroll.js';
import { initMenuHandleScroll } from './global/menu_hangle_scroll.js';
import { initContactForm } from './global/contact.js';
import { initSvgInject } from './global/svg-inject.js';

$(function () {
    function runMainScripts() {
        anim_scroll();
        initLogoScroll();
        initMenuHandleScroll();
        initContactForm();

        if (typeof window.mainPageScript === 'function') {
            window.mainPageScript();
        }

        if (typeof window.careersPageScript === 'function') {
            window.careersPageScript();
        }
    }

    initSvgInject(runMainScripts);
});