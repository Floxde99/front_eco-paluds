import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SuggestionsEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
        <Search className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">Aucune nouvelle suggestion</h3>
      <p className="mb-6 max-w-md text-sm text-slate-600">
        Complétez votre profil pour recevoir plus de suggestions personnalisées
      </p>
      <Button className="gap-2">Compléter mon profil</Button>
    </div>
  )
}
