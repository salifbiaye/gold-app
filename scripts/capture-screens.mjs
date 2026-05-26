import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'pdf-assets');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:8081';
const VP = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true };
const SKIP_EXISTING = process.argv.includes('--skip-existing');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const targets = [
  { slug: 'splash', title: 'Splash', auth: false, action: 'splash' },
  { slug: 'auth', title: 'Connexion', auth: false, action: 'auth' },
  { slug: 'home', title: 'Accueil', auth: true },
  { slug: 'chat', title: 'Chat IA', auth: true, tab: 'Chat' },
  { slug: 'orders', title: 'Mes commandes', auth: true, tab: 'Commandes' },
  { slug: 'wallet', title: 'Wallet', auth: true, tab: 'Wallet' },
  { slug: 'profile', title: 'Profil', auth: true, action: 'profile' },
  { slug: 'notifications', title: 'Notifications', auth: true, action: 'notifications' },
  { slug: 'settings', title: 'Parametres', auth: true, action: 'settings' },
  { slug: 'drawer', title: 'Menu lateral', auth: true, action: 'drawer' },
  { slug: 'support', title: 'Support', auth: true, action: 'support' },
  { slug: 'qr-scanner', title: 'Scanner QR', auth: true, action: 'qr' },
  { slug: 'transport', title: 'Transport', auth: true, service: 'Transport' },
  { slug: 'map', title: 'Carte', auth: true, action: 'map' },
  { slug: 'real-estate', title: 'Immobilier', auth: true, service: 'Immobilier' },
  { slug: 'health', title: 'Sante', auth: true, service: 'Santé' },
  { slug: 'payments', title: 'Paiements', auth: true, service: 'Paiements' },
  { slug: 'delivery', title: 'Livraison', auth: true, service: 'Livraison' },
  { slug: 'food', title: 'Alimentation', auth: true, service: 'Alimentation' },
  { slug: 'education', title: 'Education', auth: true, service: 'Education' },
  { slug: 'tourism', title: 'Tourisme', auth: true, service: 'Tourisme' },
];

async function clickByText(page, text, maxWait = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const clicked = await page.evaluate((targetText) => {
      const normalize = (value) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();

      const wanted = normalize(targetText);
      const nodes = [...document.querySelectorAll('div, span, button, a')];
      const exact = nodes.find((node) => normalize(node.textContent || '') === wanted);
      const loose = nodes.find((node) => {
        const text = normalize(node.textContent || '');
        return text.includes(wanted) && text.length <= wanted.length + 40;
      });
      const node = exact || loose;
      if (!node) return false;

      let target = node;
      for (let i = 0; i < 4; i += 1) {
        target.click();
        target = target.parentElement || target;
      }
      return true;
    }, text);

    if (clicked) return true;
    await sleep(300);
  }
  console.log(`  WARNING: text not found: ${text}`);
  return false;
}

async function clickTab(page, tabText) {
  const tabX = {
    Accueil: 50,
    Chat: 146,
    Commandes: 244,
    Wallet: 340,
  }[tabText];

  if (tabX) {
    await page.mouse.click(tabX, 812);
    await sleep(1300);
    return;
  }

  const clicked = await page.evaluate((text) => {
    const normalize = (value) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const wanted = normalize(text);
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const tab = tabs.find((item) => normalize(item.textContent || '').includes(wanted));
    if (!tab) return false;
    tab.click();
    return true;
  }, tabText);

  if (!clicked) console.log(`  WARNING: tab not found: ${tabText}`);
  await sleep(1300);
}

async function login(page) {
  await sleep(2500);
  await page.mouse.click(195, 600);
  await sleep(2200);
}

async function clickHomeService(page, service) {
  const positions = {
    Transport: [52, 480],
    Livraison: [143, 480],
    Immobilier: [238, 480],
    Santé: [330, 480],
    Alimentation: [52, 555],
    Education: [143, 555],
    Tourisme: [238, 555],
    Paiements: [330, 555],
  };
  const position = positions[service];
  if (position) {
    await page.mouse.click(position[0], position[1]);
    await sleep(1600);
    return;
  }
  await clickByText(page, service);
  await sleep(1600);
}

async function openHeaderMenu(page) {
  await page.mouse.click(38, 28);
  await sleep(1000);
}

async function runAction(page, target) {
  if (target.action === 'splash') {
    await sleep(650);
    return;
  }

  if (target.action === 'auth') {
    await sleep(2600);
    return;
  }

  if (target.tab) {
    await clickTab(page, target.tab);
  }

  if (target.service) {
    await clickHomeService(page, target.service);
  }

  switch (target.action) {
    case 'profile':
      await page.mouse.click(356, 28);
      await sleep(1600);
      break;
    case 'notifications':
      await page.mouse.click(316, 28);
      await sleep(1600);
      break;
    case 'settings':
      await openHeaderMenu(page);
      await page.mouse.click(100, 545);
      await sleep(1600);
      break;
    case 'drawer':
      await openHeaderMenu(page);
      break;
    case 'support':
      await openHeaderMenu(page);
      await page.mouse.click(92, 500);
      await sleep(1200);
      break;
    case 'qr':
      await page.mouse.click(252, 227);
      await sleep(1600);
      break;
    case 'map':
      await page.mouse.click(192, 625);
      await sleep(1800);
      break;
    default:
      break;
  }
}

async function captureTarget(browser, mode, target) {
  const path = join(OUT, `${target.slug}-${mode}.png`);
  if (SKIP_EXISTING && existsSync(path)) {
    console.log(`  skip ${target.slug}-${mode}.png`);
    return;
  }

  const page = await browser.newPage();
  await page.setViewport(VP);
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: mode }]);

  await page.goto(APP_URL, { waitUntil: target.action === 'splash' ? 'domcontentloaded' : 'networkidle2', timeout: 45000 });

  if (target.auth) await login(page);
  await runAction(page, target);

  await page.screenshot({ path, type: 'png' });
  await page.close();
  console.log(`  saved ${target.slug}-${mode}.png`);
}

async function captureMode(browser, mode) {
  console.log(`\n=== ${mode.toUpperCase()} MODE ===`);
  for (const target of targets) {
    console.log(`  ${target.title}`);
    await captureTarget(browser, mode, target);
  }
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  await captureMode(browser, 'dark');
  await captureMode(browser, 'light');

  await browser.close();
  console.log('\nAll screenshots saved to pdf-assets/');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
