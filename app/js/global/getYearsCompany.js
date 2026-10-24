// Year, Month - 1, day
export function getYearsCompany() {
    const companyStartDate = new Date(2008, 0, 1);
    const experienceElement = document.querySelector("#experience-years");
    const today = new Date();

    if (!experienceElement || companyStartDate > today) return;

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

    experienceElement.textContent = roundedYears;
}