import { useMemo } from 'react'
import { useDashboardData } from '@/hooks/useDashboardQuery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Globe, Mail, MapPin, Phone, Users } from 'lucide-react'
import InteractiveMap from '@/components/Map'
import { useNavigate } from 'react-router-dom'

function emptyArray(value) {
  return Array.isArray(value) ? value : []
}

function formatAddress(company) {
  const parts = [company.address, company.city, company.postal_code]
  return parts.filter(Boolean).join(', ')
}

export default function ContactsPage() {
  const { companies = [], loading } = useDashboardData()
  const navigate = useNavigate()

  const mappedCompanies = useMemo(() => {
    if (!Array.isArray(companies)) return []
    return companies.map((company, index) => ({
      id: company.id ?? company.id_company ?? index,
      name: company.name ?? 'Entreprise sans nom',
      description: company.description ?? 'Aucune description disponible',
      industry: company.sector ?? company.industry ?? 'Non renseigné',
      address: formatAddress(company),
      phone: company.phone ?? company.phone_number ?? null,
      email: company.email ?? company.contact_email ?? null,
      website: company.website ?? company.site ?? null,
      logo: company.logo ?? null,
      coordinates: company.coordinates ?? (company.latitude && company.longitude
        ? [Number(company.latitude), Number(company.longitude)]
        : null),
      segments: emptyArray(company.tags ?? company.segments ?? company.labels),
      stats: {
        activeSynergies: company.activeSynergies ?? company.activeMatches ?? 0,
        completedSynergies: company.completedSynergies ?? company.completedMatches ?? 0,
      },
    }))
  }, [companies])

  const mapMarkers = useMemo(() =>
    mappedCompanies
      .filter((company) => Array.isArray(company.coordinates) && company.coordinates.length === 2)
      .map((company) => ({
        position: company.coordinates,
        popup: company.name,
      })),
  [mappedCompanies])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
              <Users className="h-4 w-4" />
              <span>Réseau connecté</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Mes entreprises connectées</h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              Retrouver l'ensemble des entreprises avec lesquelles vous avez établi une connexion. Suivez vos synergies
              actives, contactez vos interlocuteurs et explorez de nouvelles opportunités sur le territoire des Paluds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200"
              onClick={() => navigate('/contacts/messages')}
            >
              Accéder à la messagerie
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/suggestions')}
            >
              Trouver de nouveaux partenaires
            </Button>
          </div>
        </header>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-white">
            <CardTitle className="text-base text-slate-700">Carte des connexions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InteractiveMap
              className="h-[360px] w-full rounded-b-xl"
              center={[43.29, 5.58]}
              zoom={11}
              markers={mapMarkers}
            />
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Liste des entreprises</h2>
              <p className="text-sm text-slate-500">
                {loading
                  ? 'Chargement en cours...'
                  : `${mappedCompanies.length} entreprise${mappedCompanies.length > 1 ? 's' : ''} connectée${mappedCompanies.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="border border-slate-200 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-5 w-40 rounded bg-slate-200 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-slate-200 animate-pulse"></div>
                      <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse"></div>
                    </div>
                    <div className="h-10 w-full rounded bg-slate-200 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mappedCompanies.length === 0 ? (
            <Card className="border border-dashed border-slate-200 shadow-none bg-white">
              <CardContent className="p-10 text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Aucune entreprise connectée pour l'instant</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Dès qu'une synergie est confirmée, votre partenaire apparaît ici pour suivre vos échanges et vos
                  actions en cours.
                </p>
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/suggestions')}
                >
                  Explorer des opportunités
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mappedCompanies.map((company) => (
                <Card key={company.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                        <p className="text-sm text-slate-600">{company.description}</p>
                        <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            {company.industry}
                          </Badge>
                          {company.stats.activeSynergies > 0 && (
                            <Badge variant="outline" className="border-emerald-100 text-emerald-600">
                              {company.stats.activeSynergies} synergie{company.stats.activeSynergies > 1 ? 's' : ''} active{company.stats.activeSynergies > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {company.stats.completedSynergies > 0 && (
                            <Badge variant="outline" className="border-blue-100 text-blue-600">
                              {company.stats.completedSynergies} finalisation{company.stats.completedSynergies > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-500">
                      {company.address && (
                        <div className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{company.address}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a href={`tel:${company.phone}`} className="text-blue-600 hover:text-blue-700">
                            {company.phone}
                          </a>
                        </div>
                      )}
                      {company.email && (
                        <div className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700">
                            {company.email}
                          </a>
                        </div>
                      )}
                      {company.website && (
                        <div className="inline-flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            Voir le site
                          </a>
                        </div>
                      )}
                    </div>

                    {company.segments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {company.segments.map((segment) => (
                          <Badge
                            key={segment}
                            variant="outline"
                            className="border-blue-100 text-blue-600 bg-blue-50/70"
                          >
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200"
                        onClick={() => navigate({ pathname: '/contacts/messages', search: `?conversation=${company.id}` })}
                      >
                        Ouvrir la messagerie
                      </Button>
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate({ pathname: '/assistant', search: `?conversation=${company.id}` })}
                      >
                        Contacter via l'assistant
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200"
                        onClick={() => navigate({ pathname: '/profile', search: `?company=${company.id}` })}
                      >
                        Voir la fiche
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
