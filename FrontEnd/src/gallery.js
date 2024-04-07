const apiBaseUrl = "http://localhost:5678/api/"
const galleryHtmlDiv = document.querySelector('.gallery')
const filtersHtmlDiv = document.querySelector('.filters')
let galleryData
let categories

/**
 * Call API
 */

function callAPI(path) {
  fetch(`${apiBaseUrl}${path}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur lors de la requête à l'API`);
      }
      return response.json();
    })
    .then(data => {
      displayGallery(data)
      getSingleCategoriesFromWorks(data)
    })
    .catch(error => {
      console.error(`Erreur lors de la récupération des données de l'API :, ${error}`);
    });
}
window.onload = callAPI("works")

/**
 *  Create on HTML
 */

//Works
function displayGallery(data) {
  const fragment = document.createDocumentFragment();
  data.forEach(el => {
    const figure = document.createElement('figure');
    figure.classList.add('workCard');
    figure.dataset.category = el.category.name;
    figure.innerHTML = `
      <img src="${el.imageUrl}" alt="${el.title}" />
      <figcaption>${el.title}</figcaption>
    `;
    fragment.appendChild(figure);
  });
  galleryHtmlDiv.appendChild(fragment);
}


// Filter Buttons

function getSingleCategoriesFromWorks(data) {
  let listOfCategories = new Set(); // 
  data.forEach((el) => {
    listOfCategories.add(JSON.stringify(el.category));
  });
  const arrayOfStrings = [...listOfCategories];
  categories = arrayOfStrings.map((string) => JSON.parse(string));

  categories.unshift({ id: 0, name: "Tous" })

  displayFiltersButton(categories)
}

function displayFiltersButton(categories) {
  categories.forEach((element, index) => {
    const button = document.createElement("button");
    button.innerText = element.name;
    button.className = "category";
    button.classList.toggle("active", index === 0);
    button.dataset.category = element.name;
    filtersHtmlDiv.appendChild(button);

    button.addEventListener("click", () => {
      document.querySelectorAll('.category').forEach(button => {
        button.classList.remove('active');
      });
      button.classList.add('active');
      toggleWorks(button.dataset.category)
    });
  });
}

// Filtration

function toggleWorks(datasetCategory) {
  const figures = document.querySelectorAll(".workCard");
  if ("Tous" === datasetCategory) {
    figures.forEach((figure) => {
      figure.style.display = "block";
    });
  } else {
    figures.forEach((figure) => {
      figure.dataset.category === datasetCategory
        ? (figure.style.display = "block")
        : (figure.style.display = "none");
    });
  }
}


/**
 * Admin mode
 */
function setAdminMode() {
  if (sessionStorage.getItem("token")?.length == 143) {
    TODO:
  }
}
