import { z } from 'zod'

export const trimString = (message = 'Ce champ est requis') =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)

export const optionalTrimmedString = () =>
  z
    .string()
    .trim()
    .transform((value) => (value === '' ? undefined : value))
    .optional()

export const numberInRange = ({
  message,
  min,
  max,
}) =>
  z.coerce
    .number({ invalid_type_error: message, required_error: message })
    .refine((value) => !Number.isNaN(value), { message })
    .refine((value) => (min === undefined || value >= min) && (max === undefined || value <= max), {
      message,
    })

export const mapZodErrors = (zodError) => {
  const fieldErrors = zodError?.flatten?.().fieldErrors ?? {}

  return Object.entries(fieldErrors).reduce((acc, [field, messages]) => {
    if (messages && messages.length) {
      acc[field] = messages[0]
    }
    return acc
  }, {})
}
