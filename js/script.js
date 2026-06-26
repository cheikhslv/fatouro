/* ===================================================================
   FATOURO — script
=================================================================== */

/* -------------------------------------------------------------------
 * 1. CONFIGURATION — à personnaliser
 * ----------------------------------------------------------------- */
const CONFIG = {
  // Numéro WhatsApp au format international SANS "+" ni espaces (ex. Sénégal : 221771234567)
  whatsapp: "221784490303",
  // Identifiant Instagram (sans @)
  instagram: "fatouro_the_brand",
  // --- MODE 1 : un lien CSV publié par catégorie (actif) ---
  // (Fichier → Publier sur le web → CSV, un lien par onglet)
  sheetCsvByCategory: {
    Femmes: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrRcMpw7UCenhkMys2BAWZB7tab_Dc-r7jwFrUc_SUdaayKKbSZ7AddN6e5aG1LDLhY58BJ8TFD54a/pub?gid=109925606&single=true&output=csv",
    Hommes:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrRcMpw7UCenhkMys2BAWZB7tab_Dc-r7jwFrUc_SUdaayKKbSZ7AddN6e5aG1LDLhY58BJ8TFD54a/pub?gid=1428091129&single=true&output=csv",
    Enfants: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrRcMpw7UCenhkMys2BAWZB7tab_Dc-r7jwFrUc_SUdaayKKbSZ7AddN6e5aG1LDLhY58BJ8TFD54a/pub?gid=877697971&single=true&output=csv",
  },

  // --- MODE 2 : lecture par nom d'onglet (si sheetId rempli) ---
  sheetId: "",
  sheetTabs: ["Femmes", "Hommes", "Enfants"],

  // --- MODE 3 : un seul tableur (si les deux ci-dessus sont vides) ---
  sheetCsvUrl: "",

  // --- EMAIL (reçu de commande via le compte Google de la boutique) ---
  // Colle ici l'URL de l'application web Google Apps Script (voir GUIDE-PAIEMENT.md).
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbz7e-kjTwkBVfY1w9V7sN3ym4499xooFA4RbKlmQrBlq6iU_cCfOYzrhFEIkocuBDx0/exec",

  // --- PAIEMENT (Wave / Orange Money) ---
  // Remplis ces valeurs quand tu les auras : les boutons s'activeront tout seuls.
  paiement: {
    wave: {
      // Lien de paiement Wave Business, ex : "https://pay.wave.com/m/XXXXXXXX/c/sn/"
      lien: "",
    },
    orange: {
      // Code marchand Orange Money, ex : "391XXXX"  +  le numéro qui reçoit
      code: "",
      numero: "",
    },
  },
};

/* -------------------------------------------------------------------
 * 2. ARTICLES DE SECOURS — utilisés tant que le tableur n'est pas branché
 *    (sur les pages collections). image: "" => initiale « F ».
 * ----------------------------------------------------------------- */
const PRODUITS = [
  { nom: "Boubou brodé",        en: "Embroidered boubou", categorie: "Femmes",  prix: "", stock: "", image: "" },
  { nom: "Ensemble wax",        en: "Wax set",            categorie: "Femmes",  prix: "", stock: "", image: "" },
  { nom: "Robe de cérémonie",   en: "Ceremony dress",     categorie: "Femmes",  prix: "", stock: "", image: "" },
  { nom: "Tailleur élégant",    en: "Elegant suit",       categorie: "Femmes",  prix: "", stock: "", image: "" },
  { nom: "Caftan en lin",       en: "Linen kaftan",       categorie: "Femmes",  prix: "", stock: "", image: "" },
  { nom: "Robe wax moderne",    en: "Modern wax dress",   categorie: "Femmes",  prix: "", stock: "", image: "" },
  { nom: "Chemise africaine",   en: "African shirt",      categorie: "Hommes",  prix: "", stock: "", image: "" },
  { nom: "Caftan élégant",      en: "Elegant kaftan",     categorie: "Hommes",  prix: "", stock: "", image: "" },
  { nom: "Boubou homme",        en: "Men's boubou",       categorie: "Hommes",  prix: "", stock: "", image: "" },
  { nom: "Ensemble brodé",      en: "Embroidered set",    categorie: "Hommes",  prix: "", stock: "", image: "" },
  { nom: "Veste wax",           en: "Wax jacket",         categorie: "Hommes",  prix: "", stock: "", image: "" },
  { nom: "Tenue enfant",        en: "Children's outfit",  categorie: "Enfants", prix: "", stock: "", image: "" },
  { nom: "Ensemble enfant wax", en: "Kids wax set",       categorie: "Enfants", prix: "", stock: "", image: "" },
  { nom: "Robe fillette",       en: "Girl's dress",       categorie: "Enfants", prix: "", stock: "", image: "" },
  { nom: "Boubou garçon",       en: "Boy's boubou",       categorie: "Enfants", prix: "", stock: "", image: "" },
];

let ARTICLES = null; // rempli depuis le tableur si disponible
let LANG = "fr";

/* -------------------------------------------------------------------
 * 3. Utilitaires
 * ----------------------------------------------------------------- */
const norm = (s) =>
  (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function lienWhatsApp(message) {
  const texte = encodeURIComponent(message || "Bonjour Fatouro, je souhaite passer une commande.");
  return `https://wa.me/${CONFIG.whatsapp}?text=${texte}`;
}

function categorieNormale(cat) {
  const c = norm(cat);
  if (c.startsWith("femme")) return "Femmes";
  if (c.startsWith("homme")) return "Hommes";
  if (c.startsWith("enfant")) return "Enfants";
  return cat || "";
}

function estEnVente(p) {
  const v = norm(p.envente !== undefined ? p.envente : "");
  return !(v === "non" || v === "no" || v === "0" || v === "false");
}

function estEpuise(p) {
  const s = (p.stock == null ? "" : p.stock).toString().trim();
  if (s === "") return false;
  const n = parseInt(s, 10);
  return !isNaN(n) && n <= 0;
}

// Prix : un nombre "25000" -> "25 000 FCFA" ; un texte est gardé tel quel ; vide -> null
function formatPrix(v) {
  const s = (v || "").toString().trim();
  if (!s) return null;
  const digits = s.replace(/[\s.]/g, "");
  if (/^\d+$/.test(digits)) {
    return Number(digits).toLocaleString("fr-FR").replace(/ /g, " ") + " FCFA";
  }
  return s;
}

/* -------------------------------------------------------------------
 * 4. Liens WhatsApp / Instagram
 * ----------------------------------------------------------------- */
function appliquerLiens() {
  const wa = lienWhatsApp();
  const insta = `https://instagram.com/${CONFIG.instagram}`;
  ["whatsappLink", "fabWhatsapp", "ctaWhatsapp", "footerWhatsapp"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = wa;
  });
  ["instagramLink", "footerInstagram"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = insta;
  });
}

/* -------------------------------------------------------------------
 * 5. Lecture du tableur Google (CSV publié)
 * ----------------------------------------------------------------- */
const ENTETES = {
  nom: "nom", name: "nom",
  categorie: "categorie", category: "categorie",
  prix: "prix", price: "prix",
  stock: "stock",
  photo: "image", image: "image", url: "image",
  envente: "envente", disponible: "envente", available: "envente",
  nomen: "en", nameen: "en",
  nouveaute: "nouveaute", nouveautes: "nouveaute", new: "nouveaute",
};

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Ordre des colonnes par défaut si l'onglet n'a PAS de ligne de titres.
const COLONNES_DEFAUT = ["nom", "categorie", "prix", "stock", "image", "envente", "en", "nouveaute"];

// Transforme les lignes CSV en articles. categorieParDefaut = nom de l'onglet (mode multi-onglets).
function lignesVersArticles(texteCsv, categorieParDefaut) {
  const rows = parseCSV(texteCsv).filter((r) => r.some((c) => c.trim() !== ""));
  if (!rows.length) return [];

  // Détecte une ligne de titres (contient « Nom »). Sinon, on suppose l'ordre par défaut.
  const entetes = rows[0].map((h) => norm(h).replace(/[^a-z]/g, ""));
  const aEntete = entetes.includes("nom");
  const champs = aEntete ? entetes.map((h) => ENTETES[h]) : COLONNES_DEFAUT;
  const lignes = aEntete ? rows.slice(1) : rows;

  return lignes.map((r) => {
    const o = {};
    champs.forEach((f, idx) => { if (f) o[f] = (r[idx] || "").trim(); });
    o.categorie = categorieNormale(o.categorie || categorieParDefaut || "");
    return o;
  });
}

async function chargerArticles() {
  // MODE 1 : un lien CSV publié par catégorie
  if (CONFIG.sheetCsvByCategory && Object.keys(CONFIG.sheetCsvByCategory).length) {
    try {
      const entrees = Object.entries(CONFIG.sheetCsvByCategory);
      const lots = await Promise.all(
        entrees.map(async ([cat, url]) => {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`${cat} HTTP ${res.status}`);
          return lignesVersArticles(await res.text(), cat);
        })
      );
      const tout = lots.flat().filter((a) => a.nom && estEnVente(a));
      return tout.length ? tout : null;
    } catch (e) {
      console.warn("Fatouro : liens CSV illisibles, articles de secours utilisés.", e);
      return null;
    }
  }

  // MODE 2 : un onglet par catégorie (lecture par nom d'onglet via gviz)
  if (CONFIG.sheetId && CONFIG.sheetTabs && CONFIG.sheetTabs.length) {
    try {
      const lots = await Promise.all(
        CONFIG.sheetTabs.map(async (tab) => {
          const url = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`${tab} HTTP ${res.status}`);
          return lignesVersArticles(await res.text(), tab);
        })
      );
      const tout = lots.flat().filter((a) => a.nom && estEnVente(a));
      return tout.length ? tout : null;
    } catch (e) {
      console.warn("Fatouro : onglets illisibles, articles de secours utilisés.", e);
      return null;
    }
  }

  // MODE 2 : un seul tableur en CSV publié
  if (CONFIG.sheetCsvUrl) {
    try {
      const res = await fetch(CONFIG.sheetCsvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const articles = lignesVersArticles(await res.text());
      const tout = articles.filter((a) => a.nom && estEnVente(a));
      return tout.length ? tout : null;
    } catch (e) {
      console.warn("Fatouro : tableur illisible, articles de secours utilisés.", e);
      return null;
    }
  }

  return null;
}

/* -------------------------------------------------------------------
 * 6. Rendu d'une carte produit
 * ----------------------------------------------------------------- */
// Liste des produits affichés (pour la fiche détaillée)
let VUE = [];

// Découpe la colonne Photo en plusieurs liens (séparés par espace, virgule, ; ou retour ligne)
function imagesDe(p) {
  return (p.image || "")
    .split(/[\s,;|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function carteProduit(p, i) {
  const nom = p.nom;
  const nomEn = p.en || nom;
  const cat = p.categorie || "";
  const epuise = estEpuise(p);
  const prix = formatPrix(p.prix);
  const stockNum = parseInt((p.stock == null ? "" : p.stock).toString().trim(), 10);
  const images = imagesDe(p);
  const prixNum = (p.prix || "").toString().replace(/[^\d]/g, "");

  // Enregistre le produit pour la fiche détaillée
  const idx = VUE.push({
    nom, nomEn, cat, prix, epuise,
    stock: isNaN(stockNum) ? null : stockNum,
    prixNum: prixNum ? parseInt(prixNum, 10) : null,
    images,
  }) - 1;

  const visuel = images.length
    ? `<img src="${images[0]}" alt="${nom}" loading="lazy" />`
    : `<div class="product__placeholder">F</div>`;
  const badge = epuise ? `<span class="product__badge" data-fr="Épuisé" data-en="Sold out">Épuisé</span>` : "";
  const multi = images.length > 1 ? `<span class="product__count">📷 ${images.length}</span>` : "";

  const meta = prix
    ? `<p class="product__meta">${prix}</p>`
    : `<p class="product__meta" data-fr="Sur commande" data-en="Made to order">Sur commande</p>`;

  let stockLine = "";
  if (epuise) {
    stockLine = `<p class="product__stock product__stock--out" data-fr="Épuisé" data-en="Sold out">Épuisé</p>`;
  } else if (!isNaN(stockNum)) {
    stockLine = `<p class="product__stock" data-fr="${stockNum} en stock" data-en="${stockNum} in stock">${stockNum} en stock</p>`;
  }

  const cta = `<span class="product__order" data-fr="Voir l'article →" data-en="View item →">Voir l'article →</span>`;

  return `
    <div class="product${epuise ? " product--out" : ""}" role="button" tabindex="0" data-vue="${idx}" data-reveal style="--i:${i % 4}">
      <div class="product__frame">${visuel}${badge}${multi}</div>
      <h4 class="product__name" data-fr="${nom}" data-en="${nomEn}">${nom}</h4>
      ${meta}
      ${stockLine}
      ${cta}
    </div>`;
}

/* -------------------------------------------------------------------
 * Fiche détaillée (fenêtre modale) + galerie photos
 * ----------------------------------------------------------------- */
let modalEtat = { images: [], i: 0 };

function creerModal() {
  if (document.getElementById("produitModal")) return;
  const el = document.createElement("div");
  el.id = "produitModal";
  el.className = "modal";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `
    <div class="modal__overlay" data-close></div>
    <div class="modal__box" role="dialog" aria-modal="true">
      <button class="modal__close" data-close aria-label="Fermer">×</button>
      <div class="modal__gallery">
        <div class="modal__stage">
          <button class="modal__nav modal__nav--prev" id="modalPrev" aria-label="Précédent">‹</button>
          <div class="modal__img" id="modalImg"></div>
          <button class="modal__nav modal__nav--next" id="modalNext" aria-label="Suivant">›</button>
        </div>
        <div class="modal__thumbs" id="modalThumbs"></div>
      </div>
      <div class="modal__info">
        <p class="modal__cat" id="modalCat"></p>
        <h3 class="modal__name" id="modalName"></h3>
        <p class="modal__price" id="modalPrice"></p>
        <p class="modal__stock" id="modalStock"></p>
        <div class="modal__actions" id="modalActions">
          <button class="btn btn--gold" id="modalPay" data-fr="Payer" data-en="Pay">Payer</button>
          <a class="btn btn--ghost" id="modalOrder" href="#" target="_blank" rel="noopener"></a>
        </div>
        <form class="checkout" id="orderForm" hidden>
          <p class="pay__title" data-fr="Vos informations" data-en="Your details">Vos informations</p>
          <div class="checkout__row">
            <input name="prenom" required autocomplete="given-name" data-fr-ph="Prénom" data-en-ph="First name" placeholder="Prénom" />
            <input name="nom" required autocomplete="family-name" data-fr-ph="Nom" data-en-ph="Last name" placeholder="Nom" />
          </div>
          <input name="email" type="email" required autocomplete="email" placeholder="Email" />
          <input name="tel" required inputmode="tel" autocomplete="tel" data-fr-ph="Téléphone" data-en-ph="Phone" placeholder="Téléphone" />
          <button type="submit" class="btn btn--gold" data-fr="Continuer vers le paiement" data-en="Continue to payment">Continuer vers le paiement</button>
          <button type="button" class="pay__back" id="formBack" data-fr="← Retour" data-en="← Back">← Retour</button>
        </form>
        <div class="pay" id="payPanel" hidden>
          <p class="pay__title" data-fr="Choisir le mode de paiement" data-en="Choose a payment method">Choisir le mode de paiement</p>
          <div class="pay__methods">
            <button class="pay__method" id="payWave">
              <img class="pay__logo" src="assets/paiement/wave.png" alt="Wave" onerror="this.remove()" />
              <span>Wave</span>
            </button>
            <button class="pay__method" id="payOrange">
              <img class="pay__logo" src="assets/paiement/orange-money.png" alt="Orange Money" onerror="this.remove()" />
              <span>Orange Money</span>
            </button>
          </div>
          <div class="pay__details" id="payDetails"></div>
          <button class="pay__back" id="payBack" data-fr="← Retour" data-en="← Back">← Retour</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);

  el.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", fermerModal));
  document.getElementById("modalPrev").addEventListener("click", () => changerImage(-1));
  document.getElementById("modalNext").addEventListener("click", () => changerImage(1));
  document.getElementById("modalPay").addEventListener("click", ouvrirPaiement);
  document.getElementById("orderForm").addEventListener("submit", soumettreFormulaire);
  document.getElementById("formBack").addEventListener("click", fermerPaiement);
  document.getElementById("payBack").addEventListener("click", retourFormulaire);
  document.getElementById("payWave").addEventListener("click", payerWave);
  document.getElementById("payOrange").addEventListener("click", payerOrange);
  document.addEventListener("keydown", (e) => {
    if (el.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") fermerModal();
    if (e.key === "ArrowLeft") changerImage(-1);
    if (e.key === "ArrowRight") changerImage(1);
  });
}

function afficherImage() {
  const stage = document.getElementById("modalImg");
  const imgs = modalEtat.images;
  stage.innerHTML = imgs.length
    ? `<img src="${imgs[modalEtat.i]}" alt="" />`
    : `<div class="modal__placeholder">F</div>`;
  const multi = imgs.length > 1;
  document.getElementById("modalPrev").style.display = multi ? "" : "none";
  document.getElementById("modalNext").style.display = multi ? "" : "none";
  document.querySelectorAll("#modalThumbs .modal__thumb").forEach((t, k) =>
    t.classList.toggle("is-active", k === modalEtat.i)
  );
  majLienCommande();
}

// Met à jour le lien WhatsApp avec le nom, le prix ET le lien de la photo affichée.
function majLienCommande() {
  const p = modalEtat.p;
  if (!p) return;
  const order = document.getElementById("modalOrder");
  if (!order) return;
  const img = modalEtat.images[modalEtat.i];
  const base = p.epuise
    ? `Bonjour Fatouro, le modèle « ${p.nom} » (${p.cat}) est-il de nouveau disponible ?`
    : `Bonjour Fatouro, je suis intéressé(e) par le modèle « ${p.nom} » (${p.cat})${p.prix ? " à " + p.prix : ""}. Est-il disponible ?`;
  const msg = img ? `${base}\nPhoto : ${img}` : base;
  order.href = lienWhatsApp(msg);
}

function changerImage(d) {
  const n = modalEtat.images.length;
  if (!n) return;
  modalEtat.i = (modalEtat.i + d + n) % n;
  afficherImage();
}

function ouvrirModal(p) {
  creerModal();
  const enAnglais = LANG === "en";
  modalEtat = { images: p.images || [], i: 0, p };

  document.getElementById("modalCat").textContent = p.cat || "";
  document.getElementById("modalName").textContent = enAnglais ? p.nomEn : p.nom;
  document.getElementById("modalPrice").textContent = p.prix || (enAnglais ? "Made to order" : "Sur commande");

  const stockEl = document.getElementById("modalStock");
  if (p.epuise) {
    stockEl.textContent = enAnglais ? "Sold out" : "Épuisé";
    stockEl.className = "modal__stock modal__stock--out";
  } else if (p.stock != null) {
    stockEl.textContent = enAnglais ? `${p.stock} in stock` : `${p.stock} en stock`;
    stockEl.className = "modal__stock";
  } else {
    stockEl.textContent = "";
  }

  const order = document.getElementById("modalOrder");
  order.textContent = p.epuise
    ? enAnglais ? "Ask availability" : "Demander la disponibilité"
    : enAnglais ? "Order on WhatsApp" : "Commander sur WhatsApp";

  const thumbs = document.getElementById("modalThumbs");
  thumbs.innerHTML =
    modalEtat.images.length > 1
      ? modalEtat.images
          .map((src, k) => `<button class="modal__thumb" data-k="${k}"><img src="${src}" alt="" /></button>`)
          .join("")
      : "";
  thumbs.querySelectorAll(".modal__thumb").forEach((t) =>
    t.addEventListener("click", () => { modalEtat.i = +t.dataset.k; afficherImage(); })
  );

  fermerPaiement(); // repart sur le choix d'actions, panneau paiement masqué
  afficherImage();
  const el = document.getElementById("produitModal");
  el.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function fermerModal() {
  const el = document.getElementById("produitModal");
  if (el) el.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ----- Paiement : formulaire -> choix Wave/Orange -> reçu email ----- */

// Clic sur « Payer » : on affiche le formulaire d'infos client
function ouvrirPaiement() {
  document.getElementById("modalActions").hidden = true;
  document.getElementById("payPanel").hidden = true;
  document.getElementById("payDetails").innerHTML = "";
  document.getElementById("orderForm").hidden = false;
  traduire();
}

// Validation du formulaire -> on passe au choix du mode de paiement
function soumettreFormulaire(e) {
  e.preventDefault();
  const f = e.target;
  modalEtat.buyer = {
    prenom: f.prenom.value.trim(),
    nom: f.nom.value.trim(),
    email: f.email.value.trim(),
    tel: f.tel.value.trim(),
  };
  f.hidden = true;
  document.getElementById("payDetails").innerHTML = "";
  document.getElementById("payPanel").hidden = false;
  traduire();
}

// Retour : du choix de paiement vers le formulaire
function retourFormulaire() {
  document.getElementById("payPanel").hidden = true;
  document.getElementById("payDetails").innerHTML = "";
  document.getElementById("orderForm").hidden = false;
}

// Réinitialise tout (à l'ouverture de la fiche, ou « Retour » depuis le formulaire)
function fermerPaiement() {
  ["payPanel", "orderForm"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  const actions = document.getElementById("modalActions");
  if (actions) actions.hidden = false;
  const d = document.getElementById("payDetails");
  if (d) d.innerHTML = "";
}

/* ----- Envoi du reçu par email (Google Apps Script) ----- */
function emailConfigure() {
  return !!CONFIG.appsScriptUrl;
}

async function envoyerRecu(methode) {
  if (!CONFIG.appsScriptUrl) return false; // pas encore configuré
  const b = modalEtat.buyer || {};
  const p = modalEtat.p || {};
  const params = {
    customer_name: `${b.prenom} ${b.nom}`.trim(),
    customer_email: b.email,
    customer_phone: b.tel,
    article: p.nom || "",
    category: p.cat || "",
    price: p.prix || (p.prixNum ? p.prixNum + " FCFA" : ""),
    payment_method: methode,
    photo: (p.images && p.images[0]) || "",
  };
  try {
    await fetch(CONFIG.appsScriptUrl, {
      method: "POST",
      mode: "no-cors", // Apps Script ne renvoie pas d'en-tête CORS : envoi « aveugle »
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(params),
    });
    return true;
  } catch (err) {
    console.warn("Fatouro : envoi du reçu échoué.", err);
    return false;
  }
}

function noteRecu(ok) {
  if (emailConfigure()) {
    return ok
      ? `<p class="pay__recu">${LANG === "en" ? "✓ Receipt sent to your email." : "✓ Reçu envoyé à votre email."}</p>`
      : `<p class="pay__recu pay__recu--ko">${LANG === "en" ? "Receipt could not be sent." : "Le reçu n'a pas pu être envoyé."}</p>`;
  }
  return "";
}

function msgBientot(nom) {
  const t = LANG === "en" ? `${nom} payment coming soon.` : `Paiement ${nom} bientôt disponible.`;
  return `<div class="pay__box"><p>${t}</p></div>`;
}

async function payerWave() {
  const p = modalEtat.p;
  const lien = CONFIG.paiement.wave.lien;
  const details = document.getElementById("payDetails");
  if (!lien) { details.innerHTML = msgBientot("Wave"); return; }
  const en = LANG === "en";
  details.innerHTML = `<div class="pay__box"><p>${en ? "Sending receipt…" : "Envoi du reçu…"}</p></div>`;
  const ok = await envoyerRecu("Wave");
  let url = lien;
  if (p && p.prixNum) url += (lien.includes("?") ? "&" : "?") + "amount=" + p.prixNum;
  window.open(url, "_blank", "noopener");
  details.innerHTML = `
    <div class="pay__box">
      ${noteRecu(ok)}
      <p class="pay__steps">${en ? "Finalize the payment in the Wave window." : "Finalisez le paiement dans la fenêtre Wave."}</p>
      <a class="btn btn--gold" href="${url}" target="_blank" rel="noopener">${en ? "Reopen Wave" : "Rouvrir Wave"}</a>
    </div>`;
}

async function payerOrange() {
  const p = modalEtat.p;
  const o = CONFIG.paiement.orange;
  const details = document.getElementById("payDetails");
  if (!o.code) { details.innerHTML = msgBientot("Orange Money"); return; }
  const en = LANG === "en";
  details.innerHTML = `<div class="pay__box"><p>${en ? "Sending receipt…" : "Envoi du reçu…"}</p></div>`;
  const ok = await envoyerRecu("Orange Money");
  const montant = p && p.prixNum ? p.prixNum.toLocaleString("fr-FR") + " FCFA" : p ? p.prix : "";
  const waConfirm = lienWhatsApp(
    `Bonjour Fatouro, j'ai payé le modèle « ${p.nom} »${p.prix ? " (" + p.prix + ")" : ""} par Orange Money. Voici ma preuve de paiement.`
  );
  details.innerHTML = `
    <div class="pay__box">
      ${noteRecu(ok)}
      <p class="pay__line">${en ? "Merchant code" : "Code marchand"} : <strong>${o.code}</strong></p>
      ${o.numero ? `<p class="pay__line">${en ? "Number" : "Numéro"} : <strong>${o.numero}</strong></p>` : ""}
      ${montant ? `<p class="pay__line">${en ? "Amount" : "Montant"} : <strong>${montant}</strong></p>` : ""}
      <p class="pay__steps">${en ? "Pay via your Orange Money app (or #144#), then confirm:" : "Payez via l'appli Orange Money (ou #144#), puis confirmez :"}</p>
      <a class="btn btn--gold" href="${waConfirm}" target="_blank" rel="noopener">${en ? "I've paid — confirm on WhatsApp" : "J'ai payé — confirmer sur WhatsApp"}</a>
    </div>`;
}

// Clic / clavier sur une carte produit -> ouvre la fiche
function activerFiches() {
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".product[data-vue]");
    if (!card) return;
    e.preventDefault();
    const p = VUE[+card.dataset.vue];
    if (p) ouvrirModal(p);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = document.activeElement;
    if (card && card.classList && card.classList.contains("product") && card.dataset.vue != null) {
      e.preventDefault();
      const p = VUE[+card.dataset.vue];
      if (p) ouvrirModal(p);
    }
  });
}

/* Catalogue filtré (pages collections) */
function rendreCatalogue() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const cat = grid.dataset.categorie;
  const source = ARTICLES && ARTICLES.length ? ARTICLES : PRODUITS;
  const liste = cat ? source.filter((p) => categorieNormale(p.categorie) === cat) : source;

  if (!liste.length) {
    grid.innerHTML = `<p class="catalogue__note" data-fr="Bientôt de nouveaux modèles." data-en="New pieces coming soon.">Bientôt de nouveaux modèles.</p>`;
  } else {
    grid.innerHTML = liste.map(carteProduit).join("");
  }
  traduire();
  observeReveal(grid);
}

/* Nouveautés (accueil) — uniquement si le tableur est branché ;
   sinon on garde les cartes statiques déjà présentes dans la page. */
function rendreNouveautes() {
  const grid = document.getElementById("nouveautesGrid");
  if (!grid || !(ARTICLES && ARTICLES.length)) return;
  const nouv = ARTICLES.filter((p) => norm(p.nouveaute) === "oui" || norm(p.nouveaute) === "yes");
  const liste = (nouv.length ? nouv : ARTICLES).slice(0, 4);
  grid.innerHTML = liste.map(carteProduit).join("");
  traduire();
  observeReveal(grid);
}

/* -------------------------------------------------------------------
 * 7. Sélecteur de langue FR / EN (mémorisé)
 * ----------------------------------------------------------------- */
function traduire() {
  document.querySelectorAll("[data-en]").forEach((el) => {
    const fr = el.getAttribute("data-fr");
    const en = el.getAttribute("data-en");
    el.textContent = LANG === "en" ? en : fr != null ? fr : el.textContent;
  });
  // Placeholders des champs (formulaire)
  document.querySelectorAll("[data-en-ph]").forEach((el) => {
    el.placeholder = LANG === "en" ? el.getAttribute("data-en-ph") : el.getAttribute("data-fr-ph");
  });
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = LANG === "en" ? "FR" : "EN";
  document.documentElement.setAttribute("lang", LANG);
}

function selecteurLangue() {
  try { LANG = localStorage.getItem("fatouro_lang") || "fr"; } catch (e) {}
  traduire();
  const btn = document.getElementById("langToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      LANG = LANG === "fr" ? "en" : "fr";
      try { localStorage.setItem("fatouro_lang", LANG); } catch (e) {}
      traduire();
    });
  }
}

/* -------------------------------------------------------------------
 * 8. Menu mobile
 * ----------------------------------------------------------------- */
function menuMobile() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const ouvert = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", ouvert ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* -------------------------------------------------------------------
 * 9. Animations au défilement
 * ----------------------------------------------------------------- */
let revealObs = null;
function setupReveal() {
  if ("IntersectionObserver" in window) {
    revealObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); revealObs.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }
  observeReveal(document);
}
function observeReveal(root) {
  const els = root.querySelectorAll("[data-reveal]");
  if (!revealObs) { els.forEach((el) => el.classList.add("is-visible")); return; }
  els.forEach((el) => revealObs.observe(el));
}

/* -------------------------------------------------------------------
 * 10. Barre de progression
 * ----------------------------------------------------------------- */
function effetsDefilement() {
  const barre = document.getElementById("scrollProgress");
  if (!barre) return;
  const onScroll = () => {
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    barre.style.width = (total > 0 ? (h.scrollTop / total) * 100 : 0).toFixed(2) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* -------------------------------------------------------------------
 * 11. Initialisation
 * ----------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  appliquerLiens();
  selecteurLangue();
  menuMobile();
  setupReveal();
  effetsDefilement();
  activerFiches();
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  ARTICLES = await chargerArticles(); // null si pas de tableur => secours
  rendreCatalogue();
  rendreNouveautes();
});
