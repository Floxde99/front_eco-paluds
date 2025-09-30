import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Heart, List, Loader2, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import InteractiveMap from '@/components/Map'
import api from '@/services/Api'

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

function DirectoryCard({ company }) {
  const distanceValue = typeof company.distance === 'number'
    ? company.distance.toFixed(1)
    : company.distance
  const sectorLabel = company.sector ?? 'Secteur non renseigné'
  const tags = Array.isArray(company.tags) ? company.tags : []

  return (
    <Card className="border border-slate-200 shadow-sm">
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
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Contacter</Button>
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
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSectors, setSelectedSectors] = useState(new Set())
  const [selectedWasteTypes, setSelectedWasteTypes] = useState(new Set())
  const [maxDistance, setMaxDistance] = useState(DEFAULT_MAX_DISTANCE)
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [sectorsDirty, setSectorsDirty] = useState(false)
  const [wastesDirty, setWastesDirty] = useState(false)
  const defaultSectorValuesRef = useRef(new Set())
  const defaultWasteValuesRef = useRef(new Set())
  const sectorsTouchedRef = useRef(false)
  const wastesTouchedRef = useRef(false)

  const toggleSelection = (value, setState, touchedRef, defaultValuesRef, setDirty) => {
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
      if (defaultValuesRef?.current instanceof Set && typeof setDirty === 'function') {
        const isDirty = !areSetsEqual(next, defaultValuesRef.current)
        setDirty(isDirty)
      } else if (typeof setDirty === 'function') {
        setDirty(true)
      }
      return next
    })
    setPage(1)
  }

  const directoryQueryParams = useMemo(() => {
    const sectorsArray = Array.from(selectedSectors)
    const wasteArray = Array.from(selectedWasteTypes)

    const sectorsParam =
      sectorsDirty && sectorsArray.length ? [...sectorsArray].sort().join(',') : undefined
    const wastesParam =
      wastesDirty && wasteArray.length ? [...wasteArray].sort().join(',') : undefined

    return {
      search: searchTerm.trim(),
      sectors: sectorsParam,
      wasteTypes: wastesParam,
      maxDistance,
      page,
      limit: DEFAULT_PAGE_SIZE,
    }
  }, [searchTerm, selectedSectors, selectedWasteTypes, maxDistance, page, sectorsDirty, wastesDirty])

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
    defaultSectorValuesRef.current = defaultSet

    if (!optionValues.length) {
      sectorsTouchedRef.current = false
      if (selectedSectors.size) {
        setSelectedSectors(new Set())
      }
      if (sectorsDirty) {
        setSectorsDirty(false)
      }
      return
    }

    const nextSet = sectorsTouchedRef.current
      ? new Set([...selectedSectors].filter((value) => defaultSet.has(value)))
      : defaultSet

    const dirty = sectorsTouchedRef.current && !areSetsEqual(nextSet, defaultSet)

    if (!areSetsEqual(selectedSectors, nextSet)) {
      setSelectedSectors(nextSet)
    }

    if (sectorsDirty !== dirty) {
      setSectorsDirty(dirty)
    }
  }, [sectorOptions, selectedSectors, sectorsDirty])

  useEffect(() => {
    const optionValues = wasteOptions.map((option) => option.value)
    const defaultSet = new Set(optionValues)
    defaultWasteValuesRef.current = defaultSet

    if (!optionValues.length) {
      wastesTouchedRef.current = false
      if (selectedWasteTypes.size) {
        setSelectedWasteTypes(new Set())
      }
      if (wastesDirty) {
        setWastesDirty(false)
      }
      return
    }

    const nextSet = wastesTouchedRef.current
      ? new Set([...selectedWasteTypes].filter((value) => defaultSet.has(value)))
      : defaultSet

    const dirty = wastesTouchedRef.current && !areSetsEqual(nextSet, defaultSet)

    if (!areSetsEqual(selectedWasteTypes, nextSet)) {
      setSelectedWasteTypes(nextSet)
    }

    if (wastesDirty !== dirty) {
      setWastesDirty(dirty)
    }
  }, [wasteOptions, selectedWasteTypes, wastesDirty])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, maxDistance])

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

  const distanceLabel = `${maxDistance} km`

  const handleReset = () => {
    setSearchTerm('')
    setSelectedSectors(new Set(defaultSectorValuesRef.current ?? []))
    setSelectedWasteTypes(new Set(defaultWasteValuesRef.current ?? []))
    setMaxDistance(DEFAULT_MAX_DISTANCE)
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
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
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
                              checked={selectedSectors.has(sector.value)}
                              onChange={() =>
                                toggleSelection(
                                  sector.value,
                                  setSelectedSectors,
                                  sectorsTouchedRef,
                                  defaultSectorValuesRef,
                                  setSectorsDirty
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
                              checked={selectedWasteTypes.has(waste.value)}
                              onChange={() =>
                                toggleSelection(
                                  waste.value,
                                  setSelectedWasteTypes,
                                  wastesTouchedRef,
                                  defaultWasteValuesRef,
                                  setWastesDirty
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
                      value={maxDistance}
                      onChange={(event) => setMaxDistance(Number(event.target.value))}
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
                  onClick={() => refetch()}
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
                onClick={() => setViewMode('list')}
                aria-label="Vue liste"
              >
                <List className={`h-5 w-5 ${viewMode === 'list' ? 'text-white' : 'text-slate-500'}`} />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'map' ? 'default' : 'outline'}
                className={`h-10 w-10 p-0 ${viewMode === 'map' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setViewMode('map')}
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
                <DirectoryCard key={company.id ?? company.name} company={company} />
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

  const url = searchParams.toString() ? `/company/companies?${searchParams.toString()}` : '/company/companies'
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
