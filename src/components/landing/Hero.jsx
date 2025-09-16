import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Connectez votre entreprise à
          <br />
          <span className="block">l'économie circulaire</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Transformez vos déchets en ressources et trouvez de nouveaux partenaires dans la
          zone industrielle des Paluds
        </p>
        <div className="mt-8">
          <Link to="/login?mode=signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-medium rounded-md">Créer un compte gratuit</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
