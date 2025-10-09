import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Download, FileSpreadsheet, Eye, CheckCircle2, TrendingUp, Users, DollarSign, Sparkles, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  useImportStats,
  useImportHistory,
  useUploadImport,
  useDownloadTemplate,
  useMapColumns,
  useRunAnalysis,
  useSyncData,
  useVolumePredictions,
  useSuggestedPartnerships,
  useOptimizations,
  useFinancialImpact,
  useProfileSummary,
} from '@/hooks/useImport'

const FILE_ID_KEYS = [
  'fileId',
  'file_id',
  'id',
  'uploadId',
  'upload_id',
  'importId',
  'import_id',
]

const ANALYSIS_ID_KEYS = [
  'analysisId',
  'analysis_id',
  'id',
  'resultId',
  'result_id',
  'jobId',
  'job_id',
]

function resolveUploadedFileId(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const candidates = [
    ...FILE_ID_KEYS.map((key) => payload?.[key]),
    ...FILE_ID_KEYS.map((key) => payload?.data?.[key]),
    ...FILE_ID_KEYS.map((key) => payload?.file?.[key]),
    ...FILE_ID_KEYS.map((key) => payload?.result?.[key]),
    ...FILE_ID_KEYS.map((key) => payload?.upload?.[key]),
    Array.isArray(payload?.files) ? payload.files[0]?.id : undefined,
    Array.isArray(payload?.uploads) ? payload.uploads[0]?.id : undefined,
  ].filter((value) => value !== undefined && value !== null)

  if (candidates.length === 0) {
    return null
  }

  const first = candidates[0]
  return typeof first === 'number' ? first : String(first)
}

function resolveAnalysisId(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const candidates = [
    ...ANALYSIS_ID_KEYS.map((key) => payload?.[key]),
    ...ANALYSIS_ID_KEYS.map((key) => payload?.data?.[key]),
    ...ANALYSIS_ID_KEYS.map((key) => payload?.analysis?.[key]),
    ...ANALYSIS_ID_KEYS.map((key) => payload?.result?.[key]),
    Array.isArray(payload?.analyses) ? payload.analyses[0]?.id : undefined,
  ].filter((value) => value !== undefined && value !== null)

  if (candidates.length === 0) {
    return null
  }

  const first = candidates[0]
  return typeof first === 'number' ? first : String(first)
}

// Processus d'import en 4 étapes
const IMPORT_STEPS = [
  { id: 1, label: 'Upload fichier' },
  { id: 2, label: 'Mapping colonnes' },
  { id: 3, label: 'Analyse IA' },
  { id: 4, label: 'Intégration' },
]

function extractArray(data, candidates = []) {
  if (Array.isArray(data)) return data
  for (const key of candidates) {
    const value = data?.[key]
    if (Array.isArray(value)) return value
  }
  return []
}

function extractNumberValue(data, candidates = []) {
  for (const key of candidates) {
    const value = data?.[key]
    if (typeof value === 'number') return value
  }
  return 0
}

function normalizeMappingResponse(response) {
  const rawResponse = response?.__raw ?? response
  const dataSection = rawResponse?.data ?? response?.data ?? rawResponse

  const columnsArray = extractArray(dataSection, ['columns', 'mappedColumns', 'mapping'])
  const previewArray = extractArray(dataSection, ['preview', 'rows', 'sampleRows', 'sample', 'data', 'items'])
  const totalRows =
    extractNumberValue(dataSection, ['mappedRows', 'rowCount', 'rows', 'totalRows', 'validRows', 'previewCount']) ||
    previewArray.length

  let columns = columnsArray

  if ((!columns || columns.length === 0) && dataSection?.mappedColumns && typeof dataSection.mappedColumns === 'object') {
    columns = Object.entries(dataSection.mappedColumns).map(([source, target]) => ({
      source,
      target: typeof target === 'string'
        ? target
        : target?.target || target?.mappedTo || target?.field || target?.name || JSON.stringify(target),
    }))
  }

  return {
    columns,
    preview: previewArray,
    totalRows,
    raw: rawResponse,
  }
}

export default function ImportPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFileId, setUploadedFileId] = useState(null)
  const [analysisId, setAnalysisId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [mappingResult, setMappingResult] = useState(null)
  const [syncResult, setSyncResult] = useState(null)

  const { data: stats } = useImportStats()
  const { data: history } = useImportHistory()
  const { data: profileSummary } = useProfileSummary()

  const uploadMutation = useUploadImport()
  const downloadTemplate = useDownloadTemplate()
  const mapColumnsMutation = useMapColumns()
  const runAnalysisMutation = useRunAnalysis()
  const syncMutation = useSyncData()

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier avant de continuer')
      return
    }

    try {
      const result = await uploadMutation.mutateAsync(selectedFile)
      const newFileId = resolveUploadedFileId(result)

      if (!newFileId) {
        console.error('Réponse inattendue lors de l\'upload du fichier :', result)
        toast.error("Impossible de récupérer l'identifiant du fichier importé")
        return
      }

      setUploadedFileId(newFileId)
      setCurrentStep(2)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleDownloadTemplate = () => {
    downloadTemplate.mutate()
  }

  const handleMapColumns = async () => {
    if (!uploadedFileId) {
      toast.error('Aucun fichier importé à mapper')
      return
    }

    // Si un mapping est déjà prêt, passer à l'étape suivante
    if (mappingResult && (mappingResult.preview?.length || mappingResult.columns?.length)) {
      setCurrentStep(3)
      return
    }

    try {
      const result = await mapColumnsMutation.mutateAsync({
        fileId: uploadedFileId,
        mapping: 'auto',
      })
      const normalized = normalizeMappingResponse(result)
      setMappingResult(normalized)
    } catch (error) {
      console.error('Mapping failed:', error)
    }
  }

  const handleRunAnalysis = async () => {
    if (!uploadedFileId) return

    try {
      const result = await runAnalysisMutation.mutateAsync(uploadedFileId)
      const resolved = resolveAnalysisId(result)

      if (!resolved) {
        console.error('Réponse inattendue lors de l\'analyse IA :', result)
        toast.error("Impossible de récupérer l'identifiant de l'analyse IA")
        return
      }

      setAnalysisId(resolved)
      setCurrentStep(4)
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  const handleSync = async () => {
    if (!analysisId) return

    try {
      const result = await syncMutation.mutateAsync(analysisId)
      setSyncResult(result)
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader stats={stats} />
        
        <div className="mt-8 space-y-6">
          <ImportSteps currentStep={currentStep} />
          
          {currentStep === 1 && (
            <FileUploadSection
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileDrop={handleFileDrop}
              onUpload={handleUpload}
              onDownloadTemplate={handleDownloadTemplate}
              isUploading={uploadMutation.isPending}
            />
          )}

          {currentStep === 2 && (
            <ColumnMappingSection
              onNext={handleMapColumns}
              result={mappingResult}
              isMapping={mapColumnsMutation.isPending}
            />
          )}

          {currentStep === 3 && (
            <AnalysisSection
              onRunAnalysis={handleRunAnalysis}
              isAnalyzing={runAnalysisMutation.isPending}
            />
          )}

          {currentStep === 4 && analysisId && (
            <>
              <AIResultsSection analysisId={analysisId} />
              <IntegrationSection
                profileSummary={profileSummary}
                syncResult={syncResult}
                onSync={handleSync}
                isSyncing={syncMutation.isPending}
              />
            </>
          )}

          <ImportHistorySection history={history} />
          <PremiumFeaturesSection onContactAI={() => navigate('/assistant')} />
        </div>
      </div>
    </div>
  )
}

// ===================
// HEADER
// ===================
function PageHeader({ stats }) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Upload className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Import automatisé des données</h1>
          <Badge className="bg-[#FFC107] text-white hover:bg-[#FFA000]">
            PREMIUM
          </Badge>
        </div>
        <p className="text-slate-600">
          Importez vos données de production et déchets depuis Excel pour une analyse IA prédictive
        </p>
      </div>
      
      {stats && (
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalImports || 127}</p>
            <p className="text-sm text-slate-600">Imports ce mois</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.precisionRate || 94}%</p>
            <p className="text-sm text-slate-600">Précision IA</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ===================
// STEPS
// ===================
function ImportSteps({ currentStep }) {
  const steps = IMPORT_STEPS.map((step) => {
    const isCompleted = step.id < currentStep
    const isCurrent = step.id === currentStep
    const status = isCompleted ? 'TERMINÉ' : isCurrent ? 'EN COURS' : 'À VENIR'

    return {
      ...step,
      isCompleted,
      isCurrent,
      status,
    }
  })

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Processus d'import en 4 étapes</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                    step.isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : step.isCurrent
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {step.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">{step.label}</p>
                <p className={`text-xs ${
                  step.status === 'EN COURS'
                    ? 'text-blue-600'
                    : step.status === 'TERMINÉ'
                    ? 'text-green-600'
                    : 'text-slate-400'
                }`}>
                  {step.status}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 ${step.isCompleted ? 'bg-green-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ===================
// FILE UPLOAD
// ===================
function FileUploadSection({ selectedFile, onFileSelect, onFileDrop, onUpload, onDownloadTemplate, isUploading }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div
            className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400"
            onDrop={onFileDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileSpreadsheet className="mb-4 h-16 w-16 text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Glissez-déposez votre fichier Excel
            </h3>
            <p className="mb-4 text-sm text-slate-600">ou cliquez pour parcourir</p>
            
            <input
              type="file"
              accept=".xlsx,.csv,.ods"
              onChange={onFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button type="button" variant="outline" className="cursor-pointer" asChild>
                <span>Parcourir</span>
              </Button>
            </label>

            {selectedFile && (
              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                <p className="text-xs text-blue-700">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="text-xs">
                .xlsx
              </Badge>
              <Badge variant="outline" className="text-xs">
                .csv
              </Badge>
              <Badge variant="outline" className="text-xs">
                .ods
              </Badge>
            </div>

            <p className="mt-3 text-xs text-slate-500">Taille max : 10 MB</p>
          </div>

          {selectedFile && (
            <Button
              onClick={onUpload}
              disabled={isUploading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'Upload en cours...' : 'Importer le fichier'}
            </Button>
          )}
        </CardContent>
      </Card>

      <ExcelTemplateCard onDownload={onDownloadTemplate} />
    </div>
  )
}

function ExcelTemplateCard({ onDownload }) {
  const columns = [
    { type: 'Déchet', name: 'Chutes métal', quantity: '500', unit: 'kg', frequency: 'Mensuel', state: 'Propre' },
    { type: 'Production', name: 'Pièces usinées', quantity: '200', unit: 'unités', frequency: 'Mensuel', state: 'Fini' },
    { type: 'Besoin', name: 'Aluminium', quantity: '2000', unit: 'kg', frequency: 'Mensuel', state: 'Brut' },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Modèle Excel recommandé</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-slate-600">Structure optimisée pour l'analyse IA prédictive</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-blue-50">
                <th className="p-2 text-left font-semibold text-blue-900">Type</th>
                <th className="p-2 text-left font-semibold text-blue-900">Nom</th>
                <th className="p-2 text-left font-semibold text-blue-900">Quantité</th>
                <th className="p-2 text-left font-semibold text-blue-900">Unité</th>
                <th className="p-2 text-left font-semibold text-blue-900">Fréquence</th>
                <th className="p-2 text-left font-semibold text-blue-900">État</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((row, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">
                    <Badge className={
                      row.type === 'Déchet' ? 'bg-red-100 text-red-700' :
                      row.type === 'Production' ? 'bg-green-100 text-green-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {row.type}
                    </Badge>
                  </td>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2">{row.quantity}</td>
                  <td className="p-2">{row.unit}</td>
                  <td className="p-2">{row.frequency}</td>
                  <td className="p-2">{row.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          onClick={onDownload}
          variant="outline"
          className="mt-4 w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Télécharger modèle
        </Button>
      </CardContent>
    </Card>
  )
}

// ===================
// COLUMN MAPPING
// ===================
function ColumnMappingSection({ result, onNext, isMapping }) {
  const columns = result?.columns || []
  const previewRows = result?.preview || []
  const totalRows = result?.totalRows || previewRows.length || 0
  const hasResult = !!result
  const canProceed = columns.length > 0 || previewRows.length > 0
  const buttonLabel = isMapping
    ? 'Analyse du mapping...'
    : canProceed
    ? 'Continuer vers l\'analyse IA'
    : 'Lancer le mapping automatique'

  const previewColumns = (() => {
    if (columns.length > 0) {
      return columns.map((col, idx) => {
        if (typeof col === 'string') {
          return { header: col, key: col }
        }

        return {
          header: col?.target || col?.mappedTo || col?.field || col?.name || col?.source || `Colonne ${idx + 1}`,
          key: col?.source || col?.original || col?.column || col?.name || col?.field || `col_${idx}`,
        }
      })
    }
    if (previewRows.length > 0) {
      return Object.keys(previewRows[0]).map((key) => ({ header: key, key }))
    }
    return []
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapping des colonnes détecté</CardTitle>
        <p className="text-sm text-slate-600">Vérifiez la correspondance automatique des colonnes</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasResult ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-900">
                {columns.length > 0
                  ? `${columns.length} colonne${columns.length > 1 ? 's' : ''} détectée${columns.length > 1 ? 's' : ''}`
                  : 'Résultat de mapping reçu'}
              </p>
              <p className="text-xs text-green-800">
                {totalRows > 0
                  ? `${totalRows} ligne${totalRows > 1 ? 's' : ''} reconnue${totalRows > 1 ? 's' : ''}`
                  : 'Aucune ligne valide détectée pour le moment'}
              </p>
            </div>

            {columns.length > 0 && (
              <div className="rounded border border-slate-200">
                <div className="border-b bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-600">
                  Correspondance des colonnes
                </div>
                <ul className="divide-y divide-slate-200">
                  {columns.slice(0, 6).map((col, idx) => {
                    const source = col?.source || col?.original || col?.column || col?.name || `Colonne ${idx + 1}`
                    const target = col?.target || col?.mappedTo || col?.field || col?.destination || '—'
                    return (
                      <li key={idx} className="flex items-center justify-between px-4 py-2 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">{source}</span>
                        <ArrowRight className="mx-2 h-4 w-4 text-slate-400" />
                        <span className="text-blue-600">{target}</span>
                      </li>
                    )
                  })}
                </ul>
                {columns.length > 6 && (
                  <div className="px-4 py-2 text-xs text-slate-500">
                    + {columns.length - 6} colonne{columns.length - 6 > 1 ? 's' : ''} supplémentaire{columns.length - 6 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="rounded border border-slate-200">
                <div className="border-b bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-600">
                  Extrait des données importées
                </div>
                <div className="max-h-56 overflow-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        {previewColumns.map((column, idx) => (
                          <th key={idx} scope="col" className="px-4 py-2 text-left font-semibold uppercase tracking-wide">
                            {column.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {previewRows.slice(0, 5).map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50">
                          {previewColumns.map((column, colIdx) => {
                            const directValue = row?.[column.key]
                            const fallbackKey = typeof column.header === 'string' ? column.header.toLowerCase() : undefined
                            const fallbackValue = fallbackKey && row?.[fallbackKey]
                            const mappedValue = columns[colIdx]?.source ? row?.[columns[colIdx]?.source] : undefined
                            const sequentialValue = Object.values(row)[colIdx]
                            const value = directValue ?? fallbackValue ?? mappedValue ?? sequentialValue
                            return (
                              <td key={colIdx} className="px-4 py-2 text-slate-700">
                                {value === null || value === undefined || value === '' ? '—' : String(value)}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
                  {Math.min(5, previewRows.length)} ligne{Math.min(5, previewRows.length) > 1 ? 's' : ''} affichée{previewRows.length > 5 ? 's' : ''} sur {previewRows.length}
                </div>
              </div>
            )}

            {previewRows.length === 0 && (
              <div className="rounded border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
                L&apos;API n&apos;a pas retourné d&apos;aperçu de lignes. Vérifiez que la route <code>/import/{'{fileId}'}/map</code> renvoie un tableau (ex: <code>preview.rows</code>) pour afficher un extrait ici.
              </div>
            )}

          </div>
        ) : (
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              Cliquez sur &quot;Valider et continuer&quot; pour lancer le mapping automatique de votre fichier.
            </p>
            <p className="text-xs text-blue-800">Un aperçu des colonnes détectées s&apos;affichera ici.</p>
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={isMapping}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {buttonLabel}
        </Button>

        {!canProceed && hasResult && !isMapping && (
          <p className="text-xs text-center text-amber-700">
            Vérifiez la configuration des colonnes, puis relancez le mapping si besoin.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ===================
// ANALYSIS
// ===================
function AnalysisSection({ onRunAnalysis, isAnalyzing }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Analyse IA Prédictive
        </CardTitle>
        <p className="text-sm text-slate-600">
          Lancement de l'analyse prédictive sur vos données
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="font-medium text-slate-900">Analyse en cours...</p>
              <p className="text-sm text-slate-600">Cela peut prendre quelques secondes</p>
            </div>
          </div>
        ) : (
          <Button
            onClick={onRunAnalysis}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Lancer l'analyse IA
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ===================
// AI RESULTS
// ===================
function AIResultsSection({ analysisId }) {
  const { data: predictions, isLoading: loadingPredictions } = useVolumePredictions(analysisId)
  const { data: partnerships, isLoading: loadingPartnerships } = useSuggestedPartnerships(analysisId)
  const { data: optimizations, isLoading: loadingOptimizations } = useOptimizations(analysisId)
  const { data: impact, isLoading: loadingImpact } = useFinancialImpact(analysisId)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Aperçu de l'analyse IA prédictive</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <PredictionsCard data={predictions} isLoading={loadingPredictions} />
        <PartnershipsCard data={partnerships} isLoading={loadingPartnerships} />
        <OptimizationsCard data={optimizations} isLoading={loadingOptimizations} />
        <FinancialImpactCard data={impact} isLoading={loadingImpact} />
      </div>
    </div>
  )
}

function PredictionsCard({ data, isLoading }) {
  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Prédictions de volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 animate-pulse rounded bg-slate-200 w-3/4" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">Évolution prévue sur 12 mois</p>
            {data.map((pred, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{pred.label}</span>
                <span className="font-semibold text-slate-900">{pred.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucune prédiction disponible</p>
        )}
      </CardContent>
    </Card>
  )
}

function PartnershipsCard({ data, isLoading }) {
  return (
    <Card className="border-l-4 border-l-green-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-green-600" />
          Partenaires suggérés
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 animate-pulse rounded bg-slate-200 w-3/4" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">Compatibilité optimisée</p>
            {data.slice(0, 3).map((partner, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{partner.name}</span>
                <Badge className="bg-green-100 text-green-700">{partner.score}%</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucun partenaire suggéré</p>
        )}
      </CardContent>
    </Card>
  )
}

function OptimizationsCard({ data, isLoading }) {
  return (
    <Card className="border-l-4 border-l-amber-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-amber-600" />
          Optimisations proposées
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 animate-pulse rounded bg-slate-200 w-3/4" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">Améliorer du ROI</p>
            {data.slice(0, 3).map((opt, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <span className="text-sm text-slate-600">{opt.description}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucune optimisation disponible</p>
        )}
      </CardContent>
    </Card>
  )
}

function FinancialImpactCard({ data, isLoading }) {
  return (
    <Card className="border-l-4 border-l-purple-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-5 w-5 text-purple-600" />
          Impact financier
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 animate-pulse rounded bg-slate-200 w-3/4" />
          </div>
        ) : data ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">Potentiel de revenus annuel</p>
            <p className="text-2xl font-bold text-purple-900">
              {data.minRevenue || 0}€ - {data.maxRevenue || 0}€
            </p>
            <p className="text-xs text-slate-500">Basé sur vos données historiques</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucun impact financier calculé</p>
        )}
      </CardContent>
    </Card>
  )
}

// ===================
// INTEGRATION
// ===================
function IntegrationSection({ profileSummary, syncResult, onSync, isSyncing }) {
  const synced = syncResult?.syncedItems || syncResult || {}
  const syncedProductions = extractNumberValue(synced, ['productions', 'productionsCount', 'productionCount'])
  const syncedWastes = extractNumberValue(synced, ['wastes', 'wastesCount', 'wasteCount'])
  const syncedNeeds = extractNumberValue(synced, ['needs', 'needsCount', 'needCount'])
  const hasSyncDetails = syncedProductions + syncedWastes + syncedNeeds > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Données actuelles du profil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <StatBox
            icon={<FileSpreadsheet className="h-5 w-5 text-blue-600" />}
            label="Productions"
            value={profileSummary?.productions || 0}
            subtext="items renseignés"
          />
          <StatBox
            icon={<FileSpreadsheet className="h-5 w-5 text-red-600" />}
            label="Déchets"
            value={profileSummary?.wastes || 0}
            subtext="types répertoriés"
          />
          <StatBox
            icon={<FileSpreadsheet className="h-5 w-5 text-amber-600" />}
            label="Besoins"
            value={profileSummary?.needs || 0}
            subtext="besoin actif"
          />
          <StatBox
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            label="Analyses"
            value={profileSummary?.analyses || 0}
            subtext="analyses effectuées"
          />
        </div>

        {syncResult && (
          <div className={`rounded-md border p-4 ${hasSyncDetails ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className="text-sm font-medium text-slate-900">
              {hasSyncDetails
                ? 'Résultat de la dernière synchronisation'
                : 'La synchronisation a réussi mais aucun nouvel élément n\'a été détecté'}
            </p>
            {hasSyncDetails && (
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>Productions ajoutées : {syncedProductions}</li>
                <li>Déchets ajoutés : {syncedWastes}</li>
                <li>Besoins ajoutés : {syncedNeeds}</li>
              </ul>
            )}
            {!hasSyncDetails && (
              <p className="mt-2 text-xs text-slate-600">
                Vérifiez que votre fichier contient bien des colonnes mappées (ex: type, quantité) et que les lignes ne sont pas filtrées.
              </p>
            )}
          </div>
        )}

        <Button
          onClick={onSync}
          disabled={isSyncing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
        </Button>
      </CardContent>
    </Card>
  )
}

function StatBox({ icon, label, value, subtext }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  )
}

// ===================
// HISTORY
// ===================
function ImportHistorySection({ history }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des analyses IA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!history || history.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune analyse disponible</p>
          ) : (
            history.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.name || 'Import sans nom'}</p>
                    <p className="text-sm text-slate-600">
                      {item.description || new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={item.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {item.status === 'SUCCESS' ? 'SUCCÈS' : item.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ===================
// PREMIUM FEATURES
// ===================
function PremiumFeaturesSection({ onContactAI }) {
  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Planification intelligente',
      description: "L'IA analyse vos cycles de production pour prédire les volumes futurs et optimiser la collecte des déchets.",
      items: [
        'Réduction des coûts de stockage',
        'Optimisation logistique',
      ],
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Matching avancé',
      description: "Algorithme propriétaire qui analyse la compatibilité chimique, géographique et temporelle pour des partenariats optimaux.",
      items: [
        'Score de compatibilité précis',
        'Priorité sur les suggestions',
      ],
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Analyse prédictive ROI',
      description: "Calculs financiers automatisés incluant coûts de transport, traitement et revenus potentiels sur 12-36 mois.",
      items: [
        'Projection financière détaillée',
        'Analyse de risques',
      ],
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <CardTitle>Fonctionnalités avancées Premium</CardTitle>
        </div>
        <p className="text-sm text-slate-600">
          Maximisez votre potentiel avec l'intelligence artificielle
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={idx} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{feature.title}</h3>
              <p className="mb-3 text-sm text-slate-600">{feature.description}</p>
              <ul className="space-y-1">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-blue-600 p-6 text-center text-white">
          <p className="mb-2 text-sm font-medium">Besoin d'aide avec l'import ?</p>
          <p className="mb-4 text-xs">
            Discutez d'abord avec notre assistant IA dédié ; l'équipe support intervient seulement si nécessaire.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => onContactAI?.()}
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-blue-600"
            >
              <Clock className="mr-2 h-4 w-4" />
              Contacter l'assistant IA
            </Button>
            <Button variant="outline" className="border-white bg-white text-blue-600 hover:bg-slate-50">
              Support humain (dernier recours)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
