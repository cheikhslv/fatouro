// ⬇️ À MODIFIER : l'email qui reçoit une copie de chaque commande (compte de la boutique)
const MOM_EMAIL = "omzosylla2003@gmail.com";

// ⬇️ Lien public du logo Fatouro (ex. depuis postimages, finit par .jpg/.png).
//    Laisse "" pour afficher le texte « FATOURO » à la place.
const LOGO_URL = "https://i.postimg.cc/Dz1cRDky/Whats-App-Image-2026-06-24-at-19-41-22.jpg";

// (FACULTATIF) ID d'un Google Sheet "Commandes" pour journaliser les ventes. "" = rien.
const LOG_SHEET_ID = "";

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    const nom = d.customer_name || "client";
    const sujet = "Votre reçu Fatouro — " + (d.article || "commande");

    const texte =
      "Bonjour " + nom + ",\n\nMerci pour votre commande chez Fatouro.\n\n" +
      "Article : " + (d.article || "") + " (" + (d.category || "") + ")\n" +
      "Montant : " + (d.price || "") + "\n" +
      "Mode de paiement : " + (d.payment_method || "") + "\n\n" +
      "Téléphone : " + (d.customer_phone || "") + "\nEmail : " + (d.customer_email || "") +
      "\n\nLivraison : nous vous contacterons pour organiser la livraison (lieu et frais éventuels)." +
      "\n\nNous revenons vers vous pour confirmer. À très vite !\nFatouro";

    const entete = LOGO_URL
      ? '<img src="' + LOGO_URL + '" alt="Fatouro" style="height:56px;width:auto;display:inline-block">'
      : '<div style="font-size:30px;letter-spacing:6px;color:#f4efe6;font-weight:bold">FATOURO</div>';

    const ligne = (label, val) =>
      '<tr><td style="padding:10px 0;color:#9a9486;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.07)">' +
      label + '</td><td style="padding:10px 0;color:#f4efe6;font-size:15px;text-align:right;border-bottom:1px solid rgba(255,255,255,.07)">' +
      (val || "—") + "</td></tr>";

    const photo = d.photo
      ? '<div style="text-align:center;margin:18px 0"><img src="' + d.photo +
        '" alt="" style="max-width:200px;border-radius:8px"></div>'
      : "";

    const html =
      '<div style="background:#0e0e0e;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">' +
        '<div style="max-width:540px;margin:0 auto;background:#141210;border:1px solid rgba(201,162,75,.25);border-radius:10px;overflow:hidden">' +
          '<div style="background:#000;padding:24px 28px;text-align:center;border-bottom:1px solid rgba(201,162,75,.25)">' +
            entete +
            '<div style="font-size:11px;letter-spacing:4px;color:#c9a24b;text-transform:uppercase;margin-top:8px">Reçu de commande</div>' +
          '</div>' +
          '<div style="padding:28px">' +
            '<p style="color:#f4efe6;font-size:16px;margin:0 0 6px">Bonjour <b>' + nom + '</b>,</p>' +
            '<p style="color:#a9a294;font-size:14px;line-height:1.6;margin:0 0 18px">Merci pour votre commande chez Fatouro. Voici le récapitulatif :</p>' +
            photo +
            '<table style="width:100%;border-collapse:collapse;margin:8px 0 20px">' +
              ligne("Article", d.article) +
              ligne("Catégorie", d.category) +
              ligne("Montant", d.price) +
              ligne("Mode de paiement", d.payment_method) +
            '</table>' +
            '<p style="color:#9a9486;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px">Vos coordonnées</p>' +
            '<p style="color:#e7dfcd;font-size:14px;margin:0 0 4px">📞 ' + (d.customer_phone || "—") + '</p>' +
            '<p style="color:#e7dfcd;font-size:14px;margin:0 0 22px">✉️ ' + (d.customer_email || "—") + '</p>' +
            '<div style="background:#0e0e0e;border:1px solid rgba(201,162,75,.25);border-radius:8px;padding:16px 18px;margin:0 0 22px">' +
              '<p style="color:#c9a24b;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px">🚚 Livraison</p>' +
              '<p style="color:#cfc9bb;font-size:13px;line-height:1.6;margin:0">Notre équipe vous contactera pour organiser la livraison (lieu et frais éventuels) et confirmer la réception de votre paiement.</p>' +
            '</div>' +
            '<p style="color:#a9a294;font-size:13px;line-height:1.6;margin:0">Merci de votre confiance. À très vite chez Fatouro.</p>' +
          '</div>' +
          '<div style="background:#000;padding:16px 28px;text-align:center;color:#6f6a5e;font-size:11px;letter-spacing:1px">FATOURO — Prêt-à-porter sénégalais</div>' +
        '</div>' +
      '</div>';

    const dest = d.customer_email || MOM_EMAIL;
    MailApp.sendEmail({
      to: dest,
      bcc: d.customer_email ? MOM_EMAIL : "",
      subject: sujet,
      body: texte,
      htmlBody: html,
      name: "Fatouro",
    });

    if (LOG_SHEET_ID) {
      const sh = SpreadsheetApp.openById(LOG_SHEET_ID).getSheets()[0];
      sh.appendRow([
        new Date(), d.customer_name, d.customer_phone, d.customer_email,
        d.article, d.category, d.price, d.payment_method,
      ]);
    }

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  }
}
