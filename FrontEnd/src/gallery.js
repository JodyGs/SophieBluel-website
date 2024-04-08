import { setAdminMode } from "./admin.js"

const apiBaseUrl = "http://localhost:5678/api/"
const galleryHtmlDiv = document.querySelector('.gallery')
const filtersHtmlDiv = document.querySelector('.filters')
const modal = document.querySelector(".modal");

let galleryData
let categories
let modalStep

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
      galleryData = data
      displayGallery(galleryData)
      getSingleCategoriesFromWorks(galleryData)
      setAdminMode()
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
 * Modal
 */
export function openModal(data) {
  data = galleryData
  const token = sessionStorage.getItem("token");
  if (token && token.length === 143) {
    modal.style.display = "flex";
    document.querySelector("#addPicture").style.display = "none";
    document.querySelector("#editGallery").style.display = "flex";
    displayModalGallery(galleryData)
    modalStep = 0;
    modal.addEventListener("click", closeModal);

    document.addEventListener("click", handleButtonClicks);
  }
}

function closeModal(e) {
  if (e.target.classList.contains("modal") || e.target.classList.contains("fa-xmark")) {
    modal.style.display = "none";
    modal.removeEventListener("click", closeModal);
    modalStep = null;
  }
}

function displayModalGallery(data) {
  const modalContent = document.querySelector(".modalContent");
  modalContent.innerHTML = "";
  //show all works in array
  data.forEach((i) => {
    //create elements
    const miniWork = document.createElement("figure");
    const workImage = document.createElement("img");
    const edit = document.createElement("figcaption");
    const trashCan = document.createElement("i");
    //trashcan ID is work ID
    trashCan.id = i.id;
    trashCan.classList.add("fa-solid", "fa-trash-can");
    workImage.src = i.imageUrl;
    workImage.alt = i.title;
    edit.innerText = "éditer";
    miniWork.className = "miniWork";
    //references to DOM
    modalContent.appendChild(miniWork);
    miniWork.append(workImage, edit, trashCan);
  });
}

function handleButtonClicks(event) {
  if (event.target.id === "deleteButton") {
    deleteBtn();
  } else if (event.target.id === "addPictureBtn") {
    openNewWorkForm();
  }
}

function openNewWorkForm() {
  console.log("New form");
}


/**
 * Upload
 */