import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboardData } from '@/hooks/useDashboardQuery'
import { ProgressBar } from './ProgressBar'
import { useNavigate } from 'react-router-dom'

// Profile Completion Card
export function ProfileCard() {
  const { completion, loading, error } = useDashboardData()
  const navigate = useNavigate()

  if (error) {
    return (
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Profil entreprise</CardTitle>
            <div className="w-4 h-4 text-slate-400">✏️</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">
            Erreur de chargement
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Profil entreprise</CardTitle>
          <div className="w-4 h-4 text-slate-400">✏️</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Complétude :</span>
              <span className="font-medium">
                {loading ? '...' : `${completion?.completion?.percentage || 0}%`}
              </span>
            </div>
            <ProgressBar 
              percentage={completion?.completion?.percentage || 0} 
              loading={loading}
            />
            {!loading && completion?.completion && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-slate-500">
                  {completion.completion.score || 0} / {completion.completion.total || 8} champs remplis
                </p>
                {completion.completion.missing?.company && (
                  <p className="text-xs text-orange-600">
                    ⚠️ Nom de l'entreprise manquant
                  </p>
                )}
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Compléter mon profil
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Suggestions Card
export function SuggestionsCard() {
  const { stats, loading } = useDashboardData()
  const navigate = useNavigate()

  const newCount = stats?.user_stats?.recent_connections || 0
  const totalCount = stats?.user_stats?.active_inputs + stats?.user_stats?.active_outputs || 0

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Nouvelles suggestions</CardTitle>
          {newCount > 0 && (
            <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {newCount > 9 ? '9+' : newCount}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <p className="text-emerald-600 font-semibold">
                  {newCount} nouvelles opportunités
                </p>
                <p className="text-sm text-slate-500">
                  {totalCount} suggestions au total
                </p>
              </>
            )}
          </div>
          <Button
            type="button"
            onClick={() => navigate('/suggestions')}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Voir les suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Network Card
export function NetworkCard() {
  const { stats, companies, loading } = useDashboardData()
  const navigate = useNavigate()

  const connectedCount = companies?.length || 0
  const partnershipsCount = stats?.user_stats?.companies_owned || 0

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Mon réseau</CardTitle>
          <div className="w-4 h-4 text-slate-400">👥</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3"></div>
              </div>
            ) : (
              <>
                <p className="font-semibold">
                  {connectedCount} entreprises connectées
                </p>
                <p className="text-sm text-slate-500">
                  {partnershipsCount} partenariats actifs
                </p>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/contacts')}
          >
            Voir mes entreprises connectées
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Card
export function ActivityCard() {
  const { stats, loading } = useDashboardData()

  const activities = stats?.recent_activities || []

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Activité récente</CardTitle>
          <div className="w-4 h-4 text-slate-400">📈</div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse flex-1"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse flex-1"></div>
            </div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-2">
            {activities.slice(0, 3).map((activity, index) => (
              <div key={activity.id || index} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'profile_update' ? 'bg-blue-500' : 
                  activity.type === 'new_match' ? 'bg-emerald-500' : 
                  'bg-slate-500'
                }`}></div>
                <span className="text-sm">{activity.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Aucune activité récente
          </div>
        )}
      </CardContent>
    </Card>
  )
}
