<div align="center">

# 🌿 Eco-Paluds – Frontend

Plateforme React dédiée à l’écosystème des entreprises des Paluds : annuaire intelligent, messagerie inter-entreprises, assistant IA et gestion d’abonnement Stripe.

</div>

## Sommaire

- [Fonctionnalités clés](#fonctionnalités-clés)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration des variables d’environnement](#configuration-des-variables-denvironnement)
- [Scripts npm disponibles](#scripts-npm-disponibles)
- [Qualité & bonnes pratiques](#qualité--bonnes-pratiques)
- [Déploiement](#déploiement)
- [Ressources utiles](#ressources-utiles)

## Fonctionnalités clés

- **Authentification sécurisée** : gestion du token JWT via axios, contexte `AuthProvider`, protection des routes `RequireAuth`.
- **Dashboard personnalisé** : aperçu du profil, des suggestions, du réseau et de l’activité avec cartes radiales.
- **Annuaire & carte interactive** : filtres dynamiques (secteur, déchets, distance), pagination, vue liste/carte (Leaflet / React-Leaflet).
- **Fiches entreprises complètes** : sections éditables (informations générales, géolocalisation, ressources, progrès de complétion).
- **Messagerie entre entreprises** : création de conversations, envoi de messages, suivi des non-lus, rafraîchissement automatique.
- **Assistant IA** : interface de chat avec historique et gestion des états de génération.
- **Import intelligent** : suivi d’upload, états success/erreur, intégration à l’IA.
- **Abonnement & paiement** : intégration Stripe Checkout / PaymentIntent, gestion des plans et moyens de paiement.
- **Notifications en temps réel** : Toasts via `sonner` et intégration globale dans `App`.
- **Accessibilité & UI** : Tailwind CSS, composants Radix UI, icônes Lucide.

## Stack technique

- **React 19**, **React Router 7** pour la navigation spa.
- **Vite 7** comme bundler et outil de développement.
- **Tailwind CSS 4** + `tailwindcss-animate`, `class-variance-authority`, `tailwind-merge` pour un design system modulaire.
- **Radix UI** (`@radix-ui/react-*`) pour les primitives accessibles.
- **@tanstack/react-query 5** pour la gestion avancée des requêtes, cache et synchronisation.
- **Axios** avec intercepteurs (headers JWT, FormData, gestion d’erreurs communes).
- **Stripe** (`@stripe/react-stripe-js`, `@stripe/stripe-js`) pour la facturation.
- **Leaflet / React-Leaflet** pour la cartographie.
- **Zod** pour la validation de schémas et de formulaires.
- **Sonner** pour les notifications.
- **ESLint 9** (config personalisée) pour la qualité de code.

## Architecture du projet

```
src/
├── assets/               # Logos, images, icônes
├── components/           # UI réutilisable (avatar, cartes dashboard, navigation, formulaires...)
│   ├── company-profile/  # Widgets spécifiques à la fiche entreprise
│   ├── forms/            # Builder de formulaire générique + champs
│   ├── landing/          # Sections de la page d’atterrissage
│   ├── navigation/       # Navbar desktop/mobile, context store
│   └── ui/               # Primitives Tailwind/Radix (cards, buttons, inputs...)
├── contexts/             # Contextes React (Auth)
├── hooks/                # Hooks métiers (auth, import, messaging, suggestions...)
├── lib/                  # Instances partagées (queryClient, utils, toast)
├── pages/                # Pages principales (dashboard, annuaire, assistant, abonnement…)
├── providers/            # Providers globaux (React Query, etc.)
├── schemas/              # Schémas Zod pour la validation
├── services/             # Clients API (Axios) segmentés par domaine
├── App.jsx               # Définition des routes & layout global
├── main.jsx              # Point d’entrée (Providers + ErrorBoundary)
└── globals.css           # Styles globaux + Tailwind
```

## Prérequis

- **Node.js** ≥ 18.17 (recommandé : LTS 20+)
- **npm** ≥ 9 (ou pnpm / yarn si adapté)
- Accès aux API Eco-Paluds (backend) et à une clé Stripe publique.

## Installation

```bash
git clone https://github.com/Floxde99/front_eco-paluds.git
cd front_eco-paluds
npm install
```

## Configuration des variables d’environnement

Créer un fichier `.env.local` à la racine (non versionné) :

```env
# URL de base du backend
VITE_API_BASE_URL=https://api.eco-paluds.fr

# Timeout (ms) des requêtes axios – optionnel
VITE_API_TIMEOUT=10000

# Clé Stripe publique (mode test ou live)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
```

> Les valeurs peuvent être adaptées selon les environnements (dev/staging/prod). Vite charge automatiquement les variables préfixées par `VITE_`.

## Scripts npm disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance Vite en mode développement (http://localhost:5173). |
| `npm run build` | Build de production optimisé dans `dist/`. |
| `npm run preview` | Prévisualisation locale du build (`npm run build` requis). |
| `npm run lint` | Vérifie le code avec ESLint (inclut règles React & hooks). |
| `npm run build:css` | Génère uniquement la feuille Tailwind (mode watch). |

## Qualité & bonnes pratiques

- **React Query** : centralisation des états serveur, invalidations ciblées (cf. `hooks/use*`).
- **Gestion d’erreurs** : toasts utilisateur + `ErrorBoundary` pour les erreurs inattendues.
- **Accessibilité** : composants Radix, navigation clavier, messages aria.
- **Styling** : classes utilitaires Tailwind, variantes via `class-variance-authority` et fusion via `tailwind-merge`.
- **Formulaires** : builder générique, validation Zod, feedback utilisateur clair.
- **Authentification** : token stocké dans `localStorage`, intercepteur axios, cache invalidé à la déconnexion.

## Déploiement

### Build local

1. Générer le bundle de production :
	 ```bash
	 npm run build
	 ```
	 Le dossier `dist/` contient les assets statiques optimisés.

### Mise en production sur VPS (exemple Nginx)

1. **Copier les fichiers** : transférer le contenu de `dist/` vers le serveur (via `scp`, `rsync` ou CI/CD) dans `/var/www/eco-paluds` par exemple.
2. **Configurer Nginx** :
	 ```nginx
	 server {
		 listen 80;
		 server_name eco-paluds.example.com;

		 root /var/www/eco-paluds;
		 index index.html;

		 location / {
			 try_files $uri $uri/ /index.html;
		 }

		 location ~* \.(?:css|js|woff2?|svg|png|jpg|jpeg|gif)$ {
			 expires 7d;
			 add_header Cache-Control "public";
		 }
	 }
	 ```
	 Charger la configuration (`/etc/nginx/sites-available`) puis créer le lien symbolique dans `sites-enabled` et recharger Nginx (`sudo nginx -t && sudo systemctl reload nginx`).
3. **Variables d’environnement** : injecter les valeurs `VITE_*` au moment du build (avant le transfert) ou utiliser un outil comme `envsubst` si reconstruction côté serveur.
4. **HTTPS** : ajouter un certificat TLS (Let’s Encrypt/Certbot) pour servir le site en HTTPS.

> Adapter ces étapes si vous utilisez un autre serveur web (Caddy, Apache) ou un reverse-proxy avant Nginx.

## Ressources utiles

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/guide/)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Leaflet](https://leafletjs.com/)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)

---

💡 *Besoin d’aide pour contribuer ou intégrer de nouvelles fonctionnalités ? Consulte les hooks/services existants ou ouvre une issue avec le contexte souhaité.*
