import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin, Search } from 'lucide-react'
import { geolocationSchema } from '@/schemas/company'
import { mapZodErrors } from '@/lib/zod'

const DEFAULT_VALUES = {
  address: '',
  latitude: '',
  longitude: '',
}

const normalizeCoordinate = (value) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  return String(value)
}

export function GeolocationDialog({
  open,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const parsedInitialValues = useMemo(() => {
    if (!initialValues) {
      return { ...DEFAULT_VALUES }
    }

    const { address = '', latitude, longitude } = initialValues
    return {
      address,
      latitude: normalizeCoordinate(latitude),
      longitude: normalizeCoordinate(longitude),
    }
  }, [initialValues])

  const [values, setValues] = useState(DEFAULT_VALUES)
  const [errors, setErrors] = useState({})
  const [searchError, setSearchError] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    if (open) {
      setValues(parsedInitialValues)
      setErrors({})
      setSearchError(null)
      setSubmitError(null)
    }
  }, [open, parsedInitialValues])

  const updateValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const { [field]: _removed, ...rest } = prev
      return rest
    })
  }

  const handleSearch = async () => {
    const query = values.address?.trim()
    if (!query) {
      setErrors((prev) => ({ ...prev, address: 'Veuillez saisir une adresse à rechercher' }))
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const params = new URLSearchParams({
        format: 'json',
        q: query,
        limit: '1',
        addressdetails: '1',
      })

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error("Impossible d'obtenir la localisation")
      }

      const results = await response.json()
      if (!results?.length) {
        throw new Error('Adresse introuvable, essayez avec plus de détails')
      }

      const bestResult = results[0]
      updateValue('latitude', bestResult.lat)
      updateValue('longitude', bestResult.lon)
      setValues((prev) => ({
        ...prev,
        address: bestResult.display_name,
      }))
    } catch (error) {
      setSearchError(error.message || 'Erreur lors de la recherche de la localisation')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError(null)

    const parsed = geolocationSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(mapZodErrors(parsed.error))
      return
    }

    try {
      await onSubmit(parsed.data)
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error.message
      setSubmitError(apiMessage || 'Erreur lors de la mise à jour de la géolocalisation')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-[55%] p-6 space-y-4 bg-slate-50 border-b md:border-b-0 md:border-r">
            <DialogHeader className="space-y-2">
              <DialogTitle className="flex items-center space-x-2 text-lg md:text-xl">
                <MapPin className="h-5 w-5" />
                <span>Mettre à jour la géolocalisation</span>
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Ajustez l'adresse et les coordonnées GPS de votre entreprise pour améliorer votre visibilité locale.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="geo-address">Adresse complète</Label>
                <Input
                  id="geo-address"
                  value={values.address}
                  onChange={(event) => updateValue('address', event.target.value)}
                  placeholder="Ex: 23 Avenue de la Production, Aubagne"
                />
                {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                {searchError && <p className="text-xs text-red-600">{searchError}</p>}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Utilisez la recherche pour remplir automatiquement les coordonnées GPS.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {isSearching ? 'Recherche en cours…' : 'Rechercher la position'}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="geo-latitude">Latitude</Label>
                  <Input
                    id="geo-latitude"
                    value={values.latitude}
                    onChange={(event) => updateValue('latitude', event.target.value)}
                    placeholder="Ex: 43.2965"
                  />
                  {errors.latitude && <p className="text-xs text-red-600">{errors.latitude}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="geo-longitude">Longitude</Label>
                  <Input
                    id="geo-longitude"
                    value={values.longitude}
                    onChange={(event) => updateValue('longitude', event.target.value)}
                    placeholder="Ex: 5.5507"
                  />
                  {errors.longitude && <p className="text-xs text-red-600">{errors.longitude}</p>}
                </div>
              </div>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <DialogFooter className="gap-2 sm:gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="w-full md:w-[45%] bg-white">
            <div className="h-64 md:h-full">
              <div className="h-full w-full">
                <iframe
                  title="Prévisualisation de la carte"
                  src={`https://www.openstreetmap.org/export/embed.html?marker=${values.latitude || ''}%2C${values.longitude || ''}&layers=mapnik`}
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GeolocationDialog
