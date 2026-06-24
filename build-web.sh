#!/usr/bin/env bash
#
# Build web statique prêt à déployer sur Apache.
#
# Usage :
#   ./build-web.sh [nom-dossier] [mock|live]
#
#   nom-dossier : le sous-dossier de déploiement (défaut: i360)
#                 -> "racine" pour un déploiement à la racine d'un (sous-)domaine
#   mode        : mock (défaut, démo sans backend) ou live (vrai backend)
#
# Exemples :
#   ./build-web.sh i360            # sous-dossier /i360, mode mock
#   ./build-web.sh i360 live       # sous-dossier /i360, vrai backend
#   ./build-web.sh racine          # déploiement à la racine, mode mock
#
set -euo pipefail

NAME="${1:-i360}"
MODE="${2:-mock}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ "$MODE" = "live" ]; then USE_MOCK=false; else USE_MOCK=true; fi

# baseUrl : "/i360" pour un sous-dossier, "" pour la racine
if [ "$NAME" = "racine" ] || [ "$NAME" = "root" ] || [ "$NAME" = "/" ]; then
  BASE=""
  ZIPNAME="web-racine"
else
  BASE="/$NAME"
  ZIPNAME="$NAME"
fi

echo "▶ baseUrl = '${BASE:-/}'  |  mock = $USE_MOCK  |  zip = $ZIPNAME.zip"

# 1) Écrit experiments.baseUrl dans app.json (via node = fiable, pas de sed fragile)
node -e "
const fs=require('fs');const p='app.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.expo.experiments=j.expo.experiments||{};
if('$BASE'){ j.expo.experiments.baseUrl='$BASE'; } else { delete j.expo.experiments.baseUrl; }
fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');
console.log('  app.json -> baseUrl = '+('$BASE'||'(racine)'));
"

# 2) Export web statique
echo "▶ expo export (mock=$USE_MOCK)…"
EXPO_PUBLIC_USE_MOCK_API=$USE_MOCK npx expo export --platform web

# 3) Recopie le .htaccess (expo export efface dist/ à chaque fois !)
cp deploy/htaccess.web dist/.htaccess
echo "  .htaccess recopié dans dist/"

# 4) Zip à plat (dézipper -> un dossier nommé d'après le zip, fichiers directement dedans)
ZIP="$ROOT/$ZIPNAME.zip"
rm -f "$ZIP"
powershell -NoProfile -Command "Compress-Archive -Path '$(cygpath -w "$ROOT/dist")\\*' -DestinationPath '$(cygpath -w "$ZIP")' -Force"

echo ""
echo "✅ $ZIPNAME.zip prêt."
if [ -n "$BASE" ]; then
  echo "   → déployer dans un dossier nommé EXACTEMENT '$NAME' à la racine du (sous-)domaine."
  echo "   → URL : https://domaine.com/$NAME/"
else
  echo "   → déployer le CONTENU à la racine du (sous-)domaine."
  echo "   → URL : https://domaine.com/"
fi
echo "   → vérifier sur le serveur : mod_rewrite actif + AllowOverride All + .htaccess bien extrait."
