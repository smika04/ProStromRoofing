import { PROJECTS_PER_PAGE } from "./projects-config.js";
import {
    formatServiceName,
    getProjectImagePath,
    getProjectNumber,
    getProjectTitle,
    normalizeServiceType,
    normalizeText
} from "./projects-formatters.js";

export function createProjectsRenderer(state, actions) {
    function getProjectGlobalIndex(project) {
        const index = state.allProjects.findIndex(item => String(item.id) === String(project.id));

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
            actions.openProjectDetail(project);
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

        state.filteredProjects.slice(0, state.visibleCount).forEach(project => {
            grid.append(createProjectCard(project));
        });

        loadMoreButton.hidden = state.visibleCount >= state.filteredProjects.length;
    }

    function setFilter(filter) {
        state.currentFilter = filter;
        state.visibleCount = PROJECTS_PER_PAGE;

        state.filteredProjects = state.currentFilter === "all"
            ? [...state.allProjects]
            : state.allProjects.filter(project => normalizeServiceType(project.service_type) === state.currentFilter);

        document.querySelectorAll("[data-project-filters] button").forEach(button => {
            button.classList.toggle("is-active", button.dataset.filter === state.currentFilter);
        });

        renderProjects();
    }

    function loadMoreProjects() {
        state.visibleCount += PROJECTS_PER_PAGE;
        renderProjects();
    }

    return {
        renderProjects,
        setFilter,
        loadMoreProjects,
        getProjectGlobalIndex
    };
}