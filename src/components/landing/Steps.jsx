import React from 'react'

const Step = ({ index, title, description, color }) => (
  <div className="text-center flex-1">
    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mb-4 ${color}`}>
      {index}
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">{description}</p>
  </div>
)

export function Steps() {
  return (
    <section className="bg-gray-50 border-t">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
          <p className="text-gray-600">3 étapes simples pour rejoindre l'écosystème</p>
        </div>
        <div className="flex items-start justify-center gap-4 md:gap-8 lg:gap-16">
          <Step index={1} title="Créez votre profil" description="Renseignez vos productions, besoins et déchets en quelques clics" color="bg-blue-500" />
          <Step index={2} title="Découvrez les opportunités" description="Notre algorithme identifie les synergies possibles avec d'autres entreprises" color="bg-green-500" />
          <Step index={3} title="Connectez-vous" description="Entrez en contact directement et développez vos partenariats durables" color="bg-orange-500" />
        </div>
      </div>
    </section>
  )
}

export default Steps
