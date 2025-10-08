import React from 'react'

export function Testimonial() {
  return (
    <section className="bg-gray-50 border-t">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <blockquote className="text-lg sm:text-xl text-gray-800">
          « Grâce à Ecopaluds, nous avons trouvé un partenaire pour valoriser nos chutes de métal.
          Une économie de 15 000€ par an ! »
        </blockquote>
        <div className="mt-6">
          <p className="font-medium text-gray-900">Marie Dubois</p>
          <p className="text-sm text-gray-600">Directrice, Métallurgie Provence</p>
        </div>
      </div>
    </section>
  )
}

export default Testimonial
