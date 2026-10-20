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

// ---------- STATISTIQUES ----------
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

    // Meilleur étudiant
    const zoneMeilleur = document.getElementById("stat-meilleur");
    const zoneMeilleurNote = document.getElementById("stat-meilleur-note");

    if (total === 0) {
        zoneMeilleur.textContent = "-";
        zoneMeilleurNote.textContent = "";
    } else {
        let meilleur = Etudiants[0];
        Etudiants.forEach(function (e) {
            if (e.note > meilleur.note) {
                meilleur = e;
            }
        });

        zoneMeilleur.textContent = meilleur.prenom + " " + meilleur.nom;
        zoneMeilleurNote.textContent =
            "Note : " + String(meilleur.note).replace(".", ",") + "/20";
    }

    // Taux de réussite
    const taux = total > 0 ? (admis / total) * 100 : 0;
    document.getElementById("stat-taux").textContent =
        taux.toFixed(1).replace(".", ",") + " %";
}

// ---------- FILTRE PAR CLASSE ----------
function remplirFiltreClasses() {
    const select = document.getElementById("filtre-classe");
    const choixActuel = select.value;

    const classes = [];
    Etudiants.forEach(function (e) {
        if (!classes.includes(e.classe)) {
            classes.push(e.classe);
        }
    });

    select.innerHTML = '<option value="">Toutes les classes</option>';
    classes.forEach(function (c) {
        const option = document.createElement("option");
        option.value = c;
        option.textContent = c;
        select.appendChild(option);
    });

    // On remet le choix précédent s'il existe encore
    if (classes.includes(choixActuel)) {
        select.value = choixActuel;
    }
}

// ---------- AFFICHAGE DU TABLEAU ----------
function afficherEtudiant() {
    tableBody.innerHTML = "";

    remplirFiltreClasses();

    const recherche = document.getElementById("recherche").value.trim().toLowerCase();
    const classeChoisie = document.getElementById("filtre-classe").value;

    const liste = Etudiants.filter(function (e) {
        const texte = (e.prenom + " " + e.nom + " " + e.email + " " + e.classe).toLowerCase();
        const correspondRecherche = texte.includes(recherche);
        const correspondClasse = classeChoisie === "" || e.classe === classeChoisie;
        return correspondRecherche && correspondClasse;
    });

    const ordreTri = document.getElementById("tri-classe").value;

    if (ordreTri === "asc") {
        liste.sort(function (a, b) {
            return a.classe.localeCompare(b.classe, "fr");
        });
    } else if (ordreTri === "desc") {
        liste.sort(function (a, b) {
            return b.classe.localeCompare(a.classe, "fr");
        });
    }

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

// Écouteurs recherche / filtre / tri (une seule fois chacun)
document.getElementById("recherche").addEventListener("input", afficherEtudiant);
document.getElementById("filtre-classe").addEventListener("change", afficherEtudiant);
document.getElementById("tri-classe").addEventListener("change", afficherEtudiant);

// ---------- MODIFIER / SUPPRIMER ----------
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

// ---------- MESSAGES ----------
function afficherErreur(message) {
    const zone = document.getElementById("erreur");
    zone.textContent = message;
    zone.style.display = message === "" ? "none" : "block";
}

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

// ---------- VALIDATION ----------
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

// ---------- EXPORT CSV ----------
function exporterCSV() {
    if (Etudiants.length === 0) {
        afficherErreur("Aucun étudiant à exporter.");
        return;
    }

    const entete = ["nom", "prenom", "email", "classe", "note"];
    const lignes = Etudiants.map(function (e) {
        return [e.nom, e.prenom, e.email, e.classe, e.note]
            .map(function (v) {
                return '"' + String(v).replace(/"/g, '""') + '"';
            })
            .join(";");
    });

    const contenu = "\uFEFF" + entete.join(";") + "\n" + lignes.join("\n");
    const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(blob);
    lien.download = "etudiants.csv";
    lien.click();
    URL.revokeObjectURL(lien.href);

    afficherErreur("");
    afficherSucces("Export CSV réussi");
}

// ---------- IMPORT CSV ----------
function decouperLigneCSV(ligne) {
    const champs = [];
    let courant = "";
    let entreGuillemets = false;

    for (let i = 0; i < ligne.length; i++) {
        const c = ligne[i];
        if (c === '"') {
            if (entreGuillemets && ligne[i + 1] === '"') {
                courant += '"';
                i++;
            } else {
                entreGuillemets = !entreGuillemets;
            }
        } else if (c === ";" && !entreGuillemets) {
            champs.push(courant);
            courant = "";
        } else {
            courant += c;
        }
    }
    champs.push(courant);
    return champs.map(function (v) { return v.trim(); });
}

function importerCSV(texte) {
    const lignes = texte.replace(/^\uFEFF/, "").split(/\r?\n/).filter(function (l) {
        return l.trim() !== "";
    });

    if (lignes.length < 2) {
        afficherErreur("Le fichier CSV est vide.");
        return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let ajoutes = 0;
    let ignores = 0;

    // on saute la première ligne (en-tête)
    for (let i = 1; i < lignes.length; i++) {
        const [nom, prenom, email, classe, noteTexte] = decouperLigneCSV(lignes[i]);
        const note = parseFloat(String(noteTexte).replace(",", "."));

        const invalide =
            !nom || !prenom || !email || !classe ||
            !regexEmail.test(email) ||
            isNaN(note) || note < 0 || note > 20;

        const doublon = Etudiants.some(function (e) {
            return e.email.toLowerCase() === String(email).toLowerCase();
        });

        if (invalide || doublon) {
            ignores++;
            continue;
        }

        Etudiants.push({
            id: Date.now() + i,
            nom: nom,
            prenom: prenom,
            email: email,
            classe: classe,
            note: note
        });
        ajoutes++;
    }

    sauvegarder();
    afficherEtudiant();
    afficherErreur("");
    afficherSucces(ajoutes + " ajouté(s), " + ignores + " ignoré(s)");
}

document.getElementById("btn-export").addEventListener("click", exporterCSV);

document.getElementById("btn-import").addEventListener("click", function () {
    document.getElementById("fichier-csv").click();
});

document.getElementById("fichier-csv").addEventListener("change", function (e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    const lecteur = new FileReader();
    lecteur.onload = function () {
        importerCSV(lecteur.result);
    };
    lecteur.readAsText(fichier, "UTF-8");
    e.target.value = "";
});

// ---------- AJOUT / MODIFICATION ----------
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

    sauvegarder();
    afficherEtudiant();
    formulaire.reset();
});