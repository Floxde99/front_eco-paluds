# Application React avec Tailwind CSS v4

Cette application utilise React 19, Vite, et Tailwind CSS v4 pour créer une interface moderne avec des animations fluides.

## 🚀 Technologies utilisées

- **React 19** - Framework JavaScript
- **Vite** - Build tool et serveur de développement
- **Tailwind CSS v4** - Framework CSS utilitaire
- **TypeScript** - Typage statique
- **ESLint** - Linting du code

## 📦 Installation

```bash
npm install
```

## 🛠️ Scripts disponibles

### Développement
```bash
npm run dev
```
Lance le serveur de développement sur `http://localhost:5173`

### Build pour la production
```bash
npm run build:prod
```
Compile l'application pour la production dans le dossier `dist/`

### Prévisualisation du build
```bash
npm run preview
```
Prévisualise le build de production sur `http://localhost:4173`

### Linting
```bash
npm run lint
```
Vérifie la qualité du code avec ESLint

## 🖥️ Déploiement sur VPS

### Prérequis sur le VPS
- Node.js 18+ installé
- npm installé
- Git installé

### Script de déploiement automatique
```bash
chmod +x deploy.sh
./deploy.sh
```

Le script `deploy.sh` effectue automatiquement :
1. 🧹 Nettoyage des fichiers précédents
2. 📦 Installation des dépendances
3. 🔨 Build de production avec Tailwind CSS
4. ✅ Vérification que les styles sont bien inclus
5. 📋 Affichage des résultats

### Vérification du build
Le script vérifie que :
- ✅ Le dossier `dist/` est créé
- ✅ Le fichier CSS contient Tailwind
- ✅ La taille du CSS est correcte (≈30KB)

## 🎨 Fonctionnalités

- **Design responsive** - Interface adaptée à tous les écrans
- **Animations fluides** - Effets visuels modernes
- **Glassmorphism** - Effets de verre avec backdrop-blur
- **Gradients dynamiques** - Arrière-plans colorés
- **Composants interactifs** - Boutons, onglets, compteur

## 🐛 Résolution des problèmes

### Les styles Tailwind ne s'affichent pas en production
1. Vérifiez que `cross-env` est dans les dependencies (pas devDependencies)
2. Utilisez `npm run build:prod` au lieu de `npm run build`
3. Vérifiez le fichier CSS généré dans `dist/assets/`

### Erreur "cross-env: not found"
```bash
npm install cross-env
```

### Le build échoue
1. Supprimez `node_modules` et `package-lock.json`
2. Relancez `npm install`
3. Vérifiez les versions des dépendances

## 📁 Structure du projet

```
front/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── App.jsx          # Composant principal
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles Tailwind + customs
├── dist/                # Build de production
├── deploy.sh            # Script de déploiement
├── tailwind.config.js   # Configuration Tailwind
├── vite.config.js       # Configuration Vite
└── package.json         # Dépendances
```

## 🆘 Support

Si vous rencontrez des problèmes lors du déploiement, vérifiez :
1. Les logs du script `deploy.sh`
2. La présence du fichier CSS dans `dist/assets/`
3. Que Tailwind CSS est détecté dans le build
