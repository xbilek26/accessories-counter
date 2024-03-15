document.addEventListener("DOMContentLoaded", function () {
    var userInput = document.getElementById("userInput");

    userInput.addEventListener("keydown", function (event) {
        if (!(event.ctrlKey && event.key === "v")) {
            event.preventDefault();
        }
    });

    userInput.addEventListener("paste", function (event) {

        event.preventDefault();

        var pastedText = (event.clipboardData || window.clipboardData).getData('text');

        userInput.value = pastedText;

        fetchData(event);
    });

    userInput.addEventListener("input", function (event) {
        // Pokud je délka textu větší než 0, zamezíme mazání
        if (userInput.value.length > 0) {
            userInput.value = userInput.value.charAt(0);
        }

        fetchData(event);
    });

    userInput.addEventListener("click", function (event) {
        userInput.select(); // Označíme text
    });
});

async function fetchData() {
    var input = document.getElementById("userInput").value.trim();
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

    var apiUrl = "https://www.alza.cz/api/carousels/v1/commodities/" + id + "/recommendedAccesorySlots?country=CZ&pgrik=mAID&ucik=AiAEJQ";
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
    var dataElement = document.getElementById("data");
    var totalItems = 0;

    clearError();

    dataElement.innerHTML = "";

    carousels.forEach(carousel => {
        var title = carousel.title;
        var itemsCount = carousel.items.length;
        totalItems += itemsCount;

        dataElement.innerHTML += "<p>" + title + ": " + itemsCount + "</p>";
    });

    dataElement.innerHTML += "<hr>";

    var totalCountElement = document.createElement("p");
    totalCountElement.innerHTML = "<strong>Celkový počet: " + totalItems + "</strong>";
    if (totalItems > 125) {
        totalCountElement.classList.add("closeToLimit");
    }
    dataElement.appendChild(totalCountElement);
}


function displayError(message) {
    var dataElement = document.getElementById("data");
    dataElement.innerHTML = "<p id='error'>" + message + "</p>";
}

function clearError() {
    var errorElement = document.getElementById("error");
    if (errorElement) {
        errorElement.remove();
    }
}

function clearData() {
    var dataElement = document.getElementById("data");
    dataElement.innerHTML = "";
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

        var dataElement = document.getElementById("data");
        dataElement.appendChild(productNameContainer);
    } catch (error) {
        console.error('Chyba při načítání názvu produktu:', error);
        displayError("Chyba při načítání názvu produktu.");
    }
}
