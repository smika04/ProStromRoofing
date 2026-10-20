export function initSvgInject(callback) {
    function runPageScripts() {
        if (typeof callback === 'function') {
            callback();
        }
    }

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
}