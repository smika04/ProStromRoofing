export function initCareersJobs() {
    const list = document.querySelector('[data-jobs-list]');
    const count = document.querySelector('[data-jobs-count]');
    const empty = document.querySelector('[data-jobs-empty]');

    if (!list) return;

    const jobsUrl = list.dataset.jobsUrl || '../json/jobs.json';

    function createListItems(items) {
        return items.map(function (item, index) {
            const title = item.Title || 'Open role';
            const position = item.Position || 'Position';
            const location = item.Location || 'Location';
            const description = item.Description || '';
            const salary = item.Salary || '';
            const requirements = Array.isArray(item.Requirements) ? item.Requirements : [];
            const duties = Array.isArray(item.Duties) ? item.Duties : [];

            return `
                <article class="career-job" data-career-job>
                    <button
                        class="career-job__button"
                        type="button"
                        aria-expanded="false"
                        aria-controls="career-job-panel-${index}"
                    >
                        <span class="career-job__title">${title}</span>
                        <span class="career-job__meta">${position}</span>
                        <span class="career-job__meta">${location}</span>
                        <span class="career-job__icon" aria-hidden="true">→</span>
                    </button>

                    <div class="career-job__panel" id="career-job-panel-${index}">
                        <div class="career-job__panel-inner">
                            <div class="career-job__details">
                                <div>
                                    <h3>About the role</h3>
                                    <p>${description}</p>

                                    ${salary ? `
                                        <div class="career-job__salary">
                                            <h3>Salary</h3>
                                            <p>${salary}</p>
                                        </div>
                                    ` : ''}
                                </div>

                                <div>
                                    <h3>Requirements</h3>
                                    <ul>
                                        ${requirements.map(function (requirement) {
                return `<li>${requirement}</li>`;
            }).join('')}
                                    </ul>
                                </div>

                                <div>
                                    <h3>Duties</h3>
                                    <ul>
                                        ${duties.map(function (duty) {
                return `<li>${duty}</li>`;
            }).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    function closeOtherJobs(currentJob) {
        const jobs = list.querySelectorAll('[data-career-job]');

        jobs.forEach(function (job) {
            if (job === currentJob) return;

            const button = job.querySelector('.career-job__button');

            job.classList.remove('is-open');

            if (button) {
                button.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function bindJobEvents() {
        const jobs = list.querySelectorAll('[data-career-job]');

        jobs.forEach(function (job) {
            const button = job.querySelector('.career-job__button');

            if (!button) return;

            button.addEventListener('click', function () {
                const isOpen = job.classList.contains('is-open');

                closeOtherJobs(job);

                job.classList.toggle('is-open', !isOpen);
                button.setAttribute('aria-expanded', String(!isOpen));
            });
        });
    }

    fetch(jobsUrl)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Jobs request failed');
            }

            return response.json();
        })
        .then(function (items) {
            if (!Array.isArray(items) || items.length === 0) {
                if (count) count.textContent = '0 open roles';
                if (empty) empty.hidden = false;
                return;
            }

            list.innerHTML = createListItems(items);

            if (count) {
                count.textContent = `${items.length} open ${items.length === 1 ? 'role' : 'roles'}`;
            }

            bindJobEvents();
        })
        .catch(function () {
            if (count) count.textContent = 'Unable to load roles';
            if (empty) {
                empty.hidden = false;
                empty.textContent = 'We could not load open roles right now. Please try again later.';
            }
        });
}