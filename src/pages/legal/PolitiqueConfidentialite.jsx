import React from 'react'

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Politique de confidentialité</h1>
        <div className="prose prose-slate max-w-none">
          <p>Expliquez ici comment vous collectez, utilisez et stockez les données personnelles.</p>
          <h2>Données collectées</h2>
          <p>Listez les catégories de données et la base légale.</p>
          <h2>Durée de conservation</h2>
          <p>Indiquez les durées et les droits des utilisateurs.</p>
        </div>
      </div>
    </div>
  )
}
