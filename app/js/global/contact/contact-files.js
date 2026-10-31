export function createFilesController(form) {
    const photoUploader = form.querySelector('[data-photo-uploader]');
    const photoList = photoUploader?.querySelector('[data-photo-list]');
    const photoAdd = photoUploader?.querySelector('[data-photo-add]');
    const photoInput = photoUploader?.querySelector('[data-photo-input]');
    const selectedFiles = [];

    const isResumeUploader = photoInput?.accept.includes('.pdf') ||
        photoInput?.accept.includes('.doc') ||
        photoInput?.accept.includes('.docx');

    const maxFiles = isResumeUploader ? 1 : 3;

    function updateFileAddVisibility() {
        if (!photoAdd) return;

        photoAdd.classList.toggle('is-hidden', selectedFiles.length >= maxFiles);
    }

    function renderFiles() {
        if (!photoList) return;

        photoList.innerHTML = '';

        selectedFiles.forEach(function (file, index) {
            const fileItem = document.createElement('div');
            fileItem.className = 'form__photo-item';

            if (file.type.startsWith('image/')) {
                const preview = document.createElement('img');
                preview.className = 'form__photo-preview';
                preview.src = URL.createObjectURL(file);
                preview.alt = file.name;

                preview.addEventListener('load', function () {
                    URL.revokeObjectURL(preview.src);
                });

                fileItem.append(preview);
            } else {
                const fileIcon = document.createElement('span');
                fileIcon.className = 'form__photo-preview';
                fileIcon.textContent = '📄';

                fileItem.append(fileIcon);
            }

            const name = document.createElement('span');
            name.className = 'form__photo-name';
            name.textContent = file.name;

            const removeButton = document.createElement('button');
            removeButton.className = 'form__photo-remove';
            removeButton.type = 'button';
            removeButton.textContent = 'Remove';

            removeButton.addEventListener('click', function () {
                selectedFiles.splice(index, 1);
                renderFiles();
            });

            fileItem.append(name, removeButton);
            photoList.append(fileItem);
        });

        updateFileAddVisibility();
    }

    function reset() {
        selectedFiles.length = 0;

        if (photoInput) {
            photoInput.value = '';
        }

        renderFiles();
    }

    function isAllowedFile(file) {
        if (!photoInput) return false;

        const accept = photoInput.accept;

        if (!accept) return true;

        if (file.type.startsWith('image/') && accept.includes('image/*')) {
            return true;
        }

        const fileName = file.name.toLowerCase();

        return accept
            .split(',')
            .map(function (type) {
                return type.trim().toLowerCase();
            })
            .some(function (type) {
                return fileName.endsWith(type);
            });
    }

    function init() {
        if (!photoInput) {
            return;
        }

        photoInput.addEventListener('change', function () {
            const files = Array.from(photoInput.files || []);
            const availableSlots = maxFiles - selectedFiles.length;

            files.slice(0, availableSlots).forEach(function (file) {
                if (isAllowedFile(file)) {
                    selectedFiles.push(file);
                }
            });

            photoInput.value = '';
            renderFiles();
        });

        updateFileAddVisibility();
    }

    return {
        init,
        reset
    };
}
