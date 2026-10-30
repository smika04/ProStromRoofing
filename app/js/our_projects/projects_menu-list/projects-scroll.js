import { HEADER_SCROLL_OFFSET, PAGE_ANIMATION_DURATION } from "./projects-config.js";

export function scrollToPosition(top, behavior = "smooth") {
    window.requestAnimationFrame(function () {
        window.scrollTo({
            top,
            behavior
        });
    });
}

export function getElementTop(element, offset = HEADER_SCROLL_OFFSET) {
    if (!element) {
        return 0;
    }

    return Math.max(element.getBoundingClientRect().top + window.scrollY - offset, 0);
}

export function scrollToElement(element, behavior = "smooth") {
    scrollToPosition(getElementTop(element), behavior);
}

export function restartAnimation(element, animationClass) {
    if (!element) {
        return;
    }

    element.classList.remove(animationClass);

    requestAnimationFrame(function () {
        element.classList.add(animationClass);
    });
}

export function createSectionSwitcher() {
    let isSwitchingSections = false;

    return function switchSections(sectionToHide, sectionToShow, onComplete) {
        if (isSwitchingSections) {
            sectionToHide.hidden = true;
            sectionToHide.classList.remove("is-entering", "is-leaving");

            sectionToShow.hidden = false;
            sectionToShow.classList.remove("is-entering", "is-leaving");

            if (typeof onComplete === "function") {
                onComplete();
            }

            return;
        }

        isSwitchingSections = true;

        sectionToHide.classList.remove("is-entering");
        sectionToHide.classList.add("is-leaving");

        window.setTimeout(function () {
            sectionToHide.hidden = true;
            sectionToHide.classList.remove("is-leaving");

            sectionToShow.hidden = false;
            restartAnimation(sectionToShow, "is-entering");

            window.setTimeout(function () {
                sectionToShow.classList.remove("is-entering");
                isSwitchingSections = false;

                if (typeof onComplete === "function") {
                    onComplete();
                }
            }, PAGE_ANIMATION_DURATION + 220);
        }, PAGE_ANIMATION_DURATION);
    };
}