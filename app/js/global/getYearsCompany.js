// Year, Month - 1, day
export function getYearsCompany() {
    const companyStartDate = new Date(2008, 0, 1);
    const today = new Date();

    if (companyStartDate > today) return;

    let years = today.getFullYear() - companyStartDate.getFullYear();

    const anniversary = new Date(
        today.getFullYear(),
        companyStartDate.getMonth(),
        companyStartDate.getDate()
    );

    if (today < anniversary) {
        years--;
    }

    // Round to the nearest 5 years
    const roundedYears = Math.round(years / 5) * 5;

    document.querySelectorAll("[data-experience-years]").forEach(element => {
        const prefix = element.dataset.prefix ?? element.textContent;
        element.dataset.prefix = prefix;
        element.textContent = `${roundedYears}${prefix}`;
    });
}