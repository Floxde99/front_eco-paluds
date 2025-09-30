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

const RESOURCE_CONFIG = {
  production: {
    title: {
      create: 'Ajouter une production',
      edit: 'Modifier la production',
    },
    description:
      'Décrivez un produit ou service que votre entreprise propose afin de le rendre visible auprès des autres acteurs.',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'category', label: 'Catégorie', type: 'text' },
      { name: 'quantity', label: 'Quantité', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  besoin: {
    title: {
      create: 'Ajouter un besoin',
      edit: 'Modifier le besoin',
    },
    description:
      'Précisez les ressources ou services que vous recherchez pour favoriser les synergies locales.',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'category', label: 'Catégorie', type: 'text' },
      { name: 'quantity', label: 'Quantité', type: 'text' },
      {
        name: 'urgence',
        label: 'Niveau d\'urgence',
        type: 'select',
        options: ['Faible', 'Normale', 'Urgente'],
        required: true,
      },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  dechet: {
    title: {
      create: 'Ajouter un déchet',
      edit: 'Modifier le déchet',
    },
    description:
      'Indiquez les sous-produits ou déchets valorisables afin de faciliter leur réutilisation.',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'category', label: 'Catégorie', type: 'text' },
      { name: 'quantity', label: 'Quantité', type: 'text' },
      { name: 'etat', label: 'État', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'traitement', label: 'Traitement requis', type: 'checkbox' },
    ],
  },
}

function getInitialState(type, initialValues) {
  if (!type) {
    return {}
  }

  const defaults = RESOURCE_DEFAULTS[type] ?? {}
  if (!initialValues) {
    return defaults
  }

  return {
    ...defaults,
    ...initialValues,
    traitement:
      initialValues.traitement !== undefined
        ? Boolean(initialValues.traitement)
        : defaults.traitement,
  }
}

const RESOURCE_DEFAULTS = {
  production: {
    name: '',
    category: '',
    quantity: '',
    description: '',
  },
  besoin: {
    name: '',
    category: '',
    quantity: '',
    urgence: 'Normale',
    description: '',
  },
  dechet: {
    name: '',
    category: '',
    quantity: '',
    etat: '',
    description: '',
    traitement: false,
  },
}

export function ResourceDialog({
  open,
  type,
  mode,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const config = useMemo(() => (type ? RESOURCE_CONFIG[type] : null), [type])
  const [values, setValues] = useState(() => getInitialState(type, initialValues))

  useEffect(() => {
    setValues(getInitialState(type, initialValues))
  }, [type, initialValues, open])

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!type) return
    await onSubmit(values)
  }

  if (!config) {
    return null
  }

  const title = config.title?.[mode] ?? 'Gérer la ressource'
  const description = config.description
  const submitLabel = mode === 'edit' ? 'Mettre à jour' : 'Ajouter'

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {config.fields.map((field) => {
            if (field.type === 'textarea') {
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <textarea
                    id={field.name}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={values[field.name] ?? ''}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    required={field.required}
                  />
                </div>
              )
            }

            if (field.type === 'select') {
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <select
                    id={field.name}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values[field.name] ?? ''}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    required={field.required}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )
            }

            if (field.type === 'checkbox') {
              return (
                <div key={field.name} className="flex items-center space-x-2">
                  <input
                    id={field.name}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={Boolean(values[field.name])}
                    onChange={(event) => handleChange(field.name, event.target.checked)}
                  />
                  <Label htmlFor={field.name} className="cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              )
            }

            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  value={values[field.name] ?? ''}
                  required={field.required}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                />
              </div>
            )
          })}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'En cours…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ResourceDialog
