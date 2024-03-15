document.addEventListener("DOMContentLoaded", function () {
    var urlInput = document.getElementById("urlInput");
    urlInput.focus();

    urlInput.addEventListener("click", function () {
        if (urlInput.value !== "") {
            urlInput.select();
        }
    });
});

async function fetchData() {
    var input = document.getElementById("urlInput").value.trim();
    if (input === "") {
        clearData();
        return;
    }

    var url = (input.includes(".htm") || input.includes("dq=")) ? input : await getFinalUrl("https://www.alza.cz/kod/" + input);
    var id = getIdFromUrl(url);

    if (!id) {
        displayError("Neplatný kód produktu nebo odkaz.");
        return;
    }

    var apiUrl = "https://www.alza.cz/api/carousels/v1/commodities/" + id + "/recommendedAccesorySlots?country=CZ&pgrik=mAID&ucik=AiAEJQ.json";
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayCarouselItemsCount(data);
            displayProductName(id);
        })
        .catch(error => {
            console.error('Chyba při načítání dat:', error);
            displayError("Chyba při načítání dat.");
        });
}

function getIdFromUrl(url) {
    var matches = url.match(/-d(\d+)\.htm/);
    if (matches && matches.length > 1) {
        return matches[1];
    } else {
        matches = url.match(/dq=(\d+)/);
        if (matches && matches.length > 1) {
            return matches[1];
        }
    }
    return null;
}

function displayCarouselItemsCount(data) {
    var carousels = data.carousels;
    var jsonDataElement = document.getElementById("jsonData");
    var totalItems = 0;

    clearError();

    jsonDataElement.innerHTML = "";

    carousels.forEach(carousel => {
        var title = carousel.title;
        var itemsCount = carousel.items.length;
        totalItems += itemsCount;

        jsonDataElement.innerHTML += "<p>" + title + ": " + itemsCount + "</p>";
    });

    jsonDataElement.innerHTML += "<hr>";

    var totalCountElement = document.createElement("p");
    totalCountElement.innerHTML = "<strong>Celkový počet: " + totalItems + "</strong>";
    if (totalItems > 125) {
        totalCountElement.classList.add("overLimit");
    } else {
        totalCountElement.classList.add("underLimit");
    }
    jsonDataElement.appendChild(totalCountElement);
}


function displayError(message) {
    var jsonDataElement = document.getElementById("jsonData");
    jsonDataElement.innerHTML = "<p id='error'>" + message + "</p>";
}

function clearError() {
    var errorElement = document.getElementById("error");
    if (errorElement) {
        errorElement.remove();
    }
}

function clearData() {
    var jsonDataElement = document.getElementById("jsonData");
    jsonDataElement.innerHTML = "";
}

async function getFinalUrl(url) {
    try {
        const response = await fetch(url, { redirect: 'follow' });
        if (!response.ok) {
            throw new Error('Chyba přesměrování.');
        }
        return response.url;
    } catch (error) {
        throw error;
    }
}

async function getProductTitleFromUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Chyba při načítání HTML kódu stránky produktu.');
        }
        const html = await response.text();
        const regex = /<h1 itemprop="name"[^>]*>([^<]*)<\/h1>/i;
        const match = regex.exec(html);
        if (match && match.length > 1) {
            return match[1];
        } else {
            throw new Error('Nepodařilo se najít název produktu.');
        }
    } catch (error) {
        throw error;
    }
}

async function displayProductName(id) {
    try {
        const productUrl = `https://www.alza.cz/-d${id}.htm#accessories`;
        const productName = await getProductTitleFromUrl(productUrl);

        var productNameLink = document.createElement("a");
        productNameLink.textContent = "🔗" + productName;
        productNameLink.href = productUrl;
        productNameLink.target = "_blank";

        var productNameContainer = document.createElement("div");
        productNameContainer.classList.add("product-container");
        productNameContainer.appendChild(productNameLink);

        var jsonDataElement = document.getElementById("jsonData");
        jsonDataElement.appendChild(productNameContainer);
    } catch (error) {
        console.error('Chyba při načítání názvu produktu:', error);
        displayError("Chyba při načítání názvu produktu.");
    }
}
