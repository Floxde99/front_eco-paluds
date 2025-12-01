import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CompanyCreateForm from '@/components/forms/CompanyCreateForm'
import { Button } from '@/components/ui/button'
import { Plus, Package, Recycle, Search } from 'lucide-react'
import { ProfileProgressCard } from '@/components/company-profile/ProfileProgressCard'
import { GeneralInformationSection } from '@/components/company-profile/GeneralInformationSection'
import { ResourceSection } from '@/components/company-profile/ResourceSection'
import { GeolocationSection } from '@/components/company-profile/GeolocationSection'
import { ProfileLoadingSkeleton } from '@/components/company-profile/ProfileLoadingSkeleton'
import { ResourceDialog } from '@/components/company-profile/ResourceDialog'
import { useCompanyProfilePage } from '@/hooks/useCompanyProfilePage'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

export default function CompanyProfile() {
  const navigate = useNavigate()
  const {
    loading,
    hasProfile,
    profileData,
    productions,
    besoins,
    dechets,
    generalInfo,
    setGeneralInfo,
    isEditingGeneral,
    toggleGeneralEditing,
    resetGeneralInfo,
    saveGeneralInfo,
    deleteResource,
    resourceDialog,
    openResourceDialog,
    closeResourceDialog,
    saveResource,
    isSavingResource,
    isDeletingResource,
    address,
    coordinates,
    radius,
    saveGeolocation,
    isSavingGeolocation,
  } = useCompanyProfilePage()

  const [deleteDialogState, setDeleteDialogState] = useState({
    open: false,
    type: null,
    item: null,
  })

  const handleFieldChange = useCallback(
    (field, value) => {
      setGeneralInfo((previous) => ({ ...previous, [field]: value }))
    },
    [setGeneralInfo]
  )

  const handleDeleteRequest = useCallback((type, item) => {
    setDeleteDialogState({ open: true, type, item })
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogState({ open: false, type: null, item: null })
  }, [])

  const confirmDeletion = useCallback(async () => {
    const { type, item } = deleteDialogState
    if (!type) {
      return
    }

    try {
      await deleteResource(type, item)
      closeDeleteDialog()
    } catch {
      // L'erreur est déjà gérée et journalisée dans le hook
    }
  }, [deleteDialogState, deleteResource, closeDeleteDialog])

  const handleToggleGeneralEditing = useCallback(() => {
    if (isEditingGeneral) {
      resetGeneralInfo()
    } else {
      toggleGeneralEditing()
    }
  }, [isEditingGeneral, resetGeneralInfo, toggleGeneralEditing])

  const companyId = profileData?.id

  const handleOpenPublicPreview = useCallback(() => {
    if (!companyId) {
      toast.error("Impossible d'ouvrir le profil public pour le moment.")
      return
    }

    const general = profileData?.general ?? {}
    const [latitude, longitude] = Array.isArray(coordinates)
      ? coordinates
      : [undefined, undefined]

    const previewCompany = {
      id: companyId,
      name: general.nom_entreprise ?? general.name ?? 'Entreprise',
      description: general.description ?? '',
      sector: general.secteur ?? general.sector ?? null,
      phone: general.phone ?? null,
      email: general.email ?? null,
      website: general.website ?? null,
      address,
      latitude,
      longitude,
      productions,
      besoins,
      dechets,
    }

    navigate(
      {
  pathname: `/companies/${companyId}`,
        search: '?preview=1',
      },
      previewCompany
        ? { state: { previewCompany } }
        : undefined
    )
  }, [address, besoins, companyId, coordinates, dechets, navigate, productions, profileData])

  if (loading) {
    return <ProfileLoadingSkeleton />
  }

  if (!hasProfile) {
    return <CompanyCreateForm />
  }

  const progressSections = [
    { label: 'Informations générales', completed: Boolean(generalInfo.nom_entreprise) },
    { label: 'Productions', completed: productions.length > 0 },
    { label: 'Besoins', completed: besoins.length > 0 },
    { label: 'Géolocalisation', completed: Boolean(address) },
  ]

  const addButtonContent = (
    <>
      <Plus className="h-4 w-4" />
      Ajouter
    </>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Ma fiche entreprise</h1>
          <p className="text-slate-600">Complétez votre profil pour maximiser vos opportunités</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleOpenPublicPreview}
            disabled={!profileData?.id}
            title={!profileData?.id ? "Profil public indisponible" : undefined}
          >
            Aperçu public
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
        </div>
      </div>

      <ProfileProgressCard sections={progressSections} />

      <div className="space-y-8">
        <GeneralInformationSection
          value={generalInfo}
          isEditing={isEditingGeneral}
          onFieldChange={handleFieldChange}
          onToggle={handleToggleGeneralEditing}
          onSave={saveGeneralInfo}
          onCancel={resetGeneralInfo}
        />

        <ResourceSection
          title="Productions et services"
          icon={Package}
          items={productions}
          type="production"
          onAdd={() => openResourceDialog('production')}
          addButtonContent={addButtonContent}
          onEdit={openResourceDialog}
          onDelete={handleDeleteRequest}
          emptyState={{
            icon: Package,
            message: 'Aucune production renseignée',
            actionLabel: 'Ajouter une production',
          }}
        />

        <ResourceSection
          title="Besoins et recherches"
          icon={Search}
          items={besoins}
          type="besoin"
          onAdd={() => openResourceDialog('besoin')}
          addButtonContent={addButtonContent}
          onEdit={openResourceDialog}
          onDelete={handleDeleteRequest}
          emptyState={{
            icon: Search,
            message: 'Aucun besoin renseigné',
            actionLabel: 'Ajouter un besoin',
          }}
        />

        <ResourceSection
          title="Déchets et sous-produits"
          icon={Recycle}
          items={dechets}
          type="dechet"
          onAdd={() => openResourceDialog('dechet')}
          addButtonContent={addButtonContent}
          onEdit={openResourceDialog}
          onDelete={handleDeleteRequest}
          emptyState={{
            icon: Recycle,
            message: 'Aucun déchet renseigné',
            actionLabel: 'Ajouter un déchet',
          }}
        />

        <GeolocationSection
          address={address}
          radius={radius}
          coordinates={coordinates}
          onSave={saveGeolocation}
          isSaving={isSavingGeolocation}
        />
      </div>

      <ResourceDialog
        open={resourceDialog.open}
        type={resourceDialog.type}
        mode={resourceDialog.mode}
        initialValues={resourceDialog.initialValues}
        onClose={closeResourceDialog}
        onSubmit={saveResource}
        isSubmitting={isSavingResource}
      />

      <ConfirmDialog
        open={deleteDialogState.open}
        title="Supprimer cet élément ?"
        description="Cette action est définitive et supprimera la ressource de votre fiche entreprise."
        confirmLabel="Supprimer"
        onConfirm={confirmDeletion}
        onCancel={closeDeleteDialog}
        isLoading={isDeletingResource}
      />
    </div>
  )
}