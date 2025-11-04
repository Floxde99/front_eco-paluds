import { useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCompanyPublicProfile } from '@/services/Api'
import { getCompanyProfile } from '@/services/CompanyProfileApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, CheckCircle2, Factory, Globe, Loader2, Mail, MapPin, Phone, Recycle } from 'lucide-react'
import InteractiveMap from '@/components/Map'

function toArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  if (typeof value === 'object') return Object.values(value)
  return []
}

function normalizeResourceItems(rawItems) {
  return toArray(rawItems)
    .map((item, index) => {
      if (item == null) return null
      if (typeof item === 'string') {
        return { id: index, title: item, details: null }
      }
      if (typeof item === 'object') {
        return {
          id: item.id ?? index,
          title: item.name ?? item.label ?? item.title ?? 'Ressource',
          details: item.description ?? item.notes ?? item.details ?? null,
          category: item.category ?? item.type ?? null,
          quantity: item.quantity ?? item.amount ?? null,
          status: item.status ?? null,
        }
      }
      return null
    })
    .filter(Boolean)
}

function normalizeCompany(data, fallbackId) {
  if (!data) return null
  const latitude = Number(data.latitude ?? data.lat ?? data.coordinates?.[0])
  const longitude = Number(data.longitude ?? data.lng ?? data.lon ?? data.coordinates?.[1])

  return {
    id:
      data.id ??
      data.company_id ??
      data.companyId ??
      data.id_company ??
      data.uuid ??
      data.slug ??
      fallbackId,
    name: data.name ?? data.company_name ?? 'Entreprise',
    description: data.description ?? data.about ?? 'Aucune description disponible pour cette entreprise.',
    sector: data.sector ?? data.industry ?? 'Non renseigné',
    address: data.address ?? data.full_address ?? null,
    postalCode: data.postal_code ?? data.zip ?? null,
    city: data.city ?? data.town ?? null,
    phone: data.phone ?? data.phone_number ?? null,
    email: data.email ?? data.contact_email ?? null,
    website: data.website ?? data.site ?? null,
    tags: toArray(data.tags ?? data.labels ?? data.keywords),
    coordinates: Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null,
    productions: normalizeResourceItems(data.productions ?? data.offers ?? data.production),
    needs: normalizeResourceItems(data.besoins ?? data.needs ?? data.demands),
    wastes: normalizeResourceItems(data.dechets ?? data.waste ?? data.wastes),
    stats: {
      synergies: data.activeSynergies ?? data.active_matches ?? data.synergies ?? 0,
      completed: data.completedSynergies ?? data.completed_matches ?? data.completed ?? 0,
      employees: data.employees ?? data.workforce ?? null,
    },
  }
}

function SectionList(props) {
  const { title, icon: IconComponent, items, emptyLabel } = props
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-200 bg-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <IconComponent className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
          <p className="text-xs text-slate-500">{items.length} élément{items.length > 1 ? 's' : ''}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                  {item.category && <Badge variant="outline" className="border-slate-200 text-slate-500">{item.category}</Badge>}
                  {item.quantity && <Badge variant="secondary" className="bg-blue-50 text-blue-600">{item.quantity}</Badge>}
                  {item.status && <Badge variant="outline" className="border-emerald-200 text-emerald-600">{item.status}</Badge>}
                </div>
              </div>
              {item.details && <p className="text-sm text-slate-600">{item.details}</p>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function CompanyPublicProfilePage() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const previewMode = searchParams.get('preview') === '1'
  const statePreview = location.state?.previewCompany ?? null
  const listingCompany = location.state?.directoryCompany ?? null

  const {
    data: publicData,
    isLoading: isPublicLoading,
    isError: isPublicError,
    error: publicError,
    refetch: refetchPublic,
  } = useQuery({
    queryKey: ['company-public', companyId],
    queryFn: () => getCompanyPublicProfile(companyId),
    enabled: !!companyId,
    retry: previewMode ? 0 : 1,
  })

  const {
    data: previewProfile,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    refetch: refetchPreview,
  } = useQuery({
    queryKey: ['company-preview-self'],
    queryFn: getCompanyProfile,
    enabled: previewMode && !statePreview,
    retry: 1,
    staleTime: 60_000,
  })

  const previewPayload = useMemo(() => {
    if (statePreview) return statePreview
    if (previewProfile) {
      return transformProfileToPublic(previewProfile)
    }
    return null
  }, [previewProfile, statePreview])

  const publicCompany = useMemo(() => {
    const normalized = normalizeCompany(publicData, companyId)
    if (normalized) {
      return normalized
    }
    if (listingCompany) {
      return normalizeCompany(listingCompany, companyId)
    }
    return null
  }, [publicData, companyId, listingCompany])
  const previewCompany = useMemo(() => normalizeCompany(previewPayload, companyId), [previewPayload, companyId])

  const company = previewMode ? (previewCompany ?? publicCompany) : publicCompany

  const isLoading = previewMode
    ? (!previewCompany && (isPublicLoading || isPreviewLoading))
    : isPublicLoading

  const didFail = previewMode
    ? !previewCompany && !isLoading && (isPublicError || isPreviewError)
    : (!company && !isLoading && isPublicError)

  const errorMessage = previewMode
    ? "Impossible d'afficher l'aperçu. Vérifiez que votre fiche entreprise est complète."
    : publicError?.response?.status === 404 && listingCompany
      ? "Aucune fiche détaillée disponible pour cette entreprise."
      : publicError?.response?.status === 404
        ? "Cette entreprise n'est plus disponible dans l'annuaire."
        : "Impossible de charger le profil de cette entreprise pour le moment."

  const refetch = previewMode
    ? () => {
        refetchPublic()
        if (!statePreview) {
          refetchPreview()
        }
      }
    : refetchPublic

  const markers = useMemo(() => {
    if (company?.coordinates) {
      return [
        {
          position: company.coordinates,
          popup: company.name,
        },
      ]
    }
    return []
  }, [company])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
          <div className="h-10 w-64 rounded bg-slate-200 animate-pulse" />
          <div className="h-5 w-80 rounded bg-slate-200 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (didFail || !company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-10 text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Loader2 className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Profil inaccessible</h1>
              <p className="text-sm text-slate-500">{errorMessage}</p>
              <div className="flex items-center justify-center gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Retour
                </Button>
                <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={() => refetch()}>
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const formattedAddress = [company.address, company.postalCode, company.city].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-4">
          <Button type="button" variant="ghost" className="px-0 text-sm text-blue-600 hover:text-blue-700" onClick={() => navigate(-1)}>
            ← Retour vers l'annuaire
          </Button>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
              <Building2 className="h-4 w-4" />
              <span>Profil public</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
              <Badge className="bg-blue-100 text-blue-700">{company.sector}</Badge>
              {company.stats.synergies > 0 && (
                <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                  {company.stats.synergies} synergie{company.stats.synergies > 1 ? 's' : ''} active{company.stats.synergies > 1 ? 's' : ''}
                </Badge>
              )}
              {company.stats.completed > 0 && (
                <Badge variant="outline" className="border-blue-200 text-blue-600">
                  {company.stats.completed} finalisation{company.stats.completed > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 max-w-3xl">{company.description}</p>
            {company.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {company.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-slate-200 text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {formattedAddress && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adresse</p>
                  <p className="text-sm text-slate-700">{formattedAddress}</p>
                </CardContent>
              </Card>
            )}
            {company.phone && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Téléphone</p>
                  <a href={`tel:${company.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                    {company.phone}
                  </a>
                </CardContent>
              </Card>
            )}
            {company.email && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <a href={`mailto:${company.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                    {company.email}
                  </a>
                </CardContent>
              </Card>
            )}
            {company.website && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Globe className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Site web</p>
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Consulter
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </header>

        {markers.length > 0 && (
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-white">
              <CardTitle className="text-base text-slate-700">Localisation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <InteractiveMap
                className="h-[320px] w-full rounded-b-xl"
                center={company.coordinates}
                zoom={13}
                markers={markers}
              />
            </CardContent>
          </Card>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <SectionList
            title="Productions"
            icon={Factory}
            items={company.productions}
            emptyLabel="Aucune production partagée pour le moment."
          />
          <SectionList
            title="Besoins"
            icon={CheckCircle2}
            items={company.needs}
            emptyLabel="Aucun besoin identifié actuellement."
          />
          <SectionList
            title="Déchets & ressources"
            icon={Recycle}
            items={company.wastes}
            emptyLabel="Aucun flux listé pour le moment."
          />
        </section>

        <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Dernière mise à jour {new Date().toLocaleDateString('fr-FR')}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200"
              onClick={() => navigate({ pathname: '/assistant', search: `?company=${company.id}` })}
            >
              Contacter via l'assistant
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (company.id) {
                  navigate(
                    { pathname: '/contacts/messages', search: `?company=${company.id}` },
                    {
                      state: {
                        company: {
                          id: company.id,
                          id_company: company.id_company ?? company.companyId ?? company.company_id ?? company.id,
                          name: company.name,
                          sector: company.sector,
                        },
                      },
                    }
                  )
                } else {
                  navigate('/contacts/messages')
                }
              }}
            >
              Contacter directement
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/suggestions')}
            >
              Explorer les synergies
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function transformProfileToPublic(profile) {
  if (!profile) return null
  const general = profile.general ?? {}
  const geolocation = profile.geolocation ?? {}
  const productions = Array.isArray(profile.productions) ? profile.productions : []
  const besoins = Array.isArray(profile.besoins) ? profile.besoins : []
  const dechets = Array.isArray(profile.dechets) ? profile.dechets : []

  return {
    id: profile.id ?? general.id ?? null,
    name: general.nom_entreprise ?? general.name ?? 'Entreprise',
    description: general.description ?? '',
    sector: general.secteur ?? general.sector ?? 'Non renseigné',
    phone: general.phone ?? null,
    email: general.email ?? null,
    website: general.website ?? null,
    address: geolocation.address ?? general.adresse ?? null,
    postal_code: general.postal_code ?? null,
    city: general.city ?? null,
    latitude: geolocation.latitude ?? (profile.coordinates?.[0] ?? null),
    longitude: geolocation.longitude ?? (profile.coordinates?.[1] ?? null),
    productions,
    besoins,
    dechets,
  }
}
