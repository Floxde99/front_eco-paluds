#!/bin/bash

# Script de déploiement pour VPS
echo "🚀 Déploiement en cours..."

# Nettoyage
echo "🧹 Nettoyage..."
rm -rf node_modules package-lock.json dist

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci --production=false

# Build pour la production
echo "🔨 Build pour la production..."
NODE_ENV=production npm run build

# Vérification du build
echo "✅ Vérification du build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build réussi !"
    ls -la dist/
else
    echo "❌ Erreur: Le dossier dist n'a pas été créé"
    exit 1
fi

echo "🎉 Déploiement terminé avec succès !"
