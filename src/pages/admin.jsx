
import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Download,
  Eye,
  LineChart,
  Loader2,
  Minus,
  Pencil,
  PieChart,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react"
import {
  useAdminCompanies,
  useAdminMetrics,
  useAdminSystemStats,
} from "@/hooks/useAdminDashboard"
import { exportAdminCompanies } from "@/services/AdminApi"

const PAGE_SIZE = 10

const STATUS_TONE_CLASSES = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  pending: "border-amber-100 bg-amber-50 text-amber-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
}

const TREND_TONE_CLASSES = {
  positive: "text-emerald-600",
  negative: "text-red-500",
  warning: "text-amber-600",
  neutral: "text-slate-500",
}

const TREND_ICONS = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  warning: AlertTriangle,
  neutral: Minus,
}

const CARD_ICONS = {
  companies: Building2,
  connections: Users,
  activity: Activity,
  moderation: AlertTriangle,
}

const SYSTEM_ICON_MAP = {
  registrations: BarChart3,
  sectors: PieChart,
  connections: LineChart,
}

const integerFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const relativeFormatter = new Intl.RelativeTimeFormat("fr", {
  numeric: "auto",
})

function formatCardValue(value, type = "number") {
  if (value === undefined || value === null) {
    return "—"
  }

  const numeric = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(numeric)) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
    return "—"
  }

  if (type === "percentage") {
    return `${percentFormatter.format(numeric)}%`
  }

  return integerFormatter.format(numeric)
}

function formatDateValue(date, fallbackLabel) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return dateFormatter.format(date)
  }

  if (fallbackLabel && typeof fallbackLabel === "string") {
    return fallbackLabel
  }

  return "—"
}

function formatRelativeTimeValue(date, fallbackLabel) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
    const abs = Math.abs(diffSeconds)

    if (abs < 60) {
      return relativeFormatter.format(diffSeconds, "second")
    }
    if (abs < 3600) {
      return relativeFormatter.format(Math.round(diffSeconds / 60), "minute")
    }
    if (abs < 86400) {
      return relativeFormatter.format(Math.round(diffSeconds / 3600), "hour")
    }
    if (abs < 2629800) {
      return relativeFormatter.format(Math.round(diffSeconds / 86400), "day")
    }
    if (abs < 31557600) {
      return relativeFormatter.format(Math.round(diffSeconds / 2629800), "month")
    }

    return relativeFormatter.format(Math.round(diffSeconds / 31557600), "year")
  }

  if (fallbackLabel && typeof fallbackLabel === "string") {
    return fallbackLabel
  }

  return "—"
}

function buildPaginationSequence(current, total) {
  if (!total || total <= 1) {
    return [1]
  }

  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const sequence = [1]

  if (current > 3) {
    sequence.push("ellipsis-start")
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let page = start; page <= end; page += 1) {
    sequence.push(page)
  }

  if (current < total - 2) {
    sequence.push("ellipsis-end")
  }

  sequence.push(total)
  return sequence
}

function sanitizeStatusValue(value) {
  if (value === undefined || value === null) {
    return null
  }
  return String(value).toLowerCase().replace(/[_\s]+/g, "-")
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("all")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
    }, 350)

    return () => {
      clearTimeout(handle)
    }
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, sectorFilter, debouncedSearch])

  const companyQueryParams = useMemo(() => {
    const normalizedStatus =
      statusFilter === "all" || !statusFilter ? undefined : statusFilter
    const normalizedSector =
      sectorFilter === "all" || !sectorFilter ? undefined : sectorFilter
    const normalizedSearch = debouncedSearch || undefined

    return {
      page,
      perPage: PAGE_SIZE,
      status: normalizedStatus,
      sector: normalizedSector,
      search: normalizedSearch,
    }
  }, [page, statusFilter, sectorFilter, debouncedSearch])

  const metricsQuery = useAdminMetrics()
  const companiesQuery = useAdminCompanies(companyQueryParams)
  const statsQuery = useAdminSystemStats()

  const metricsData = metricsQuery.data?.metrics

  const summaryCards = useMemo(() => {
    const cards = []
    if (!metricsData) {
      return cards
    }

    const companyCard = metricsData.companies ?? {}
    const connectionsCard = metricsData.connections ?? {}
    const activityCard = metricsData.activity ?? {}
    const moderationCard = metricsData.moderation ?? {}

    const moderationValue =
      typeof moderationCard.value === "number" ? moderationCard.value : null
    const moderationTone =
      moderationCard.changeType ??
      (moderationValue && moderationValue > 0 ? "warning" : "positive")
    const moderationChange =
      moderationCard.changeLabel ??
      (moderationValue && moderationValue > 0
        ? "Action requise"
        : "Aucune action")

    cards.push({
      key: "companies",
      title: "Entreprises",
      value: formatCardValue(companyCard.value, "number"),
      rawValue: companyCard.value,
      subtitle: companyCard.subtitle ?? "Total inscrites",
      change: companyCard.changeLabel,
      changeTone: companyCard.changeType ?? "neutral",
      Icon: CARD_ICONS.companies,
    })

    cards.push({
      key: "connections",
      title: "Connexions",
      value: formatCardValue(connectionsCard.value, "number"),
      rawValue: connectionsCard.value,
      subtitle: connectionsCard.subtitle ?? "Mises en relation",
      change: connectionsCard.changeLabel,
      changeTone: connectionsCard.changeType ?? "neutral",
      Icon: CARD_ICONS.connections,
    })

    cards.push({
      key: "activity",
      title: "Activité",
      value: formatCardValue(activityCard.value, "percentage"),
      rawValue: activityCard.value,
      subtitle: activityCard.subtitle ?? "Profils complétés",
      change: activityCard.changeLabel,
      changeTone: activityCard.changeType ?? "neutral",
      Icon: CARD_ICONS.activity,
    })

    cards.push({
      key: "moderation",
      title: "Modération",
      value: formatCardValue(moderationCard.value, "number"),
      rawValue: moderationCard.value,
      subtitle: moderationCard.subtitle ?? "En attente",
      change: moderationChange,
      changeTone: moderationTone,
      Icon: CARD_ICONS.moderation,
    })

    return cards
  }, [metricsData])

  const companies = useMemo(
    () => companiesQuery.data?.items ?? [],
    [companiesQuery.data?.items]
  )
  const pagination = companiesQuery.data?.pagination ?? {
    page: 1,
    perPage: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  }

  const totalItems = pagination.totalItems ?? companies.length ?? 0
  const paginationSequence = useMemo(
    () => buildPaginationSequence(pagination.page ?? 1, pagination.totalPages ?? 1),
    [pagination.page, pagination.totalPages]
  )

  const statusOptions = useMemo(() => {
    const options = new Map()
    const apiOptions = companiesQuery.data?.filters?.statuses ?? []
    apiOptions.forEach((option) => {
      if (!option?.value) {
        return
      }
      options.set(String(option.value), option.label ?? String(option.value))
    })

    companies.forEach((company) => {
      if (!company) return
      const value =
        (company.rawStatus && String(company.rawStatus)) ??
        sanitizeStatusValue(company.status)
      if (!value) {
        return
      }
      if (!options.has(value)) {
        options.set(value, company.status ?? value)
      }
    })

    return [
      { value: "all", label: "Tous" },
      ...Array.from(options.entries()).map(([value, label]) => ({
        value,
        label,
      })),
    ]
  }, [companies, companiesQuery.data?.filters?.statuses])

  const sectorOptions = useMemo(() => {
    const options = new Map()
    const apiOptions = companiesQuery.data?.filters?.sectors ?? []
    apiOptions.forEach((option) => {
      if (!option?.value) return
      const value = String(option.value)
      if (!options.has(value)) {
        options.set(value, option.label ?? value)
      }
    })

    companies.forEach((company) => {
      if (!company?.sector) return
      const value = company.sector
      if (!options.has(value)) {
        options.set(value, value)
      }
    })

    return [
      { value: "all", label: "Tous secteurs" },
      ...Array.from(options.entries()).map(([value, label]) => ({
        value,
        label,
      })),
    ]
  }, [companies, companiesQuery.data?.filters?.sectors])

  const systemCards = statsQuery.data?.cards ?? []

  const displayStart =
    totalItems === 0
      ? 0
      : (pagination.page - 1) * pagination.perPage + 1
  const displayEnd =
    totalItems === 0
      ? 0
      : Math.min(pagination.page * pagination.perPage, totalItems)

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value)
  }

  const handleSectorChange = (event) => {
    setSectorFilter(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const { blob, filename } = await exportAdminCompanies({
        status:
          companyQueryParams.status === "all"
            ? undefined
            : companyQueryParams.status,
        sector:
          companyQueryParams.sector === "all"
            ? undefined
            : companyQueryParams.sector,
        search: companyQueryParams.search,
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Export lancé avec succès.")
    } catch (error) {
      console.error("Error exporting companies:", error)
      toast.error("Impossible d'exporter les entreprises pour le moment.")
    } finally {
      setExporting(false)
    }
  }

  const handleAddCompany = () => {
    toast.info("Creation d'entreprise disponible prochainement.")
  }

  const handleViewCompany = (companyId) => {
    if (!companyId) {
      toast.error("Impossible d'ouvrir cette fiche entreprise.")
      return
    }
    navigate(`/companies/${companyId}`)
  }

  const handleEditCompany = (companyId) => {
    if (!companyId) {
      toast.error("Impossible d'éditer cette entreprise.")
      return
    }
    toast.info("Édition avancée à venir.")
  }

  const handleDeleteCompany = (companyId) => {
    if (!companyId) {
      toast.error("Entreprise introuvable.")
      return
    }
    toast.info("Suppression depuis l'interface admin à venir.")
  }

  const handleChangePage = (nextPage) => {
    if (
      typeof nextPage === "number" &&
      nextPage >= 1 &&
      nextPage <= (pagination.totalPages || 1)
    ) {
      setPage(nextPage)
    }
  }

  const trendToneClass = (tone) =>
    TREND_TONE_CLASSES[tone] ?? TREND_TONE_CLASSES.neutral

  const renderTrend = (tone, label) => {
    if (!label) {
      return <span className="text-slate-400 text-sm">Données indisponibles</span>
    }
    const Icon = TREND_ICONS[tone] ?? TREND_ICONS.neutral
    return (
      <span className={`flex items-center text-sm font-medium ${trendToneClass(tone)} gap-1`}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Tableau de bord administrateur
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Surveillez l'activité des entreprises et les actions de modération
              en temps réel.
            </p>
          </div>

          {metricsQuery.isError ? (
            <Card className="border border-red-200 bg-red-50 text-red-700">
              <CardHeader>
                <CardTitle>Impossible de charger les indicateurs</CardTitle>
                <CardDescription>
                  Vérifiez votre connexion ou réessayez plus tard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-100"
                  onClick={() => metricsQuery.refetch()}
                >
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {metricsQuery.isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`metrics-skeleton-${index}`} className="border border-slate-200">
                      <CardHeader>
                        <Skeleton className="h-4 w-24 bg-slate-200" />
                        <Skeleton className="mt-2 h-8 w-20 bg-slate-200" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-32 bg-slate-200" />
                      </CardContent>
                    </Card>
                  ))
                : summaryCards.map((card) => {
                    const tone = card.changeTone ?? "neutral"
                    const Icon = card.Icon
                    return (
                      <Card key={card.key} className="border border-slate-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-600">
                                {card.title}
                              </p>
                              <p className="mt-2 text-3xl font-semibold text-slate-900">
                                {card.value}
                              </p>
                            </div>
                            <div className="rounded-full bg-slate-100 p-3 text-slate-600">
                              <Icon className="size-5" aria-hidden="true" />
                            </div>
                          </div>
                          <CardDescription className="mt-2">
                            {card.subtitle}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>{renderTrend(tone, card.change)}</CardContent>
                      </Card>
                    )
                  })}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Gestion des entreprises
              </h2>
              <p className="text-sm text-slate-500">
                Filtrez, analysez ou modifiez les entreprises inscrites.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="mr-2 size-4" aria-hidden="true" />
                )}
                Exporter
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAddCompany}
              >
                <Plus className="mr-2 size-4" aria-hidden="true" />
                Ajouter entreprise
              </Button>
            </div>
          </div>

          <Card className="border border-slate-200">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                <div className="flex flex-1 flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Statut
                    </span>
                    <select
                      className="h-11 w-44 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={handleStatusChange}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Secteur
                    </span>
                    <select
                      className="h-11 w-48 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={sectorFilter}
                      onChange={handleSectorChange}
                    >
                      {sectorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Rechercher une entreprise..."
                    className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {companiesQuery.isError ? (
                <div className="p-6 text-center text-sm text-red-600">
                  Impossible de charger les entreprises.
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-100"
                      onClick={() => companiesQuery.refetch()}
                    >
                      Réessayer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Entreprise</th>
                        <th className="px-6 py-3 font-semibold">Secteur</th>
                        <th className="px-6 py-3 font-semibold">Statut</th>
                        <th className="px-6 py-3 font-semibold">Inscription</th>
                        <th className="px-6 py-3 font-semibold">
                          Dernière activité
                        </th>
                        <th className="px-6 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {companiesQuery.isLoading
                        ? Array.from({ length: 5 }).map((_, index) => (
                            <tr key={`company-skeleton-${index}`}>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-40 bg-slate-200" />
                                <Skeleton className="mt-2 h-3 w-32 bg-slate-200" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-24 bg-slate-200" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-24 bg-slate-200" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-28 bg-slate-200" />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Skeleton className="size-5 rounded bg-slate-200" />
                                  <Skeleton className="size-5 rounded bg-slate-200" />
                                  <Skeleton className="size-5 rounded bg-slate-200" />
                                </div>
                              </td>
                            </tr>
                          ))
                        : companies.length === 0 ? (
                            <tr>
                              <td
                                className="px-6 py-10 text-center text-sm text-slate-500"
                                colSpan={6}
                              >
                                Aucune entreprise ne correspond à votre recherche.
                              </td>
                            </tr>
                          )
                        : companies.map((company) => {
                            const badgeTone =
                              STATUS_TONE_CLASSES[company.statusTone] ??
                              STATUS_TONE_CLASSES.inactive

                            return (
                              <tr key={company.id ?? company.name} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">
                                      {company.name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {company.email ?? "—"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {company.sector ?? "—"}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge
                                    className={`border px-3 py-1 text-xs font-medium ${badgeTone}`}
                                  >
                                    {company.status ?? "Inconnu"}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {formatDateValue(
                                    company.createdAt,
                                    company.createdAtLabel
                                  )}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {formatRelativeTimeValue(
                                    company.lastActivityAt,
                                    company.lastActivityLabel
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3 text-slate-400">
                                    <button
                                      type="button"
                                      className="transition-colors hover:text-blue-600"
                                      aria-label={`Voir ${company.name}`}
                                      onClick={() => handleViewCompany(company.id)}
                                    >
                                      <Eye className="size-4" aria-hidden="true" />
                                    </button>
                                    <button
                                      type="button"
                                      className="transition-colors hover:text-amber-500"
                                      aria-label={`Modifier ${company.name}`}
                                      onClick={() => handleEditCompany(company.id)}
                                    >
                                      <Pencil className="size-4" aria-hidden="true" />
                                    </button>
                                    <button
                                      type="button"
                                      className="transition-colors hover:text-red-500"
                                      aria-label={`Supprimer ${company.name}`}
                                      onClick={() => handleDeleteCompany(company.id)}
                                    >
                                      <Trash2 className="size-4" aria-hidden="true" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>

            <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>
                Affichage de {displayStart} à {displayEnd} sur {totalItems} entreprises
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => handleChangePage(pagination.page - 1)}
                  disabled={pagination.page <= 1 || companiesQuery.isLoading}
                >
                  Précédent
                </Button>
                {paginationSequence.map((entry, index) => {
                  if (typeof entry === "string") {
                    return (
                      <span key={`${entry}-${index}`} className="px-2 text-slate-400">
                        …
                      </span>
                    )
                  }
                  const isActive = entry === pagination.page
                  return (
                    <Button
                      key={entry}
                      variant={isActive ? "default" : "outline"}
                      className={
                        isActive
                          ? "bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                          : "border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      }
                      onClick={() => handleChangePage(entry)}
                      disabled={companiesQuery.isLoading}
                    >
                      {entry}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  className="border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => handleChangePage(pagination.page + 1)}
                  disabled={
                    pagination.page >= pagination.totalPages ||
                    companiesQuery.isLoading
                  }
                >
                  Suivant
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Statistiques système
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {statsQuery.isError ? (
              <Card className="border border-red-200 bg-red-50 text-red-700 md:col-span-3">
                <CardHeader>
                  <CardTitle>Statistiques indisponibles</CardTitle>
                  <CardDescription>
                    Impossible de récupérer les statistiques du système.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-100"
                    onClick={() => statsQuery.refetch()}
                  >
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : statsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={`system-skeleton-${index}`} className="border border-slate-200">
                  <CardHeader className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-12 rounded-full bg-slate-200" />
                      <Skeleton className="h-4 w-32 bg-slate-200" />
                    </div>
                    <Skeleton className="h-4 w-40 bg-slate-200" />
                  </CardHeader>
                </Card>
              ))
            ) : (
              systemCards.map((stat) => {
                const Icon =
                  SYSTEM_ICON_MAP[stat.key] ?? SYSTEM_ICON_MAP.registrations
                const tone = stat.changeType ?? "neutral"
                const valueDisplay =
                  stat.key === "sectors" && stat.valueLabel
                    ? stat.valueLabel
                    : formatCardValue(
                        stat.value,
                        stat.key === "activity" || stat.key === "sectors"
                          ? "percentage"
                          : "number"
                      )

                  return (
                  <Card
                    key={stat.key}
                    className="border border-slate-200 bg-white text-slate-700"
                  >
                    <CardHeader className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-slate-100 p-3">
                            <Icon className="size-5 text-slate-500" />
                          </div>
                          <CardTitle className="text-base font-semibold text-slate-900">
                            {stat.title}
                          </CardTitle>
                        </div>
                        <span className="text-xl font-semibold text-slate-900">
                          {valueDisplay}
                        </span>
                      </div>
                      <CardDescription className={trendToneClass(tone)}>
                        {stat.changeLabel ?? "Aucune donnée disponible"}
                      </CardDescription>
                      {stat.key === "sectors" && stat.valueLabel && (
                        <p className="text-sm text-slate-500">
                          Secteur principal :{" "}
                          <span className="font-medium text-slate-900">
                            {stat.valueLabel}
                          </span>
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                )
              })
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

