import React from 'react'
import { LEGAL } from '@/config/legal'

export default function CGU() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Conditions Générales d'Utilisation</h1>
        <div className="prose prose-slate max-w-none">
          <p>
            Les présentes conditions ont pour objet d’encadrer l’accès et l’utilisation du service
            {` ${LEGAL.appName}`} (le « Service »). Toute utilisation implique l’acceptation pleine et
            entière des CGU en vigueur.
          </p>

          <h2>1. Objet du Service</h2>
          <p>
            {LEGAL.appName} propose des fonctionnalités de gestion de profil d’entreprise, d’annuaire,
            de messagerie inter‑entreprises, d’assistant et d’import/traitement de données, ainsi que des
            offres d’abonnement.
          </p>

          <h2>2. Accès au Service</h2>
          <ul>
            <li>Ouverture de compte: informations exactes, complètes et à jour requises.</li>
            <li>Identifiants: l’utilisateur conserve la confidentialité de ses moyens d’authentification.</li>
            <li>Disponibilité: le Service est en principe accessible 24/7 sous réserve de maintenance.</li>
          </ul>

          <h2>3. Utilisation et obligations</h2>
          <ul>
            <li>Respect des lois et des droits des tiers; absence de contenus illicites ou nuisibles.</li>
            <li>Interdiction d’extraire massivement des données, d’altérer le Service, ou d’y accéder de manière non autorisée.</li>
            <li>Responsabilité des contenus publiés dans les profils, messages et fichiers importés.</li>
          </ul>

          <h2>4. Contenus et modération</h2>
          <p>
            L’utilisateur demeure seul responsable des informations publiées. {LEGAL.appName} peut retirer
            tout contenu manifestement illicite ou contraire aux présentes CGU, et suspendre le compte en cas d’abus.
          </p>

          <h2>5. Propriété intellectuelle</h2>
          <p>
            Le Service et ses éléments (logiciels, design, textes, graphiques, logos, etc.) sont protégés.
            Toute reproduction ou exploitation non autorisée est interdite. Les marques et logos tiers
            restent la propriété de leurs titulaires.
          </p>

          <h2>6. Abonnements et paiements</h2>
          <p>
            Certaines fonctionnalités sont soumises à abonnement. Les conditions (prix, durée, renouvellement)
            sont précisées lors de la souscription. Les paiements sont traités par des prestataires (Stripe/PayPal).
          </p>

          <h2>7. Données personnelles</h2>
          <p>
            Le traitement des données personnelles est décrit dans notre Politique de confidentialité. En
            utilisant le Service, vous reconnaissez en avoir pris connaissance.
          </p>

          <h2>8. Responsabilité</h2>
          <ul>
            <li>
              {LEGAL.appName} met en œuvre des moyens raisonnables pour assurer un Service fiable mais ne
              garantit pas l’absence d’erreurs, d’interruptions ou de vulnérabilités.
            </li>
            <li>
              {LEGAL.appName} ne saurait être tenue responsable des dommages indirects, pertes d’exploitation,
              ou résultant de l’utilisation de contenus fournis par les utilisateurs.
            </li>
          </ul>

          <h2>9. Liens et services tiers</h2>
          <p>
            Le Service peut contenir des liens ou intégrations de tiers. {LEGAL.appName} n’est pas responsable
            de ces services externes ni de leurs conditions.
          </p>

          <h2>10. Suspension et résiliation</h2>
          <p>
            {LEGAL.appName} peut suspendre ou résilier l’accès en cas de violation des CGU ou d’usage abusif.
            L’utilisateur peut à tout moment demander la clôture de son compte.
          </p>

          <h2>11. Modifications</h2>
          <p>
            Les CGU peuvent être modifiées pour tenir compte de l’évolution du Service. L’utilisation du
            Service après mise à jour vaut acceptation des nouvelles CGU.
          </p>

          <h2>12. Droit applicable et juridiction</h2>
          <p>
            Les CGU sont soumises au droit français. Tout litige sera soumis à la compétence
            {LEGAL.disputeJurisdiction ? ` des juridictions de ${LEGAL.disputeJurisdiction}` : ' des juridictions françaises compétentes'}.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question, contactez‑nous à {LEGAL.contactEmail || LEGAL.email || 'À compléter'}.
            <br />
            Dernière mise à jour: {LEGAL.lastUpdate || 'À compléter'}
          </p>
        </div>
      </div>
    </div>
  )
}

