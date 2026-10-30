import {
    formatServiceName,
    getProjectImagePath,
    getProjectNumber,
    getProjectTitle,
    normalizeText
} from "./projects-formatters.js";
import {
    blurFocusedElementInside,
    destroyGallerySlider,
    prepareGallerySlider,
    renderGallery
} from "./projects-gallery.js";
import { scrollToElement, scrollToPosition } from "./projects-scroll.js";

export function createProjectDetailController(options) {
    const {
        state,
        page,
        detail,
        projectView,
        switchSections,
        getProjectGlobalIndex
    } = options;

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

    function openProjectDetail(project, shouldUpdateUrl = true, shouldSaveScroll = true) {
        if (shouldSaveScroll && detail.hidden) {
            state.projectsPageScrollY = window.scrollY;
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

        scrollToElement(projectView);
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
                scrollToPosition(state.projectsPageScrollY, "auto");
            }
        });
    }

    function openProjectFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("project");

        if (!projectId) {
            return;
        }

        const project = state.allProjects.find(item => String(item.id) === String(projectId));

        if (project) {
            openProjectDetail(project, false, false);
        }
    }

    return {
        openProjectDetail,
        closeProjectDetail,
        openProjectFromUrl,
        clearProjectUrl
    };
}