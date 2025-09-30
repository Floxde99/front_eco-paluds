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
    const company = res.data.company
    return {
      general: {
        nom_entreprise: company.name,
        secteur: company.sector,
        description: company.description,
        phone: company.phone,
        email: company.email,
        website: company.website,
        siret: company.siret
      },
      productions: company.productions || [],
      besoins: company.besoins || [],
      dechets: company.dechets || [],
      geolocation: {
        address: company.address,
        latitude: company.latitude,
        longitude: company.longitude
      }
    }
  } catch (err) {
    if (err?.response?.status === 404) {
      // Pas de profil encore : retourner null pour que le hook/composant gère l'état vide
      return null
    }
    console.error('❌ Error fetching company profile:', err)
    throw err
  }
}

/**
 * Create a new company profile
 * @param {Object} companyData - Company data with required and optional fields
 * @param {string} companyData.name - Company name (required)
 * @param {string} companyData.sector - Company sector (required)
 * @param {string} companyData.address - Company address (required)
 * @param {string} companyData.siret - Company SIRET (required)
 * @param {number} companyData.latitude - Company latitude (required)
 * @param {number} companyData.longitude - Company longitude (required)
 * @param {string} companyData.phone - Company phone (required)
 * @param {string} companyData.email - Company email (required)
 * @param {string} [companyData.website] - Company website (optional)
 * @param {string} [companyData.description] - Company description (optional)
 * @returns {Promise} Created company data
 */
export async function createCompany(companyData) {
  try {
    // Debug : Afficher les données avant envoi
    console.log('📤 Frontend sending company data:', companyData)
    
    // Validation des champs requis
    const requiredFields = ['name', 'sector', 'address', 'siret', 'phone', 'email', 'latitude', 'longitude']
    const missingFields = requiredFields.filter(field => 
      companyData[field] === undefined || companyData[field] === null || companyData[field] === ''
    )
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`)
    }
    
    // S'assurer que tous les champs requis sont présents et valides
    const cleanedData = {
      name: String(companyData.name).trim(),
      sector: String(companyData.sector).trim(),
      address: String(companyData.address).trim(),
      siret: String(companyData.siret).trim(),
      phone: String(companyData.phone).trim(),
      email: String(companyData.email).trim(),
      latitude: Number(companyData.latitude),
      longitude: Number(companyData.longitude),
      // Champs optionnels
      ...(companyData.description && { description: String(companyData.description).trim() }),
      ...(companyData.website && { website: String(companyData.website).trim() })
    }
    
    console.log('📤 Cleaned data being sent:', cleanedData)
    
    const res = await api.post('/company', cleanedData)
    return res.data.company
  } catch (err) {
    console.error('❌ Error creating company:', err)
    throw err
  }
}

export async function updateCompanyGeneral(generalData) {
  try {

    const transformedData = {
      name: generalData.nom_entreprise,
      sector: generalData.secteur,
      description: generalData.description
    }
    
    const res = await api.put('/company/general', transformedData)
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
    return res.data.productions || []
  } catch (err) {
    if (err?.response?.status === 404) {
      return [] // pas encore de productions
    }
    console.error('❌ Error fetching productions:', err)
    throw err
  }
}

/**
 * Add new production
 * @param {Object} productionData - Production item data
 * @param {string} productionData.name - Production name
 * @param {string} productionData.category - Production category
 * @param {string} productionData.quantity - Quantity information (maps to unit_measure)
 * @param {string} productionData.description - Production description
 * @param {string} productionData.status - Production status
 * @returns {Promise} Created production item
 */
export async function addProduction(productionData) {
  try {
    // Transform frontend field names to backend expected names
    const transformedData = {
      name: productionData.name,
      category: productionData.category,
      unit_measure: productionData.quantity || productionData.unit_measure,
      description: productionData.description,
      status: productionData.status || "active"
    }
    
    const res = await api.post('/company/productions', transformedData)
    // Backend returns: { message: "...", production: {...} }
    return res.data.production
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
    // Transform frontend field names to backend expected names
    const transformedData = {
      name: productionData.name,
      category: productionData.category,
      unit_measure: productionData.quantity || productionData.unit_measure,
      description: productionData.description,
      status: productionData.status || "active"
    }
    
    const res = await api.put(`/company/productions/${id}`, transformedData)
    // Backend returns: { message: "...", production: {...} }
    return res.data.production
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
    return res.data.besoins || []
  } catch (err) {
    if (err?.response?.status === 404) {
      return [] // pas encore de besoins
    }
    console.error('❌ Error fetching besoins:', err)
    throw err
  }
}

/**
 * Add new besoin
 * @param {Object} besoinData - Besoin item data
 * @param {string} besoinData.name - Besoin name
 * @param {string} besoinData.category - Besoin category
 * @param {string} besoinData.quantity - Quantity needed (maps to unit_measure)
 * @param {string} besoinData.description - Besoin description
 * @param {string} besoinData.status - Besoin status
 * @returns {Promise} Created besoin item
 */
export async function addBesoin(besoinData) {
  try {
    // Transform frontend field names to backend expected names
    const transformedData = {
      name: besoinData.name,
      category: besoinData.category,
      unit_measure: besoinData.quantity || besoinData.unit_measure,
      description: besoinData.description,
      status: besoinData.status || "active"
    }
    
    const res = await api.post('/company/besoins', transformedData)
    // Backend returns: { message: "...", besoin: {...} }
    return res.data.besoin
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
    // Transform frontend field names to backend expected names
    const transformedData = {
      name: besoinData.name,
      category: besoinData.category,
      unit_measure: besoinData.quantity || besoinData.unit_measure,
      description: besoinData.description,
      status: besoinData.status || "active"
    }
    
    const res = await api.put(`/company/besoins/${id}`, transformedData)
    // Backend returns: { message: "...", besoin: {...} }
    return res.data.besoin
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
    return res.data.dechets || []
  } catch (err) {
    if (err?.response?.status === 404) {
      return [] // pas encore de déchets
    }
    console.error('❌ Error fetching dechets:', err)
    throw err
  }
}

/**
 * Add new dechet
 * @param {Object} dechetData - Dechet item data
 * @param {string} dechetData.name - Dechet name
 * @param {string} dechetData.category - Dechet category
 * @param {string} dechetData.quantity - Quantity available (maps to unit_measure)
 * @param {string} dechetData.description - Dechet description
 * @param {boolean} dechetData.traitement - Treatment required (maps to is_been)
 * @param {string} dechetData.status - Dechet status
 * @returns {Promise} Created dechet item
 */
export async function addDechet(dechetData) {
  try {
    // Transform frontend field names to backend expected names
    const transformedData = {
      name: dechetData.name,
      category: dechetData.category,
      unit_measure: dechetData.quantity || dechetData.unit_measure,
      description: dechetData.description,
      is_been: dechetData.traitement !== undefined ? dechetData.traitement : true,
      status: dechetData.status || "active"
    }
    
    const res = await api.post('/company/dechets', transformedData)
    // Backend returns: { message: "...", dechet: {...} }
    return res.data.dechet
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
    // Transform frontend field names to backend expected names
    const transformedData = {
      name: dechetData.name,
      category: dechetData.category,
      unit_measure: dechetData.quantity || dechetData.unit_measure,
      description: dechetData.description,
      is_been: dechetData.traitement !== undefined ? dechetData.traitement : true,
      status: dechetData.status || "active"
    }
    
    const res = await api.put(`/company/dechets/${id}`, transformedData)
    // Backend returns: { message: "...", dechet: {...} }
    return res.data.dechet
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
 * @param {number} geoData.latitude - Latitude coordinate
 * @param {number} geoData.longitude - Longitude coordinate
 * @returns {Promise} Updated geolocation data
 */
export async function updateGeolocation(geoData) {
  try {
    // Backend expects: { address, latitude, longitude }
    const transformedData = {
      address: geoData.address,
      latitude: geoData.latitude,
      longitude: geoData.longitude
    }
    
    const res = await api.put('/company/geolocation', transformedData)
    // Backend returns: { message: "...", geolocation: {...} }
    return res.data.geolocation
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
    return res.data.geolocation || null
  } catch (err) {
    if (err?.response?.status === 404) {
      return null // pas encore de géolocalisation
    }
    console.error('❌ Error fetching geolocation:', err)
    throw err
  }
}