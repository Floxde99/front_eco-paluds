import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Heart, List, Loader2, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import InteractiveMap from '@/components/Map'
import api from '@/services/Api'
import { useLocation, useNavigate } from 'react-router-dom'
import { PAGINATION, MAP_CONFIG } from '@/config/constants'

const DEFAULT_MAX_DISTANCE = PAGINATION?.DEFAULT_MAX_DISTANCE ?? 15
const DEFAULT_PAGE_SIZE = PAGINATION?.DEFAULT_PAGE_SIZE ?? 12
const MIN_DISTANCE = PAGINATION?.MIN_DISTANCE ?? 1
const MAX_DISTANCE = PAGINATION?.MAX_DISTANCE ?? 50
const MAP_DEFAULT_CENTER = MAP_CONFIG?.DEFAULT_CENTER ?? [43.294, 5.58]
const MAP_DEFAULT_ZOOM = MAP_CONFIG?.DEFAULT_ZOOM ?? 12
const MAP_DEFAULT_HEIGHT = MAP_CONFIG?.DEFAULT_HEIGHT ?? 440

const normalizeValue = (value) => String(value ?? '').trim()

const TAG_STYLES = {
  Plastiques: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  Recyclage: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  Organique: 'bg-lime-50 text-lime-700 ring-1 ring-lime-100',
  Compostage: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
  'Économie circulaire': 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
}

function Tag({ label }) {
  const classes = TAG_STYLES[label] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${classes}`}>
      {label}
    </span>
  )
}

function DirectoryCard({ company, onOpenProfile }) {
  const distanceValue =
    typeof company.distance === 'number'
      ? `${company.distance.toFixed(1)} km`
      : company.distance || 'Distance à confirmer'
  const sectorLabel = company.sector ?? 'Secteur non renseigné'
  const tags = Array.isArray(company.tags) ? company.tags : []
  const description = company.description?.trim() || 'Profil en attente de description.'
  const offer = company.offer
  const demand = company.demand

  return (
    <Card
      className="group relative overflow-hidden border border-slate-200 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400" />
      <CardContent className="p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <Building2 className="h-4 w-4" />
              <span>{sectorLabel}</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{company.name}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              {distanceValue}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-slate-200 bg-white text-slate-700 shadow-none hover:border-blue-200 hover:text-blue-700"
              onClick={(event) => {
                event.stopPropagation()
                onOpenProfile?.(company)
              }}
            >
              Voir la fiche
            </Button>
          </div>
        </div>

        {(offer || demand) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {offer && (
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Propose</p>
                <p className="text-sm text-slate-700">{offer}</p>
              </div>
            )}
            {demand && (
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recherche</p>
                <p className="text-sm text-slate-700">{demand}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tags.length ? (
            tags.map((tag) => <Tag key={tag} label={tag} />)
          ) : (
            <span className="text-xs text-slate-400">Aucun tag communiqué.</span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="inline-flex items-center gap-1.5">
            <MapIcon className="h-4 w-4" />
            <span>Consultez la fiche pour les coordonnées</span>
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
    if (!value) return
    if (touchedRef?.current === false) {
      touchedRef.current = true
    }
    const normalized = normalizeValue(value)
    setState((prev) => {
      const next = new Set(prev)
      if (next.has(normalized)) {
        next.delete(normalized)
      } else {
        next.add(normalized)
      }
      return next
    })
  }

  const directoryQueryParams = useMemo(() => {
    const sectorsArray = Array.from(appliedSectors)
    const wasteArray = Array.from(appliedWasteTypes)

    const sectorsParam = sectorsArray.length
      ? [...sectorsArray].sort().join(',')
      : (sectorsDirty ? '__none' : undefined)
    const wastesParam = wasteArray.length
      ? [...wasteArray].sort().join(',')
      : (wastesDirty ? '__none' : undefined)

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
    const optionValues = sectorOptions.map((option) => normalizeValue(option.value))
    if (!optionValues.length) {
      return
    }

    const defaultSet = new Set(optionValues)

    if (!sectorsTouchedRef.current) {
      defaultSectorValuesRef.current = defaultSet
    }

    const sanitizeSelection = (selection) =>
      new Set([...selection].map(normalizeValue).filter((value) => defaultSet.has(value)))

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
    const optionValues = wasteOptions.map((option) => normalizeValue(option.value))
    if (!optionValues.length) {
      return
    }

    const defaultSet = new Set(optionValues)

    if (!wastesTouchedRef.current) {
      defaultWasteValuesRef.current = defaultSet
    }

    const sanitizeSelection = (selection) =>
      new Set([...selection].map(normalizeValue).filter((value) => defaultSet.has(value)))

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

  const pendingDistanceLabel = `${pendingMaxDistance} km`
  const appliedDistanceLabel = `${appliedMaxDistance} km`

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (appliedSearchTerm.trim()) count += 1
    if (appliedSectors.size) count += appliedSectors.size
    if (appliedWasteTypes.size) count += appliedWasteTypes.size
    if (appliedMaxDistance !== DEFAULT_MAX_DISTANCE) count += 1
    return count
  }, [appliedSearchTerm, appliedSectors, appliedWasteTypes, appliedMaxDistance])

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-white shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)]" />
          <div className="relative flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Annuaire des entreprises</p>
                <h1 className="text-3xl font-semibold leading-tight">{totalCompanies} entreprises trouvées</h1>
                <p className="text-sm text-white/80">
                  Explorez le réseau industriel des Paluds et identifiez vos futurs partenaires de proximité.
                </p>
              </div>
              <div className="inline-flex items-center rounded-full bg-white/10 p-1 text-white shadow-inner ring-1 ring-white/20">
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 rounded-full px-4 text-sm font-semibold ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/20 text-white'}`}
                  onClick={() => handleChangeView('list')}
                  aria-label="Vue liste"
                >
                  <List className={`h-5 w-5 ${viewMode === 'list' ? 'text-slate-900' : 'text-white'}`} />
                  <span className="hidden sm:inline">Liste</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 rounded-full px-4 text-sm font-semibold ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/20 text-white'}`}
                  onClick={() => handleChangeView('map')}
                  aria-label="Vue carte"
                >
                  <MapIcon className={`h-5 w-5 ${viewMode === 'map' ? 'text-slate-900' : 'text-white'}`} />
                  <span className="hidden sm:inline">Carte</span>
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/15">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Rayon appliqué</p>
                <p className="text-lg font-semibold text-white">{appliedDistanceLabel}</p>
                <p className="text-xs text-white/60">Ajustez-le depuis le panneau filtres.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/15">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Filtres actifs</p>
                <p className="text-lg font-semibold text-white">{activeFiltersCount}</p>
                <p className="text-xs text-white/60">Recherche, secteurs et types de déchets.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/15">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Statut</p>
                <p className="text-lg font-semibold text-white">{isFetching ? 'Actualisation...' : 'À jour'}</p>
                <p className="text-xs text-white/60">Données rafraîchies toutes les minutes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={pendingSearchTerm}
                onChange={(event) => setPendingSearchTerm(event.target.value)}
                placeholder="Rechercher par nom, produit ou besoin"
                className="w-full rounded-lg border-slate-200 bg-white pl-10 text-slate-900 shadow-none focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-slate-200 text-slate-600 hover:border-slate-300"
                onClick={handleReset}
              >
                Réinitialiser
              </Button>
              <Button
                type="button"
                className="h-10 rounded-lg bg-slate-900 px-4 text-white hover:bg-slate-800"
                onClick={handleApply}
                disabled={isFetching}
              >
                Appliquer les filtres
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Rayon : {pendingDistanceLabel}
            </span>
            {!!pendingSectors.size && (
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 ring-1 ring-blue-100">
                {pendingSectors.size} secteur{pendingSectors.size > 1 ? 's' : ''} sélectionné{pendingSectors.size > 1 ? 's' : ''}
              </span>
            )}
            {!!pendingWasteTypes.size && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-100">
                {pendingWasteTypes.size} type{pendingWasteTypes.size > 1 ? 's' : ''} de déchet
              </span>
            )}
            {pendingSearchTerm.trim() && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                <Search className="h-3.5 w-3.5" />
                "{pendingSearchTerm.trim()}"
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="lg:sticky lg:top-6">
            <Card className="border-none bg-white/90 shadow-lg ring-1 ring-slate-200">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filtres avancés</p>
                    <p className="text-base font-semibold text-slate-900">Affinez votre recherche</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full px-3 text-slate-500 hover:bg-slate-100"
                    onClick={handleReset}
                  >
                    Tout effacer
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secteur d'activité</p>
                    <ul className="space-y-2">
                      {sectorOptions.map((sector) => {
                        const normalized = normalizeValue(sector.value)
                        return (
                          <li
                            key={normalized}
                            className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                          >
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={pendingSectors.has(normalized)}
                                onChange={() =>
                                  toggleSelection(
                                    normalized,
                                    setPendingSectors,
                                    sectorsTouchedRef
                                  )
                                }
                                disabled={filterDisabled}
                              />
                              <span>{sector.label}</span>
                            </label>
                            <span className="text-xs font-semibold text-slate-500">{sectorCounts[sector.value] ?? 0}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type de déchet</p>
                    <ul className="space-y-2">
                      {wasteOptions.map((waste) => {
                        const normalized = normalizeValue(waste.value)
                        return (
                          <li
                            key={normalized}
                            className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                          >
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={pendingWasteTypes.has(normalized)}
                                onChange={() =>
                                  toggleSelection(
                                    normalized,
                                    setPendingWasteTypes,
                                    wastesTouchedRef
                                  )
                                }
                                disabled={filterDisabled}
                              />
                              <span>{waste.label}</span>
                            </label>
                            <span className="text-xs font-semibold text-slate-500">{wasteCounts[waste.value] ?? 0}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Distance maximale</span>
                    <span className="text-xs text-slate-500">{pendingDistanceLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={MIN_DISTANCE}
                    max={MAX_DISTANCE}
                    step={1}
                    value={pendingMaxDistance}
                    onChange={(event) => setPendingMaxDistance(Number(event.target.value))}
                    className="mt-3 w-full accent-slate-900"
                  />
                  <div className="mt-1 flex justify-between text-[11px] uppercase tracking-wide text-slate-400">
                    <span>{MIN_DISTANCE} km</span>
                    <span>{MAX_DISTANCE} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg border-slate-200 text-slate-600"
                    onClick={handleReset}
                  >
                    Effacer
                  </Button>
                  <Button
                    type="button"
                    className="h-10 flex-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
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
            {isError ? (
              <Card className="border-none bg-white/90 shadow-lg ring-1 ring-red-100">
                <CardContent className="space-y-3 p-10 text-center">
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
              <Card className="overflow-hidden border-none bg-white shadow-lg ring-1 ring-slate-200">
                <CardContent className="p-0">
                  <InteractiveMap
                    className="h-[440px] w-full"
                    style={{ height: MAP_DEFAULT_HEIGHT }}
                    center={MAP_DEFAULT_CENTER}
                    zoom={MAP_DEFAULT_ZOOM}
                    markers={markers}
                  />
                </CardContent>
              </Card>
            ) : isEmptyState ? (
              <Card className="border-none bg-white/90 shadow-lg ring-1 ring-slate-200">
                <CardContent className="space-y-3 p-10 text-center">
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
              <div className="grid grid-cols-1 gap-4">
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
                    Mise à jour des résultats...
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
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
