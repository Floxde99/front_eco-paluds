import React from 'react'

const BenefitCard = ({ icon, title, children }) => (
  <div className="text-center flex-1">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">{children}</p>
  </div>
)

export function Benefits() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">Pourquoi rejoindre EcoConnect ?</h2>
        <div className="flex items-start justify-center gap-4 md:gap-8 lg:gap-16">
          <BenefitCard icon="♻️" title="Réduisez vos coûts">
            Transformez vos déchets en revenus et réduisez vos coûts de traitement proximité
          </BenefitCard>
          <BenefitCard icon="🤝" title="Développez votre réseau">
            Créez des partenariats locaux durables avec des entreprises de proximité
          </BenefitCard>
          <BenefitCard icon="🌿" title="Impact environnemental">
            Contribuez à l'économie circulaire et réduisez votre empreinte carbone
          </BenefitCard>
        </div>
      </div>
    </section>
  )
}

export default Benefits
