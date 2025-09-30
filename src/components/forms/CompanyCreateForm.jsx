import { useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2 } from 'lucide-react'
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

const companySchema = [
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
  { name: 'address', label: 'Adresse complète', required: true, placeholder: "Ex: 123 Rue de l'Innovation" },
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
]

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
  const schema = useMemo(() => companySchema, [])

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