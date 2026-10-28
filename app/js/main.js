import { anim_scroll } from './global/anim_scroll.js';
import { initLogoScroll } from './global/logo_scroll.js';
import { initMenuHandleScroll } from './global/menu_hangle_scroll.js';
import { initContactForm } from './global/contact.js';
import { initSvgInject } from './global/svg-inject.js';
import { getYearsCompany } from "./global/getYearsCompany";
import { getCompanyContacts } from "./global/getCompanyContacts";

$(function () {
    function runMainScripts() {
        initMenuHandleScroll();
        anim_scroll();
        initLogoScroll();
        initContactForm();
        getYearsCompany();
        getCompanyContacts();

        if (typeof window.mainPageScript === 'function') {
            window.mainPageScript();
        }

        if (typeof window.careersPageScript === 'function') {
            window.careersPageScript();
        }

        if (typeof window.ourProjectsPageScript === 'function') {
            window.ourProjectsPageScript();
        }
    }

    initSvgInject(runMainScripts);
});