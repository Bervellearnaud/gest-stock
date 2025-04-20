const formConnexion = document.getElementById("formConnexion");
const messageErreur = document.getElementById("messageErreur");
const connexionSection = document.getElementById("connexion-section");
const dashboardSection = document.getElementById("dashboard-section");
const nomUtilisateurSpan = document.getElementById("nomUtilisateur");
const roleUtilisateurSpan = document.getElementById("roleUtilisateur");
const btnDeconnexion = document.getElementById("btnDeconnexion");

function afficherDashboard(user) {
  connexionSection.style.display = "none";
  dashboardSection.style.display = "block";
  nomUtilisateurSpan.textContent = user.username;
  roleUtilisateurSpan.textContent = user.role;

  if (user.role === "admin") {
    afficherGestionUtilisateurs();
  }
}

btnDeconnexion.addEventListener("click", () => {
  localStorage.removeItem("sessionUser");
  dashboardSection.style.display = "none";
  connexionSection.style.display = "block";
  messageErreur.textContent = "";
  formConnexion.reset();
});

window.addEventListener("load", () => {
  const sessionUser = JSON.parse(localStorage.getItem("sessionUser"));
  if (sessionUser) {
    afficherDashboard(sessionUser);
  }
});

formConnexion.addEventListener("submit", (e) => {
  e.preventDefault();
  messageErreur.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const users = getUsers();

  const user = users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );

  if (user) {
    localStorage.setItem("sessionUser", JSON.stringify(user));
    afficherDashboard(user);
  } else {
    messageErreur.textContent = "Identifiants incorrects ou rôle non valide.";
  }
});
