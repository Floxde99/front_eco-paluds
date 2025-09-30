import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCompanyProfile,
  createCompany,
  updateCompanyGeneral,
  getProductions,
  addProduction,
  updateProduction,
  deleteProduction,
  getBesoins,
  addBesoin,
  updateBesoin,
  deleteBesoin,
  getDechets,
  addDechet,
  updateDechet,
  deleteDechet,
  updateGeolocation,
  getGeolocation
} from '@/services/CompanyProfileApi'

// Query keys for company profile - centralized for consistency
export const companyKeys = {
  all: ['company'],
  profile: () => [...companyKeys.all, 'profile'],
  general: () => [...companyKeys.all, 'general'],
  productions: () => [...companyKeys.all, 'productions'],
  besoins: () => [...companyKeys.all, 'besoins'],
  dechets: () => [...companyKeys.all, 'dechets'],
  geolocation: () => [...companyKeys.all, 'geolocation'],
}

// ===================
// MAIN PROFILE HOOKS
// ===================

/**
 * Hook to fetch complete company profile data
 */
export function useCompanyProfile() {
  return useQuery({
    queryKey: companyKeys.profile(),
    queryFn: async () => {
      try {
        const data = await getCompanyProfile()
        return data
      } catch (error) {
        // 404 means no company profile exists yet - this is normal for new users
        if (error?.response?.status === 404) {
          return null
        }
        console.error('❌ Error fetching company profile:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry 404 errors - no company profile exists
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to create a new company profile
 */
export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCompany,
    onSuccess: (newCompany) => {
      // Transform the response to match our expected format
      const transformedData = {
        general: {
          nom_entreprise: newCompany.name,
          secteur: newCompany.sector,
          description: newCompany.description,
          phone: newCompany.phone,
          email: newCompany.email,
          website: newCompany.website,
          siret: newCompany.siret
        },
        productions: [],
        besoins: [],
        dechets: [],
        geolocation: {
          address: newCompany.address,
          latitude: newCompany.latitude,
          longitude: newCompany.longitude
        }
      }

      // Set the new company data in cache
      queryClient.setQueryData(companyKeys.profile(), transformedData)
      
      // Invalidate all company-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: companyKeys.all })
      
      toast.success('Entreprise créée avec succès!')
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la création de l\'entreprise'
      toast.error(errorMessage)
      console.error('❌ Error creating company:', error)
    }
  })
}

/**
 * Hook to update company general information with optimistic updates
 */
export function useUpdateCompanyGeneral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCompanyGeneral,
    onMutate: async (newGeneralData) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: companyKeys.profile() })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(companyKeys.profile())

      // Optimistically update
      queryClient.setQueryData(companyKeys.profile(), (old) => {
        if (!old) return old
        return {
          ...old,
          general: {
            ...old.general,
            ...newGeneralData
          }
        }
      })

      return { previousProfile }
    },
    onError: (err, newGeneralData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(companyKeys.profile(), context.previousProfile)
      }
      console.error('❌ Error updating company general info:', err)
      toast.error('Erreur lors de la mise à jour des informations générales')
    },
    onSuccess: () => {
      toast.success('Informations générales mises à jour')
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
    },
  })
}

// ===================
// PRODUCTIONS HOOKS
// ===================

/**
 * Hook to fetch company productions
 */
export function useProductions() {
  return useQuery({
    queryKey: companyKeys.productions(),
    queryFn: async () => {
      try {
        const data = await getProductions()
        return data
      } catch (error) {
        // 404 means no productions exist yet - return empty array
        if (error?.response?.status === 404) {
          return []
        }
        console.error('❌ Error fetching productions:', error)
        throw error
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to add new production
 */
export function useAddProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addProduction,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: companyKeys.productions() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Production ajoutée avec succès')
    },
    onError: (err) => {
      console.error('❌ Error adding production:', err)
      toast.error('Erreur lors de l\'ajout de la production')
    },
  })
}

/**
 * Hook to update production
 */
export function useUpdateProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateProduction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.productions() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Production mise à jour')
    },
    onError: (err) => {
      console.error('❌ Error updating production:', err)
      toast.error('Erreur lors de la mise à jour de la production')
    },
  })
}

/**
 * Hook to delete production
 */
export function useDeleteProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.productions() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Production supprimée')
    },
    onError: (err) => {
      console.error('❌ Error deleting production:', err)
      toast.error('Erreur lors de la suppression de la production')
    },
  })
}

// ===================
// BESOINS HOOKS
// ===================

/**
 * Hook to fetch company besoins
 */
export function useBesoins() {
  return useQuery({
    queryKey: companyKeys.besoins(),
    queryFn: async () => {
      try {
        const data = await getBesoins()
        return data
      } catch (error) {
        // 404 means no besoins exist yet - return empty array
        if (error?.response?.status === 404) {
          return []
        }
        console.error('❌ Error fetching besoins:', error)
        throw error
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to add new besoin
 */
export function useAddBesoin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addBesoin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.besoins() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Besoin ajouté avec succès')
    },
    onError: (err) => {
      console.error('❌ Error adding besoin:', err)
      toast.error('Erreur lors de l\'ajout du besoin')
    },
  })
}

/**
 * Hook to update besoin
 */
export function useUpdateBesoin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateBesoin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.besoins() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Besoin mis à jour')
    },
    onError: (err) => {
      console.error('❌ Error updating besoin:', err)
      toast.error('Erreur lors de la mise à jour du besoin')
    },
  })
}

/**
 * Hook to delete besoin
 */
export function useDeleteBesoin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBesoin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.besoins() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Besoin supprimé')
    },
    onError: (err) => {
      console.error('❌ Error deleting besoin:', err)
      toast.error('Erreur lors de la suppression du besoin')
    },
  })
}

// ===================
// DECHETS HOOKS
// ===================

/**
 * Hook to fetch company dechets
 */
export function useDechets() {
  return useQuery({
    queryKey: companyKeys.dechets(),
    queryFn: async () => {
      try {
        const data = await getDechets()
        return data
      } catch (error) {
        // 404 means no dechets exist yet - return empty array
        if (error?.response?.status === 404) {
          return []
        }
        console.error('❌ Error fetching dechets:', error)
        throw error
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to add new dechet
 */
export function useAddDechet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addDechet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.dechets() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Déchet ajouté avec succès')
    },
    onError: (err) => {
      console.error('❌ Error adding dechet:', err)
      toast.error('Erreur lors de l\'ajout du déchet')
    },
  })
}

/**
 * Hook to update dechet
 */
export function useUpdateDechet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateDechet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.dechets() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Déchet mis à jour')
    },
    onError: (err) => {
      console.error('❌ Error updating dechet:', err)
      toast.error('Erreur lors de la mise à jour du déchet')
    },
  })
}

/**
 * Hook to delete dechet
 */
export function useDeleteDechet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDechet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.dechets() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Déchet supprimé')
    },
    onError: (err) => {
      console.error('❌ Error deleting dechet:', err)
      toast.error('Erreur lors de la suppression du déchet')
    },
  })
}

// ===================
// GEOLOCATION HOOKS
// ===================

/**
 * Hook to fetch geolocation data
 */
export function useGeolocation() {
  return useQuery({
    queryKey: companyKeys.geolocation(),
    queryFn: async () => {
      try {
        const data = await getGeolocation()
        return data
      } catch (error) {
        // 404 means no geolocation data exists yet - return null
        if (error?.response?.status === 404) {
          return null
        }
        console.error('❌ Error fetching geolocation:', error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (geolocation changes less frequently)
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to update geolocation
 */
export function useUpdateGeolocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGeolocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.geolocation() })
      queryClient.invalidateQueries({ queryKey: companyKeys.profile() })
      toast.success('Géolocalisation mise à jour')
    },
    onError: (err) => {
      console.error('❌ Error updating geolocation:', err)
      toast.error('Erreur lors de la mise à jour de la géolocalisation')
    },
  })
}

// ===================
// UTILITY HOOKS
// ===================

/**
 * Combined hook that fetches all company data
 */
export function useCompanyData() {
  const profile = useCompanyProfile()
  const productions = useProductions()
  const besoins = useBesoins()
  const dechets = useDechets()
  const geolocation = useGeolocation()

  return {
    profile: profile.data,
    productions: productions.data,
    besoins: besoins.data,
    dechets: dechets.data,
    geolocation: geolocation.data,
    loading: profile.isLoading || productions.isLoading || besoins.isLoading || dechets.isLoading || geolocation.isLoading,
    error: profile.error || productions.error || besoins.error || dechets.error || geolocation.error,
    refetch: () => {
      profile.refetch()
      productions.refetch()
      besoins.refetch()
      dechets.refetch()
      geolocation.refetch()
    }
  }
}

/**
 * Hook to invalidate all company-related cache
 */
export function useInvalidateCompany() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: companyKeys.all })
  }
}