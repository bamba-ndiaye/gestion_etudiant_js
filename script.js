// console.log("Script chargé ✅");
// let Etudiants = [];

let Etudiants = JSON.parse(localStorage.getItem("Etudiants")) || [];
let idEnModification = null;

const formulaire = document.getElementById("form");
const tableBody = document.getElementById("table-body");

function sauvegarder() {
    localStorage.setItem("Etudiants", JSON.stringify(Etudiants));
}

function calculResultat(note) {
    if (note >= 10) {
        return "Admis";
    }
    return "Echec";
}

function mettreAJourStats() {
    const total = Etudiants.length;
    const admis = Etudiants.filter(function (e) {
        return e.note >= 10;
    }).length;

    let somme = 0;
    Etudiants.forEach(function (e) {
        somme += e.note;
    });
    const moyenne = total > 0 ? somme / total : 0;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-admis").textContent = admis;
    document.getElementById("stat-moyenne").textContent =
        moyenne.toFixed(2).replace(".", ",") + "/20";
}

function afficherEtudiant() {
    tableBody.innerHTML = "";

    const recherche = document.getElementById("recherche").value.trim().toLowerCase();

    const liste = Etudiants.filter(function (e) {
        const texte = (e.prenom + " " + e.nom + " " + e.email + " " + e.classe).toLowerCase();
        return texte.includes(recherche);
    });

    if (liste.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;">Aucun étudiant trouvé.</td></tr>';
        mettreAJourStats();
        return;
    }

    liste.forEach(function (etudiant) {
        const ligne = document.createElement("tr");
        const resultat = calculResultat(etudiant.note);
        const classeBadge = resultat === "Admis" ? "badge-success" : "badge-danger";

        ligne.innerHTML =
            "<td>" + etudiant.prenom + " " + etudiant.nom + "</td>" +
            "<td>" + etudiant.email + "</td>" +
            "<td>" + etudiant.classe + "</td>" +
            "<td>" + etudiant.note + "/20</td>" +
            '<td><span class="badge ' + classeBadge + '">' + resultat + "</span></td>" +
            "<td>" +
            '<button class="btn-action btn-edit">Modifier</button> ' +
            '<button class="btn-action btn-delete">Supprimer</button>' +
            "</td>";

        ligne.querySelector(".btn-edit").addEventListener("click", function () {
            modifierEtudiant(etudiant.id);
        });
        ligne.querySelector(".btn-delete").addEventListener("click", function () {
            supprimerEtudiant(etudiant.id);
        });

        tableBody.appendChild(ligne);
    });

    mettreAJourStats();
}
document.getElementById("recherche").addEventListener("input", afficherEtudiant);

function modifierEtudiant(id) {
    const etudiant = Etudiants.find(function (e) {
        return e.id === id;
    });

    document.getElementById("nom").value = etudiant.nom;
    document.getElementById("prenom").value = etudiant.prenom;
    document.getElementById("email").value = etudiant.email;
    document.getElementById("classe").value = etudiant.classe;
    document.getElementById("note").value = etudiant.note;

    idEnModification = id;
    document.getElementById("btn").textContent = "Enregistrer les modifications";
    afficherErreur("");
    window.scrollTo(0, 0);
}

function supprimerEtudiant(id) {
    if (!confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
        return;
    }

    Etudiants = Etudiants.filter(function (etudiant) {
        return etudiant.id !== id;
    });

    if (idEnModification === id) {
        idEnModification = null;
        formulaire.reset();
        document.getElementById("btn").textContent = "Ajouter l'étudiant";
    }

    sauvegarder();
    afficherSucces("Étudiant supprimé");
    afficherEtudiant();
}

function afficherErreur(message) {
    const zone = document.getElementById("erreur");
    zone.textContent = message;
    zone.style.display = message === "" ? "none" : "block";
}

// les nouveaux fonctions

let timerSucces;

function afficherSucces(message) {
    const zone = document.getElementById("mgs");
    zone.textContent = message;
    zone.classList.add("visible");

    clearTimeout(timerSucces);
    timerSucces = setTimeout(function () {
        zone.classList.remove("visible");
    }, 3000);
}

function valider(nom, prenom, email, classe, noteTexte) {
    if (nom === "" || prenom === "" || email === "" || classe === "" || noteTexte === "") {
        return "Tous les champs sont obligatoires.";
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        return "L'adresse e-mail n'est pas valide.";
    }

    const note = parseFloat(noteTexte.replace(",", "."));
    if (isNaN(note)) {
        return "La note doit être un nombre.";
    }
    if (note < 0 || note > 20) {
        return "La note doit être comprise entre 0 et 20.";
    }

    const doublon = Etudiants.some(function (e) {
        return e.email.toLowerCase() === email.toLowerCase() && e.id !== idEnModification;
    });
    if (doublon) {
        return "Cet e-mail est déjà utilisé par un autre étudiant.";
    }

    return "";
}

afficherEtudiant();

formulaire.addEventListener("submit", function (e) {
    e.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const classe = document.getElementById("classe").value.trim();
    const noteTexte = document.getElementById("note").value.trim();

    const erreur = valider(nom, prenom, email, classe, noteTexte);
    if (erreur !== "") {
        afficherErreur(erreur);
        return;
    }
    afficherErreur("");

    const note = parseFloat(noteTexte.replace(",", "."));

    if (idEnModification === null) {
        Etudiants.push({
            id: Date.now(),
            nom: nom,
            prenom: prenom,
            email: email,
            classe: classe,
            note: note
        });

        // nouveau
        afficherSucces("Étudiant ajouté avec succès");
    } else {
        const etudiant = Etudiants.find(function (e) {
            return e.id === idEnModification;
        });
        etudiant.nom = nom;
        etudiant.prenom = prenom;
        etudiant.email = email;
        etudiant.classe = classe;
        etudiant.note = note;

        idEnModification = null;
        afficherSucces("Étudiant modifié avec succès");
        document.getElementById("btn").textContent = "Ajouter l'étudiant";
    }

    // Etudiants.push(etudiant);
    // console.log(Etudiants);
    sauvegarder();
    afficherEtudiant();
    formulaire.reset();
});