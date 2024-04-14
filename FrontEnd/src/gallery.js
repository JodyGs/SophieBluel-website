const apiBaseUrl = "http://localhost:5678/api/";
const galleryHtmlDiv = document.querySelector('.gallery');
const filtersHtmlDiv = document.querySelector('.filters');
const modal = document.querySelector(".modal");

let galleryData;
let categories;
let modalStep;
let pictureInput;
let newWork


/**
 * Call API
 */

async function callAPI(path) {
  fetch(`${apiBaseUrl}${path}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur lors de la requête à l'API`);
      }
      return response.json();
    })
    .then(data => {
      galleryData = data;
      displayGallery(galleryData);
      getSingleCategoriesFromWorks(galleryData);
      setAdminMode();
    })
    .catch(error => {
      console.error(`Erreur lors de la récupération des données de l'API: ${error}`);
    });
}

// Utiliser addEventListener au lieu de window.onload
window.addEventListener('load', () => {
  callAPI("works");
});

/**
 *  Create on HTML
 */

// Works
function displayGallery(data) {
  // Vide le contenu de l'élément HTML de la galerie
  galleryHtmlDiv.innerHTML = "";

  // Crée les éléments de la galerie à partir des données
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

  // Ajoute le fragment contenant les éléments de la galerie à l'élément HTML de la galerie
  galleryHtmlDiv.appendChild(fragment);
}

// Filter Buttons
function getSingleCategoriesFromWorks(data) {
  let listOfCategories = new Set();
  data.forEach((el) => {
    listOfCategories.add(JSON.stringify(el.category));
  });
  const arrayOfStrings = [...listOfCategories];
  categories = arrayOfStrings.map((string) => JSON.parse(string));

  categories.unshift({ id: 0, name: "Tous" });

  displayFiltersButton(categories);
}

function displayFiltersButton(categories) {
  filtersHtmlDiv.innerHTML = ""; // Clear existing filters
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
      toggleWorks(button.dataset.category);
    });
  });
}

function setAdminMode() {
  //display admin mode if token is found and has the expected length (optional chaining)
  if (sessionStorage.getItem("token")?.length == 143) {

    document.querySelector(".filters").style.display = "none";
    document.getElementById("logLink").innerText = "logout";

    const body = document.querySelector("body");
    const infoBar = document.createElement("div");
    const editMode = document.createElement("p");

    infoBar.className = "infoBar";
    editMode.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Mode édition`;

    body.insertAdjacentElement("afterbegin", infoBar);
    infoBar.append(editMode);

    const editBtn = `<button class="editBtn"><i class="fa-regular fa-pen-to-square"></i>Modifier</p>`;
    document.querySelector("#portfolio h2").insertAdjacentHTML("afterend", editBtn);

    document.querySelector("#portfolio button").addEventListener("click", openModal);
  }
}

// Filtration
function toggleWorks(datasetCategory) {
  const figures = document.querySelectorAll(".workCard");
  figures.forEach((figure) => {
    if ("Tous" === datasetCategory || figure.dataset.category === datasetCategory) {
      figure.style.display = "block";
    } else {
      figure.style.display = "none";
    }
  });
}

/**
 * Modal
 */
export function openModal(data) {
  data = galleryData;
  const token = sessionStorage.getItem("token");
  if (token && token.length === 143) {
    modal.style.display = "flex";
    document.querySelector("#addPicture").style.display = "none";
    document.querySelector("#editGallery").style.display = "flex";
    displayModalGallery(galleryData);
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
  data.forEach((i) => {
    const miniWork = document.createElement("figure");
    const workImage = document.createElement("img");
    const edit = document.createElement("figcaption");
    const trashCan = document.createElement("i");
    trashCan.id = i.id;
    trashCan.classList.add("fa-solid", "fa-trash-can");
    workImage.src = i.imageUrl;
    workImage.alt = i.title;
    edit.innerText = "éditer";
    miniWork.className = "miniWork";
    modalContent.appendChild(miniWork);
    miniWork.append(workImage, edit, trashCan);
  });
}

function handleButtonClicks(event) {
  if (event.target.matches(".fa-trash-can")) {
    deleteBtn(event);
  } else if (event.target.id === "addPictureBtn") {
    openNewWorkForm();
  }
}

function openNewWorkForm() {
  modalStep = 1;

  // Vérification de la présence des éléments du formulaire avant de les manipuler
  const addPictureElement = document.querySelector("#addPicture");
  const editGalleryElement = document.querySelector("#editGallery");
  const labelPhotoElement = document.querySelector("#labelPhoto");
  const picturePreviewElement = document.querySelector("#picturePreview");
  const validerElement = document.querySelector("#valider");

  if (addPictureElement && editGalleryElement && labelPhotoElement && picturePreviewElement && validerElement) {
    // Affichage des éléments du formulaire
    addPictureElement.style.display = "flex";
    editGalleryElement.style.display = "none";
    labelPhotoElement.style.display = "flex";
    picturePreviewElement.style.display = "none";
    validerElement.style.backgroundColor = "#A7A7A7";
    document.getElementById("addPictureForm").reset();
    callAPICategories();

    // Affichage de l'aperçu de l'image
    pictureInput = document.querySelector("#photo");
    pictureInput.onchange = picturePreview;

    // Événements
    document.querySelector("#addPictureForm").onchange = changeSubmitBtnColor;
    document.addEventListener("click", closeModal);
    document.querySelector(".modalHeader .fa-arrow-left").addEventListener("click", openModal);
    document.removeEventListener("click", openNewWorkForm);
    document.removeEventListener("click", deleteBtn);
    document.addEventListener("click", newWorkFormSubmit);
  }
}

function callAPICategories() {
  let selectCategories;
  fetch(`${apiBaseUrl}categories`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur lors de la requête à l'API`);
      }
      return response.json();
    })
    .then(data => {
      selectCategories = data
      selectCategoryForm(selectCategories);

    })
    .catch(error => {
      console.error(`Erreur lors de la récupération des données de l'API: ${error}`);
    });
}

function selectCategoryForm(data) {

  const selectElement = document.querySelector("#selectCategory");
  if (selectElement) {
    selectElement.innerHTML = "";
    data.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.innerText = category.name;
      option.id = category.id;
      selectElement.appendChild(option);
    });
  }
}

function deleteBtn(e) {
  e.preventDefault();
  // Vérification si le bouton cliqué correspond à l'icône de suppression
  if (e.target.matches(".fa-trash-can")) {
    deleteWork(e.target.id);
  }
}

function deleteWork(id) {
  // Authentification de l'utilisateur et envoi de la réponse de l'API
  let token = sessionStorage.getItem("token");
  // Utilisation de l'URL de base pour former l'URL complète de la requête
  const url = `${apiBaseUrl}works/${id}`;
  fetch(url, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    // Utilisation d'une fonction fléchée pour la gestion de la réponse fetch
    // Vérification si la réponse est positive ou non
    if (response.ok) {
      alert("Projet supprimé avec succès");
      // Suppression du projet du tableau des données
      galleryData = galleryData.filter((work) => work.id != id);
      // Affichage des galeries mises à jour
      displayGallery(galleryData);
      displayModalGallery(galleryData);
    } else {
      alert("Erreur : " + response.status);
      // Fermeture du modal en cas d'erreur
      closeModal();
    }
  });
}

function picturePreview() {
  const [file] = pictureInput.files;
  if (file) {
    document.querySelector("#picturePreviewImg").src = URL.createObjectURL(file);
    document.querySelector("#picturePreview").style.display = "flex";
    document.querySelector("#labelPhoto").style.display = "none";
  }
}

function newWorkFormSubmit(e) {
  if (e.target === document.querySelector("#valider")) {
    e.preventDefault();
    postNewWork();
  }
}

function changeSubmitBtnColor() {
  const select = document.getElementById("selectCategory");
  if (document.getElementById("title").value !== "" && document.getElementById("photo").files[0] !== undefined && select.options[select.selectedIndex].id !== "") {
    document.querySelector("#valider").style.backgroundColor = "#1D6154";
  }
}

//POST new work
function postNewWork() {
  let token = sessionStorage.getItem("token");
  const select = document.getElementById("selectCategory");
  //get data from form
  const title = document.getElementById("title").value;
  const categoryName = select.options[select.selectedIndex].innerText;
  const categoryId = select.options[select.selectedIndex].id;
  const image = document.getElementById("photo").files[0];
  //check form validity
  let validity = formValidation(image, title, categoryId);
  if (validity === true) {
    //create FormData
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", categoryId);
    // send collected data to API
    sendNewData(token, formData, title, categoryName);
  }
};

//form validation
const formValidation = function (image, title, categoryId) {
  if (image == undefined) {
    alert("Veuillez ajouter une image");
    return false;
  }
  if (title.trim().length == 0) {
    alert("Veuillez ajouter un titre");
    return false;
  }
  if (categoryId == "") {
    alert("Veuillez choisir une catégorie");
    return false;
  } else {
    return true;
  }
}

//add new work in galleryData array for dynamic display using API response
const addTogalleryData = function (data, categoryName) {
  newWork = {};
  newWork.title = data.title;
  newWork.id = data.id;
  newWork.category = { "id": data.categoryId, "name": categoryName };
  newWork.imageUrl = data.imageUrl;
  galleryData.push(newWork);
}

//API call for new work
function sendNewData(token, formData, title, categoryName) {
  fetch(`${apiBaseUrl}works`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        alert("Nouveau fichier envoyé avec succés : " + title);
        return response.json();
      } else {
        console.error("Erreur:", response.status);
      }
    })
    .then((data) => {
      addTogalleryData(data, categoryName);
      displayGallery(galleryData);
      document.querySelector(".modal").style.display = "none";
      document.removeEventListener("click", closeModal);
      modalStep = null;
    })
    .catch((error) => console.error("Erreur:", error));
}

