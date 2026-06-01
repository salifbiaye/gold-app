# GoldApp — Architecture technique

> Document de référence : stack, choix techniques, structure du code, sécurité, modules.

---

## 1. Vue d'ensemble

GoldApp est un **super-app sénégalais** (paiements PI-SPI, transport, livraison, immobilier, santé, alimentation, tourisme, éducation, vendeurs, IA "Chercher"). Il existe sur **3 surfaces** :

```
┌───────────────────────┐      ┌───────────────────────┐
│  📱 Mobile natif      │      │  🌐 Web (RNW)         │
│  iOS / Android        │      │  Desktop / Mobile     │
│  React Native + Expo  │      │  React Native Web     │
└──────────┬────────────┘      └──────────┬────────────┘
           │                              │
           └──────────────┬───────────────┘
                          │  HTTPS · JWT Bearer + cookie HttpOnly
                          ▼
              ┌───────────────────────┐
              │  ⚙️ Backend GoldApp   │
              │  Spring Boot 3.3      │
              │  Java 17 / PostgreSQL │
              │  BFF + Gateway        │
              └──────────┬────────────┘
                         │ OpenFeign
        ┌────────────────┼────────────────────┬─────────┐
        ▼                ▼                    ▼         ▼
   PI-SPI (BCEAO)    OSRM routing       Overpass OSM  Autres
   (mock WireMock)   (route public)     (POI public)  partenaires
```

**Principe fondateur** : c'est une **app mobile-first**. Le web est un **miroir fonctionnel** — il n'invente pas de feature qui n'existe pas en mobile.

---

## 2. Stack technique complète

### 📱 Mobile + Web (le même codebase)

| Couche | Techno | Version | Pourquoi |
|---|---|---|---|
| Framework | **Expo (React Native)** | 54.x | Single codebase iOS / Android / Web |
| Web | **React Native Web** | 0.21.2 | Mêmes composants RN, rendus en DOM |
| Router | **expo-router** | 4.x | Routing fichier-système, deeplinks |
| Langage | TypeScript | 5.x | Type-safety |
| Icônes | lucide-react-native | latest | 1000+ icônes, fines, modernes |
| Maps mobile | **react-native-webview + Leaflet** | 1.9.4 | Voir [section Maps](#5-maps--routing) |
| Maps web | **iframe + Leaflet (CDN)** | 1.9.4 | Idem mobile, mais via iframe |
| Géoloc native | expo-location | latest | GPS sur mobile |
| Géoloc web | `navigator.geolocation` | natif | Standard browser |
| Biométrie | expo-local-authentication | latest | Face ID / fingerprint |
| Stockage sécurisé | expo-secure-store (mobile) | latest | Keychain / EncryptedSharedPreferences |

### ⚙️ Backend GoldApp

| Couche | Techno | Version |
|---|---|---|
| Framework | **Spring Boot** | 3.3.5 |
| Langage | Java | 17 |
| Build | Maven mono-module | 3.9+ |
| Sécurité | Spring Security 6 + jjwt | 0.12.6 |
| HTTP externe | **Spring Cloud OpenFeign** | 2023.0.3 |
| Resilience | Resilience4j | 2.2.0 |
| Cache | **Caffeine** | latest |
| Persistance | Spring Data JPA + PostgreSQL | 16 |
| DB dev | H2 in-memory | runtime |
| Mapping | MapStruct | 1.5.5 |
| Doc API | springdoc-openapi | 2.6.0 |
| Tests | JUnit 5 + WireMock + Testcontainers | — |

---

## 3. Structure du repo

```
projet-front/                       ← le frontend (RN + RNW)
├── app/                            ← expo-router (file-based routing)
│   ├── _layout.tsx                 ← root layout (Theme + WebSession + ApiModeBadge)
│   ├── index.tsx                   ← landing publique
│   ├── connexion.tsx               ← login
│   └── app/                        ← zone authentifiée
│       ├── _layout.tsx
│       ├── index.tsx               ← /app
│       ├── wallet.tsx
│       ├── commandes.tsx
│       ├── chat.tsx
│       ├── carte.tsx
│       ├── profil.tsx
│       ├── notifications.tsx
│       ├── parametres.tsx
│       └── services/[id].tsx       ← page service dynamique
│
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          ← SOURCE DE VÉRITÉ — partagé mobile + web
│   │   ├── WalletScreen.tsx
│   │   ├── OrdersScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── TransportScreen.tsx
│   │   ├── RealEstateScreen.tsx
│   │   ├── HealthScreen.tsx
│   │   ├── PaymentsScreen.tsx
│   │   ├── ServiceCategoryScreen.tsx
│   │   └── web/                    ← web uniquement (public + auth)
│   │       ├── public/             ← landing, PublicServicePage
│   │       └── auth/               ← LoginScreen
│   │
│   ├── components/
│   │   ├── MapView/                ← composant maps cross-platform
│   │   │   ├── MapView.tsx         ← re-export
│   │   │   ├── MapView.web.tsx     ← iframe + Leaflet (web)
│   │   │   ├── MapView.native.tsx  ← WebView + Leaflet (mobile)
│   │   │   └── types.ts
│   │   ├── HtmlMapView.tsx         ← bridge WebView ↔ iframe pour HTML brut
│   │   └── dev/ApiModeBadge.tsx    ← badge MOCK / LIVE en bas à droite
│   │
│   ├── services/                   ← couche données (mock ↔ live transparent)
│   │   ├── api/
│   │   │   ├── client.ts           ← apiRequest avec unwrap + auto-refresh JWT
│   │   │   └── index.ts            ← helpers haut niveau
│   │   ├── auth/
│   │   │   ├── authService.ts      ← login / register / logout / refresh
│   │   │   ├── tokenStore.ts       ← access en mémoire, refresh mémoire (mobile)
│   │   │   └── secureSessionStore.ts ← biométrie mobile
│   │   ├── maps/
│   │   │   ├── routingService.ts   ← getRoute (OSRM public API)
│   │   │   └── placesService.ts    ← getMapPlaces (Overpass public API)
│   │   ├── wallet/walletService.ts ← → /api/payments/*
│   │   ├── orders/ordersService.ts
│   │   ├── chat/chatService.ts
│   │   └── serviceConfig.ts        ← { useMock: env.useMockApi }
│   │
│   ├── config/
│   │   ├── api.ts                  ← URLs des endpoints backend
│   │   ├── env.ts                  ← lit les EXPO_PUBLIC_* env vars
│   │   ├── auth.ts                 ← mock credentials, demoUser
│   │   └── serviceRegistry.ts      ← catalogue services (icon, label, color)
│   │
│   ├── context/
│   │   ├── ThemeContext.tsx        ← light / dark / system + colors
│   │   ├── AuthContext.tsx         ← session mobile
│   │   └── WebSessionContext.tsx   ← session web
│   │
│   └── data/mockData.ts            ← fixtures pour mode mock
│
├── .env.example                    ← documentation des variables
└── ARCHITECTURE.md                 ← ce fichier

goldapp-backend/                    ← le backend Spring Boot
├── pom.xml                         ← mono-module Maven
├── docker-compose.yml              ← Postgres + WireMock PI-SPI
├── wiremock/pispi/mappings/        ← stubs WireMock (wallet, transactions, transfer)
└── src/main/
    ├── java/sn/goldapp/
    │   ├── GoldAppApplication.java
    │   ├── common/                 ← ApiResponse, exceptions, GlobalExceptionHandler
    │   ├── security/               ← JWT, SecurityConfig, AuthController + RefreshCookies
    │   ├── feign/                  ← FeignGlobalConfig, ErrorDecoder, AuthInterceptor
    │   ├── cache/                  ← CacheConfig (Caffeine), CacheNames
    │   └── modules/                ← UN PACKAGE PAR DOMAINE
    │       ├── payments/           ← PI-SPI (wallet, transferts, QR, factures, airtime, cashout)
    │       ├── orders/
    │       ├── transport/
    │       ├── realestate/
    │       ├── health/
    │       ├── food/
    │       ├── tourism/
    │       ├── education/
    │       ├── marketplace/
    │       ├── vendors/            ← "Devenir vendeur"
    │       ├── maps/               ← OSRM + Overpass + agences GOLD
    │       ├── home/               ← dashboard agrégé
    │       └── ai/                 ← chatbot "Chercher"
    └── resources/application*.yml
```

---

## 4. Front : architecture responsive unifiée

### Principe : un seul codebase d'écrans, layout adaptatif

Tous les écrans sont dans `src/screens/` (plus de split `mobile/` vs `web/app/`). Le même `HomeScreen.tsx` tourne sur iOS, Android et navigateur web. La navigation s'adapte à la largeur d'écran.

| Largeur | Navigation | Layout contenu |
|---|---|---|
| `< 768px` | Bottom tab bar (4 onglets) | Full width, padding horizontal 20px |
| `≥ 768px` | Sidebar fixe **260px** à gauche | Full width du reste de l'écran, padding 20px |

### Shell de navigation (`RootNavigator.tsx`)

`MainTabs` détecte `useWindowDimensions().width` et bascule :

- **Mobile** : `Tab.Navigator` avec `tabBar` personnalisé en bas. Chaque écran gère son propre header.
- **Desktop** : sidebar `260px` à gauche (NAVIGATION haut / COMPTE bas), Tab.Navigator sans barre visible.

**Règle header par écran :**
| Écran | Header |
|---|---|
| Home | `AppHeader` (avatar, localisation, cloche) |
| Chat IA / Commandes / Wallet | `HeaderBar` avec titre centré |
| Profil / Notifications / Paramètres | Header propre avec bouton retour + titre |

**Écrans secondaires sur desktop** (Profil / Notifications / Paramètres) :
- Rendu **inline** dans la zone de contenu → la sidebar reste visible
- `DesktopNavWrapper` intercepte `useNavigation()` : bouton retour → `closeDesktopPage()`
- Sur mobile : navigation classique `stackNav.navigate()` (push plein écran)

**QR Scanner** : `ScannerProvider` est maintenant à l'intérieur de `AuthenticatedNavigator` (web + mobile). `QRScannerOverlay` utilise `position: fixed` sur web pour couvrir le viewport.

```
Mobile (< 768px)              Desktop (≥ 768px)
┌─────────────────┐           ┌────────┬──────────────────────┐
│  [AppHeader]    │ ← Home    │        │  [AppHeader] Home    │
│  [HeaderBar]    │ ← autres  │ NAVIG. │  [HeaderBar] autres  │
├─────────────────┤           │        │                      │
│  Screen content │           │ 260px  │  Screen content      │
│                 │           │ ──── ──│  (full width)        │
├─────────────────┤           │ COMPTE │                      │
│  Bottom tab bar │           └────────┴──────────────────────┘
└─────────────────┘
```

### Pont web ↔ mobile (`app/application.tsx`)

Sur web, `WebAuthGate` lit `useWebSession()` et construit un `AuthResult` depuis le cookie de session :

```ts
const auth: AuthResult = { token: user.token, user };
// → NavigationIndependentTree + AuthenticatedNavigator (même navigator que mobile)
```

- `status === 'authenticating'` → spinner
- `status !== 'authenticated'` → redirect `/connexion`
- `status === 'authenticated'` → `AuthenticatedNavigator` (MainTabs + Profile + Notifications + Settings)

Les routes `app/app/*.tsx` redirigent toutes vers `/application` (point d'entrée unique).

**Règle stricte** : on n'ajoute PAS de feature au web qui n'existe pas en mobile. Un seul code → zéro divergence UX.

---

## 5. Maps & routing

**Question récurrente** : *« quoi tu utilises pour les cartes et le routing ? »* — voici la réponse complète.

### Le stack maps GoldApp (100% gratuit, sans API key)

```
┌──────────────────────────────────────────────────────────────┐
│  AFFICHAGE CARTE                                             │
│  ──────────────────                                          │
│  Leaflet 1.9.4 (CDN unpkg)                                   │
│   • mobile : chargé dans une WebView (react-native-webview)  │
│   • web    : chargé dans un iframe (srcDoc)                  │
│                                                              │
│  Tile layers (fond de carte) :                               │
│   • light : tile.openstreetmap.org                           │
│   • dark  : basemaps.cartocdn.com/dark_all                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  RECHERCHE POI (points d'intérêt)                            │
│  ────────────────────────                                    │
│  Overpass API (https://overpass-api.de/api/interpreter)      │
│  Service : src/services/maps/placesService.ts                │
│                                                              │
│  Catégories supportées (tag OSM amenity=*) :                 │
│   • restaurant, cafe, pharmacy, fuel, atm, hospital          │
│   • transport (highway=bus_stop), delivery (post_office)     │
│                                                              │
│  Fallback : PROTOTYPE_PLACES en dur si Overpass ne répond    │
│  pas / quota dépassé.                                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  CALCUL D'ITINÉRAIRES                                        │
│  ─────────────────                                           │
│  OSRM public (https://router.project-osrm.org/route/v1)      │
│  Service : src/services/maps/routingService.ts               │
│                                                              │
│  3 profils : driving / cycling / walking                     │
│  Format : geojson, overview=full                             │
│  Retourne : distance (m), durée (s), geometry[] de LatLng    │
└──────────────────────────────────────────────────────────────┘
```

### Comment c'est rendu côté composant

Le composant `MapView` a 2 implémentations résolues par Metro selon la plateforme :

```
src/components/MapView/
├── MapView.web.tsx    ← Platform.OS === 'web'
└── MapView.native.tsx ← iOS / Android
```

**Sur web** :
```tsx
return createElement('iframe', {
  srcDoc: buildInitialHtml(center, zoom, theme),  // ← HTML construit UNE SEULE FOIS
  ref: iframeRef,
});

// Updates propagés via postMessage (markers, route, theme, center)
//   host → iframe : 'gold-map-host' { type: 'bulk', markers, route, ... }
//   iframe → host : 'gold-map' { type: 'marker' | 'map-click' | 'ready', ... }
```

**Pourquoi iframe + postMessage et pas du React-Leaflet ?**
- Metro 0.81 ne sait pas résoudre proprement le package npm `leaflet` (mauvais champ `main`)
- L'iframe charge Leaflet depuis le CDN → zéro bundle weight
- L'iframe est **isolé** : les styles Leaflet ne fuient pas dans l'app
- Avec postMessage on évite de **rerender** l'iframe à chaque clic → pas de clignotement

**Sur mobile** : exactement le même HTML, mais affiché dans une `<WebView>` au lieu d'un iframe. Communication via `postMessage` aussi (API React Native WebView).

### Reroute si on veut switcher

Le code est conçu pour qu'on puisse remplacer le stack par **Mapbox GL** ou **Google Maps** sans toucher aux écrans :
- `routingService.ts` → swap l'implémentation `getRoute()`
- `placesService.ts` → swap `getMapPlaces()`
- `MapView` → on garde l'interface `markers, route, center, theme` identique

C'est pour ça que l'architecture **n'expose jamais Leaflet dans les screens** — uniquement le composant `MapView` qui encapsule tout.

### Côté backend : module `maps`

Quand le front sera en mode `LIVE`, il appellera **le backend** au lieu d'OSRM/Overpass directement :

```
Front: GET /api/maps/route?fromLat=…&toLat=…&mode=DRIVING
   ↓
Backend GoldApp (Spring Boot)
   ↓ @FeignClient("osrm")  (config = FeignGlobalConfig, circuit breaker, retry)
   ↓
https://router.project-osrm.org/route/v1/...
   ↓
Mapping OSRM JSON → domaine Route { distanceMeters, durationSeconds, geometry[] }
```

Avantages : **circuit breaker, retry, cache Caffeine, rate limit**, et possibilité de remplacer le provider plus tard sans toucher au front.

---

## 6. Sécurité & authentification

### Stratégie token (Option B : memory + refresh cookie HttpOnly)

```
┌──────────────────────────────────────────────────────────────┐
│  WEB                                                         │
├──────────────────────────────────────────────────────────────┤
│  Login → backend renvoie :                                   │
│   • access_token (15 min) dans body → tokenStore (mémoire)   │
│   • refresh_token (30j)  → Set-Cookie HttpOnly Secure        │
│                                       SameSite=Lax           │
│                                       Path=/api/auth         │
│                                                              │
│  Toutes les requêtes : Authorization: Bearer <access>        │
│                       + credentials: 'include' (cookie)      │
│                                                              │
│  Au reload de page : access perdu (mémoire) → tryRefresh()   │
│   → POST /auth/refresh sans body → cookie envoyé auto        │
│   → nouveau access en mémoire                                │
│                                                              │
│  ⛔ Le JS n'a PAS accès au refresh token (XSS-proof)         │
│  ⛔ Pas de localStorage : XSS = vol max 15 min               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  MOBILE                                                      │
├──────────────────────────────────────────────────────────────┤
│  Login → backend renvoie body avec :                         │
│   • access_token  → tokenStore (mémoire)                     │
│   • refresh_token → tokenStore.setRefresh() (mémoire,        │
│                    futur : expo-secure-store / Keychain)     │
│                                                              │
│  Toutes les requêtes : Authorization: Bearer <access>        │
│                                                              │
│  Pas de cookie côté mobile (header X-Client absent côté      │
│  backend, donc refresh reste dans le body).                  │
│                                                              │
│  Biométrie (Face ID / empreinte) :                           │
│   expo-local-authentication confirme physiquement avant      │
│   de réinjecter le token mémorisé (secureSessionStore).      │
└──────────────────────────────────────────────────────────────┘
```

### Comment le backend différencie web/mobile

Le header **`X-Client: web`** envoyé par le front web déclenche :
- Backend `AuthController.prepareResponse()` détecte le header
- Si `web` : pose un cookie HttpOnly et **omet** le refreshToken du body
- Sinon (mobile) : laisse le refreshToken dans le body

### Auto-refresh sur 401

`apiRequest()` côté front :
```
1. fetch(path)
2. Si 401 → tryRefresh()
     • web   : POST /auth/refresh (cookie envoyé auto)
     • mobile: POST /auth/refresh avec body { refreshToken }
3. Si refresh OK → re-fetch(path)
4. Si refresh KO → tokenStore.clear() + _onUnauthorized() → redirige login
```

### Backend : Spring Security + JWT

| Composant | Fichier | Rôle |
|---|---|---|
| `SecurityConfig` | `security/config/SecurityConfig.java` | Filter chain, public routes, BCrypt |
| `JwtService` | `security/jwt/JwtService.java` | Sign/verify HS384, claims (sub, email, roles) |
| `JwtAuthFilter` | `security/jwt/JwtAuthFilter.java` | OncePerRequestFilter qui parse Bearer + injecte SecurityContext |
| `RefreshCookies` | `security/auth/RefreshCookies.java` | Helpers Set-Cookie HttpOnly Secure SameSite |
| `AuthController` | `security/auth/AuthController.java` | /auth/login, /register, /refresh, /logout, /me |
| `AuthService` | `security/auth/AuthService.java` | Rotation refresh, hash SHA-256 stocké en DB |

**Endpoints publics** : `/auth/login`, `/auth/register`, `/auth/refresh`, `/actuator/health`, `/swagger-ui/**`.
**Tous les autres** : authentifiés (`@PreAuthorize("isAuthenticated()")` sur chaque controller métier).

---

## 7. Backend : standardisation OpenFeign

C'est le **cœur du backend** : tout appel HTTP vers un service externe passe par un client Feign standardisé.

### Convention obligatoire pour tous les modules

```java
@ExternalApi("pispi")                                          // ← tag pour tracking
@FeignClient(
    name          = "pispi",
    url           = "${external.pispi.url}",
    configuration = FeignGlobalConfig.class                    // ← appliquée à TOUS
)
public interface PiSpiFeignClient {
    @GetMapping("/v1/users/{userId}/wallet")
    PispiWalletDto getWallet(@PathVariable String userId);
    // ...
}
```

### Ce que `FeignGlobalConfig` fournit gratuitement

| Bean | Rôle |
|---|---|
| `FeignErrorDecoder` | 4xx → `ExternalClientException`, 5xx → `ExternalServerException` (retry éligible) |
| `FeignAuthInterceptor` | Propage JWT user OU token externe via `ExternalTokenStore` (Caffeine) |
| `Request.Options` | Timeouts par défaut (5s connect / 15s read) |
| `Logger.Level.BASIC` | Logs structurés |
| `X-Request-Id` | Injecté automatiquement pour tracing |

### Resilience4j sur chaque adapter

```java
@CircuitBreaker(name = "external-default")
@Retry(name = "external-default")              // GET seulement, jamais POST financier
@Cacheable(CacheNames.WALLET_BALANCE)
public Wallet getBalance(UUID userId) {
    return mapper.toWallet(client.getWallet(userId.toString()));
}
```

Si une API externe tombe :
- Au bout de 5 échecs sur 10 → circuit s'ouvre 30s
- Le front reçoit `{ error: { code: "SERVICE_UNAVAILABLE" } }` (mapping dans `GlobalExceptionHandler`)
- Pas de cascade d'erreurs

### Anti-patterns interdits

- ❌ `RestTemplate` / `WebClient` / `OkHttp` ad hoc → tout doit passer par Feign
- ❌ `@Retry` sur des POST financiers (risque de double débit)
- ❌ Exposer un DTO Feign au domaine ou au front → toujours mapper

---

## 8. Backend : Clean Architecture par module

Chaque module métier suit **la même structure** :

```
modules/<domain>/
├── domain/                        ← PUR — pas de Spring, pas de Feign
│   ├── model/                     ← records immutables (Wallet, Order, …)
│   ├── port/                      ← interfaces sortantes (XxxExternalPort)
│   └── usecase/                   ← logique métier
├── application/                   ← service Spring qui orchestre
│   └── XxxService.java
├── infrastructure/
│   ├── feign/                     ← @FeignClient + adapter (implements port)
│   ├── mapper/                    ← MapStruct DTO ↔ domaine
│   └── persistence/               ← JPA si données locales nécessaires
└── interfaces/rest/
    ├── XxxController.java         ← @PreAuthorize("isAuthenticated()")
    └── dto/                       ← DTOs REST exposés au front
```

**Règle de dépendance** : `interfaces` → `application` → `domain` ← `infrastructure`. Le `domain` ne connaît rien.

Pour ajouter un nouveau service externe (ex: nouvel acquéreur PI-SPI) → on swappe juste l'adapter Feign, le `domain` et le `controller` restent inchangés.

---

## 9. Backend : Cache Caffeine

Convention centralisée dans `cache/CacheNames.java` :

```java
public static final String WALLET_BALANCE = "wallet:balance";
public static final String MAPS_PLACES    = "maps:places";
public static final String HOME_DASHBOARD = "home:dashboard";
// ...
```

Specs configurées par cache dans `application.yml` :

```yaml
goldapp:
  cache:
    specs:
      wallet:balance:  "maximumSize=10000,expireAfterWrite=30s"
      maps:places:     "maximumSize=5000,expireAfterWrite=10m"
      home:dashboard:  "maximumSize=1000,expireAfterWrite=2m"
```

**Règle** : `@Cacheable` sur l'**adapter** (pas le controller), avec `@CacheEvict` sur les writes pour invalider.

---

## 10. Mode mock ↔ live

### Côté front

Le flag `env.useMockApi` (lu depuis `EXPO_PUBLIC_USE_MOCK_API` dans `.env`) bascule transparemment tous les services :

```ts
// src/services/wallet/walletService.ts
export async function getWalletBalance(): Promise<WalletBalance> {
  if (serviceConfig.useMock) return MOCK_BALANCE;            // ← données factices
  const raw = await apiRequest<BackendWallet>(endpoints.payments.walletBalance);
  return backendToWalletBalance(raw);                        // ← vrai backend
}
```

**Badge `ApiModeBadge`** — petit dot en haut à droite (DEV only) :
- 🟠 dot ambre = MOCK
- 🟢 dot vert = LIVE

### Côté backend : WireMock pour PI-SPI

Tant que la vraie API PI-SPI BCEAO n'est pas accessible :
```
goldapp-backend/wiremock/pispi/mappings/
├── wallet-balance.json      ← GET /v1/users/:id/wallet
├── wallet-transactions.json ← GET /v1/users/:id/transactions
└── transfer.json            ← POST /v1/transfers
```
`docker compose up -d pispi-mock` → WireMock écoute sur `:9100`.

---

## 11. Catalogue des modules (alignés sur le mind map "Chercher")

| Module | Endpoint | Status backend | Externe |
|---|---|---|---|
| `payments` | `/api/payments/*` | ✅ complet (Clean Archi) | PI-SPI (mock WireMock) |
| `orders` | `/api/orders` | ✅ stub | — |
| `transport` | `/api/transport/*` | ✅ stub | (partenaires fret/taxis à venir) |
| `realestate` | `/api/realestate/*` | ✅ stub | (partenaires immo à venir) |
| `health` | `/api/health/*` | ✅ stub | (pharmacies / cliniques à venir) |
| `food` | `/api/food/*` | ✅ stub | (vendeurs alimentation à venir) |
| `tourism` | `/api/tourism/*` | ✅ stub | (séjours / loisirs à venir) |
| `education` | `/api/education/*` | ✅ stub | (cours / ressources à venir) |
| `marketplace` | `/api/marketplace/*` | ✅ stub | (commerce général à venir) |
| `vendors` | `/api/vendors/*` | ✅ in-memory | (onboarding marchand) |
| `maps` | `/api/maps/*` | ✅ Feign réel | **OSRM + Overpass** |
| `home` | `/api/home/dashboard` | ✅ agrège payments + orders | — |
| `ai` | `/api/ai/chercher` | ✅ stub (intent par mots-clés) | (future : Claude / OpenAI via Feign) |

---

## 12. Comment lancer

### Front

```bash
cd projet-front
npm install
cp .env.example .env       # éditer EXPO_PUBLIC_USE_MOCK_API + EXPO_PUBLIC_API_URL
npx expo start --clear
```

### Backend

```bash
cd goldapp-backend
mvn spring-boot:run        # H2 in-memory, démarre en 9s
# → http://localhost:8080/swagger-ui.html
```

Avec Postgres réel :
```bash
docker compose up -d postgres
export DB_URL=jdbc:postgresql://localhost:5432/goldapp DB_USER=goldapp DB_PASSWORD=goldapp
mvn spring-boot:run
```

Avec mock PI-SPI :
```bash
docker compose up -d pispi-mock   # WireMock sur :9100
```

### Brancher front sur back

`.env` du front :
```env
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

Restart `npx expo start --clear` → le badge en bas à droite passe de MOCK à LIVE.

---

## 13. APK mobile

Le build de l'APK passe par EAS Build :
```bash
eas build --platform android --profile production
```

L'APK final pèse **~31 MB** (ABI splits + R8 minification + shrinkResources activés dans `android/app/build.gradle`).

---

## 14. Décisions clés (récap)

| Décision | Pourquoi |
|---|---|
| **Mono-codebase RN+RNW** | Un seul projet pour 3 surfaces, économie énorme sur la maintenance |
| **expo-router** | File-based routing, deeplinks gratuits |
| **Backend mono-module Spring Boot** | Démarrage rapide, refactor microservices possible plus tard |
| **OpenFeign + Resilience4j** | Tous les appels externes suivent la même convention → testable, monitorable |
| **Caffeine (in-process)** | Pas besoin de Redis pour les caches courts (TTL < 10 min) |
| **Cookie HttpOnly + access en mémoire** | XSS-proof, standard 2026 (Stripe, Auth0) |
| **Leaflet via iframe/WebView** | Free, no API key, bundle léger, swap Mapbox possible |
| **OSRM + Overpass public** | Démarrer sans budget infra ; quand on grandit, on déploie nos propres instances |
| **WireMock pour PI-SPI** | Dev local sans dépendre du planning d'intégration BCEAO |
| **Écrans unifiés mobile + web** | Un seul fichier par feature, zéro duplication, sidebar 260px responsive sur desktop |
| **`AuthenticatedNavigator` export** | Même navigator réutilisé par mobile (post-splash) et web (post-cookie-auth) |
| **`DesktopNavWrapper`** | Injecte un contexte nav custom pour que les écrans secondaires (Profil/Notifs/Settings) rendent inline sur desktop avec `goBack()` → close sidebar view, pas de push plein écran |
| **`AppHeader` uniquement sur Home** | Chat/Orders/Wallet utilisent `HeaderBar` (titre centré) ; évite la redondance de l'avatar/localisation sur des pages non-contextuelles |
| **`ScannerProvider` dans `AuthenticatedNavigator`** | Corrige l'absence du contexte scanner sur web (la route `/application` ne passait pas par `App.tsx` qui avait le provider) |

---

## 15. À venir

- Biométrie : finaliser `secureSessionStore` avec expo-secure-store (Keychain / EncryptedSharedPreferences)
- Chatbot IA : remplacer le stub par un Feign client vers Claude API
- Persistance Orders + Vendors en JPA (actuellement in-memory)
- Migrations Flyway en prod (remplacer `ddl-auto: update`)
- Self-host OSRM/Overpass quand le volume justifie (~1000 req/min)
- Reverse proxy nginx + TLS Let's Encrypt
- Tests d'intégration WireMock pour le module payments
- CI/CD GitHub Actions (test front + test back + build APK + déploiement)
