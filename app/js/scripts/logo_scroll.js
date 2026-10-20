export function initLogoScroll() {
    document.querySelector(".logo")?.addEventListener("click", function (event) {
        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}