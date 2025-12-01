import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ResourceItemCard from './ResourceItemCard'

export function ResourceSection({
  title,
  icon,
  items = [],
  type,
  onAdd,
  addLabel = 'Ajouter',
  addButtonContent,
  onEdit,
  onDelete,
  emptyState,
}) {
  const hasItems = items.length > 0
  const IconComponent = icon
  const EmptyIcon = emptyState?.icon
  const buttonLabel = emptyState?.actionLabel ?? addLabel
  const addButton = (
    <Button
      onClick={onAdd}
      disabled={!onAdd}
      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
    >
      {addButtonContent ?? addLabel}
    </Button>
  )

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center space-x-2">
          {IconComponent && <IconComponent className="h-5 w-5" />}
          <span>{title}</span>
        </h2>
        {addButton}
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ResourceItemCard
              key={item.id}
              item={item}
              type={type}
              onEdit={onEdit ? (current) => onEdit(type, current) : undefined}
              onDelete={(current) => onDelete?.(type, current)}
            />
          ))}
        </div>
      ) : (
        emptyState && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              {EmptyIcon && <EmptyIcon className="h-6 w-6 text-slate-400 mx-auto" />}
              <p className="text-slate-500">{emptyState.message}</p>
              <Button variant="outline" onClick={onAdd} disabled={!onAdd}>
                {buttonLabel}
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </section>
  )
}

export default ResourceSection
