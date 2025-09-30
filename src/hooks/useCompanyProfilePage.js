import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useCompanyProfile,
  useUpdateCompanyGeneral,
  useProductions,
  useAddProduction,
  useUpdateProduction,
  useDeleteProduction,
  useBesoins,
  useAddBesoin,
  useUpdateBesoin,
  useDeleteBesoin,
  useDechets,
  useAddDechet,
  useUpdateDechet,
  useDeleteDechet,
  useGeolocation,
  useUpdateGeolocation,
} from './useCompanyProfile'

const DEFAULT_GENERAL_INFO = {
  nom_entreprise: '',
  secteur: '',
  description: '',
}

const DEFAULT_ADDRESS = 'Zone Industrielle des Paluds, 13400 Aubagne'

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

const RESOURCE_DIALOG_INITIAL_STATE = {
  open: false,
  type: null,
  mode: 'create',
  item: null,
}

export function useCompanyProfilePage() {
  const { data: profileData, isLoading: profileLoading } = useCompanyProfile()
  const { data: productions = [], isLoading: productionsLoading } = useProductions()
  const { data: besoins = [], isLoading: besoinsLoading } = useBesoins()
  const { data: dechets = [], isLoading: dechetsLoading } = useDechets()
  const { data: geolocation, isLoading: geolocationLoading } = useGeolocation()

  const updateGeneralMutation = useUpdateCompanyGeneral()
  const addProductionMutation = useAddProduction()
  const updateProductionMutation = useUpdateProduction()
  const deleteProductionMutation = useDeleteProduction()
  const addBesoinMutation = useAddBesoin()
  const updateBesoinMutation = useUpdateBesoin()
  const deleteBesoinMutation = useDeleteBesoin()
  const addDechetMutation = useAddDechet()
  const updateDechetMutation = useUpdateDechet()
  const deleteDechetMutation = useDeleteDechet()
  const updateGeolocationMutation = useUpdateGeolocation()

  const [isEditingGeneral, setIsEditingGeneral] = useState(false)
  const [generalInfo, setGeneralInfo] = useState(DEFAULT_GENERAL_INFO)
  const [resourceDialogState, setResourceDialogState] = useState(
    RESOURCE_DIALOG_INITIAL_STATE
  )

  const loading =
    profileLoading ||
    productionsLoading ||
    besoinsLoading ||
    dechetsLoading ||
    geolocationLoading

  useEffect(() => {
    if (profileData?.general) {
      setGeneralInfo({
        nom_entreprise: profileData.general.nom_entreprise || '',
        secteur: profileData.general.secteur || '',
        description: profileData.general.description || '',
      })
    }
  }, [profileData])

  const getCompanyCoordinates = useCallback(() => {
    if (geolocation?.latitude && geolocation?.longitude) {
      return [parseFloat(geolocation.latitude), parseFloat(geolocation.longitude)]
    }

    if (profileData?.general?.latitude && profileData?.general?.longitude) {
      return [
        parseFloat(profileData.general.latitude),
        parseFloat(profileData.general.longitude),
      ]
    }

    return [43.2965, 5.5507]
  }, [geolocation, profileData])

  const getCompanyAddress = useCallback(() => {
    return geolocation?.address || profileData?.general?.adresse || DEFAULT_ADDRESS
  }, [geolocation, profileData])

  const coordinates = useMemo(() => getCompanyCoordinates(), [getCompanyCoordinates])
  const address = useMemo(() => getCompanyAddress(), [getCompanyAddress])
  const radius = geolocation?.rayon || '25'

  const toggleGeneralEditing = useCallback(() => {
    setIsEditingGeneral((prev) => !prev)
  }, [])

  const resetGeneralInfo = useCallback(() => {
    if (profileData?.general) {
      setGeneralInfo({
        nom_entreprise: profileData.general.nom_entreprise || '',
        secteur: profileData.general.secteur || '',
        description: profileData.general.description || '',
      })
    } else {
      setGeneralInfo(DEFAULT_GENERAL_INFO)
    }
    setIsEditingGeneral(false)
  }, [profileData])

  const saveGeneralInfo = useCallback(() => {
    updateGeneralMutation.mutate(generalInfo, {
      onSuccess: () => setIsEditingGeneral(false),
    })
  }, [generalInfo, updateGeneralMutation])

  const deleteResource = useCallback(
    async (type, item) => {
      const id = typeof item === 'object' ? item.id : item
      if (!id) {
        return
      }

      try {
        switch (type) {
          case 'production':
            await deleteProductionMutation.mutateAsync(id)
            break
          case 'besoin':
            await deleteBesoinMutation.mutateAsync(id)
            break
          case 'dechet':
            await deleteDechetMutation.mutateAsync(id)
            break
          default:
            break
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la ressource', error)
        throw error
      }
    },
    [deleteBesoinMutation, deleteDechetMutation, deleteProductionMutation]
  )

  const addResourceMutations = useMemo(
    () => ({
      production: addProductionMutation,
      besoin: addBesoinMutation,
      dechet: addDechetMutation,
    }),
    [addProductionMutation, addBesoinMutation, addDechetMutation]
  )

  const updateResourceMutations = useMemo(
    () => ({
      production: updateProductionMutation,
      besoin: updateBesoinMutation,
      dechet: updateDechetMutation,
    }),
    [updateProductionMutation, updateBesoinMutation, updateDechetMutation]
  )

  const openResourceDialog = useCallback((type, item = null) => {
    if (!type) return

    setResourceDialogState(() => ({
      open: true,
      type,
      mode: item ? 'edit' : 'create',
      item: item ? { ...item } : null,
    }))
  }, [])

  const closeResourceDialog = useCallback(() => {
    setResourceDialogState(() => ({ ...RESOURCE_DIALOG_INITIAL_STATE }))
  }, [])

  const saveResource = useCallback(
    async (values) => {
      const { type, mode, item } = resourceDialogState
      if (!type) return

      const isEdit = mode === 'edit' && item?.id
      const mutation = isEdit
        ? updateResourceMutations[type]?.mutateAsync
        : addResourceMutations[type]?.mutateAsync

      if (!mutation) return

      try {
        if (isEdit) {
          await mutation({ id: item.id, ...values })
        } else {
          await mutation(values)
        }
        closeResourceDialog()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la ressource', error)
      }
    },
    [addResourceMutations, closeResourceDialog, resourceDialogState, updateResourceMutations]
  )

  const resourceDialog = useMemo(() => {
    const { type, item } = resourceDialogState
    if (!type) {
      return { ...resourceDialogState, initialValues: null }
    }

    const defaults = RESOURCE_DEFAULTS[type] || {}
    const baseValues = item || {}

    return {
      ...resourceDialogState,
      initialValues: {
        ...defaults,
        ...baseValues,
        traitement:
          baseValues.traitement !== undefined
            ? Boolean(baseValues.traitement)
            : defaults.traitement,
        urgence: baseValues.urgence || defaults.urgence,
      },
    }
  }, [resourceDialogState])

  const isSavingResource =
    addProductionMutation.isPending ||
    updateProductionMutation.isPending ||
    addBesoinMutation.isPending ||
    updateBesoinMutation.isPending ||
    addDechetMutation.isPending ||
    updateDechetMutation.isPending

  const isDeletingResource =
    deleteProductionMutation.isPending ||
    deleteBesoinMutation.isPending ||
    deleteDechetMutation.isPending

  const saveGeolocation = useCallback(
    async (values) => {
      try {
        await updateGeolocationMutation.mutateAsync(values)
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la géolocalisation', error)
        throw error
      }
    },
    [updateGeolocationMutation]
  )

  return {
    loading,
    hasProfile: Boolean(profileData),
    profileData,
    productions,
    besoins,
    dechets,
    geolocation,
    address,
    coordinates,
    radius,
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
    saveGeolocation,
    isSavingGeolocation: updateGeolocationMutation.isPending,
  }
}

export default useCompanyProfilePage
