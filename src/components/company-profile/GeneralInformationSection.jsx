import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2 } from 'lucide-react'

export function GeneralInformationSection({
  value,
  isEditing,
  onFieldChange,
  onToggle,
  onSave,
  onCancel,
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <span className="text-sm font-semibold">1</span>
          </span>
          <span>Informations générales</span>
        </h2>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <Edit2 className="h-4 w-4 mr-2" />
          {isEditing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
              {isEditing ? (
                <Input
                  id="nom_entreprise"
                  value={value.nom_entreprise}
                  onChange={(e) => onFieldChange('nom_entreprise', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">{value.nom_entreprise}</p>
              )}
            </div>

            <div>
              <Label htmlFor="secteur">Secteur d'activité *</Label>
              {isEditing ? (
                <Input
                  id="secteur"
                  value={value.secteur}
                  onChange={(e) => onFieldChange('secteur', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{value.secteur}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description de l'activité</Label>
              {isEditing ? (
                <textarea
                  id="description"
                  value={value.description}
                  onChange={(e) => onFieldChange('description', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-gray-700">{value.description}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button onClick={onSave}>Enregistrer</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export default GeneralInformationSection
