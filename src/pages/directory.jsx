import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Heart, List, Loader2, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import InteractiveMap from '@/components/Map'
import api from '@/services/Api'
import { useLocation, useNavigate } from 'react-router-dom'

const DEFAULT_MAX_DISTANCE = 15
const DEFAULT_PAGE_SIZE = 12

const TAG_STYLES = {
  Plastiques: 'bg-emerald-100 text-emerald-700',
  Recyclage: 'bg-amber-100 text-amber-700',
  Organique: 'bg-lime-100 text-lime-700',
  Compostage: 'bg-violet-100 text-violet-700',
  'Économie circulaire': 'bg-sky-100 text-sky-700',
}

function Tag({ label }) {
  const classes = TAG_STYLES[label] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  )
}

function DirectoryCard({ company, onOpenProfile }) {
  const distanceValue = typeof company.distance === 'number'
    ? company.distance.toFixed(1)
    : company.distance
  const sectorLabel = company.sector ?? 'Secteur non renseigné'
  const tags = Array.isArray(company.tags) ? company.tags : []

  return (
    <Card
      className="border border-slate-200 shadow-sm transition hover:border-blue-200 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="button"
      tabIndex={0}
      onClick={() => onOpenProfile?.(company)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenProfile?.(company)
        }
      }}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
            <p className="text-sm text-slate-600">{company.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              {distanceValue} km
            </span>
            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={(event) => {
                event.stopPropagation()
                // TODO: branch to contact flow when API ready
              }}
            >
              Contacter
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>

        <div className="text-sm text-slate-600 space-y-1">
          {company.offer && <p>{company.offer}</p>}
          {company.demand && <p>{company.demand}</p>}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>{sectorLabel}</span>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
            aria-label="Ajouter aux favoris"
            onClick={(event) => event.stopPropagation()}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DirectoryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [pendingSearchTerm, setPendingSearchTerm] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [pendingSectors, setPendingSectors] = useState(new Set())
  const [appliedSectors, setAppliedSectors] = useState(new Set())
  const [pendingWasteTypes, setPendingWasteTypes] = useState(new Set())
  const [appliedWasteTypes, setAppliedWasteTypes] = useState(new Set())
  const [pendingMaxDistance, setPendingMaxDistance] = useState(DEFAULT_MAX_DISTANCE)
  const [appliedMaxDistance, setAppliedMaxDistance] = useState(DEFAULT_MAX_DISTANCE)
  const getViewFromSearch = useCallback(() => {
    const params = new URLSearchParams(location.search)
    const view = params.get('view')
    return view === 'map' ? 'map' : 'list'
  }, [location.search])

  const [viewMode, setViewMode] = useState(() => getViewFromSearch())
  const [page, setPage] = useState(1)
  const [sectorsDirty, setSectorsDirty] = useState(false)
  const [wastesDirty, setWastesDirty] = useState(false)
  const defaultSectorValuesRef = useRef(new Set())
  const defaultWasteValuesRef = useRef(new Set())
  const sectorsTouchedRef = useRef(false)
  const wastesTouchedRef = useRef(false)

  const toggleSelection = (value, setState, touchedRef) => {
    if (touchedRef?.current === false) {
      touchedRef.current = true
    }
    setState((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }

  const directoryQueryParams = useMemo(() => {
    const sectorsArray = Array.from(appliedSectors)
    const wasteArray = Array.from(appliedWasteTypes)

    const sectorsParam =
      sectorsDirty && sectorsArray.length ? [...sectorsArray].sort().join(',') : undefined
    const wastesParam =
      wastesDirty && wasteArray.length ? [...wasteArray].sort().join(',') : undefined

    return {
      search: appliedSearchTerm.trim(),
      sectors: sectorsParam,
      wasteTypes: wastesParam,
      maxDistance: appliedMaxDistance,
      page,
      limit: DEFAULT_PAGE_SIZE,
    }
  }, [appliedSearchTerm, appliedSectors, appliedWasteTypes, appliedMaxDistance, page, sectorsDirty, wastesDirty])

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['directory', directoryQueryParams],
    queryFn: fetchDirectory,
    keepPreviousData: true,
    staleTime: 60_000,
  })

  const directoryData = useMemo(() => {
    if (!data) return {}
    if (data.success && data.data) return data.data
    return data
  }, [data])

  const facets = useMemo(() => directoryData?.facets ?? {}, [directoryData])
  const facetSectors = useMemo(() => facets?.sectors ?? [], [facets])
  const facetWasteTypes = useMemo(() => facets?.wasteTypes ?? [], [facets])

  const sectorOptions = useMemo(() => normalizeFacetEntries(facetSectors), [facetSectors])

  const wasteOptions = useMemo(() => normalizeFacetEntries(facetWasteTypes), [facetWasteTypes])

  useEffect(() => {
    const optionValues = sectorOptions.map((option) => option.value)
    const defaultSet = new Set(optionValues)

    if (!sectorsTouchedRef.current) {
      defaultSectorValuesRef.current = defaultSet
    }

    if (!optionValues.length) {
      sectorsTouchedRef.current = false
      defaultSectorValuesRef.current = defaultSet
      if (pendingSectors.size) {
        setPendingSectors(new Set())
      }
      if (appliedSectors.size) {
        setAppliedSectors(new Set())
        setPage(1)
      }
      if (sectorsDirty) {
        setSectorsDirty(false)
      }
      return
    }

    const sanitizeSelection = (selection) =>
      new Set([...selection].filter((value) => defaultSet.has(value)))

    let nextPending = pendingSectors
    let nextApplied = appliedSectors
    let pendingChanged = false
    let appliedChanged = false

    if (!sectorsTouchedRef.current) {
      if (!areSetsEqual(pendingSectors, defaultSet)) {
        nextPending = defaultSet
        pendingChanged = true
      }
      if (!areSetsEqual(appliedSectors, defaultSet)) {
        nextApplied = defaultSet
        appliedChanged = true
      }
    } else {
      const sanitizedPending = sanitizeSelection(pendingSectors)
      if (!areSetsEqual(pendingSectors, sanitizedPending)) {
        nextPending = sanitizedPending
        pendingChanged = true
      }
    }

    const sanitizedApplied = sanitizeSelection(nextApplied)
    if (!areSetsEqual(nextApplied, sanitizedApplied)) {
      nextApplied = sanitizedApplied
      appliedChanged = true
    }

    const baseline = defaultSectorValuesRef.current ?? defaultSet
    const dirty = !areSetsEqual(nextApplied, baseline)

    if (pendingChanged) {
      setPendingSectors(nextPending)
    }
    if (appliedChanged) {
      setAppliedSectors(nextApplied)
      setPage(1)
    }
    if (sectorsDirty !== dirty) {
      setSectorsDirty(dirty)
    }
  }, [sectorOptions, pendingSectors, appliedSectors, sectorsDirty])

  useEffect(() => {
    const optionValues = wasteOptions.map((option) => option.value)
    const defaultSet = new Set(optionValues)

    if (!wastesTouchedRef.current) {
      defaultWasteValuesRef.current = defaultSet
    }

    if (!optionValues.length) {
      wastesTouchedRef.current = false
      defaultWasteValuesRef.current = defaultSet
      if (pendingWasteTypes.size) {
        setPendingWasteTypes(new Set())
      }
      if (appliedWasteTypes.size) {
        setAppliedWasteTypes(new Set())
        setPage(1)
      }
      if (wastesDirty) {
        setWastesDirty(false)
      }
      return
    }

    const sanitizeSelection = (selection) =>
      new Set([...selection].filter((value) => defaultSet.has(value)))

    let nextPending = pendingWasteTypes
    let nextApplied = appliedWasteTypes
    let pendingChanged = false
    let appliedChanged = false

    if (!wastesTouchedRef.current) {
      if (!areSetsEqual(pendingWasteTypes, defaultSet)) {
        nextPending = defaultSet
        pendingChanged = true
      }
      if (!areSetsEqual(appliedWasteTypes, defaultSet)) {
        nextApplied = defaultSet
        appliedChanged = true
      }
    } else {
      const sanitizedPending = sanitizeSelection(pendingWasteTypes)
      if (!areSetsEqual(pendingWasteTypes, sanitizedPending)) {
        nextPending = sanitizedPending
        pendingChanged = true
      }
    }

    const sanitizedApplied = sanitizeSelection(nextApplied)
    if (!areSetsEqual(nextApplied, sanitizedApplied)) {
      nextApplied = sanitizedApplied
      appliedChanged = true
    }

    const baseline = defaultWasteValuesRef.current ?? defaultSet
    const dirty = !areSetsEqual(nextApplied, baseline)

    if (pendingChanged) {
      setPendingWasteTypes(nextPending)
    }
    if (appliedChanged) {
      setAppliedWasteTypes(nextApplied)
      setPage(1)
    }
    if (wastesDirty !== dirty) {
      setWastesDirty(dirty)
    }
  }, [wasteOptions, pendingWasteTypes, appliedWasteTypes, wastesDirty])

  useEffect(() => {
    const currentView = getViewFromSearch()
    if (currentView !== viewMode) {
      setViewMode(currentView)
    }
  }, [getViewFromSearch, viewMode])

  const handleChangeView = useCallback((nextView) => {
    setViewMode(nextView)
    const params = new URLSearchParams(location.search)
    if (nextView === 'map') {
      params.set('view', 'map')
    } else {
      params.delete('view')
    }
    const search = params.toString()
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true })
  }, [location.pathname, location.search, navigate])

  const companies = useMemo(() => {
    const list = directoryData?.items ?? directoryData?.companies ?? []
    return Array.isArray(list) ? list : []
  }, [directoryData])

  const totalCompanies = directoryData?.total ?? companies.length

  const sectorCounts = useMemo(() => {
    const counts = Object.create(null)
    sectorOptions.forEach((option) => {
      counts[option.value] = option.count ?? 0
    })
    return counts
  }, [sectorOptions])

  const wasteCounts = useMemo(() => {
    const counts = Object.create(null)
    wasteOptions.forEach((option) => {
      counts[option.value] = option.count ?? 0
    })
    return counts
  }, [wasteOptions])

  const distanceLabel = `${pendingMaxDistance} km`

  const handleApply = () => {
    const nextAppliedSectors = new Set(pendingSectors)
    const nextAppliedWastes = new Set(pendingWasteTypes)
    const hasSearchChanged = pendingSearchTerm !== appliedSearchTerm
    const hasDistanceChanged = pendingMaxDistance !== appliedMaxDistance
    const hasSectorsChanged = !areSetsEqual(appliedSectors, nextAppliedSectors)
    const hasWastesChanged = !areSetsEqual(appliedWasteTypes, nextAppliedWastes)

    if (hasSearchChanged) {
      setAppliedSearchTerm(pendingSearchTerm)
    }
    if (hasDistanceChanged) {
      setAppliedMaxDistance(pendingMaxDistance)
    }
    if (hasSectorsChanged) {
      setAppliedSectors(nextAppliedSectors)
    }
    if (hasWastesChanged) {
      setAppliedWasteTypes(nextAppliedWastes)
    }

    if (hasSearchChanged || hasDistanceChanged || hasSectorsChanged || hasWastesChanged) {
      setPage(1)
      return
    }

    refetch()
  }

  const handleReset = () => {
    const defaultSectorsArray = Array.from(defaultSectorValuesRef.current ?? [])
    const defaultWastesArray = Array.from(defaultWasteValuesRef.current ?? [])

    setPendingSearchTerm('')
    setAppliedSearchTerm('')
    setPendingSectors(new Set(defaultSectorsArray))
    setAppliedSectors(new Set(defaultSectorsArray))
    setPendingWasteTypes(new Set(defaultWastesArray))
    setAppliedWasteTypes(new Set(defaultWastesArray))
    setPendingMaxDistance(DEFAULT_MAX_DISTANCE)
    setAppliedMaxDistance(DEFAULT_MAX_DISTANCE)
    setPage(1)
    setSectorsDirty(false)
    setWastesDirty(false)
    sectorsTouchedRef.current = false
    wastesTouchedRef.current = false
  }

  const markers = useMemo(
    () =>
      companies
        .map((company) => {
          const coordinates = normalizeCoordinates(company.coordinates)
          if (!coordinates) return null
          const distanceValue =
            typeof company.distance === 'number'
              ? company.distance.toFixed(1)
              : company.distance
          return {
            position: coordinates,
            popup: distanceValue ? `${company.name} — ${distanceValue} km` : company.name,
          }
        })
        .filter(Boolean),
    [companies]
  )

  const isEmptyState = !isLoading && !isFetching && companies.length === 0

  const filterDisabled = isLoading && !sectorOptions.length && !wasteOptions.length

  const handleOpenProfile = useCallback((company) => {
    const targetId =
      company?.id_company ??
      company?.company_id ??
      company?.uuid ??
      company?.slug ??
      company?.id
    if (!targetId) return
    navigate(
  { pathname: `/companies/${targetId}` },
      { state: { directoryCompany: company } }
    )
  }, [navigate])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
        <aside>
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Rechercher</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={pendingSearchTerm}
                    onChange={(event) => setPendingSearchTerm(event.target.value)}
                    placeholder="Nom d'entreprise, produit..."
                    className="pl-9"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wide">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filtres</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Secteur d'activité</p>
                    <ul className="mt-2 space-y-2">
                      {sectorOptions.map((sector) => (
                        <li key={sector.value} className="flex items-center justify-between gap-2 text-sm text-slate-600">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              checked={pendingSectors.has(sector.value)}
                              onChange={() =>
                                toggleSelection(
                                  sector.value,
                                  setPendingSectors,
                                  sectorsTouchedRef
                                )
                              }
                              disabled={filterDisabled}
                            />
                            <span>{sector.label}</span>
                          </label>
                          <span className="text-xs text-slate-400">{sectorCounts[sector.value] ?? 0}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type de déchet</p>
                    <ul className="mt-2 space-y-2">
                      {wasteOptions.map((waste) => (
                        <li key={waste.value} className="flex items-center justify-between gap-2 text-sm text-slate-600">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              checked={pendingWasteTypes.has(waste.value)}
                              onChange={() =>
                                toggleSelection(
                                  waste.value,
                                  setPendingWasteTypes,
                                  wastesTouchedRef
                                )
                              }
                              disabled={filterDisabled}
                            />
                            <span>{waste.label}</span>
                          </label>
                          <span className="text-xs text-slate-400">{wasteCounts[waste.value] ?? 0}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Distance maximale</p>
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={pendingMaxDistance}
                      onChange={(event) => setPendingMaxDistance(Number(event.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0 km</span>
                      <span>{distanceLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" className="border-slate-200 text-slate-500" onClick={handleReset}>
                  Effacer
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleApply}
                  disabled={isFetching}
                >
                  Appliquer
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Annuaire des entreprises
              </p>
              <h1 className="text-2xl font-bold text-slate-900">{totalCompanies} entreprises trouvées</h1>
              <p className="text-sm text-slate-500">
                Explorez le réseau industriel des Paluds et trouvez des partenaires près de chez vous.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={`h-10 w-10 p-0 ${viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => handleChangeView('list')}
                aria-label="Vue liste"
              >
                <List className={`h-5 w-5 ${viewMode === 'list' ? 'text-white' : 'text-slate-500'}`} />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'map' ? 'default' : 'outline'}
                className={`h-10 w-10 p-0 ${viewMode === 'map' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => handleChangeView('map')}
                aria-label="Vue carte"
              >
                <MapIcon className={`h-5 w-5 ${viewMode === 'map' ? 'text-white' : 'text-slate-500'}`} />
              </Button>
            </div>
          </div>

          {isError ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-10 text-center space-y-3">
                <p className="text-lg font-semibold text-slate-900">Erreur lors du chargement</p>
                <p className="text-sm text-slate-500">
                  {error?.message ?? "Impossible de récupérer l'annuaire pour le moment."}
                </p>
                <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'map' ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <InteractiveMap
                  className="h-[420px] w-full rounded-xl"
                  center={[43.294, 5.58]}
                  zoom={12}
                  markers={markers}
                />
              </CardContent>
            </Card>
          ) : isEmptyState ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-10 text-center space-y-3">
                <p className="text-lg font-semibold text-slate-900">Aucune entreprise trouvée</p>
                <p className="text-sm text-slate-500">
                  Ajustez vos filtres ou élargissez le rayon de recherche pour découvrir de nouveaux partenaires.
                </p>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <DirectoryCard
                  key={company.id ?? company.name}
                  company={company}
                  onOpenProfile={handleOpenProfile}
                />
              ))}
              {isFetching && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise à jour des résultats…
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

async function fetchDirectory({ queryKey }) {
  const [, params] = queryKey
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.sectors) {
    searchParams.set('sectors', params.sectors)
  }

  if (params.wasteTypes) {
    searchParams.set('wasteTypes', params.wasteTypes)
  }

  if (params.maxDistance) {
    searchParams.set('maxDistance', String(params.maxDistance))
  }

  if (params.page) {
    searchParams.set('page', String(params.page))
  }

  if (params.limit) {
    searchParams.set('limit', String(params.limit))
  }

  const url = searchParams.toString() ? `/companies?${searchParams.toString()}` : '/companies'
  const response = await api.get(url)
  const payload = response.data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload
  }
  return payload
}

function normalizeCoordinates(coordinates) {
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    const [lat, lng] = coordinates.map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat, lng]
    }
    return null
  }

  if (coordinates && typeof coordinates === 'object') {
    const lat = Number(coordinates.lat ?? coordinates.latitude)
    const lng = Number(coordinates.lng ?? coordinates.lon ?? coordinates.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat, lng]
    }
  }

  return null
}

function areSetsEqual(setA, setB) {
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

function normalizeFacetEntries(rawFacets) {
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

  if (Array.isArray(rawFacets)) {
    rawFacets.forEach((facet, index) => pushEntry(String(index), facet))
  } else if (typeof rawFacets === 'object') {
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
