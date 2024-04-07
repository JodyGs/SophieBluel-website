const baseApiUrl = "http://localhost:5678/api/";

// Constantes pour les IDs des éléments du formulaire
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

document.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  fetch(`${baseApiUrl}users/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }).then((response) => {
    if (response.status !== 200) {
      alert("Email ou mot de passe erronés");
    } else {
      response.json().then((data) => {
        sessionStorage.setItem("token", data.token);
        window.location.replace("index.html");
      });
    }
  });
});