import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  uploadImportFile,
  getImportStats,
  mapImportColumns,
  runAIAnalysis,
  getVolumePredictions,
  getSuggestedPartnerships,
  getOptimizations,
  getFinancialImpact,
  getImportHistory,
  syncImportedData,
  downloadExcelTemplate,
  getProfileDataSummary,
} from '@/services/ImportApi'

function unwrapData(payload) {
  if (!payload) return undefined
  if (Array.isArray(payload)) return payload
  if (payload.data !== undefined) return unwrapData(payload.data)
  if (payload.result !== undefined) return unwrapData(payload.result)
  return payload
}

function extractArray(payload, keys = []) {
  const unwrapped = unwrapData(payload)
  if (Array.isArray(unwrapped)) return unwrapped

  const visited = new Set()

  const scanObject = (obj, preferredKeys = []) => {
    if (!obj || typeof obj !== 'object') return []
    if (visited.has(obj)) return []
    visited.add(obj)

    for (const key of preferredKeys) {
      const value = obj?.[key]
      if (Array.isArray(value)) {
        return value
      }
      if (value && typeof value === 'object') {
        const nested = scanObject(value, preferredKeys)
        if (nested.length > 0) return nested
      }
    }

    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        return value
      }
    }

    for (const value of Object.values(obj)) {
      if (value && typeof value === 'object') {
        const nested = scanObject(value, preferredKeys)
        if (nested.length > 0) return nested
      }
    }

    return []
  }

  const arrays = scanObject(unwrapped, keys)
  if (arrays.length > 0) return arrays

  return []
}

function extractObject(payload) {
  const unwrapped = unwrapData(payload)
  return typeof unwrapped === 'object' && unwrapped !== null ? unwrapped : {}
}

function extractNumber(payload, keys = []) {
  const obj = extractObject(payload)
  for (const key of keys) {
    const value = obj?.[key]
    if (typeof value === 'number') {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return 0
}

// Query keys
export const importKeys = {
  all: ['import'],
  stats: () => [...importKeys.all, 'stats'],
  history: (limit) => [...importKeys.all, 'history', limit],
  analysis: (id) => [...importKeys.all, 'analysis', id],
  predictions: (id) => [...importKeys.all, 'predictions', id],
  partnerships: (id) => [...importKeys.all, 'partnerships', id],
  optimizations: (id) => [...importKeys.all, 'optimizations', id],
  impact: (id) => [...importKeys.all, 'impact', id],
  profileSummary: () => [...importKeys.all, 'profile-summary'],
}

/**
 * Hook to get import statistics
 */
export function useImportStats() {
  return useQuery({
    queryKey: importKeys.stats(),
    queryFn: getImportStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get import history
 */
export function useImportHistory(limit = 30) {
  return useQuery({
    queryKey: importKeys.history(limit),
    queryFn: () => getImportHistory(limit),
    select: (data) => extractArray(data, ['history', 'items', 'records']),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to get volume predictions
 */
export function useVolumePredictions(analysisId) {
  return useQuery({
    queryKey: importKeys.predictions(analysisId),
    queryFn: () => getVolumePredictions(analysisId),
    enabled: !!analysisId,
    select: (data) => extractArray(data, ['predictions', 'items']),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to get partnership suggestions
 */
export function useSuggestedPartnerships(analysisId) {
  return useQuery({
    queryKey: importKeys.partnerships(analysisId),
    queryFn: () => getSuggestedPartnerships(analysisId),
    enabled: !!analysisId,
    select: (data) => extractArray(data, ['partnerships', 'items', 'suggestions']),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get optimizations
 */
export function useOptimizations(analysisId) {
  return useQuery({
    queryKey: importKeys.optimizations(analysisId),
    queryFn: () => getOptimizations(analysisId),
    enabled: !!analysisId,
    select: (data) => extractArray(data, ['optimizations', 'items', 'recommendations']),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get financial impact
 */
export function useFinancialImpact(analysisId) {
  return useQuery({
    queryKey: importKeys.impact(analysisId),
    queryFn: () => getFinancialImpact(analysisId),
    enabled: !!analysisId,
    select: (data) => {
      const impact = extractObject(data)
      return {
        minRevenue:
          impact.minRevenue ?? impact.min_revenue ?? impact.range?.min ?? 0,
        maxRevenue:
          impact.maxRevenue ?? impact.max_revenue ?? impact.range?.max ?? 0,
        breakdown: impact.breakdown ?? impact.details ?? null,
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get profile data summary
 */
export function useProfileSummary() {
  return useQuery({
    queryKey: importKeys.profileSummary(),
    queryFn: getProfileDataSummary,
    select: (data) => {
      const summary = extractObject(data)
      return {
        productions:
          extractNumber(summary, ['productions', 'productionsCount', 'productionCount']) || 0,
        wastes:
          extractNumber(summary, ['wastes', 'wasteCount', 'wastesCount']) || 0,
        needs:
          extractNumber(summary, ['needs', 'needsCount', 'needCount']) || 0,
        analyses:
          extractNumber(summary, ['analyses', 'analysisCount', 'analysesCount']) || 0,
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to upload import file
 */
export function useUploadImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadImportFile,
    onSuccess: (data) => {
      toast.success('Fichier importé avec succès')
      queryClient.invalidateQueries({ queryKey: importKeys.stats() })
      queryClient.invalidateQueries({ queryKey: importKeys.history() })
      return data
    },
    onError: (error) => {
      console.error('❌ Error uploading file:', error)
      const message = error.response?.data?.error || 'Erreur lors de l\'import du fichier'
      toast.error(message)
    },
  })
}

/**
 * Hook to map columns
 */
export function useMapColumns() {
  return useMutation({
    mutationFn: ({ fileId, mapping }) => mapImportColumns(fileId, mapping),
    onSuccess: (data) => {
      const mapping = extractObject(data)
      const columnsDetected = extractArray(data, ['columns', 'mappedColumns', 'mapping'])
      const previewRows = extractArray(data, ['preview', 'rows', 'sampleRows', 'sample', 'data', 'items'])

      let columnCount = columnsDetected.length
      if (!columnCount && mapping?.mappedColumns && typeof mapping.mappedColumns === 'object') {
        columnCount = Object.keys(mapping.mappedColumns).length
      }

      toast.success(
        columnCount > 0
          ? `${columnCount} colonne${columnCount > 1 ? 's' : ''} détectée${columnCount > 1 ? 's' : ''} automatiquement`
          : 'Colonnes mappées avec succès'
      )

      if (columnCount === 0) {
        toast.warning('Aucune colonne détectée automatiquement. Vérifiez votre fichier avant de continuer.')
      }

      if (previewRows.length === 0) {
        toast.warning('Aucun aperçu de lignes renvoyé par l’API.')
      }

      return {
        ...mapping,
        __raw: data,
      }
    },
    onError: (error) => {
      console.error('❌ Error mapping columns:', error)
      const message = error.response?.data?.error || 'Erreur lors du mapping des colonnes'
      toast.error(message)
    },
  })
}

/**
 * Hook to run AI analysis
 */
export function useRunAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: runAIAnalysis,
    onSuccess: (data) => {
      const result = extractObject(data)
      const totalItems = extractNumber(result, ['itemsAnalyzed', 'items', 'rows'])

      toast.success(
        totalItems
          ? `Analyse IA terminée : ${totalItems} lignes traitées`
          : 'Analyse IA terminée'
      )
      queryClient.invalidateQueries({ queryKey: importKeys.all })
      return data
    },
    onError: (error) => {
      console.error('❌ Error running analysis:', error)
      const message = error.response?.data?.error || 'Erreur lors de l\'analyse IA'
      toast.error(message)
    },
  })
}

/**
 * Hook to sync imported data
 */
export function useSyncData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: syncImportedData,
    onSuccess: (data) => {
      const result = extractObject(data)
      const synced = result.syncedItems || result

      const productions = extractNumber(synced, ['productions', 'productionsCount', 'productionCount'])
      const wastes = extractNumber(synced, ['wastes', 'wastesCount', 'wasteCount'])
      const needs = extractNumber(synced, ['needs', 'needsCount', 'needCount'])

      const total = productions + wastes + needs

      toast.success(
        total > 0
          ? `${total} éléments synchronisés (prod: ${productions}, déchets: ${wastes}, besoins: ${needs})`
          : 'Synchronisation terminée (aucun nouvel élément détecté)'
      )

      if (total === 0) {
        console.warn('Synchronisation sans nouvel élément. Réponse API:', data)
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['company-profile'] })
      queryClient.invalidateQueries({ queryKey: importKeys.profileSummary() })
      queryClient.invalidateQueries({ queryKey: importKeys.history() })
    },
    onError: (error) => {
      console.error('❌ Error syncing data:', error)
      const message = error.response?.data?.error || 'Erreur lors de la synchronisation'
      toast.error(message)
    },
  })
}

/**
 * Hook to download template
 */
export function useDownloadTemplate() {
  return useMutation({
    mutationFn: downloadExcelTemplate,
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'modele_import_ecopaluds.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Modèle téléchargé')
    },
    onError: (error) => {
      console.error('❌ Error downloading template:', error)
      toast.error('Erreur lors du téléchargement')
    },
  })
}

