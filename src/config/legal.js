// Centralise les informations légales à afficher sur les pages
// Renseignez les variables dans votre .env (toutes doivent commencer par VITE_)

const env = import.meta.env || {}

function val(key, fallback = '') {
  const v = env[key]
  return v && String(v).trim() ? String(v).trim() : fallback
}

function orPlaceholder(value, label = 'À compléter') {
  return value && String(value).trim() ? String(value).trim() : label
}

const APP_NAME = val('VITE_APP_NAME', 'Application')

export const LEGAL = {
  appName: APP_NAME,

  // Éditeur / Société
  companyName: val('VITE_LEGAL_COMPANY_NAME', APP_NAME),
  legalForm: val('VITE_LEGAL_LEGAL_FORM', ''),
  shareCapital: val('VITE_LEGAL_SHARE_CAPITAL', ''),
  addressLine1: val('VITE_LEGAL_ADDRESS', ''),
  postalCode: val('VITE_LEGAL_POSTAL_CODE', ''),
  city: val('VITE_LEGAL_CITY', ''),
  country: val('VITE_LEGAL_COUNTRY', 'France'),
  phone: val('VITE_LEGAL_PHONE', ''),
  email: val('VITE_LEGAL_EMAIL', ''),
  rcs: val('VITE_LEGAL_RCS', ''),
  siren: val('VITE_LEGAL_SIREN', ''),
  siret: val('VITE_LEGAL_SIRET', ''),
  vat: val('VITE_LEGAL_VAT', ''),

  publicationDirector: val('VITE_LEGAL_PUBLICATION_DIRECTOR', ''),

  // Hébergeur
  hostName: val('VITE_LEGAL_HOST_NAME', ''),
  hostAddress: val('VITE_LEGAL_HOST_ADDRESS', ''),
  hostPhone: val('VITE_LEGAL_HOST_PHONE', ''),

  // DPO / Contact RGPD
  dpoName: val('VITE_LEGAL_DPO_NAME', ''),
  dpoEmail: val('VITE_LEGAL_DPO_EMAIL', ''),
  contactEmail: val('VITE_LEGAL_CONTACT_EMAIL', val('VITE_LEGAL_EMAIL', '')),

  // Divers
  disputeJurisdiction: val('VITE_LEGAL_DISPUTE_JURISDICTION', ''),
  lastUpdate: val('VITE_LEGAL_LAST_UPDATE', ''),
}

export function formatCompanyIdentity() {
  const parts = [
    orPlaceholder(LEGAL.companyName),
    LEGAL.legalForm && `${LEGAL.legalForm}${LEGAL.shareCapital ? ` au capital de ${LEGAL.shareCapital}` : ''}`,
    (LEGAL.addressLine1 || LEGAL.postalCode || LEGAL.city) &&
      [LEGAL.addressLine1, `${LEGAL.postalCode} ${LEGAL.city}`.trim(), LEGAL.country]
        .filter(Boolean)
        .join(', '),
    LEGAL.rcs && `RCS: ${LEGAL.rcs}`,
    LEGAL.siren && `SIREN: ${LEGAL.siren}`,
    LEGAL.siret && `SIRET: ${LEGAL.siret}`,
    LEGAL.vat && `TVA intracommunautaire: ${LEGAL.vat}`,
  ].filter(Boolean)
  return parts.join(' • ')
}

export function formatHostIdentity() {
  const parts = [
    orPlaceholder(LEGAL.hostName),
    LEGAL.hostAddress && LEGAL.hostAddress,
    LEGAL.hostPhone && `Tél: ${LEGAL.hostPhone}`,
  ].filter(Boolean)
  return parts.join(' • ')
}

