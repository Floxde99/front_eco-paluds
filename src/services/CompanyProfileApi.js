import api from './Api.js'

// Company Profile API functions
// Following the same patterns as Api.js for consistency

/**
 * Get complete company profile data
 * @returns {Promise} Company profile with general info, productions, besoins, dechets, geolocation
 */
export async function getCompanyProfile() {
  try {
    const res = await api.get('/company/profile')
    return res.data
  } catch (err) {
    console.error('❌ Error fetching company profile:', err)
    throw err
  }
}

/**
 * Update company general information
 * @param {Object} generalData - Object containing company general info
 * @param {string} generalData.nom_entreprise - Company name
 * @param {string} generalData.secteur - Business sector
 * @param {string} generalData.description - Company description
 * @returns {Promise} Updated company data
 */
export async function updateCompanyGeneral(generalData) {
  try {
    const res = await api.put('/company/general', generalData)
    return res.data
  } catch (err) {
    console.error('❌ Error updating company general info:', err)
    throw err
  }
}

// ===================
// PRODUCTIONS API
// ===================

/**
 * Get all company productions
 * @returns {Promise} Array of production items
 */
export async function getProductions() {
  try {
    const res = await api.get('/company/productions')
    return res.data
  } catch (err) {
    console.error('❌ Error fetching productions:', err)
    throw err
  }
}

/**
 * Add new production
 * @param {Object} productionData - Production item data
 * @param {string} productionData.name - Production name
 * @param {string} productionData.category - Production category
 * @param {string} productionData.quantity - Quantity information
 * @returns {Promise} Created production item
 */
export async function addProduction(productionData) {
  try {
    const res = await api.post('/company/productions', productionData)
    return res.data
  } catch (err) {
    console.error('❌ Error adding production:', err)
    throw err
  }
}

/**
 * Update existing production
 * @param {number} id - Production ID
 * @param {Object} productionData - Updated production data
 * @returns {Promise} Updated production item
 */
export async function updateProduction(id, productionData) {
  try {
    const res = await api.put(`/company/productions/${id}`, productionData)
    return res.data
  } catch (err) {
    console.error('❌ Error updating production:', err)
    throw err
  }
}

/**
 * Delete production
 * @param {number} id - Production ID to delete
 * @returns {Promise} Deletion confirmation
 */
export async function deleteProduction(id) {
  try {
    const res = await api.delete(`/company/productions/${id}`)
    return res.data
  } catch (err) {
    console.error('❌ Error deleting production:', err)
    throw err
  }
}

// ===================
// BESOINS API
// ===================

/**
 * Get all company besoins (needs)
 * @returns {Promise} Array of besoin items
 */
export async function getBesoins() {
  try {
    const res = await api.get('/company/besoins')
    return res.data
  } catch (err) {
    console.error('❌ Error fetching besoins:', err)
    throw err
  }
}

/**
 * Add new besoin
 * @param {Object} besoinData - Besoin item data
 * @param {string} besoinData.name - Besoin name
 * @param {string} besoinData.category - Besoin category
 * @param {string} besoinData.quantity - Quantity needed
 * @param {string} besoinData.urgence - Urgency level
 * @returns {Promise} Created besoin item
 */
export async function addBesoin(besoinData) {
  try {
    const res = await api.post('/company/besoins', besoinData)
    return res.data
  } catch (err) {
    console.error('❌ Error adding besoin:', err)
    throw err
  }
}

/**
 * Update existing besoin
 * @param {number} id - Besoin ID
 * @param {Object} besoinData - Updated besoin data
 * @returns {Promise} Updated besoin item
 */
export async function updateBesoin(id, besoinData) {
  try {
    const res = await api.put(`/company/besoins/${id}`, besoinData)
    return res.data
  } catch (err) {
    console.error('❌ Error updating besoin:', err)
    throw err
  }
}

/**
 * Delete besoin
 * @param {number} id - Besoin ID to delete
 * @returns {Promise} Deletion confirmation
 */
export async function deleteBesoin(id) {
  try {
    const res = await api.delete(`/company/besoins/${id}`)
    return res.data
  } catch (err) {
    console.error('❌ Error deleting besoin:', err)
    throw err
  }
}

// ===================
// DECHETS API
// ===================

/**
 * Get all company dechets (waste)
 * @returns {Promise} Array of dechet items
 */
export async function getDechets() {
  try {
    const res = await api.get('/company/dechets')
    return res.data
  } catch (err) {
    console.error('❌ Error fetching dechets:', err)
    throw err
  }
}

/**
 * Add new dechet
 * @param {Object} dechetData - Dechet item data
 * @param {string} dechetData.name - Dechet name
 * @param {string} dechetData.category - Dechet category
 * @param {string} dechetData.quantity - Quantity available
 * @param {string} dechetData.etat - Current state/condition
 * @param {boolean} dechetData.traitement - Treatment required
 * @returns {Promise} Created dechet item
 */
export async function addDechet(dechetData) {
  try {
    const res = await api.post('/company/dechets', dechetData)
    return res.data
  } catch (err) {
    console.error('❌ Error adding dechet:', err)
    throw err
  }
}

/**
 * Update existing dechet
 * @param {number} id - Dechet ID
 * @param {Object} dechetData - Updated dechet data
 * @returns {Promise} Updated dechet item
 */
export async function updateDechet(id, dechetData) {
  try {
    const res = await api.put(`/company/dechets/${id}`, dechetData)
    return res.data
  } catch (err) {
    console.error('❌ Error updating dechet:', err)
    throw err
  }
}

/**
 * Delete dechet
 * @param {number} id - Dechet ID to delete
 * @returns {Promise} Deletion confirmation
 */
export async function deleteDechet(id) {
  try {
    const res = await api.delete(`/company/dechets/${id}`)
    return res.data
  } catch (err) {
    console.error('❌ Error deleting dechet:', err)
    throw err
  }
}

// ===================
// GEOLOCATION API
// ===================

/**
 * Update company geolocation data
 * @param {Object} geoData - Geolocation data
 * @param {string} geoData.address - Company address
 * @param {number} geoData.rayon - Action radius in km
 * @param {number} geoData.latitude - Latitude coordinate
 * @param {number} geoData.longitude - Longitude coordinate
 * @returns {Promise} Updated geolocation data
 */
export async function updateGeolocation(geoData) {
  try {
    const res = await api.put('/company/geolocation', geoData)
    return res.data
  } catch (err) {
    console.error('❌ Error updating geolocation:', err)
    throw err
  }
}

/**
 * Get company geolocation data
 * @returns {Promise} Geolocation data
 */
export async function getGeolocation() {
  try {
    const res = await api.get('/company/geolocation')
    return res.data
  } catch (err) {
    console.error('❌ Error fetching geolocation:', err)
    throw err
  }
}