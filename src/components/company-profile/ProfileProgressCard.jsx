import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle } from 'lucide-react'

function ProgressSection({ completed = false, label, onClick }) {
  const Icon = completed ? CheckCircle : Circle

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center space-x-2 transition-colors ${
        completed ? 'text-green-600' : 'text-gray-400'
      } hover:text-blue-600`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium text-left">{label}</span>
    </button>
  )
}

export function ProfileProgressCard({ sections = [], completionLabel }) {
  const total = sections.length || 1
  const completed = sections.filter((section) => section.completed).length
  const percentage = Math.round((completed / total) * 100)
  const label = completionLabel ?? `${percentage}% complété`

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Progression du profil</h3>
          <span className="text-sm font-medium text-green-600">{label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-4 justify-between">
          {sections.map((section) => (
            <ProgressSection key={section.label} {...section} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileProgressCard
