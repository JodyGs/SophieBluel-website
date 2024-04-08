import { openModal } from "./gallery.js";

export function setAdminMode() {
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
