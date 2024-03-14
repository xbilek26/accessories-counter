function fetchData() {
    var inputUrl = document.getElementById("urlInput").value.trim();
    if (inputUrl === "") {
        clearData();
        return;
    }

    var id = getIdFromUrl(inputUrl);
    if (!id) {
        displayError("Neplatný odkaz.");
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
