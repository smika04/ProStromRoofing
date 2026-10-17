import { about_us_script } from "./about_us-page_script.js";
import { careers_script } from "./careers-page_script.js";
import { main_script } from "./main-page_script.js";
import { our_projects_script } from "./our_projects-page_script.js";
import { services_script } from "./services-page_script.js";

import SVGInjector from "svg-injector";

$(function () {
    document.querySelector(".logo")?.addEventListener("click", (event) => {
        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    SVGInjector(
        document.querySelectorAll(".svg-inject"),
        {},
        function () {
            about_us_script();
            careers_script();
            our_projects_script();
            services_script();
        }
    );
    main_script();
});