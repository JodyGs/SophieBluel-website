const baseApiUrl = "http://localhost:5678/api/";

// Retrieve form elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Check presence of form elements
if (!emailInput || !passwordInput) {
  console.error("Les éléments du formulaire ne sont pas trouvés.");
}

// Form submission management
document.addEventListener("submit", (e) => {
  e.preventDefault();

  // Build formData object from form values
  const formData = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  // Send POST request to server
  fetch(`${baseApiUrl}users/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      // Checking the response
      if (response.status !== 200) {
        alert("Email ou mot de passe erronés");
      } else {
        // If the response is valid, retrieve JSON data
        response.json().then((data) => {
          // Token storage in sessionStorage
          sessionStorage.setItem("token", data.token);
          // Redirect to home page
          window.location.replace("index.html");
        });
      }
    })
    .catch((error) => {
      console.error("Une erreur s'est produite lors de la requête:", error);
      alert("Une erreur s'est produite lors de la connexion.");
    });
});