import React from 'react'
import { LEGAL } from '@/config/legal'

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Politique de confidentialité</h1>
        <div className="prose prose-slate max-w-none">
          <p>
            La présente politique explique comment {LEGAL.appName} traite vos données personnelles,
            conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés.
            Le responsable de traitement est {LEGAL.companyName || LEGAL.appName}.
          </p>

          <h2>Coordonnées du responsable et du DPO</h2>
          <ul>
            <li>Responsable du traitement: {LEGAL.companyName || LEGAL.appName}</li>
            <li>Contact: {LEGAL.contactEmail || LEGAL.email || 'À compléter'}</li>
            <li>Délégué à la protection des données (DPO): {LEGAL.dpoName || 'À compléter'}</li>
            <li>Contact DPO: {LEGAL.dpoEmail || 'À compléter'}</li>
          </ul>

          <h2>Données traitées</h2>
          <p>Nous traitons les catégories suivantes selon l’usage du service:</p>
          <ul>
            <li>
              Compte et authentification: prénom, nom, e‑mail, mot de passe (haché), téléphone,
              entreprise, jeton d’authentification (stocké localement), logs de connexion.
            </li>
            <li>
              Profil entreprise: raison sociale, secteur, description, site web, e‑mail, téléphone,
              SIRET/SIREN, adresse postale.
            </li>
            <li>
              Géolocalisation: adresse, latitude/longitude de l’entreprise (fournis par l’utilisateur).
            </li>
            <li>
              Contenus fournis: messages (messagerie inter‑entreprises), pièces jointes, données importées
              (fichiers CSV/XLSX pour analyse/synchronisation), informations de productions/besoins/déchets.
            </li>
            <li>
              Abonnement et paiement: données de facturation; les données de carte sont traitées par
              nos prestataires de paiement (Stripe/PayPal) et ne sont pas conservées par {LEGAL.appName}.
            </li>
            <li>
              Données techniques: adresse IP, identifiants techniques, données de navigation strictement
              nécessaires au fonctionnement, cookies essentiels et stockage local.
            </li>
          </ul>

          <h2>Finalités et bases légales</h2>
          <ul>
            <li>Fourniture du service (création de compte, profil, messagerie, import) — Exécution du contrat (art. 6‑1‑b RGPD).</li>
            <li>Gestion de l’abonnement, facturation et paiement — Exécution du contrat et obligation légale (art. 6‑1‑b et 6‑1‑c).</li>
            <li>Sécurité, prévention de la fraude, journalisation — Intérêt légitime (art. 6‑1‑f).</li>
            <li>Support et communication nécessaire — Intérêt légitime (art. 6‑1‑f).</li>
            <li>Prospection auprès de professionnels — Intérêt légitime (art. 6‑1‑f) avec droit d’opposition.</li>
            <li>Cookies/traceurs non essentiels — Consentement (art. 6‑1‑a), le cas échéant.</li>
          </ul>

          <h2>Destinataires et sous‑traitants</h2>
          <p>
            Les données sont accessibles uniquement aux équipes habilitées et à nos sous‑traitants
            techniques dans la limite de leurs missions:
          </p>
          <ul>
            <li>Hébergeur et infogérant: {LEGAL.hostName || 'À compléter'} (infrastructure et stockage).</li>
            <li>Prestataire de paiement: Stripe (Stripe Payments Europe) et/ou PayPal (Europe) S.à r.l., pour les paiements.</li>
            <li>Fournisseurs de cartes/OSM/Leaflet: chargement de tuiles cartographiques (OpenStreetMap) et ressources Leaflet/CDN.</li>
          </ul>
          <p>
            Chaque prestataire agit selon nos instructions et met en œuvre des mesures de sécurité adaptées.
          </p>

          <h2>Transferts hors UE</h2>
          <p>
            Les paiements peuvent impliquer des transferts hors UE par Stripe/PayPal. Ces transferts sont
            encadrés par des mécanismes reconnus (clauses contractuelles types, mesures complémentaires).
            Consultez leurs politiques: <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">Stripe</a>,
            {' '}<a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" target="_blank" rel="noreferrer">PayPal</a>.
          </p>

          <h2>Durées de conservation</h2>
          <ul>
            <li>Compte utilisateur: 3 ans après la dernière activité ou jusqu’à suppression.</li>
            <li>Données de facturation: 10 ans (obligations comptables).</li>
            <li>Messages et contenus: 3 ans après la dernière activité de l’espace concerné.</li>
            <li>Fichiers importés/analyse: 12 mois après import ou selon réglage du compte.</li>
            <li>Logs techniques et sécurité: 6 à 12 mois.</li>
          </ul>

          <h2>Cookies et traceurs</h2>
          <p>
            Le site utilise des cookies et/ou stockage local strictement nécessaires (authentification,
            sécurité, préférences). Aucune mesure d’audience non essentielle n’est déposée sans votre
            consentement. Les modules de paiement (Stripe/PayPal) peuvent déposer des cookies nécessaires
            à la prévention de la fraude et au paiement lorsque vous initiez une transaction.
          </p>

          <h2>Vos droits</h2>
          <p>
            Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition,
            et de portabilité des données, ainsi que du droit de définir des directives post‑mortem.
            Pour les exercer, contactez‑nous à {LEGAL.dpoEmail || LEGAL.contactEmail || LEGAL.email || 'À compléter'}.
            Vous disposez également du droit d’introduire une réclamation auprès de la CNIL
            (www.cnil.fr).
          </p>

          <h2>Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos
            données (contrôle d’accès, chiffrement en transit, journalisation). Aucune mesure n’étant
            infaillible, nous vous recommandons de choisir un mot de passe robuste et de le conserver
            confidentiel.
          </p>

          <h2>Mise à jour</h2>
          <p>
            La présente politique peut être mise à jour pour tenir compte de l’évolution légale ou des
            services. Dernière mise à jour: {LEGAL.lastUpdate || 'À compléter'}.
          </p>
        </div>
      </div>
    </div>
  )
}

