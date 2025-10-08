import api from './Api'

/**
 * Upload Excel file for import
 * @param {File} file - Excel file (.xlsx, .csv, .ods)
 * @returns {Promise} Upload response with file ID
 */
export async function uploadImportFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/import/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data // { fileId, fileName, fileSize, fileType }
}

/**
 * Get import statistics
 * @returns {Promise} Import stats (total imports, precision rate, etc.)
 */
export async function getImportStats() {
  const response = await api.get('/import/stats')
  return response.data // { totalImports, precisionRate, monthlyImports }
}

/**
 * Map columns from uploaded file
 * @param {string} fileId - Uploaded file ID
 * @param {Object|string} mapping - Column mapping configuration ('auto' or {column: field})
 * @returns {Promise} Mapped data preview
 */
export async function mapImportColumns(fileId, mapping) {
  const response = await api.post(`/import/${fileId}/map`, { mapping })
  return response.data // { mappedColumns, preview, columnHeaders }
}

/**
 * Run AI analysis on imported data
 * @param {string} fileId - Uploaded file ID
 * @returns {Promise} AI analysis results
 */
export async function runAIAnalysis(fileId) {
  const response = await api.post(`/import/${fileId}/analyze`)
  return response.data // { analysisId, status }
}

/**
 * Get volume predictions from analysis
 * @param {string} analysisId - Analysis ID
 * @returns {Promise} Prediction results
 */
export async function getVolumePredictions(analysisId) {
  const response = await api.get(`/import/analysis/${analysisId}/predictions`)
  return response.data // { predictions: [{label, value}] }
}

/**
 * Get suggested partnerships from analysis
 * @param {string} analysisId - Analysis ID
 * @returns {Promise} Partnership suggestions
 */
export async function getSuggestedPartnerships(analysisId) {
  const response = await api.get(`/import/analysis/${analysisId}/partnerships`)
  return response.data // { partnerships: [{name, score, compatibility}] }
}

/**
 * Get optimization recommendations
 * @param {string} analysisId - Analysis ID
 * @returns {Promise} Optimization recommendations
 */
export async function getOptimizations(analysisId) {
  const response = await api.get(`/import/analysis/${analysisId}/optimizations`)
  return response.data // { optimizations: [{description, impact, savings}] }
}

/**
 * Get financial impact analysis
 * @param {string} analysisId - Analysis ID
 * @returns {Promise} Financial impact data
 */
export async function getFinancialImpact(analysisId) {
  const response = await api.get(`/import/analysis/${analysisId}/impact`)
  return response.data // { minRevenue, maxRevenue, breakdown }
}

/**
 * Get import history
 * @param {number} limit - Number of entries to retrieve
 * @returns {Promise} Import history
 */
export async function getImportHistory(limit = 30) {
  const response = await api.get('/import/history', {
    params: { limit }
  })
  return response.data // { history: [{id, name, description, status, createdAt}] }
}

/**
 * Sync imported data to user profile
 * @param {string} analysisId - Analysis ID
 * @returns {Promise} Sync confirmation
 */
export async function syncImportedData(analysisId) {
  const response = await api.post(`/import/analysis/${analysisId}/sync`)
  return response.data // { syncedItems: {productions, wastes, needs} }
}

/**
 * Download Excel template
 * @returns {Promise<Blob>} Excel file blob
 */
export async function downloadExcelTemplate() {
  const response = await api.get('/import/template', {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get current profile data for synchronization check
 * @returns {Promise} Profile data summary
 */
export async function getProfileDataSummary() {
  const response = await api.get('/import/profile-summary')
  return response.data // { productions, wastes, needs, analyses }
}

