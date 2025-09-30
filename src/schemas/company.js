import { z } from 'zod'
import { numberInRange, optionalTrimmedString, trimString } from '@/lib/zod'

const SIRET_REGEX = /^\d{14}$/

export const companyCreateSchema = z.object({
  name: trimString("Le nom de l'entreprise est obligatoire"),
  sector: trimString("Le secteur d'activité est obligatoire"),
  address: trimString("L'adresse est obligatoire"),
  siret: trimString('Le SIRET est obligatoire').refine((value) => SIRET_REGEX.test(value), {
    message: 'Le SIRET doit contenir exactement 14 chiffres',
  }),
  phone: trimString('Le téléphone est obligatoire'),
  email: z
    .string({ required_error: "L'email est obligatoire" })
    .trim()
    .min(1, "L'email est obligatoire")
    .email("Format d'email invalide"),
  latitude: numberInRange({
    message: 'Latitude invalide',
    min: -90,
    max: 90,
  }),
  longitude: numberInRange({
    message: 'Longitude invalide',
    min: -180,
    max: 180,
  }),
  description: optionalTrimmedString(),
  website: optionalTrimmedString().refine(
    (value) => !value || /^https?:\/\//i.test(value),
    {
      message: 'Le site web doit commencer par http:// ou https://',
    }
  ),
})

export const geolocationSchema = z.object({
  address: trimString('Veuillez saisir une adresse'),
  latitude: numberInRange({
    message: 'Latitude invalide (comprise entre -90 et 90)',
    min: -90,
    max: 90,
  }),
  longitude: numberInRange({
    message: 'Longitude invalide (comprise entre -180 et 180)',
    min: -180,
    max: 180,
  }),
})

