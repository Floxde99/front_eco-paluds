import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'
import { InteractiveMap } from '@/components/Map'
import { GeolocationDialog } from './GeolocationDialog'

const DEFAULT_COORDINATES = [43.2965, 5.5507]

export function GeolocationSection({
  address,
  radius,
  coordinates,
  onSave,
  isSaving,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [latitude, longitude] = useMemo(() => {
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      return coordinates
    }
    return [undefined, undefined]
  }, [coordinates])

  const mapCenter = useMemo(() => {
    if (
      typeof latitude === 'number' &&
      !Number.isNaN(latitude) &&
      typeof longitude === 'number' &&
      !Number.isNaN(longitude)
    ) {
      return [latitude, longitude]
    }
    return DEFAULT_COORDINATES
  }, [latitude, longitude])

  const markers = useMemo(() => {
    if (
      typeof latitude === 'number' &&
      !Number.isNaN(latitude) &&
      typeof longitude === 'number' &&
      !Number.isNaN(longitude)
    ) {
      return [
        {
          position: [latitude, longitude],
          popup: address,
        },
      ]
    }
    return []
  }, [address, latitude, longitude])

  const handleOpenDialog = () => {
    if (onSave) {
      setIsDialogOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleSubmit = async (values) => {
    if (!onSave) return

    await onSave(values)
    setIsDialogOpen(false)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Géolocalisation</span>
        </h2>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleOpenDialog}
          disabled={!onSave || isSaving}
        >
          {isSaving ? 'Mise à jour…' : 'Mettre à jour'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="adresse">Adresse complète *</Label>
              <Input
                id="adresse"
                value={address || 'Adresse non renseignée'}
                className="mt-1"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="rayon">Rayon d'action (km)</Label>
              <Input
                id="rayon"
                value={radius || 'Non renseigné'}
                className="mt-1"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={
                  typeof latitude === 'number' && !Number.isNaN(latitude)
                    ? latitude
                    : 'Non renseignée'
                }
                className="mt-1"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={
                  typeof longitude === 'number' && !Number.isNaN(longitude)
                    ? longitude
                    : 'Non renseignée'
                }
                className="mt-1"
                readOnly
              />
            </div>
          </div>

          <div className="rounded-lg h-64 overflow-hidden">
            <InteractiveMap center={mapCenter} zoom={13} markers={markers} />
          </div>
        </CardContent>
      </Card>

      <GeolocationDialog
        open={isDialogOpen}
        initialValues={{
          address,
          latitude,
          longitude,
        }}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        isSubmitting={Boolean(isSaving)}
      />
    </section>
  )
}

export default GeolocationSection
