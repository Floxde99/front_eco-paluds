import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Package, Recycle, Search, Trash2 } from 'lucide-react'

const iconByType = {
  production: Package,
  besoin: Search,
  dechet: Recycle,
}

export function ResourceItemCard({ item, type = 'production', onEdit, onDelete }) {
  const Icon = iconByType[type] ?? Package

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1 text-sm text-slate-500">
              <h4 className="font-medium text-slate-900 text-base">
                {item.name || item.titre}
              </h4>
              {item.category && <p>Catégorie: {item.category}</p>}
              {item.quantity && <p>Quantité: {item.quantity}</p>}
              {item.urgence && <p>Urgence: {item.urgence}</p>}
              {item.etat && <p>État: {item.etat}</p>}
              {item.traitement !== undefined && (
                <p>Traitement requis: {item.traitement ? 'Oui' : 'Non'}</p>
              )}
              {item.description && <p className="text-slate-600">{item.description}</p>}
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(item)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResourceItemCard
