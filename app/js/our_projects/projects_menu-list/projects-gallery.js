import {
    getProjectImagePath,
    getProjectPhotos,
    getProjectTitle
} from "./projects-formatters.js";

export function blurFocusedElementInside(element) {
    if (!element || !document.activeElement) {
        return;
    }

    if (element.contains(document.activeElement) && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
    }
}

function getCurrentGalleryActivePath(gallery) {
    if (!gallery) {
        return "";
    }

    return gallery.dataset.activeImagePath || "";
}

export function setActiveGalleryItem(gallery, activeImagePath) {
    if (!gallery || !activeImagePath) {
        return;
    }

    gallery.dataset.activeImagePath = activeImagePath;

    gallery.querySelectorAll(".project-detail__gallery-item").forEach(item => {
        item.classList.toggle("is-active", item.dataset.imagePath === activeImagePath);
    });
}

function syncGalleryAccessibility(gallery) {
    if (!gallery) {
        return;
    }

    const activeImagePath = getCurrentGalleryActivePath(gallery);

    gallery.querySelectorAll(".slick-slide").forEach(slide => {
        const isHidden = slide.getAttribute("aria-hidden") === "true";

        if (isHidden && slide.contains(document.activeElement)) {
            blurFocusedElementInside(slide);
        }

        slide.querySelectorAll("button, a, input, select, textarea, [tabindex]").forEach(element => {
            if (isHidden) {
                element.setAttribute("tabindex", "-1");
            } else if (element.classList.contains("project-detail__gallery-item")) {
                element.setAttribute("tabindex", "0");
            } else {
                element.removeAttribute("tabindex");
            }
        });
    });

    gallery.querySelectorAll(".project-detail__gallery-item").forEach(item => {
        item.classList.toggle("is-active", item.dataset.imagePath === activeImagePath);
    });
}

function safeSyncGallery(gallery) {
    if (!gallery) {
        return;
    }

    window.requestAnimationFrame(function () {
        syncGalleryAccessibility(gallery);

        window.setTimeout(function () {
            syncGalleryAccessibility(gallery);
        }, 0);
    });
}

function preloadGalleryImages(gallery) {
    if (!gallery) {
        return Promise.resolve();
    }

    const images = Array.from(gallery.querySelectorAll("img"));

    if (!images.length) {
        return Promise.resolve();
    }

    return Promise.allSettled(images.map(image => {
        if (image.complete) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            image.addEventListener("load", resolve, {
                once: true
            });

            image.addEventListener("error", resolve, {
                once: true
            });
        });
    }));
}

function refreshGallerySlider(gallery) {
    if (!gallery || !window.$ || !$.fn.slick) {
        return;
    }

    if ($(gallery).hasClass("slick-initialized")) {
        $(gallery).slick("setPosition");
        safeSyncGallery(gallery);
        setActiveGalleryItem(gallery, getCurrentGalleryActivePath(gallery));
    }
}

export function destroyGallerySlider(gallery) {
    if (!gallery) {
        return;
    }

    blurFocusedElementInside(gallery);

    if (window.$ && $.fn.slick) {
        $(gallery).off(".projectsGallery");

        if ($(gallery).hasClass("slick-initialized")) {
            $(gallery).slick("unslick");
        }
    }

    gallery.classList.remove("is-loading", "is-loaded");

    gallery.querySelectorAll(".project-detail__gallery-item").forEach(item => {
        item.removeAttribute("tabindex");
        item.removeAttribute("aria-hidden");
    });
}

function initGallerySlider(gallery, activeImagePath) {
    if (!gallery) {
        return;
    }

    gallery.dataset.activeImagePath = activeImagePath;

    if (!window.$ || !$.fn.slick) {
        gallery.classList.remove("is-loading");
        gallery.classList.add("is-loaded");
        setActiveGalleryItem(gallery, activeImagePath);
        return;
    }

    destroyGallerySlider(gallery);

    gallery.dataset.activeImagePath = activeImagePath;

    $(gallery)
        .off(".projectsGallery")
        .on("init.projectsGallery", function () {
            safeSyncGallery(gallery);
            setActiveGalleryItem(gallery, getCurrentGalleryActivePath(gallery));
        })
        .on("beforeChange.projectsGallery", function () {
            blurFocusedElementInside(gallery);
            syncGalleryAccessibility(gallery);
        })
        .on("afterChange.projectsGallery", function () {
            safeSyncGallery(gallery);
            setActiveGalleryItem(gallery, getCurrentGalleryActivePath(gallery));
        })
        .on("setPosition.projectsGallery", function () {
            safeSyncGallery(gallery);
            setActiveGalleryItem(gallery, getCurrentGalleryActivePath(gallery));
        });

    $(gallery).slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        infinite: false,
        arrows: true,
        dots: true,
        draggable: true,
        swipe: true,
        touchMove: true,
        speed: 420,
        pauseOnHover: true,
        pauseOnFocus: true,
        cssEase: "cubic-bezier(0.22, 1, 0.36, 1)",
        accessibility: false,
        focusOnChange: false,
        focusOnSelect: false,
        responsive: [
            {
                breakpoint: 1440,
                settings: {
                    slidesToShow: 4,
                    infinite: false
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    infinite: false
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    infinite: false
                }
            }
        ]
    });

    safeSyncGallery(gallery);
    setActiveGalleryItem(gallery, getCurrentGalleryActivePath(gallery));
}

export function prepareGallerySlider(gallery, activeImagePath) {
    if (!gallery) {
        return;
    }

    gallery.classList.add("is-loading");
    gallery.classList.remove("is-loaded");

    preloadGalleryImages(gallery).finally(function () {
        initGallerySlider(gallery, activeImagePath);

        window.requestAnimationFrame(function () {
            refreshGallerySlider(gallery);

            window.setTimeout(function () {
                refreshGallerySlider(gallery);
                gallery.classList.remove("is-loading");
                gallery.classList.add("is-loaded");
            }, 120);
        });
    });
}

export function updateMainImage(imagePath, altText) {
    const mainImage = document.querySelector("[data-project-detail-main-image]");
    const gallery = document.querySelector("[data-project-detail-gallery]");

    if (!mainImage || !imagePath) {
        return;
    }

    if (gallery) {
        gallery.dataset.activeImagePath = imagePath;
        setActiveGalleryItem(gallery, imagePath);
        safeSyncGallery(gallery);
    }

    if (mainImage.src.includes(imagePath)) {
        return;
    }

    mainImage.classList.add("is-changing");

    window.setTimeout(function () {
        mainImage.classList.add("is-gallery-image");
        mainImage.src = imagePath;
        mainImage.alt = altText || mainImage.alt || "Project photo";

        if (gallery) {
            gallery.dataset.activeImagePath = imagePath;
            setActiveGalleryItem(gallery, imagePath);
            safeSyncGallery(gallery);
        }

        window.setTimeout(function () {
            mainImage.classList.remove("is-changing");
        }, 80);
    }, 180);
}

export function renderGallery(project, shouldInitSlider = true) {
    const gallery = document.querySelector("[data-project-detail-gallery]");
    const title = getProjectTitle(project);
    const activeImagePath = getProjectImagePath(project.main_photo_path);

    if (!gallery) {
        return;
    }

    destroyGallerySlider(gallery);

    gallery.innerHTML = "";
    gallery.dataset.activeImagePath = activeImagePath;
    gallery.classList.remove("is-loaded");
    gallery.classList.add("is-loading");

    getProjectPhotos(project).forEach((photo, index) => {
        const imagePath = getProjectImagePath(photo);
        const slide = document.createElement("button");

        slide.className = "project-detail__gallery-item";
        slide.type = "button";
        slide.dataset.imagePath = imagePath;
        slide.setAttribute("aria-label", `Show project photo ${index + 1}`);

        slide.innerHTML = `
            <img src="${imagePath}" alt="${title} photo ${index + 1}" loading="eager" decoding="async">
        `;

        slide.addEventListener("mousedown", function () {
            gallery.dataset.activeImagePath = imagePath;
            setActiveGalleryItem(gallery, imagePath);
        });

        slide.addEventListener("touchstart", function () {
            gallery.dataset.activeImagePath = imagePath;
            setActiveGalleryItem(gallery, imagePath);
        }, {
            passive: true
        });

        slide.addEventListener("click", function () {
            gallery.dataset.activeImagePath = imagePath;
            updateMainImage(imagePath, `${title} photo ${index + 1}`);
            setActiveGalleryItem(gallery, imagePath);
            blurFocusedElementInside(gallery);
            safeSyncGallery(gallery);
        });

        gallery.append(slide);
    });

    setActiveGalleryItem(gallery, activeImagePath);

    if (shouldInitSlider) {
        prepareGallerySlider(gallery, activeImagePath);
    }
}