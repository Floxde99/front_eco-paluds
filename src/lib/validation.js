/**
 * Validation utilities for common data types
 */

/**
 * Validate GPS coordinates
 * @param {number|string} lat - Latitude value
 * @param {number|string} lng - Longitude value
 * @returns {{latitude: number, longitude: number}} Validated coordinates
 * @throws {Error} If coordinates are invalid
 */
export function validateCoordinates(lat, lng) {
  const latitude = Number(lat)
  const longitude = Number(lng)

  // Check if values are valid numbers
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Les coordonnées doivent être des nombres valides')
  }

  // Check latitude bounds (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    throw new Error('La latitude doit être comprise entre -90 et 90 degrés')
  }

  // Check longitude bounds (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    throw new Error('La longitude doit être comprise entre -180 et 180 degrés')
  }

  return { latitude, longitude }
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate SIRET number (French business identifier)
 * @param {string} siret - SIRET number to validate
 * @returns {boolean} True if valid SIRET format
 */
export function isValidSiret(siret) {
  if (!siret || typeof siret !== 'string') {
    return false
  }
  
  // SIRET must be exactly 14 digits
  const siretRegex = /^\d{14}$/
  return siretRegex.test(siret.replace(/\s/g, ''))
}

/**
 * Validate phone number (French format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false
  }
  
  // French phone: 10 digits, optionally starting with +33
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone)
}
