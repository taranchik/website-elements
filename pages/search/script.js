function toggleLoadingIcon() {
  loadingIcon = document.getElementsByClassName("loading-icon")[0];

  if (loadingIcon.style.display) {
    loadingIcon.style.display = "";
  } else {
    loadingIcon.style.display = "inline-block";
  }
}

function clearResponseItems() {
  const ul = document.getElementById("response-items");

  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
}

function addResponseItems(items) {
  clearResponseItems();

  const ul = document.getElementById("response-items");

  for (let i = 0; i < items.length; i++) {
    const titleSpan = document.createElement("span");
    const priceSpan = document.createElement("span");
    const li = document.createElement("li");

    titleSpan.textContent = items[i].title;
    priceSpan.textContent = `$${items[i].price}`;

    li.appendChild(titleSpan);
    li.appendChild(priceSpan);
    ul.appendChild(li);
  }
}

// Define a variable to hold the current fetch operation's AbortController
let controller = null;

function searchProducts() {
  const input = document.getElementById("search-input");

  if (input.value === "") {
    clearResponseItems();

    return;
  }

  toggleLoadingIcon();

  // If there's an ongoing fetch operation, abort it
  if (controller) {
    controller.abort();
  }

  // Create a new instance of AbortController for the new fetch operation
  controller = new AbortController();
  // Encode the search term to ensure the URL is properly formatted
  const encodedSearchTerm = encodeURIComponent(input.value);
  // Construct the URL with the encoded search term
  const url = `https://dummyjson.com/products/search?q=${encodedSearchTerm}&delay=1000`;

  fetch(url, { signal: controller.signal })
    .then((response) => {
      // If the fetch request was successfully received
      if (response.ok === false) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    })
    .then(({ products }) => {
      if (input.value === "" || products.length === 0) {
        clearResponseItems();
      } else {
        addResponseItems(products);
      }
    })
    // Catches any error thrown in the promise chain, not just the HTTP error statuses
    .catch((error) => {
      if (error.name === "AbortError") {
        console.log("Fetch aborted.");
      } else {
        console.error("Fetch error:", error);
      }
    })
    .finally(() => {
      toggleLoadingIcon();

      // Reset the controller after the fetch is completed or aborted
      controller = null;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("search-input")
    .addEventListener("input", searchProducts);
});
