import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS = join(ROOT, 'pdf-assets');
const IMAGE_ASSETS = join(ROOT, 'assets', 'images');
const FONTS = 'C:\\Users\\DELL\\.claude\\skills\\canvas-design\\canvas-fonts';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = join(ROOT, 'Gold-App-UI-Presentation.pdf');
const OUT_HTML = join(ROOT, 'Gold-App-UI-Presentation.html');

function assetB64(name) {
  const path = join(ASSETS, name);
  if (!existsSync(path)) return '';
  return `data:image/png;base64,${readFileSync(path).toString('base64')}`;
}

function imageAssetB64(name) {
  const path = join(IMAGE_ASSETS, name);
  if (!existsSync(path)) return '';
  return `data:image/png;base64,${readFileSync(path).toString('base64')}`;
}

function fontB64(name) {
  const path = join(FONTS, name);
  if (!existsSync(path)) return '';
  return `data:font/truetype;base64,${readFileSync(path).toString('base64')}`;
}

const screens = [
  { id: '01', slug: 'splash', title: 'Splash Screen', group: 'Systeme', note: 'Entree sobre, identite visuelle et chargement initial.' },
  { id: '02', slug: 'auth', title: 'Connexion', group: 'Systeme', note: 'Authentification mobile, credentials centralises et acces securise.' },
  { id: '03', slug: 'home', title: 'Accueil', group: 'Core', note: 'Wallet, services principaux, recherche et parcours utilisateur.' },
  { id: '04', slug: 'chat', title: 'Chat IA', group: 'Core', note: 'Conversation mature, saisie texte, vocal et suggestions contextuelles.' },
  { id: '05', slug: 'orders', title: 'Mes commandes', group: 'Core', note: 'Suivi clair des commandes, statuts et historique operationnel.' },
  { id: '06', slug: 'wallet', title: 'Wallet', group: 'Core', note: 'Solde, carte wallet, QR code, actions rapides et transactions.' },
  { id: '07', slug: 'profile', title: 'Profil', group: 'Compte', note: 'Identite utilisateur, informations, securite et acces parametres.' },
  { id: '08', slug: 'notifications', title: 'Notifications', group: 'Compte', note: 'Liste concise des alertes et options de lecture.' },
  { id: '09', slug: 'settings', title: 'Parametres', group: 'Compte', note: 'Theme systeme, preferences, securite et configuration.' },
  { id: '10', slug: 'drawer', title: 'Menu lateral', group: 'Navigation', note: 'Navigation secondaire, acces support et deconnexion.' },
  { id: '11', slug: 'support', title: 'Support', group: 'Navigation', note: 'Bottom sheet de contact, WhatsApp et appel gratuit.' },
  { id: '12', slug: 'qr-scanner', title: 'Scanner QR', group: 'Navigation', note: 'Acces camera, scan de code et carte QR utilisateur.' },
  { id: '13', slug: 'transport', title: 'Transport', group: 'Services', note: 'Trajet, carte, selection de vehicule et confirmation.' },
  { id: '14', slug: 'map', title: 'Carte', group: 'Services', note: 'Carte interactive, filtres de categories et livreur disponible.' },
  { id: '15', slug: 'real-estate', title: 'Immobilier', group: 'Services', note: 'Recherche de biens, filtres et recommandations.' },
  { id: '16', slug: 'health', title: 'Sante', group: 'Services', note: 'Medecins, pharmacies, teleconsultation et carte.' },
  { id: '17', slug: 'payments', title: 'Paiements', group: 'Services', note: 'Marchands, factures, credit telephonique et transferts.' },
  { id: '18', slug: 'delivery', title: 'Livraison', group: 'Services', note: 'Coursiers, colis, courses et suivi cartographique.' },
  { id: '19', slug: 'food', title: 'Alimentation', group: 'Services', note: 'Restaurants, marches, paniers frais et commande.' },
  { id: '20', slug: 'education', title: 'Education', group: 'Services', note: 'Cours, formations, coaching et inscriptions futures.' },
  { id: '21', slug: 'tourism', title: 'Tourisme', group: 'Services', note: 'Experiences locales, guides et activites.' },
];

const imageOverrides = {
  'qr-scanner': {
    dark: 'scan.png',
    light: 'carte-scane.png',
  },
  transport: {
    dark: 'transport-dark.png',
    light: 'transport.png',
  },
  map: {
    dark: 'carte-dark.png',
    light: 'carte.png',
  },
};

const screenStartPage = 7;
const totalPages = screenStartPage + screens.length;

function pageNumberFor(index) {
  return String(screenStartPage + index).padStart(2, '0');
}

function phone(src, mode) {
  return `
    <figure class="device ${mode}">
      <div class="device-frame">
        <div class="device-notch"></div>
        <div class="device-screen">
          ${src ? `<img src="${src}" alt="${mode} screen" />` : '<div class="missing">Capture manquante</div>'}
        </div>
        <div class="home-indicator"></div>
      </div>
      <figcaption>${mode === 'dark' ? 'Mode sombre' : 'Mode clair'}</figcaption>
    </figure>
  `;
}

function screenPage(screen, index) {
  const override = imageOverrides[screen.slug];
  const dark = override?.dark ? imageAssetB64(override.dark) || assetB64(`${screen.slug}-dark.png`) : assetB64(`${screen.slug}-dark.png`);
  const light = override?.light ? imageAssetB64(override.light) || assetB64(`${screen.slug}-light.png`) : assetB64(`${screen.slug}-light.png`);
  return `
    <section class="page screen-page">
      <div class="page-grid"></div>
      <aside class="screen-meta">
        <div class="kicker">${screen.group}</div>
        <div class="screen-index">${screen.id}</div>
        <h2>${screen.title}</h2>
        <p>${screen.note}</p>
        <div class="mode-stack">
          <span>Dark</span>
          <span>Light</span>
        </div>
      </aside>
      <main class="screen-duo">
        ${phone(dark, 'dark')}
        ${phone(light, 'light')}
      </main>
      <footer class="folio">
        <span>Gold App UI Presentation</span>
        <strong>${pageNumberFor(index)}</strong>
      </footer>
    </section>
  `;
}

function tocRows(items) {
  return items
    .map(
      (screen, index) => `
        <div class="toc-row">
          <span class="toc-id">${screen.id}</span>
          <span>
            <strong class="toc-title">${screen.title}</strong>
            <small class="toc-note-line">${screen.note}</small>
          </span>
          <span class="toc-group">${screen.group}</span>
        </div>
      `,
    )
    .join('');
}

function figureRows() {
  return screens
    .map(
      (screen, index) => `
        <div class="figure-row">
          <span>Fig. ${screen.id}</span>
          <strong>${screen.title}</strong>
          <em>${screen.group}</em>
          <small>Dark + Light</small>
          <b>${pageNumberFor(index)}</b>
        </div>
      `,
    )
    .join('');
}

const fonts = {
  bricolageRegular: fontB64('BricolageGrotesque-Regular.ttf'),
  bricolageBold: fontB64('BricolageGrotesque-Bold.ttf'),
  workSansRegular: fontB64('WorkSans-Regular.ttf'),
  workSansMedium: fontB64('WorkSans-Medium.ttf'),
  workSansSemiBold: fontB64('WorkSans-SemiBold.ttf'),
  youngSerif: fontB64('YoungSerif-Regular.ttf'),
  dmMono: fontB64('DMMono-Regular.ttf'),
};

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
@font-face { font-family: Bricolage; src: url('${fonts.bricolageRegular}'); font-weight: 400; }
@font-face { font-family: Bricolage; src: url('${fonts.bricolageBold}'); font-weight: 800; }
@font-face { font-family: WorkSans; src: url('${fonts.workSansRegular}'); font-weight: 400; }
@font-face { font-family: WorkSans; src: url('${fonts.workSansMedium}'); font-weight: 500; }
@font-face { font-family: WorkSans; src: url('${fonts.workSansSemiBold}'); font-weight: 700; }
@font-face { font-family: YoungSerif; src: url('${fonts.youngSerif}'); }
@font-face { font-family: DMMono; src: url('${fonts.dmMono}'); }

@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #07141d;
  color: #f8fafc;
  font-family: WorkSans, Arial, sans-serif;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.page {
  width: 297mm;
  height: 210mm;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  background: #07141d;
}
.page-grid {
  position: absolute;
  inset: 0;
  opacity: .9;
  background-image:
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size: 28px 28px;
}
.cover {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 45%, rgba(14,181,109,.18), transparent 26%),
    linear-gradient(135deg, #07141d 0%, #0b1d28 100%);
}
.corner {
  position: absolute;
  width: 54px;
  height: 54px;
  border-color: rgba(14,181,109,.75);
}
.tl { top: 34px; left: 34px; border-top: 1px solid; border-left: 1px solid; }
.tr { top: 34px; right: 34px; border-top: 1px solid; border-right: 1px solid; }
.bl { bottom: 34px; left: 34px; border-bottom: 1px solid; border-left: 1px solid; }
.br { bottom: 34px; right: 34px; border-bottom: 1px solid; border-right: 1px solid; }
.cover-content { position: relative; z-index: 2; text-align: center; }
.eyebrow {
  font-family: DMMono, monospace;
  color: #0eb56d;
  font-size: 11px;
  letter-spacing: 5px;
  text-transform: uppercase;
}
.cover-logo {
  margin: 22px auto;
  width: 92px;
  height: 92px;
  border: 1px solid rgba(14,181,109,.4);
  border-radius: 26px;
  display: grid;
  place-items: center;
  font: 800 46px Bricolage, sans-serif;
  color: #0eb56d;
  background: rgba(255,255,255,.04);
  box-shadow: 0 30px 90px rgba(0,0,0,.45);
}
.cover h1 {
  margin: 0;
  font: 46px YoungSerif, serif;
  letter-spacing: -.4px;
}
.cover p {
  margin: 14px auto 0;
  max-width: 620px;
  color: rgba(248,250,252,.58);
  font-size: 15px;
  line-height: 1.6;
}
.cover-foot {
  position: absolute;
  left: 48px;
  right: 48px;
  bottom: 36px;
  display: flex;
  justify-content: space-between;
  color: rgba(248,250,252,.36);
  font: 10px DMMono, monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.toc-page, .figures-page {
  padding: 52px 66px 42px;
}
.section-label {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 30px;
  font: 10px DMMono, monospace;
  letter-spacing: 4px;
  color: #0eb56d;
  text-transform: uppercase;
}
.section-label::after {
  content: "";
  height: 1px;
  flex: 1;
  background: rgba(248,250,252,.11);
}
.toc-page h2, .figures-page h2 {
  margin: 0 0 22px;
  font: 42px YoungSerif, serif;
}
.toc-grid {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 0;
  row-gap: 0;
  width: 100%;
  max-width: none;
}
.toc-row, .figure-row {
  display: grid;
  align-items: center;
  border-bottom: 1px solid rgba(248,250,252,.09);
  min-height: 30px;
  color: rgba(248,250,252,.82);
}
.toc-row {
  grid-template-columns: 42px minmax(0, 1fr) 120px;
  min-height: 74px;
  column-gap: 18px;
}
.toc-id, .figure-row span, .figure-row b {
  font: 10px DMMono, monospace;
  color: #0eb56d;
}
.toc-title {
  display: block;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.15;
}
.toc-note-line {
  display: block;
  margin-top: 7px;
  max-width: 480px;
  color: rgba(248,250,252,.45);
  font-size: 11px;
  line-height: 1.35;
}
.toc-group {
  color: rgba(248,250,252,.38);
  font: 9px DMMono, monospace;
  text-transform: uppercase;
}
.toc-note {
  color: rgba(248,250,252,.48);
  font-size: 13px;
  line-height: 1.55;
  margin: -8px 0 24px;
  max-width: 520px;
}
.figure-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 34px;
}
.figure-row {
  grid-template-columns: 58px 1fr 82px 76px 26px;
}
.figure-row strong {
  font-size: 12px;
}
.figure-row em, .figure-row small {
  color: rgba(248,250,252,.42);
  font: 10px DMMono, monospace;
  font-style: normal;
  text-transform: uppercase;
}
.screen-page {
  display: grid;
  grid-template-columns: 250px 1fr;
  padding: 34px 42px 38px;
  column-gap: 28px;
}
.screen-meta {
  position: relative;
  z-index: 2;
  align-self: center;
}
.kicker {
  color: #0eb56d;
  font: 10px DMMono, monospace;
  letter-spacing: 4px;
  text-transform: uppercase;
}
.screen-index {
  margin-top: 28px;
  font: 64px DMMono, monospace;
  color: rgba(14,181,109,.3);
  line-height: 1;
}
.screen-meta h2 {
  margin: 8px 0 14px;
  font: 32px YoungSerif, serif;
  line-height: 1.08;
}
.screen-meta p {
  margin: 0;
  color: rgba(248,250,252,.58);
  font-size: 13px;
  line-height: 1.55;
}
.mode-stack {
  margin-top: 32px;
  display: flex;
  gap: 8px;
}
.mode-stack span {
  border: 1px solid rgba(248,250,252,.12);
  border-radius: 999px;
  padding: 7px 12px;
  color: rgba(248,250,252,.62);
  font: 10px DMMono, monospace;
  text-transform: uppercase;
}
.screen-duo {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 34px;
}
.device {
  margin: 0;
  text-align: center;
}
.device-frame {
  width: 242px;
  height: 524px;
  padding: 8px 7px 7px;
  border-radius: 34px;
  background: #05090d;
  border: 1px solid rgba(255,255,255,.12);
  box-shadow:
    0 32px 90px rgba(0,0,0,.52),
    inset 0 0 0 1px rgba(255,255,255,.04);
  position: relative;
}
.device.light .device-frame {
  background: #111;
  box-shadow:
    0 32px 90px rgba(0,0,0,.42),
    0 0 0 1px rgba(255,255,255,.04);
}
.device-notch {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 82px;
  height: 20px;
  border-radius: 0 0 14px 14px;
  background: #050505;
  z-index: 3;
}
.device-screen {
  width: 100%;
  height: 100%;
  border-radius: 27px;
  overflow: hidden;
  background: #07141d;
}
.device-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}
.missing {
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(255,255,255,.35);
  font: 11px DMMono, monospace;
}
.home-indicator {
  position: absolute;
  bottom: 11px;
  left: 50%;
  transform: translateX(-50%);
  width: 86px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,.32);
}
figcaption {
  margin-top: 12px;
  color: rgba(248,250,252,.48);
  font: 10px DMMono, monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.folio {
  position: absolute;
  left: 42px;
  right: 42px;
  bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(248,250,252,.32);
  font: 9px DMMono, monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.folio strong {
  color: #0eb56d;
  font-weight: 400;
}
.back {
  display: grid;
  place-items: center;
}
.back h2 {
  margin: 0;
  color: rgba(14,181,109,.24);
  font: 90px Bricolage, sans-serif;
}
.back p {
  margin: 12px 0 0;
  color: rgba(248,250,252,.45);
  font: 11px DMMono, monospace;
  letter-spacing: 3px;
  text-transform: uppercase;
}
</style>
</head>
<body>
  <section class="page cover">
    <div class="page-grid"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="cover-content">
      <div class="eyebrow">Mobile UI Deck</div>
      <div class="cover-logo">G</div>
      <h1>Gold App</h1>
      <p>Presentation visuelle complete des ecrans, avec comparaison systematique des modes sombre et clair.</p>
    </div>
    <div class="cover-foot"><span>Confidentiel</span><span>${totalPages} pages</span></div>
  </section>

  <section class="page toc-page">
    <div class="section-label">Sommaire</div>
    <h2>Architecture des ecrans</h2>
    <p class="toc-note">Parcours systeme, navigation globale et ecrans coeur de l'application.</p>
    <div class="toc-grid">${tocRows(screens.slice(0, 6))}</div>
  </section>

  <section class="page toc-page">
    <div class="section-label">Sommaire</div>
    <h2>Compte & navigation</h2>
    <p class="toc-note">Profil, notifications, parametres, drawer et parcours secondaires.</p>
    <div class="toc-grid">${tocRows(screens.slice(6, 11))}</div>
  </section>

  <section class="page toc-page">
    <div class="section-label">Sommaire</div>
    <h2>Services principaux</h2>
    <p class="toc-note">Acces camera, transport, carte, immobilier, sante et paiement.</p>
    <div class="toc-grid">${tocRows(screens.slice(11, 17))}</div>
  </section>

  <section class="page toc-page">
    <div class="section-label">Sommaire</div>
    <h2>Services locaux</h2>
    <p class="toc-note">Livraison, alimentation, education et tourisme presentes en dark et light mode.</p>
    <div class="toc-grid">${tocRows(screens.slice(17))}</div>
  </section>

  <section class="page figures-page">
    <div class="section-label">Table des figures</div>
    <h2>Inventaire visuel</h2>
    <div class="figure-grid">${figureRows()}</div>
  </section>

  ${screens.map((screen, index) => screenPage(screen, index)).join('')}

  <section class="page back">
    <div class="page-grid"></div>
    <div>
      <h2>GA</h2>
      <p>Gold App UI Presentation</p>
    </div>
  </section>
</body>
</html>`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 1 });
  writeFileSync(OUT_HTML, html, 'utf8');
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: OUT,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log(`PDF generated: ${OUT}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
