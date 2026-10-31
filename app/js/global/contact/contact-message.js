export function createMessageController(form) {
    const formMessage = form.querySelector('#formMessage');

    function show(message, isError = false, autoHide = false) {
        if (!formMessage) {
            return;
        }

        formMessage.textContent = message;
        formMessage.hidden = false;
        formMessage.classList.toggle('is-error', isError);

        if (autoHide && !isError) {
            setTimeout(function () {
                formMessage.hidden = true;
            }, 5000);
        }
    }

    function hide() {
        if (!formMessage) {
            return;
        }

        formMessage.hidden = true;
    }

    return {
        element: formMessage,
        show,
        hide
    };
}
