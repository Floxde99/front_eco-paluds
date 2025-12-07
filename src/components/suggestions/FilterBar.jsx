import { Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SUGGESTION_FILTERS } from './constants'

export default function SuggestionsFilterBar({ currentFilter, onFilterChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4" />
            Trier par
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {SUGGESTION_FILTERS.map((filter) => (
            <DropdownMenuItem
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={currentFilter === filter.id ? 'bg-slate-100' : ''}
            >
              {filter.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="default" className="gap-2 w-full sm:w-auto">
        <Search className="h-4 w-4" />
        Filtres
      </Button>
    </div>
  )
}
