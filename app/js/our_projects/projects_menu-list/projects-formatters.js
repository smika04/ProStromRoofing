import { PROJECTS_IMAGE_BASE_PATH } from "./projects-config.js";

export function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

export function normalizeServiceType(serviceType) {
    return String(serviceType || "").trim().toLowerCase();
}

export function formatServiceName(serviceType) {
    const normalized = normalizeServiceType(serviceType);

    if (normalized === "maintance" || normalized === "maintenance") {
        return "Maintenance";
    }

    return normalized
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function getProjectTitle(project) {
    const title = normalizeText(project.title);

    if (title) {
        return title;
    }

    const serviceName = formatServiceName(project.service_type);
    const cityName = normalizeText(project.city) || "British Columbia";

    return `${serviceName} in ${cityName}`;
}

export function getProjectImagePath(path) {
    const cleanPath = normalizeText(path).replace(/^\//, "");

    if (!cleanPath) {
        return "";
    }

    return `${PROJECTS_IMAGE_BASE_PATH}${cleanPath}`;
}

export function getProjectPhotos(project) {
    const photos = [];

    if (project.main_photo_path) {
        photos.push(project.main_photo_path);
    }

    if (Array.isArray(project.list_photos_path)) {
        photos.push(...project.list_photos_path);
    }

    return [...new Set(
        photos
            .map(photo => normalizeText(photo))
            .filter(photo => photo && !photo.includes("]"))
    )];
}

export function getProjectNumber(index) {
    return String(index + 1).padStart(2, "0");
}