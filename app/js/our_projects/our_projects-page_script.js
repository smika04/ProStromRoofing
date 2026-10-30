window.ourProjectsPageScript = function () {
    const PROJECTS_JSON_PATH = "../json/projects.json";
    const PROJECTS_IMAGE_BASE_PATH = "../images/projects/";
    const PROJECTS_PER_PAGE = 4;
    const PAGE_ANIMATION_DURATION = 360;
    const HEADER_SCROLL_OFFSET = 76;

    const page = document.querySelector("[data-projects-page]");
    const detail = document.querySelector("[data-project-detail]");
    const projectView = document.querySelector(".project_view");

    if (!page || !detail || page.dataset.projectsInitialized === "true") {
        return;
    }

    if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
    }

    page.dataset.projectsInitialized = "true";

    let allProjects = [];
    let filteredProjects = [];
    let currentFilter = "all";
    let visibleCount = PROJECTS_PER_PAGE;
    let projectsPageScrollY = 0;
    let isSwitchingSections = false;

    function initProjectViewObserver() {
        if (!projectView || !("IntersectionObserver" in window)) {
            document.body.classList.add("project-view-visible");
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                document.body.classList.toggle("project-view-visible", entry.isIntersecting);
            });
        }, {
            threshold: 0.08
        });

        observer.observe(projectView);
    }

    function normalizeText(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function normalizeServiceType(serviceType) {
        return String(serviceType || "").trim().toLowerCase();
    }

    function formatServiceName(serviceType) {
        const normalized = normalizeServiceType(serviceType);

        if (normalized === "maintance" || normalized === "maintenance") {
            return "Maintenance";
        }

        return normalized
            .split(/[-_\s]+/)
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function getProjectTitle(project) {
        const title = normalizeText(project.title);

        if (title) {
            return title;
        }

        const serviceName = formatServiceName(project.service_type);
        const cityName = normalizeText(project.city) || "British Columbia";

        return `${serviceName} in ${cityName}`;
    }

    function getProjectImagePath(path) {
        const cleanPath = normalizeText(path).replace(/^\//, "");

        if (!cleanPath) {
            return "";
        }

        return `${PROJECTS_IMAGE_BASE_PATH}${cleanPath}`;
    }

    function getProjectPhotos(project) {
        const photos = [];

        if (project.main_photo_path) {
            photos.push(project.main_photo_path);
        }

        if (project.old_photo_path) {
            photos.push(project.old_photo_path);
        }

        if (Array.isArray(project.list_photos_path)) {
            photos.push(...project.list_photos_path);
        }

        return [...new Set(
            photos
                .map(photo => normalizeText(photo))
                .filter(photo => photo && !photo.includes("]"))
        )];
    }

    function getProjectNumber(index) {
        return String(index + 1).padStart(2, "0");
    }

    function getProjectGlobalIndex(project) {
        const index = allProjects.findIndex(item => String(item.id) === String(project.id));

        return index >= 0 ? index : 0;
    }

    function scrollToPosition(top, behavior = "smooth") {
        window.requestAnimationFrame(function () {
            window.scrollTo({
                top,
                behavior
            });
        });
    }

    function getProjectViewTop() {
        if (!projectView) {
            return 0;
        }

        return Math.max(projectView.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET, 0);
    }

    function scrollToProjectViewTop(behavior = "smooth") {
        scrollToPosition(getProjectViewTop(), behavior);
    }

    function restartAnimation(element, animationClass) {
        if (!element) {
            return;
        }

        element.classList.remove(animationClass);

        requestAnimationFrame(function () {
            element.classList.add(animationClass);
        });
    }

    function switchSections(sectionToHide, sectionToShow, onComplete) {
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
    }

    function blurFocusedElementInside(element) {
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

    function setActiveGalleryItem(gallery, activeImagePath) {
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

    function updateMainImage(imagePath, altText) {
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

    function createProjectCard(project) {
        const globalIndex = getProjectGlobalIndex(project);
        const card = document.createElement("article");
        const title = getProjectTitle(project);
        const imagePath = getProjectImagePath(project.main_photo_path);
        const service = formatServiceName(project.service_type);
        const city = normalizeText(project.city) || "British Columbia";

        card.className = "project-card";
        card.dataset.projectId = project.id;

        card.innerHTML = `
            <button class="project-card__button" type="button" aria-label="Open project ${title}">
                <figure class="project-card__image">
                    <img src="${imagePath}" alt="${title}" loading="lazy">
                    <span>${getProjectNumber(globalIndex)}</span>
                </figure>

                <div class="project-card__content">
                    <p>${service} · ${city}</p>
                    <h2>${title}</h2>
                    <i aria-hidden="true">→</i>
                </div>
            </button>
        `;

        card.querySelector(".project-card__button").addEventListener("click", function () {
            openProjectDetail(project);
        });

        return card;
    }

    function renderProjects() {
        const grid = document.querySelector("[data-projects-grid]");
        const loadMoreButton = document.querySelector("[data-projects-load-more]");

        if (!grid || !loadMoreButton) {
            return;
        }

        grid.innerHTML = "";

        filteredProjects.slice(0, visibleCount).forEach(project => {
            grid.append(createProjectCard(project));
        });

        loadMoreButton.hidden = visibleCount >= filteredProjects.length;
    }

    function setFilter(filter) {
        currentFilter = filter;
        visibleCount = PROJECTS_PER_PAGE;

        filteredProjects = currentFilter === "all"
            ? [...allProjects]
            : allProjects.filter(project => normalizeServiceType(project.service_type) === currentFilter);

        document.querySelectorAll("[data-project-filters] button").forEach(button => {
            button.classList.toggle("is-active", button.dataset.filter === currentFilter);
        });

        renderProjects();
    }

    function destroyGallerySlider(gallery) {
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

    function prepareGallerySlider(gallery, activeImagePath) {
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

    function renderMaterials(project) {
        const materialsContainer = document.querySelector("[data-project-detail-materials]");

        if (!materialsContainer) {
            return;
        }

        materialsContainer.innerHTML = "";

        const materials = Array.isArray(project.materials) ? project.materials : [];
        const filledMaterials = materials.filter(material => {
            return normalizeText(material.name)
                || normalizeText(material.brand)
                || normalizeText(material.color)
                || normalizeText(material.description);
        });

        if (!filledMaterials.length) {
            materialsContainer.hidden = true;
            return;
        }

        materialsContainer.hidden = false;

        filledMaterials.forEach(material => {
            const item = document.createElement("div");

            item.className = "project-detail__material";
            item.innerHTML = `
                <span>Material</span>
                <strong>${normalizeText(material.name) || "Roofing system"}</strong>
                <p>${[normalizeText(material.brand), normalizeText(material.color)].filter(Boolean).join(" · ")}</p>
                <small>${normalizeText(material.description)}</small>
            `;

            materialsContainer.append(item);
        });
    }

    function renderGallery(project, shouldInitSlider = true) {
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

    function updateUrl(project) {
        const url = new URL(window.location.href);

        url.searchParams.set("project", project.id);
        url.hash = "";
        window.history.pushState({ projectId: project.id }, "", url.toString());
    }

    function clearProjectUrl(replace = false) {
        const url = new URL(window.location.href);

        url.searchParams.delete("project");

        if (replace) {
            window.history.replaceState({}, "", url.toString());
            return;
        }

        window.history.pushState({}, "", url.toString());
    }

    function openProjectDetail(project, shouldUpdateUrl = true, shouldSaveScroll = true) {
        if (shouldSaveScroll && detail.hidden) {
            projectsPageScrollY = window.scrollY;
        }

        const globalIndex = getProjectGlobalIndex(project);
        const title = getProjectTitle(project);
        const service = formatServiceName(project.service_type);
        const city = normalizeText(project.city) || "British Columbia";
        const description = normalizeText(project.description);
        const mainImage = getProjectImagePath(project.main_photo_path);

        const detailMainImage = document.querySelector("[data-project-detail-main-image]");
        const detailMeta = document.querySelector("[data-project-detail-meta]");
        const detailTitle = document.querySelector("[data-project-detail-title]");
        const detailDescription = document.querySelector("[data-project-detail-description]");
        const detailNumber = document.querySelector("[data-project-detail-number]");
        const detailService = document.querySelector("[data-project-detail-service]");
        const detailCity = document.querySelector("[data-project-detail-city]");
        const gallery = document.querySelector("[data-project-detail-gallery]");

        document.body.classList.remove("project-back-ready");

        if (detailMainImage) {
            detailMainImage.classList.remove("is-changing", "is-gallery-image");
            detailMainImage.src = mainImage;
            detailMainImage.alt = title;
        }

        if (detailMeta) {
            detailMeta.textContent = `${service} · ${city}`;
        }

        if (detailTitle) {
            detailTitle.textContent = title;
        }

        if (detailDescription) {
            detailDescription.textContent = description || "Explore photos, service details, and project information from this completed roofing project.";
            detailDescription.hidden = !description;
        }

        if (detailNumber) {
            detailNumber.textContent = getProjectNumber(globalIndex);
        }

        if (detailService) {
            detailService.textContent = service;
        }

        if (detailCity) {
            detailCity.textContent = city;
        }

        renderMaterials(project);
        renderGallery(project, false);

        document.body.classList.add("project-detail-open");

        if (shouldUpdateUrl) {
            updateUrl(project);
        }

        switchSections(page, detail, function () {
            if (gallery) {
                prepareGallerySlider(gallery, mainImage);
            }

            document.body.classList.add("project-back-ready");
        });

        scrollToProjectViewTop();
    }

    function closeProjectDetail(shouldUpdateUrl = true, shouldRestoreScroll = true) {
        const gallery = document.querySelector("[data-project-detail-gallery]");

        if (gallery) {
            destroyGallerySlider(gallery);
        }

        blurFocusedElementInside(detail);

        document.body.classList.remove("project-back-ready");
        document.body.classList.remove("project-detail-open");

        if (shouldUpdateUrl) {
            clearProjectUrl();
        }

        switchSections(detail, page, function () {
            if (shouldRestoreScroll) {
                scrollToPosition(projectsPageScrollY, "auto");
            }
        });
    }

    function openProjectFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("project");

        if (!projectId) {
            return;
        }

        const project = allProjects.find(item => String(item.id) === String(projectId));

        if (project) {
            openProjectDetail(project, false, false);
        }
    }

    function bindProjectPageAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", function (event) {
                const hash = link.getAttribute("href");

                if (!hash || hash === "#") {
                    return;
                }

                const target = document.querySelector(hash);

                if (!target) {
                    return;
                }

                event.preventDefault();

                window.setTimeout(function () {
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    const url = new URL(window.location.href);

                    url.hash = hash;
                    window.history.replaceState(window.history.state, "", url.toString());
                }, 80);
            });
        });
    }

    function bindEvents() {
        document.querySelectorAll("[data-project-filters] button").forEach(button => {
            button.addEventListener("click", function () {
                setFilter(button.dataset.filter);
            });
        });

        const loadMoreButton = document.querySelector("[data-projects-load-more]");

        if (loadMoreButton) {
            loadMoreButton.addEventListener("click", function () {
                visibleCount += PROJECTS_PER_PAGE;
                renderProjects();
            });
        }

        const backButton = document.querySelector("[data-project-detail-back]");

        if (backButton) {
            backButton.addEventListener("click", function () {
                closeProjectDetail();
            });
        }

        bindProjectPageAnchors();

        window.addEventListener("popstate", function () {
            const params = new URLSearchParams(window.location.search);
            const projectId = params.get("project");

            if (!projectId) {
                if (!detail.hidden) {
                    closeProjectDetail(false, false);
                }

                return;
            }

            const project = allProjects.find(item => String(item.id) === String(projectId));

            if (project) {
                openProjectDetail(project, false, false);
            }
        });
    }

    async function initProjectsPage() {
        try {
            const response = await fetch(PROJECTS_JSON_PATH);

            if (!response.ok) {
                throw new Error(`Failed to load projects: ${response.status}`);
            }

            allProjects = await response.json();
            filteredProjects = [...allProjects];

            initProjectViewObserver();
            bindEvents();
            renderProjects();
            openProjectFromUrl();
        } catch (error) {
            console.error(error);
        }
    }

    initProjectsPage();
};