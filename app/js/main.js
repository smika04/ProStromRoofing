$(function () {
    function runPageScripts() {
        if (typeof window.mainPageScript === 'function') {
            window.mainPageScript();
        }
    }

    document.querySelector(".logo")?.addEventListener("click", function (event) {
        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    if (typeof SVGInjector === 'function') {
        SVGInjector(
            document.querySelectorAll(".svg-inject"),
            {},
            function () {
                runPageScripts();
            }
        );
    } else {
        runPageScripts();
    }
});