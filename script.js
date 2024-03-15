document.addEventListener("DOMContentLoaded", function() {
  var urlInput = document.getElementById("urlInput");
  urlInput.focus();

  urlInput.addEventListener("click", function() {
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

  var url = (input.endsWith(".htm") || input.includes("dq=")) ? input : await getFinalUrl("https://www.alza.cz/kod/" + input);
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

function extractProductIdFromUrl(url) {
  const matches = url.match(/-d(\d+)\.htm/);
  return matches && matches.length > 1 ? matches[1] : null;
}

async function main() {
  try {
      const finalUrl = await getFinalUrl(originalUrl);
      const productId = extractProductIdFromUrl(finalUrl);
      if (productId) {
          document.getElementById('output').innerText = `ID produktu: ${productId}`;
      } else {
          throw new Error('Nelze získat ID produktu.');
      }
  } catch (error) {
      document.getElementById('output').innerText = `Chyba: ${error.message}`;
  }
}
