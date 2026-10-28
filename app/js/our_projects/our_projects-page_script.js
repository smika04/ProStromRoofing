window.ourProjectsPageScript = function () {
    const PROJECTS_JSON_PATH = "../json/projects.json";
    const PROJECTS_IMAGE_BASE_PATH = "../images/projects/";
    const PROJECTS_PER_PAGE = 4;

    const page = document.querySelector("[data-projects-page]");
    const detail = document.querySelector("[data-project-detail]");

    if (!page || !detail || page.dataset.projectsInitialized === "true") {
        return;
    }

    page.dataset.projectsInitialized = "true";

    let allProjects = [];
    let filteredProjects = [];
    let currentFilter = "all";
    let visibleCount = PROJECTS_PER_PAGE;

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
        if (window.$ && $.fn.slick && $(gallery).hasClass("slick-initialized")) {
            $(gallery).slick("unslick");
        }
    }

    function initGallerySlider(gallery) {
        if (!window.$ || !$.fn.slick) {
            return;
        }

        destroyGallerySlider(gallery);

        $(gallery).slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            infinite: false,
            arrows: true,
            dots: false,
            draggable: true,
            swipe: true,
            touchMove: true,
            speed: 360,
            cssEase: "ease",
            responsive: [
                {
                    breakpoint: 1440,
                    settings: {
                        slidesToShow: 4
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 640,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
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

    function renderGallery(project) {
        const gallery = document.querySelector("[data-project-detail-gallery]");
        const mainImage = document.querySelector("[data-project-detail-main-image]");

        if (!gallery) {
            return;
        }

        destroyGallerySlider(gallery);

        gallery.innerHTML = "";

        getProjectPhotos(project).forEach((photo, index) => {
            const imagePath = getProjectImagePath(photo);
            const slide = document.createElement("button");

            slide.className = "project-detail__gallery-item";
            slide.type = "button";
            slide.innerHTML = `<img src="${imagePath}" alt="Project photo ${index + 1}" loading="lazy">`;

            slide.addEventListener("click", function () {
                if (mainImage) {
                    mainImage.src = imagePath;
                }
            });

            gallery.append(slide);
        });

        initGallerySlider(gallery);
    }

    function updateUrl(project) {
        const url = new URL(window.location.href);

        url.searchParams.set("project", project.id);
        window.history.pushState({ projectId: project.id }, "", url.toString());
    }

    function clearProjectUrl() {
        const url = new URL(window.location.href);

        url.searchParams.delete("project");
        window.history.pushState({}, "", url.toString());
    }

    function openProjectDetail(project, shouldUpdateUrl = true) {
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

        if (detailMainImage) {
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
        renderGallery(project);

        page.hidden = true;
        detail.hidden = false;

        document.body.classList.add("project-detail-open");

        if (shouldUpdateUrl) {
            updateUrl(project);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function closeProjectDetail(shouldUpdateUrl = true) {
        const gallery = document.querySelector("[data-project-detail-gallery]");

        if (gallery) {
            destroyGallerySlider(gallery);
        }

        detail.hidden = true;
        page.hidden = false;

        document.body.classList.remove("project-detail-open");

        if (shouldUpdateUrl) {
            clearProjectUrl();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
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
            openProjectDetail(project, false);
        }
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

        window.addEventListener("popstate", function () {
            const params = new URLSearchParams(window.location.search);
            const projectId = params.get("project");

            if (!projectId) {
                closeProjectDetail(false);
                return;
            }

            const project = allProjects.find(item => String(item.id) === String(projectId));

            if (project) {
                openProjectDetail(project, false);
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

            bindEvents();
            renderProjects();
            openProjectFromUrl();
        } catch (error) {
            console.error(error);
        }
    }

    initProjectsPage();
};