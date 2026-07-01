# 🧺 Gérer mes articles avec Google Sheets

Ce guide t'explique, **sans toucher au code**, comment ajouter des articles,
mettre les prix et gérer le stock de la boutique Fatouro.

Tu remplis un **tableur Google** → le site se met à jour tout seul. ✨

---

## 1. Créer le tableur

1. Va sur **[sheets.google.com](https://sheets.google.com)** → **+ Nouveau tableur**.
2. Sur la **première ligne**, écris exactement ces titres de colonnes (une par case) :

| Nom | Catégorie | Prix | Stock | Photo | En vente | Nom EN | Nouveauté | Couleurs |
|-----|-----------|------|-------|-------|----------|--------|-----------|----------|

> L'ordre des colonnes n'a pas d'importance, mais les **titres doivent être écrits comme ci-dessus**.
> Les colonnes **Nom EN**, **Nouveauté** et **Couleurs** sont facultatives.

3. À partir de la 2ᵉ ligne, ajoute **un article par ligne**. Exemple :

| Nom | Catégorie | Prix | Stock | Photo | En vente | Nom EN | Nouveauté | Couleurs |
|-----|-----------|------|-------|-------|----------|--------|-----------|----------|
| Boubou brodé | Femmes | 25000 | 3 | | oui | Embroidered boubou | oui | Rouge, Bleu marine, Beige |
| Caftan en lin | Hommes | 30000 | 0 | | oui | Linen kaftan | | Blanc, Noir |
| Tenue enfant wax | Enfants | 15000 | 5 | | oui | | | |

### Que mettre dans chaque colonne
- **Nom** : le nom du modèle.
- **Catégorie** : `Femmes`, `Hommes` ou `Enfants` (c'est ce qui range l'article dans la bonne page).
- **Prix** : juste le nombre, ex. `25000` → le site affichera **25 000 FCFA**.
  (Tu peux aussi écrire un texte comme `Sur demande`.)
- **Stock** : le nombre en stock. **`0` = l'article s'affiche en « Épuisé »**.
- **Photo** : le lien d'une image (voir §4). Laisse **vide** pour afficher un « F » élégant.
- **En vente** : `oui` pour afficher l'article, `non` pour le **cacher** du site.
- **Nom EN** *(option)* : le nom en anglais (pour le bouton EN du site).
- **Nouveauté** *(option)* : `oui` pour que l'article apparaisse aussi dans **« Nouveautés »** sur l'accueil.
- **Couleurs** *(option)* : les couleurs disponibles du modèle, **séparées par des virgules**,
  ex. `Rouge, Bleu marine, Beige`. Le site affiche des **pastilles cliquables** sur la fiche ;
  le client choisit sa couleur, qui part ensuite dans la commande WhatsApp et le reçu.
  Laisse **vide** si l'article n'a qu'une seule couleur.

---

## 2. Publier le tableur (à faire **une seule fois**)

1. Dans le tableur : menu **Fichier → Partager → Publier sur le Web**.
2. Onglet **Lien** : choisis **la feuille** (ex. *Feuille 1*) et le format **CSV**.
3. Clique **Publier** → confirme. Google te donne un lien qui finit par **`output=csv`**.
4. **Copie ce lien.**

> 🔒 Publier ne rend visible que le **contenu de ce tableur** (tes articles), rien d'autre de ton compte Google.

---

## 3. Brancher le lien au site (une seule fois)

1. Ouvre le fichier **`js/script.js`**.
2. Tout en haut, dans `CONFIG`, colle ton lien entre les guillemets :

```js
sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/XXXXX/pub?gid=0&single=true&output=csv",
```

3. Enregistre, puis **publie la modification** (voir le README pour `git push`).

✅ **C'est fini !** Désormais, pour gérer ta boutique tu n'as plus qu'à **modifier le tableur** :
- Nouvelle ligne = nouvel article sur le site.
- Tu changes le **prix** ou le **stock** = mis à jour automatiquement.
- Stock à **0** = badge « Épuisé ». **En vente = non** = article retiré.

> ⏱️ Google met parfois **quelques minutes** à rafraîchir le tableur publié. Patiente un peu si le changement n'apparaît pas tout de suite.

---

## 4. Mettre la photo d'un article (en 3 gestes)

Pour afficher la photo d'un article, il faut un **lien d'image**. Le plus simple,
gratuit et sans créer de compte : **postimages.org**.

### Étape par étape
1. Va sur **[postimages.org](https://postimages.org)**.
2. Clique sur **« Choisir des images »** (Choose images) et sélectionne ta photo
   (depuis ton téléphone ou ton ordinateur). Attends qu'elle se charge.
3. Une liste de liens apparaît. Ouvre le menu déroulant et choisis
   **« Lien direct »** (Direct link), puis clique sur **« Copier »**.
   > 👉 C'est bien **« Lien direct »** qu'il faut (le lien finit par `.jpg` ou `.png`).
4. Reviens dans ton tableur Google, va sur le bon **onglet** (Femmes / Hommes / Enfants),
   et **colle** ce lien dans la colonne **Photo**, sur la ligne du bon article.
5. Attends 2-3 minutes → la photo apparaît sur le site. ✅

### Plusieurs photos pour un même article 📸📸
Tu peux mettre **plusieurs photos** pour un article : colle simplement **plusieurs liens**
dans la même case **Photo**, séparés par un **espace** (ou un retour à la ligne avec Alt+Entrée).

Exemple dans la case Photo :
```
https://i.postimg.cc/aaa/face.jpg https://i.postimg.cc/bbb/dos.jpg
```
Sur le site, en cliquant sur l'article, le client verra une **galerie** avec des flèches
pour faire défiler toutes les photos.

### Bon à savoir
- Cliquer sur un article ouvre sa **fiche détaillée** (grande photo + prix + bouton Commander).
- Photo laissée **vide** → le site affiche un « F » élégant.
- Les photos **verticales** (format portrait, comme sur Instagram) rendent le mieux.

---

## Besoin d'aide ?
Si un article ne s'affiche pas : vérifie que **En vente = oui**, que la **Catégorie**
est bien `Femmes`/`Hommes`/`Enfants`, et que le tableur est bien **publié en CSV**.
