import { PROJECTS_JSON_PATH, PROJECTS_PER_PAGE, PAGE_ANIMATION_DURATION } from "./projects_menu-list/projects-config.js";
import { createSectionSwitcher } from "./projects_menu-list/projects-scroll.js";
import { createProjectsRenderer } from "./projects_menu-list/projects-render.js";
import { createProjectDetailController } from "./projects_menu-list/projects-detail.js";

window.ourProjectsPageScript = function () {
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

    const state = {
        allProjects: [],
        filteredProjects: [],
        currentFilter: "all",
        visibleCount: PROJECTS_PER_PAGE,
        projectsPageScrollY: 0
    };

    const switchSections = createSectionSwitcher(PAGE_ANIMATION_DURATION);

    let detailController;
    let projectsRenderer;

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
                projectsRenderer.setFilter(button.dataset.filter);
            });
        });

        const loadMoreButton = document.querySelector("[data-projects-load-more]");

        if (loadMoreButton) {
            loadMoreButton.addEventListener("click", function () {
                projectsRenderer.loadMoreProjects();
            });
        }

        const backButton = document.querySelector("[data-project-detail-back]");

        if (backButton) {
            backButton.addEventListener("click", function () {
                detailController.closeProjectDetail();
            });
        }

        bindProjectPageAnchors();

        window.addEventListener("popstate", function () {
            const params = new URLSearchParams(window.location.search);
            const projectId = params.get("project");

            if (!projectId) {
                if (!detail.hidden) {
                    detailController.closeProjectDetail(false, false);
                }

                return;
            }

            const project = state.allProjects.find(item => String(item.id) === String(projectId));

            if (project) {
                detailController.openProjectDetail(project, false, false);
            }
        });
    }

    async function initProjectsPage() {
        try {
            const response = await fetch(PROJECTS_JSON_PATH);

            if (!response.ok) {
                throw new Error(`Failed to load projects: ${response.status}`);
            }

            state.allProjects = await response.json();
            state.filteredProjects = [...state.allProjects];

            projectsRenderer = createProjectsRenderer(state, {
                openProjectDetail(project) {
                    detailController.openProjectDetail(project);
                }
            });

            detailController = createProjectDetailController({
                state,
                page,
                detail,
                projectView,
                switchSections,
                getProjectGlobalIndex: projectsRenderer.getProjectGlobalIndex
            });

            initProjectViewObserver();
            bindEvents();
            projectsRenderer.renderProjects();
            detailController.openProjectFromUrl();
        } catch (error) {
            console.error(error);
        }
    }

    initProjectsPage();
};