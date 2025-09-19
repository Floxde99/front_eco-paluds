import React, { useState } from 'react'
import { 
  useCompanyProfile,
  useUpdateCompanyGeneral,
  useProductions,
  useAddProduction,
  useDeleteProduction,
  useBesoins,
  useAddBesoin,
  useDeleteBesoin,
  useDechets,
  useAddDechet,
  useDeleteDechet,
  useGeolocation
} from '@/hooks/useCompanyProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Edit2, 
  Plus, 
  Trash2, 
  MapPin, 
  Building2, 
  Package, 
  Search, 
  Recycle,
  CheckCircle,
  Circle,
  Map
} from 'lucide-react'

// Composant pour la barre de progression
function ProgressSection({ completed = false, label, onClick }) {
  return (
    <div 
      className={`flex items-center space-x-2 cursor-pointer transition-colors hover:text-blue-600 ${
        completed ? 'text-green-600' : 'text-gray-400'
      }`}
      onClick={onClick}
    >
      {completed ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <Circle className="h-5 w-5" />
      )}
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

// Composant pour les cartes de production/besoins/déchets
function ItemCard({ item, onEdit, onDelete, type = 'production' }) {
  const getIcon = () => {
    switch (type) {
      case 'production':
        return <Package className="h-4 w-4" />
      case 'besoin':
        return <Search className="h-4 w-4" />
      case 'dechet':
        return <Recycle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <Card className="relative group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{item.name || item.titre}</h4>
              {item.category && (
                <p className="text-sm text-gray-500 mb-1">
                  Catégorie: {item.category}
                </p>
              )}
              {item.quantity && (
                <p className="text-sm text-gray-500 mb-1">
                  Quantité: {item.quantity}
                </p>
              )}
              {item.urgence && (
                <p className="text-sm text-gray-500 mb-1">
                  Urgence: {item.urgence}
                </p>
              )}
              {item.etat && (
                <p className="text-sm text-gray-500 mb-1">
                  État: {item.etat}
                </p>
              )}
              {item.traitement && (
                <p className="text-sm text-gray-500">
                  Traitement requis: {item.traitement ? 'Oui' : 'Non'}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CompanyProfile() {
  // API hooks
  const { data: profileData, isLoading: profileLoading } = useCompanyProfile()
  const { data: productions = [], isLoading: productionsLoading } = useProductions()
  const { data: besoins = [], isLoading: besoinsLoading } = useBesoins()
  const { data: dechets = [], isLoading: dechetsLoading } = useDechets()
  const { data: geolocation, isLoading: geolocationLoading } = useGeolocation()

  // Mutation hooks
  const updateGeneralMutation = useUpdateCompanyGeneral()
  const addProductionMutation = useAddProduction()
  const deleteProductionMutation = useDeleteProduction()
  const addBesoinMutation = useAddBesoin()
  const deleteBesoinMutation = useDeleteBesoin()
  const addDechetMutation = useAddDechet()
  const deleteDechetMutation = useDeleteDechet()

  // Local state for editing
  const [isEditingGeneral, setIsEditingGeneral] = useState(false)
  const [generalInfo, setGeneralInfo] = useState({
    nom_entreprise: '',
    secteur: '',
    description: ''
  })

  // Update local state when profile data is loaded
  React.useEffect(() => {
    if (profileData?.general) {
      setGeneralInfo({
        nom_entreprise: profileData.general.nom_entreprise || '',
        secteur: profileData.general.secteur || '',
        description: profileData.general.description || ''
      })
    }
  }, [profileData])

  const loading = profileLoading || productionsLoading || besoinsLoading || dechetsLoading || geolocationLoading

  const handleEditGeneral = () => {
    setIsEditingGeneral(!isEditingGeneral)
  }

  const handleSaveGeneral = () => {
    updateGeneralMutation.mutate(generalInfo, {
      onSuccess: () => {
        setIsEditingGeneral(false)
      }
    })
  }

  const handleEditItem = () => {
  }

  const handleDeleteItem = (item) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return
    }

    // Determine item type and call appropriate delete mutation
    if (item.type === 'production' || productions.some(p => p.id === item.id)) {
      deleteProductionMutation.mutate(item.id)
    } else if (item.type === 'besoin' || besoins.some(b => b.id === item.id)) {
      deleteBesoinMutation.mutate(item.id)
    } else if (item.type === 'dechet' || dechets.some(d => d.id === item.id)) {
      deleteDechetMutation.mutate(item.id)
    }
  }

  const handleAddProduction = () => {
    const newProduction = {
      name: 'Nouvelle production',
      category: 'Catégorie',
      quantity: '1 unité/mois'
    }
    addProductionMutation.mutate(newProduction)
  }

  const handleAddBesoin = () => {
    const newBesoin = {
      name: 'Nouveau besoin',
      category: 'Catégorie',
      quantity: '1 unité/mois',
      urgence: 'Normale'
    }
    addBesoinMutation.mutate(newBesoin)
  }

  const handleAddDechet = () => {
    const newDechet = {
      name: 'Nouveau déchet',
      category: 'Catégorie',
      quantity: '1 kg/mois',
      etat: 'Bon état',
      traitement: false
    }
    addDechetMutation.mutate(newDechet)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Ma fiche entreprise</h1>
          <p className="text-gray-600">Complétez votre profil pour maximiser vos opportunités</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Aperçu public</Button>
          <Button className="bg-green-600 hover:bg-green-700">Enregistrer</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Progression du profil</h3>
            <span className="text-sm font-medium text-green-600">75% complété</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="flex justify-between">
            <ProgressSection completed={true} label="Informations générales" />
            <ProgressSection completed={true} label="Productions" />
            <ProgressSection completed={false} label="Besoins" />
            <ProgressSection completed={false} label="Géolocalisation" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Informations générales</span>
            </h2>
            <Button variant="ghost" size="sm" onClick={handleEditGeneral}>
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditingGeneral ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
                  {isEditingGeneral ? (
                    <Input
                      id="nom_entreprise"
                      value={generalInfo.nom_entreprise}
                      onChange={(e) => setGeneralInfo({...generalInfo, nom_entreprise: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium">{generalInfo.nom_entreprise}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="secteur">Secteur d'activité *</Label>
                  {isEditingGeneral ? (
                    <Input
                      id="secteur"
                      value={generalInfo.secteur}
                      onChange={(e) => setGeneralInfo({...generalInfo, secteur: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{generalInfo.secteur}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description de l'activité</Label>
                  {isEditingGeneral ? (
                    <textarea
                      id="description"
                      value={generalInfo.description}
                      onChange={(e) => setGeneralInfo({...generalInfo, description: e.target.value})}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{generalInfo.description}</p>
                  )}
                </div>
              </div>

              {isEditingGeneral && (
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsEditingGeneral(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveGeneral}>
                    Enregistrer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Productions et services</span>
            </h2>
            <Button onClick={handleAddProduction} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productions.map((production) => (
              <ItemCard
                key={production.id}
                item={production}
                type="production"
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Besoins et recherches</span>
            </h2>
            <Button onClick={handleAddBesoin} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {besoins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {besoins.map((besoin) => (
                <ItemCard
                  key={besoin.id}
                  item={besoin}
                  type="besoin"
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">Aucun besoin renseigné</p>
                <Button onClick={handleAddBesoin} variant="outline">
                  Ajouter un besoin
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Recycle className="h-5 w-5" />
              <span>Déchets et sous-produits</span>
            </h2>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddDechet}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dechets.map((dechet) => (
              <ItemCard
                key={dechet.id}
                item={dechet}
                type="dechet"
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Géolocalisation</span>
            </h2>
            <Button className="bg-green-600 hover:bg-green-700">
              Localiser
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="adresse">Adresse complète *</Label>
                  <Input
                    id="adresse"
                    value={geolocation?.address || 'Zone Industrielle des Paluds, 13400 Aubagne'}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="rayon">Rayon d'action (km)</Label>
                  <Input
                    id="rayon"
                    value={geolocation?.rayon || '25'}
                    className="mt-1"
                    readOnly
                  />
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Carte interactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}