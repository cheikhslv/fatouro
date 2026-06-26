# Fatouro

Site vitrine de **Fatouro** — marque sénégalaise de prêt-à-porter inspirée de la mode africaine (femmes, hommes, enfants). Boutique située aux **Almadies, Dakar**.

## 🌐 Aperçu

Site vitrine statique (HTML / CSS / JavaScript), sans dépendance ni étape de build.
Il présente la marque, les collections (Femmes · Hommes · Enfants), un catalogue,
et permet de **commander directement via WhatsApp**.

| Section    | Contenu                                              |
|------------|------------------------------------------------------|
| Accueil    | Logo, slogan, appels à l'action                      |
| Collections| Femmes · Hommes · Enfants                            |
| Catalogue  | Grille de modèles avec bouton « Commander » WhatsApp |
| À propos   | Histoire de la marque                                |
| Contact    | Boutique Almadies · WhatsApp · Instagram             |

## 📁 Structure

```
.
├── index.html          Page principale
├── css/style.css       Styles
├── js/script.js        Catalogue + liens WhatsApp/Instagram (à configurer)
└── assets/logo.jpeg    Logo Fatouro
```

## ⚙️ Personnalisation

Tout se règle dans **`js/script.js`** :

1. **Numéro WhatsApp** — dans l'objet `CONFIG`, remplacez `221770000000`
   par votre numéro au format international, sans `+` ni espaces
   (ex. Sénégal : `221771234567`).
2. **Instagram** — remplacez `fatouro` par votre identifiant réel (sans `@`).
3. **Catalogue** — modifiez le tableau `PRODUITS` (nom, catégorie, prix, image).
   Laissez `image: ""` pour afficher l'initiale « F » stylisée.

## ▶️ Lancer en local

Ouvrez simplement `index.html` dans un navigateur, ou servez le dossier :

```bash
# Python
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

## 🚀 Mettre en ligne gratuitement (GitHub Pages)

1. Poussez le code sur GitHub (branche `main`).
2. Dépôt → **Settings → Pages**.
3. *Source* : **Deploy from a branch** → branche `main` / dossier `/ (root)`.
4. Le site sera publié sur `https://<votre-utilisateur>.github.io/fatouro/`.

## 📌 À compléter

- [ ] Numéro WhatsApp réel
- [ ] Identifiant Instagram réel
- [ ] Photos des modèles (remplacer les visuels de démonstration)
- [ ] Adresse précise / horaires de la boutique
