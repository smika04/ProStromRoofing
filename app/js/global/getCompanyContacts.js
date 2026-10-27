const CONTACTS_JSON_PATH = `${__BASE_HREF__}json/company_contacts.json`;

const CONTACT_SELECTORS = {
    phone_numbers: "[data-company-phones]",
    emails: "[data-company-emails]",
    fax_numbers: "[data-company-faxes]",
    address_office: "[data-company-addresses]",
};

const MAP_SELECTOR = "[data-company-map]";

function normalizePhoneHref(phone) {
    return String(phone).replace(/[^\d+]/g, "");
}

function getAddressText(addressData) {
    if (typeof addressData === "string") {
        return addressData;
    }

    return addressData?.address ?? "";
}

function getAddressUrl(addressData) {
    if (typeof addressData === "string") {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressData)}`;
    }

    if (addressData?.map_url) {
        return addressData.map_url;
    }

    if (addressData?.address) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressData.address)}`;
    }

    return "";
}

function getAddressEmbedUrl(addressData) {
    const address = getAddressText(addressData);

    if (!address) {
        return "";
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function getContactText(type, value) {
    if (type === "address_office") {
        return getAddressText(value);
    }

    return String(value ?? "");
}

function applyContactToLink(link, type, value) {
    const text = getContactText(type, value);

    link.textContent = text;

    if (type === "phone_numbers") {
        link.href = `tel:${normalizePhoneHref(text)}`;
        return;
    }

    if (type === "emails") {
        link.href = `mailto:${text}`;
        return;
    }

    if (type === "address_office") {
        link.href = getAddressUrl(value);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    }
}

function createContactLink(type, value) {
    const link = document.createElement("a");

    applyContactToLink(link, type, value);

    return link;
}

function createContactListItem(type, value) {
    const item = document.createElement("li");
    const text = getContactText(type, value);

    if (!text) {
        return null;
    }

    if (type === "fax_numbers") {
        item.textContent = text;
        return item;
    }

    item.append(createContactLink(type, value));

    return item;
}

function renderContactList(container, type, values) {
    container.innerHTML = "";

    values.forEach(value => {
        const item = createContactListItem(type, value);

        if (item) {
            container.append(item);
        }
    });

    container.hidden = values.length === 0;
}

function renderAnchorArray(anchor, type, values) {
    const parent = anchor.parentElement;

    if (!parent) {
        return;
    }

    if (values.length === 0) {
        anchor.hidden = true;
        return;
    }

    values.forEach((value, index) => {
        const text = getContactText(type, value);

        if (!text) {
            return;
        }

        const link = index === 0 ? anchor : anchor.cloneNode(false);

        link.hidden = false;
        applyContactToLink(link, type, value);

        if (index > 0) {
            parent.insertBefore(link, anchor.nextSibling);
        }
    });
}

function renderInlineArray(element, type, values) {
    element.innerHTML = "";

    values.forEach((value, index) => {
        const text = getContactText(type, value);

        if (!text) {
            return;
        }

        if (index > 0) {
            element.append(document.createTextNode(", "));
        }

        if (type === "fax_numbers") {
            element.append(document.createTextNode(text));
            return;
        }

        element.append(createContactLink(type, value));
    });

    element.hidden = values.length === 0;
}

function renderContacts(contacts) {
    Object.entries(CONTACT_SELECTORS).forEach(([type, selector]) => {
        const values = Array.isArray(contacts[type]) ? contacts[type] : [];

        document.querySelectorAll(selector).forEach(element => {
            if (element.tagName === "UL" || element.tagName === "OL") {
                renderContactList(element, type, values);
                return;
            }

            if (element.tagName === "A") {
                renderAnchorArray(element, type, values);
                return;
            }

            renderInlineArray(element, type, values);
        });
    });
}

function renderMaps(contacts) {
    const addresses = Array.isArray(contacts.address_office) ? contacts.address_office : [];
    const mapElements = document.querySelectorAll(MAP_SELECTOR);

    mapElements.forEach((mapElement, index) => {
        if (mapElement.tagName !== "IFRAME") {
            return;
        }

        const addressIndex = Number(mapElement.dataset.companyMapIndex ?? index);
        const addressData = addresses[addressIndex] ?? addresses[0];

        if (!addressData) {
            mapElement.hidden = true;
            return;
        }

        const embedUrl = getAddressEmbedUrl(addressData);
        const addressText = getAddressText(addressData);

        if (!embedUrl) {
            mapElement.hidden = true;
            return;
        }

        mapElement.hidden = false;
        mapElement.src = embedUrl;

        if (addressText) {
            mapElement.title = `Storm Pro Roofing office at ${addressText}`;
        }
    });
}

export async function getCompanyContacts() {
    try {
        const response = await fetch(CONTACTS_JSON_PATH);

        if (!response.ok) {
            throw new Error(`Failed to load company contacts: ${response.status}`);
        }

        const contacts = await response.json();

        renderContacts(contacts);
        renderMaps(contacts);
    } catch (error) {
        console.error(error);
    }
}