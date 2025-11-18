import React from 'react'
import { LEGAL, formatCompanyIdentity, formatHostIdentity } from '@/config/legal'

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentions légales</h1>
        <div className="prose prose-slate max-w-none">
          <p>
            Conformément à l’article 6 III-1 de la loi n°2004‑575 du 21 juin 2004 pour la
            confiance dans l’économie numérique (LCEN), sont précisées ci‑dessous les informations
            relatives à l’éditeur, à l’hébergement et aux contacts du site {LEGAL.appName}.
          </p>

          <h2>Éditeur du site</h2>
          <p>{formatCompanyIdentity() || 'À compléter'}</p>
          <ul>
            <li>Adresse e‑mail: {LEGAL.email || 'À compléter'}</li>
            <li>Téléphone: {LEGAL.phone || 'À compléter'}</li>
          </ul>

          <h2>Directeur de la publication</h2>
          <p>{LEGAL.publicationDirector || 'À compléter'}</p>

          <h2>Hébergement</h2>
          <p>{formatHostIdentity() || 'À compléter'}</p>

          <h2>Contact</h2>
          <p>
            Pour toute question relative au site, vous pouvez nous écrire à{' '}
            <a href={LEGAL.contactEmail ? `mailto:${LEGAL.contactEmail}` : undefined}>
              {LEGAL.contactEmail || LEGAL.email || 'À compléter'}
            </a>
            .
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus (textes, graphismes, logos, marques, vidéos, icônes, images,
            structure et design) présents sur le site {LEGAL.appName} sont protégés par le droit de
            la propriété intellectuelle et appartiennent à leur(s) titulaire(s) respectif(s). Toute
            reproduction, représentation, modification, publication, transmission, dénaturation, totale
            ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque
            support que ce soit, est interdite sans l’autorisation écrite préalable du titulaire des droits.
          </p>

          <h2>Responsabilité</h2>
          <p>
            {LEGAL.appName} s’efforce d’assurer l’exactitude et la mise à jour des informations
            diffusées. Elle ne saurait toutefois être tenue responsable des erreurs, omissions ou
            indisponibilités du service. L’utilisation des informations et contenus disponibles sur le
            site s’effectue sous la seule responsabilité de l’utilisateur.
          </p>

          <h2>Liens hypertextes</h2>
          <p>
            Le site peut contenir des liens vers d’autres sites. {LEGAL.appName} n’exerce aucun
            contrôle sur ces ressources et ne peut être tenue responsable de leur contenu.
          </p>

          <h2>Droit applicable</h2>
          <p>
            Le présent site est soumis au droit français. Toute difficulté relative à l’exécution,
            l’interprétation ou la validité des mentions sera de la compétence
            {LEGAL.disputeJurisdiction ? ` des juridictions de ${LEGAL.disputeJurisdiction}` : ' des juridictions françaises compétentes'}.
          </p>

          <p className="text-sm text-slate-500">Dernière mise à jour: {LEGAL.lastUpdate || 'À compléter'}</p>
        </div>
      </div>
    </div>
  )
}

