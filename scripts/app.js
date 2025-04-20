// Fonction utilitaire pour récupérer la session utilisateur à jour
function getSessionUser() {
  return JSON.parse(localStorage.getItem("sessionUser"));
}

// Variables globales
const seuilAlerte = 5;
let filtreRecherche = "";
let critereTri = "nom";
let pageActuelle = 1;
const articlesParPage = 5;

// Références DOM articles
const tableArticlesBody = document.querySelector("#tableArticles tbody");
const formArticle = document.getElementById("formArticle");
const articleIdInput = document.getElementById("articleId");
const nomArticleInput = document.getElementById("nomArticle");
const quantiteArticleInput = document.getElementById("quantiteArticle");
const fournisseurArticleInput = document.getElementById("fournisseurArticle");
const formTitle = document.getElementById("formTitle");
const btnAnnuler = document.getElementById("btnAnnuler");
const inputRecherche = document.getElementById("inputRecherche");
const selectTri = document.getElementById("selectTri");
const paginationDiv = document.getElementById("pagination");

// Références DOM utilisateurs
const gestionUtilisateursSection = document.getElementById(
  "gestion-utilisateurs"
);
const tableUtilisateursBody = document.querySelector(
  "#tableUtilisateurs tbody"
);
const formUtilisateur = document.getElementById("formUtilisateur");
const userIdInput = document.getElementById("userId");
const usernameUserInput = document.getElementById("usernameUser");
const passwordUserInput = document.getElementById("passwordUser");
const roleUserSelect = document.getElementById("roleUser");
const formUserTitle = document.getElementById("formUserTitle");
const btnAnnulerUser = document.getElementById("btnAnnulerUser");

// Générateur d’ID simple
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Initialisation utilisateurs par défaut
window.addEventListener("load", () => {
  let users = getUsers();
  if (users.length === 0) {
    addUser({
      id: generateId(),
      username: "admin",
      password: "adminpass",
      role: "admin",
    });
  }

  // Afficher les données si session active
  if (getSessionUser()) {
    afficherArticles();
    afficherGestionUtilisateurs();
  }
});

// AFFICHAGE ARTICLES
function afficherArticles() {
  const sessionUser = getSessionUser();
  if (!sessionUser) return;

  let articles = getArticles();

  // Filtrer
  if (filtreRecherche) {
    articles = articles.filter(
      (article) =>
        article.nom.toLowerCase().includes(filtreRecherche) ||
        article.fournisseur.toLowerCase().includes(filtreRecherche) ||
        article.auteur.toLowerCase().includes(filtreRecherche)
    );
  }

  // Trier
  articles.sort((a, b) => {
    if (critereTri === "quantite") {
      return a.quantite - b.quantite;
    } else if (critereTri === "dateAjout") {
      return new Date(a.dateAjout) - new Date(b.dateAjout);
    } else {
      return a[critereTri].localeCompare(b[critereTri]);
    }
  });

  // Pagination
  const totalPages = Math.ceil(articles.length / articlesParPage);
  if (pageActuelle > totalPages) pageActuelle = totalPages || 1;
  const start = (pageActuelle - 1) * articlesParPage;
  const end = start + articlesParPage;
  const articlesPage = articles.slice(start, end);

  // Affichage tableau
  tableArticlesBody.innerHTML = "";
  articlesPage.forEach((article) => {
    const tr = document.createElement("tr");

    const tdNom = document.createElement("td");
    tdNom.textContent = article.nom;
    tr.appendChild(tdNom);

    const tdQuantite = document.createElement("td");
    tdQuantite.textContent = article.quantite;
    if (article.quantite === 0) {
      tdQuantite.classList.add("quantite-epuise");
    } else if (article.quantite <= seuilAlerte) {
      tdQuantite.classList.add("quantite-faible");
    }
    tr.appendChild(tdQuantite);

    const tdFournisseur = document.createElement("td");
    tdFournisseur.textContent = article.fournisseur;
    tr.appendChild(tdFournisseur);

    const tdDate = document.createElement("td");
    tdDate.textContent = article.dateAjout;
    tr.appendChild(tdDate);

    const tdAuteur = document.createElement("td");
    tdAuteur.textContent = article.auteur;
    tr.appendChild(tdAuteur);

    const tdActions = document.createElement("td");
    // Seul admin ou auteur peut modifier/supprimer
    const canEdit =
      sessionUser.role === "admin" || sessionUser.username === article.auteur;
    if (canEdit) {
      const btnModifier = document.createElement("button");
      btnModifier.innerHTML = '<span class="material-icons">edit</span>'; // Icône de modification
      btnModifier.addEventListener("click", () => remplirFormulaire(article));
      tdActions.appendChild(btnModifier);

      const btnSupprimer = document.createElement("button");
      btnSupprimer.innerHTML = '<span class="material-icons">delete</span>'; // Icône de suppression
      btnSupprimer.style.marginLeft = "5px";
      btnSupprimer.addEventListener("click", () => {
        if (
          sessionUser.role !== "admin" &&
          sessionUser.username !== article.auteur
        ) {
          alert("Vous ne pouvez pas supprimer cet article.");
          return;
        }

        if (confirm(`Supprimer l'article "${article.nom}" ?`)) {
          deleteArticle(article.id);
          afficherArticles();
          resetFormulaire();
        }
      });
      tdActions.appendChild(btnSupprimer);
    } else {
      tdActions.textContent = "-";
    }

    tr.appendChild(tdActions);
    tableArticlesBody.appendChild(tr);
  });

  afficherPagination(totalPages);
}

// Formulaire article - ajout/modification
formArticle.addEventListener("submit", (e) => {
  e.preventDefault();
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    alert("Session expirée, veuillez vous reconnecter.");
    window.location.reload();
    return;
  }

  const id = articleIdInput.value;
  const nom = nomArticleInput.value.trim();
  const quantite = parseInt(quantiteArticleInput.value, 10);
  const fournisseur = fournisseurArticleInput.value.trim();
  const dateAjout = new Date().toLocaleString();
  const auteur = sessionUser.username;

  if (!nom || isNaN(quantite) || quantite < 0 || !fournisseur) {
    alert("Veuillez remplir correctement tous les champs.");
    return;
  }

  if (id) {
    const articles = getArticles();
    const articleOriginal = articles.find((a) => a.id === id);
    if (!articleOriginal) {
      alert("Article introuvable.");
      return;
    }

    if (
      sessionUser.role !== "admin" &&
      sessionUser.username !== articleOriginal.auteur
    ) {
      alert("Vous ne pouvez pas modifier cet article.");
      return;
    }

    const articleModifie = {
      id,
      nom,
      quantite,
      fournisseur,
      dateAjout: articleOriginal.dateAjout,
      auteur: articleOriginal.auteur,
    };
    updateArticle(articleModifie);
    alert("Article modifié avec succès.");
  } else {
    const nouvelArticle = {
      id: generateId(),
      nom,
      quantite,
      fournisseur,
      dateAjout,
      auteur,
    };
    addArticle(nouvelArticle);
    alert("Article ajouté avec succès.");
  }

  afficherArticles();
  resetFormulaire();
});

function remplirFormulaire(article) {
  articleIdInput.value = article.id;
  nomArticleInput.value = article.nom;
  quantiteArticleInput.value = article.quantite;
  fournisseurArticleInput.value = article.fournisseur;
  formTitle.textContent = "Modifier un article";
  formArticle.querySelector("button[type=submit]").textContent = "Modifier";
  btnAnnuler.style.display = "inline-block";
}

btnAnnuler.addEventListener("click", resetFormulaire);

function resetFormulaire() {
  articleIdInput.value = "";
  nomArticleInput.value = "";
  quantiteArticleInput.value = "";
  fournisseurArticleInput.value = "";
  formTitle.textContent = "Ajouter un article";
  formArticle.querySelector("button[type=submit]").textContent = "Ajouter";
  btnAnnuler.style.display = "none";
}

// Recherche et tri
inputRecherche.addEventListener("input", (e) => {
  filtreRecherche = e.target.value.toLowerCase();
  pageActuelle = 1;
  afficherArticles();
});

selectTri.addEventListener("change", (e) => {
  critereTri = e.target.value;
  afficherArticles();
});

// Pagination
function afficherPagination(totalPages) {
  paginationDiv.innerHTML = "";
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btnPage = document.createElement("button");
    btnPage.textContent = i;
    btnPage.disabled = i === pageActuelle;
    btnPage.addEventListener("click", () => {
      pageActuelle = i;
      afficherArticles();
    });
    paginationDiv.appendChild(btnPage);
  }
}

// --- Gestion utilisateurs ---
function afficherGestionUtilisateurs() {
  const sessionUser = getSessionUser();
  if (sessionUser && sessionUser.role === "admin") {
    gestionUtilisateursSection.style.display = "block";
    afficherUtilisateurs();
  } else {
    gestionUtilisateursSection.style.display = "none";
  }
}

function afficherUtilisateurs() {
  const users = getUsers();
  tableUtilisateursBody.innerHTML = "";
  users.forEach((user) => {
    const tr = document.createElement("tr");

    const tdUsername = document.createElement("td");
    tdUsername.textContent = user.username;
    tr.appendChild(tdUsername);

    const tdRole = document.createElement("td");
    tdRole.textContent = user.role;
    tr.appendChild(tdRole);

    const tdActions = document.createElement("td");
    const sessionUser = getSessionUser();
    // Modifier toujours visible pour admin
    const btnModifier = document.createElement("button");
    btnModifier.innerHTML = '<span class="material-icons">edit</span>'; // Icône de modification
    btnModifier.addEventListener("click", () =>
      remplirFormulaireUtilisateur(user)
    );
    tdActions.appendChild(btnModifier);

    // Supprimer interdit sur soi-même...
    if (user.username !== sessionUser.username) {
      const btnSupprimer = document.createElement("button");
      btnSupprimer.innerHTML = '<span class="material-icons">delete</span>'; // Icône de suppression
      btnSupprimer.style.marginLeft = "5px";
      btnSupprimer.addEventListener("click", () => {
        if (confirm(`Supprimer l'utilisateur "${user.username}" ?`)) {
          deleteUser(user.id);
          afficherUtilisateurs();
        }
      });
      tdActions.appendChild(btnSupprimer);
    } else {
      tdActions.appendChild(document.createTextNode("-"));
    }

    tr.appendChild(tdActions);
    tableUtilisateursBody.appendChild(tr);
  });
}

formUtilisateur.addEventListener("submit", (e) => {
  e.preventDefault();
  const sessionUser = getSessionUser();
  if (!sessionUser || sessionUser.role !== "admin") {
    alert("Accès refusé.");
    return;
  }

  const id = userIdInput.value;
  const username = usernameUserInput.value.trim();
  const password = passwordUserInput.value;
  const role = roleUserSelect.value;

  if (!username || (!password && !id) || !role) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const users = getUsers();

  // Vérifier si le nom d'utilisateur est déjà pris (pour ajout ou modification)
  if (users.some(u => u.username === username && u.id !== id)) {
    alert("Ce nom d'utilisateur est déjà pris.");
    return;
  }

  if (id) {
    // Modification utilisateur (non autorisée pour soi-même)
    if (id === sessionUser.id) {
      alert("Vous ne pouvez pas modifier votre propre compte ici.");
      return;
    }
    // Mettre à jour l'utilisateur
    const updatedUser = {
      id,
      username,
      password: password ? password : users.find(u => u.id === id).password,
      role
    };
    updateUser(updatedUser);
    alert("Utilisateur modifié avec succès.");
  } else {
    // Ajout nouvel utilisateur
    const newUser = {
      id: generateId(),
      username,
      password,
      role
    };
    addUser(newUser);
    alert("Utilisateur ajouté avec succès.");
  }

  afficherUtilisateurs();
  resetFormulaireUtilisateur();
});
