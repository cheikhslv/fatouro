# 💳 Activer le paiement & les reçus par email

Le site a déjà : un bouton **Payer** → **formulaire client** (prénom, nom, email, téléphone)
→ choix **Wave / Orange Money** → **reçu par email** au client + copie à la maman.

Il reste à coller quelques identifiants dans `js/script.js` (objet `CONFIG`).

---

## 1. Les reçus par email — avec le compte Google de la boutique

On utilise **Google Apps Script** : pas de service tiers, envoi via **le Gmail de la boutique**,
et possibilité de **journaliser** les commandes dans un Google Sheet.

1. Va sur **[script.google.com](https://script.google.com)** → **Nouveau projet**.
2. Efface le code par défaut, puis **copie-colle tout le contenu** du fichier
   **`google-apps-script.gs`** (dans le projet).
3. En haut du script, remplace `email-de-la-maman@gmail.com` par le **vrai email de la maman**.
   *(Facultatif : pour journaliser les ventes, mets l'ID d'un Google Sheet dans `LOG_SHEET_ID`.)*
4. Clique **Enregistrer** 💾.
5. Clique **Déployer** (en haut à droite) → **Nouveau déploiement**.
6. Type : **Application Web**. Réglages :
   - *Exécuter en tant que* : **Moi**
   - *Qui a accès* : **Tout le monde**
7. Clique **Déployer** → **Autoriser l'accès** (choisis ton compte Google, accepte les permissions).
8. Copie l'**URL de l'application Web** (finit par `/exec`).
9. Colle-la dans `js/script.js` :
   ```js
   appsScriptUrl: "https://script.google.com/macros/s/XXXXX/exec",
   ```

✅ C'est tout — les reçus partent depuis ton Gmail.

> ℹ️ Limite Gmail gratuit : ~100 emails/jour (largement suffisant).

---

## 2. Le paiement Wave & Orange Money

Dans `js/script.js`, objet `CONFIG.paiement` :
```js
paiement: {
  wave:   { lien: "https://pay.wave.com/m/XXXXXXXX/c/sn/" },
  orange: { code: "391XXXX", numero: "78 449 03 03" },
},
```
- **Wave** : lien de paiement depuis l'appli **Wave Business** (section « Lien de paiement »).
  Le montant de l'article est ajouté automatiquement.
- **Orange Money** : ton **code marchand** + le numéro. Le client paie puis confirme sur WhatsApp.

---

## ⚠️ Important (à savoir)
- Le reçu email = **commande passée / paiement annoncé**. Il ne **prouve pas** que l'argent est arrivé.
- La maman **vérifie le paiement réel** dans son appli **Wave / Orange Money marchand**, et recoupe
  avec l'email reçu (qui dit **qui** a commandé **quoi**).
- Pour un reçu **100 % vérifié automatiquement**, il faudrait un agrégateur (CinetPay) + un petit serveur.

---

## ✅ Une fois les identifiants collés
- Le client remplit le formulaire → choisit Wave ou Orange Money → reçoit son **reçu par email**.
- La maman reçoit une **copie de chaque commande** dans sa boîte mail (qui + quoi + montant + paiement).
