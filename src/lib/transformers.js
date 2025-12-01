/**
 * Data transformation utilities
 * Reusable functions to transform data between frontend and backend formats
 */

/**
 * Transform resource data for API submission
 * Used for productions, besoins, and dechets
 * 
 * @param {Object} data - Resource data from form
 * @param {'production'|'besoin'|'dechet'} type - Resource type
 * @returns {Object} Transformed data ready for API
 */
export function transformResourceData(data, type) {
  const baseData = {
    name: data.name,
    category: data.category,
    unit_measure: data.quantity || data.unit_measure,
    description: data.description,
    status: data.status || 'active'
  }
  
  // Add type-specific fields
  if (type === 'dechet') {
    baseData.is_been = data.traitement !== undefined ? data.traitement : true
  }
  
  return baseData
}

/**
 * Transform company general data for API submission
 * 
 * @param {Object} generalData - General company data from form
 * @returns {Object} Transformed data ready for API
 */
export function transformCompanyGeneralData(generalData) {
  return {
    name: generalData.nom_entreprise,
    sector: generalData.secteur,
    description: generalData.description
  }
}

/**
 * Transform geolocation data for API submission
 * 
 * @param {Object} geoData - Geolocation data from form
 * @returns {Object} Transformed data ready for API
 */
export function transformGeolocationData(geoData) {
  return {
    address: geoData.address,
    latitude: geoData.latitude,
    longitude: geoData.longitude
  }
}

/**
 * Normalize user data from various backend formats
 * Handles different field naming conventions
 * 
 * @param {Object} rawUser - Raw user data from backend
 * @returns {Object|null} Normalized user object
 */
export function normalizeUser(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') {
    return null
  }

  const firstName =
    rawUser.firstName ??
    rawUser.prenom ??
    rawUser.first_name ??
    rawUser.given_name ??
    ''

  const lastName =
    rawUser.lastName ??
    rawUser.nom ??
    rawUser.last_name ??
    rawUser.family_name ??
    ''

  const email =
    rawUser.email ??
    rawUser.mail ??
    rawUser.emailAddress ??
    rawUser.user_email ??
    undefined

  return {
    ...rawUser,
    firstName,
    lastName,
    prenom: rawUser.prenom ?? firstName,
    nom: rawUser.nom ?? lastName,
    email: email ?? '',
  }
}

/**
 * Normalize coordinates from various formats
 * 
 * @param {Array|Object} coordinates - Coordinates in various formats
 * @returns {Array|null} Normalized [lat, lng] array or null if invalid
 */
export function normalizeCoordinates(coordinates) {
  // Handle array format [lat, lng]
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    const [lat, lng] = coordinates.map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat, lng]
    }
    return null
  }

  // Handle object format { lat, lng } or { latitude, longitude }
  if (coordinates && typeof coordinates === 'object') {
    const lat = Number(coordinates.lat ?? coordinates.latitude)
    const lng = Number(coordinates.lng ?? coordinates.lon ?? coordinates.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat, lng]
    }
  }

  return null
}

/**
 * Normalize facet entries for filters
 * Handles both array and object formats
 * 
 * @param {Array|Object} rawFacets - Raw facet data from backend
 * @returns {Array} Normalized facet entries with value, label, and count
 */
export function normalizeFacetEntries(rawFacets) {
  if (!rawFacets) {
    return []
  }

  const entries = []

  const pushEntry = (valueKey, facet) => {
    const value =
      facet?.value ??
      facet?.slug ??
      facet?.code ??
      facet?.name ??
      facet?.id ??
      valueKey

    if (!value) {
      return
    }

    const label = facet?.label ?? facet?.name ?? String(value)
    const count = typeof facet?.count === 'number' ? facet.count : Number(facet?.total ?? facet?.valueCount)

    entries.push({
      value: String(value),
      label,
      count: Number.isFinite(count) ? count : undefined,
    })
  }

  // Handle array format
  if (Array.isArray(rawFacets)) {
    rawFacets.forEach((facet, index) => pushEntry(String(index), facet))
  } 
  // Handle object format
  else if (typeof rawFacets === 'object') {
    Object.entries(rawFacets).forEach(([key, facetValue]) => {
      if (facetValue && typeof facetValue === 'object' && !Array.isArray(facetValue)) {
        pushEntry(key, facetValue)
      } else {
        entries.push({ value: key, label: key, count: Number(facetValue) })
      }
    })
  }

  return entries
}

/**
 * Compare two Sets for equality
 * 
 * @param {Set} setA - First set
 * @param {Set} setB - Second set
 * @returns {boolean} True if sets are equal
 */
export function areSetsEqual(setA, setB) {
  if (!setA || !setB) {
    return false
  }
  if (setA.size !== setB.size) {
    return false
  }
  for (const value of setA) {
    if (!setB.has(value)) {
      return false
    }
  }
  return true
}
