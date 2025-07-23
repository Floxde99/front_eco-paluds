#!/bin/bash

# Script de déploiement pour VPS
echo "🚀 Déploiement en cours..."

# Nettoyage
echo "🧹 Nettoyage..."
rm -rf node_modules package-lock.json dist

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build pour la production
echo "🔨 Build pour la production..."
npm run build

# Vérification du build
echo "✅ Vérification du build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build réussi !"
    
    # Vérification que le CSS est bien généré
    CSS_FILE=$(find dist/assets -name "*.css" | head -1)
    if [ -f "$CSS_FILE" ]; then
        CSS_SIZE=$(wc -c < "$CSS_FILE")
        echo "✅ CSS généré: $CSS_FILE ($CSS_SIZE bytes)"
        
        # Vérifier que le CSS contient du Tailwind
        if grep -q "tailwindcss" "$CSS_FILE"; then
            echo "✅ Tailwind CSS détecté dans le build"
        else
            echo "⚠️  Tailwind CSS pourrait ne pas être inclus"
        fi
    else
        echo "❌ Aucun fichier CSS trouvé!"
        exit 1
    fi
    
    ls -la dist/
else
    echo "❌ Erreur: Le dossier dist n'a pas été créé"
    exit 1
fi

echo "🎉 Déploiement terminé avec succès !"
