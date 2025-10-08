import { useCallback, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Building2, Loader2, Search } from 'lucide-react'
import { useCreateCompany } from '@/hooks/useCompanyProfile'
import { FormBuilder } from './FormBuilder'
import { companyCreateSchema } from '@/schemas/company'
import { mapZodErrors } from '@/lib/zod'

const SectionTitle = ({ title, subtitle }) => (
  <div className="space-y-1">
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
)

const descriptionField = {
  name: 'description',
  render: ({ field, controller }) => (
    <div>
      <Label htmlFor="description">Description de l'entreprise</Label>
      <textarea
        id="description"
        value={field.value ?? ''}
        onChange={(e) => controller.setFieldValue(field.name, e.target.value)}
        placeholder="Décrivez brièvement votre activité..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {field.error && <p className="text-xs text-red-600 mt-1">{field.error}</p>}
    </div>
  ),
}

const fetchFromDataGouv = async (query) => {
  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`)

  if (!response.ok) {
    throw new Error("Impossible d'obtenir la localisation via api-adresse.data.gouv.fr")
  }

  const data = await response.json()
  const feature = data?.features?.[0]

  if (!feature) {
    return null
  }

  const [lon, lat] = feature.geometry?.coordinates ?? []

  if (Math.abs(Number(lat)) > 90 || Math.abs(Number(lon)) > 180) {
    return null
  }

  return {
    displayName: feature.properties?.label ?? query,
    lat: String(lat ?? ''),
    lon: String(lon ?? ''),
  }
}

const fetchFromNominatim = async (query, extraParams = {}) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    limit: '3',
    addressdetails: '1',
    countrycodes: 'fr',
    dedupe: '1',
    ...extraParams,
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error("Impossible d'obtenir la localisation via OpenStreetMap")
  }

  const results = await response.json()
  if (!results?.length) {
    return null
  }

  const best = results[0]
  return {
    displayName: best.display_name ?? query,
    lat: String(best.lat ?? ''),
    lon: String(best.lon ?? ''),
  }
}

const geocodeAddress = async (query) => {
  const trimmed = query.trim()
  if (!trimmed) return null

  // Try the French government API first (better coverage in France)
  try {
    const dataGouvResult = await fetchFromDataGouv(trimmed)
    if (dataGouvResult) {
      return dataGouvResult
    }
  } catch (error) {
    console.warn('data.gouv geocoding error:', error)
  }

  // Fallback to OpenStreetMap Nominatim
  const queriesToTry = [trimmed]
  if (!/france/i.test(trimmed)) {
    queriesToTry.push(`${trimmed}, France`)
  }

  for (const q of queriesToTry) {
    try {
      const nominatimResult = await fetchFromNominatim(q)
      if (nominatimResult) {
        return nominatimResult
      }
    } catch (error) {
      console.warn('Nominatim geocoding error:', error)
    }
  }

  return null
}

const CompanyIntro = () => (
  <div className="text-center mb-8">
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-blue-100 rounded-full">
        <Building2 className="h-8 w-8 text-blue-600" />
      </div>
    </div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer le profil de votre entreprise</h1>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Remplissez les informations essentielles pour accéder à la plateforme. Vous pourrez compléter votre profil plus tard.
    </p>
  </div>
)

export default function CompanyCreateForm() {
  const createCompany = useCreateCompany()
  const [geoSearching, setGeoSearching] = useState(false)
  const [geoError, setGeoError] = useState(null)

  const handleGeocodeFromAddress = useCallback(async (controller) => {
    const rawAddress = controller.values.address?.trim()
    if (!rawAddress) {
      controller.setFieldError?.('address', 'Veuillez saisir une adresse avant la recherche')
      setGeoError(null)
      return
    }

    setGeoSearching(true)
    setGeoError(null)

    try {
      const result = await geocodeAddress(rawAddress)

      if (!result) {
        throw new Error('Adresse introuvable, essayez avec plus de détails')
      }

      

      // Update all values at once to avoid issues
      setTimeout(() => {
        controller.setFieldValue('address', result.displayName || rawAddress)
        controller.setFieldValue('latitude', result.lat ?? '')
        controller.setFieldValue('longitude', result.lon ?? '')
      }, 0)
      
      setGeoError(null)
    } catch (error) {
      setGeoError(error.message || 'Erreur lors de la récupération des coordonnées')
    } finally {
      setGeoSearching(false)
    }
  }, [])

  const getAddressField = useCallback((currentGeoSearching, currentGeoError) => ({
    name: 'address',
    required: true,
    render: ({ field, controller }) => (
      <div className="space-y-2">
        <Label htmlFor="company-address">Adresse complète</Label>
        <Input
          id="company-address"
          value={field.value ?? ''}
          onChange={(event) => {
            controller.setFieldValue(field.name, event.target.value)
            if (currentGeoError) {
              setGeoError(null)
            }
          }}
          placeholder="Ex: 123 Rue de l'Innovation"
          required
          className={field.error ? 'border-red-500 focus:ring-red-500/60' : undefined}
        />
        {field.error && <p className="text-xs text-red-600">{field.error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Cliquez sur « Remplir automatiquement » pour compléter les coordonnées GPS via OpenStreetMap.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleGeocodeFromAddress(controller)}
            disabled={currentGeoSearching}
            className="flex items-center gap-2"
          >
            {currentGeoSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {currentGeoSearching ? 'Recherche…' : 'Remplir automatiquement'}
          </Button>
        </div>
        {currentGeoError && <p className="text-xs text-red-600">{currentGeoError}</p>}
      </div>
    ),
  }), [handleGeocodeFromAddress])

  const schema = useMemo(() => [
    {
      name: 'required-heading',
      renderOnly: true,
      render: () => (
        <SectionTitle
          title="Informations obligatoires"
          subtitle="Ces champs sont nécessaires pour créer votre profil"
        />
      ),
    },
    { name: 'name', label: "Nom de l'entreprise", required: true, placeholder: 'Ex: EcoTech Solutions' },
    { name: 'sector', label: "Secteur d'activité", required: true, placeholder: 'Ex: Énergies renouvelables' },
    getAddressField(geoSearching, geoError),
    { name: 'siret', label: 'Numéro SIRET', required: true, helpText: '14 chiffres' },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true, placeholder: 'Ex: 04 91 00 00 00' },
    {
      name: 'email',
      label: 'Email professionnel',
      type: 'email',
      required: true,
      placeholder: 'contact@entreprise.com',
    },
    {
      name: 'latitude',
      label: 'Latitude',
      type: 'number',
      required: true,
      helpText: 'Coordonnée GPS',
      inputProps: { step: 'any' },
    },
    {
      name: 'longitude',
      label: 'Longitude',
      type: 'number',
      required: true,
      helpText: 'Coordonnée GPS',
      inputProps: { step: 'any' },
    },
    {
      name: 'optional-heading',
      renderOnly: true,
      render: () => (
        <SectionTitle
          title="Informations complémentaires"
          subtitle="Optionnel mais recommandé pour un profil complet"
        />
      ),
    },
    descriptionField,
    { name: 'website', label: 'Site web', placeholder: 'https://www.entreprise.com' },
  ], [geoSearching, geoError, getAddressField])

  const handleSubmit = async (values, helpers) => {
    const parsed = companyCreateSchema.safeParse(values)

    if (!parsed.success) {
      helpers.setErrors(mapZodErrors(parsed.error))
      return
    }

    try {
      await createCompany.mutateAsync(parsed.data)
      helpers.reset()
    } catch (error) {
      const apiErrors = error?.response?.data?.errors
      if (apiErrors) {
        helpers.setErrors(apiErrors)
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CompanyIntro />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Informations entreprise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormBuilder
            schema={schema}
            onSubmit={handleSubmit}
            submitLabel={null}
            loading={createCompany.isPending}
            footer={() => (
              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createCompany.isPending}
                >
                  {createCompany.isPending ? 'Création...' : 'Créer mon entreprise'}
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}