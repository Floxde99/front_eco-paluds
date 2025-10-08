import React from 'react'

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentions légales</h1>
        <div className="prose prose-slate max-w-none">
          <p>Ces mentions sont fournies à titre indicatif. Remplacez par vos informations légales réelles.</p>
          <h2>Éditeur du site</h2>
          <p>Ecopaluds — Raison sociale, adresse, contact, SIREN/SIRET.</p>
          <h2>Hébergement</h2>
          <p>Nom de l’hébergeur, adresse, téléphone.</p>
          <h2>Contact</h2>
          <p>Adresse email de contact : contact@exemple.com</p>
        </div>
      </div>
    </div>
  )
}
