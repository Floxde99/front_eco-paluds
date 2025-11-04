import api from './Api'

function getNestedValue(source, path) {
  if (!source || typeof source !== 'object') {
    return undefined
  }

  const segments = Array.isArray(path) ? path : String(path).split('.')

  let current = source
  for (const segment of segments) {
    if (
      current &&
      typeof current === 'object' &&
      segment in current &&
      current[segment] !== undefined
    ) {
      current = current[segment]
    } else {
      return undefined
    }
  }

  return current
}

function pickFirst(source, paths, fallback) {
  if (source == null) {
    return fallback
  }

  if (!Array.isArray(paths)) {
    return pickFirst(source, [paths], fallback)
  }

  for (const path of paths) {
    const value =
      typeof path === 'string' || Array.isArray(path)
        ? getNestedValue(source, path)
        : path(source)
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return fallback
}

function coerceNumber(value) {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }

  if (typeof value === 'string') {
    const normalized = value
      .replace(/\s/g, '')
      .replace(/[%+]/g, '')
      .replace(',', '.')
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? null : parsed
  }

  if (typeof value === 'object') {
    if ('value' in value) {
      return coerceNumber(value.value)
    }
    if ('count' in value) {
      return coerceNumber(value.count)
    }
    if ('total' in value) {
      return coerceNumber(value.total)
    }
    if ('amount' in value) {
      return coerceNumber(value.amount)
    }
  }

  return null
}

function coercePercent(value) {
  const numeric = coerceNumber(value)
  if (numeric === null) {
    return null
  }

  if (Math.abs(numeric) <= 1) {
    return Number((numeric * 100).toFixed(2))
  }

  return Number(numeric.toFixed(2))
}

function coerceString(value) {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : null
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'object') {
    if ('label' in value) {
      return coerceString(value.label)
    }
    if ('name' in value) {
      return coerceString(value.name)
    }
    if ('title' in value) {
      return coerceString(value.title)
    }
    if ('value' in value && typeof value.value !== 'object') {
      return coerceString(value.value)
    }
  }

  return null
}

function coerceDate(value) {
  if (!value && value !== 0) {
    return null
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === 'number') {
    const fromTimestamp =
      value > 10_000_000_000 ? new Date(value) : new Date(value * 1000)
    return Number.isNaN(fromTimestamp.getTime()) ? null : fromTimestamp
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return null
    }

    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return null
}

function determineTrendType(type, { numeric, percent } = {}) {
  if (type) {
    const normalized = String(type).toLowerCase()
    if (
      ['positive', 'increase', 'up', 'growth', 'success'].includes(normalized)
    ) {
      return 'positive'
    }
    if (
      ['negative', 'decrease', 'down', 'drop', 'decline'].includes(normalized)
    ) {
      return 'negative'
    }
    if (['warning', 'alert', 'attention', 'pending'].includes(normalized)) {
      return 'warning'
    }
    if (['neutral', 'stable', 'none'].includes(normalized)) {
      return 'neutral'
    }
  }

  if (percent !== null && percent !== undefined) {
    if (percent > 0) return 'positive'
    if (percent < 0) return 'negative'
    return 'neutral'
  }

  if (numeric !== null && numeric !== undefined) {
    if (numeric > 0) return 'positive'
    if (numeric < 0) return 'negative'
    return 'neutral'
  }

  return 'neutral'
}

const numberFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

function formatChangeLabel({ label, percent, numeric, unit, period }) {
  if (label) {
    return label
  }

  const hasPercent = percent !== null && percent !== undefined
  const hasNumeric = numeric !== null && numeric !== undefined

  if (!hasPercent && !hasNumeric) {
    return period ? `Stable ${period}` : 'Stable'
  }

  const value = hasPercent ? percent : numeric
  const appliedUnit = hasPercent ? '%' : unit ?? ''
  const formatted = numberFormatter.format(value)
  const prefix = value > 0 ? '+' : value < 0 ? '−' : ''
  const finalValue =
    value < 0 ? formatted.replace('-', '') : `${prefix}${formatted}`

  if (period) {
    return `${finalValue}${appliedUnit ? `${appliedUnit} ` : ''}${period}`
  }

  return `${finalValue}${appliedUnit}`
}

function mapMetricBlock(raw, defaults = {}) {
  const valueRaw = pickFirst(raw, [
    'total',
    'count',
    'value',
    'current',
    'amount',
    'totalCount',
    'currentValue',
  ])

  const subtitle =
    pickFirst(raw, ['subtitle', 'description', 'label']) ??
    defaults.subtitle ??
    null
  const period =
    pickFirst(raw, ['period', 'window', 'rangeLabel', 'comparingPeriod']) ??
    defaults.period ??
    null

  const changeLabel = coerceString(
    pickFirst(raw, [
      'changeLabel',
      'deltaLabel',
      'trendLabel',
      'variationLabel',
      'changeText',
    ])
  )

  const changeNumeric = coerceNumber(
    pickFirst(raw, [
      'change',
      'delta',
      'difference',
      'variation',
      'changeValue',
      'trendValue',
      'change_count',
    ])
  )

  const changePercent = coercePercent(
    pickFirst(raw, [
      'changePercent',
      'deltaPercent',
      'variationPercent',
      'growth',
      'growthRate',
      'trendPercent',
      'change_rate',
    ])
  )

  const trendType = determineTrendType(
    pickFirst(raw, [
      'changeType',
      'trend',
      'trendType',
      'direction',
      'status',
      'tone',
    ]),
    { numeric: changeNumeric, percent: changePercent }
  )

  const unit =
    coerceString(pickFirst(raw, ['unit', 'suffix', 'unitLabel'])) ??
    defaults.unit ??
    ''

  let value = coerceNumber(valueRaw)

  if (defaults.valueType === 'percentage' && value !== null) {
    value = value <= 1 ? Number((value * 100).toFixed(2)) : value
  }

  return {
    value: value ?? null,
    subtitle,
    period,
    changeLabel: formatChangeLabel({
      label: changeLabel,
      percent: defaults.preferPercent ? changePercent : null,
      numeric: defaults.preferPercent ? null : changeNumeric,
      unit,
      period,
    }),
    changeNumeric,
    changePercent,
    changeType: defaults.overrideTrendType ?? trendType,
    raw,
  }
}

function normalizeMetricsPayload(payload) {
  const root = payload?.metrics ?? payload?.data ?? payload ?? {}

  const companiesBlock =
    root.companies ??
    root.company ??
    pickFirst(root, [['overview', 'companies'], ['totals', 'companies']], {})
  const connectionsBlock =
    root.connections ??
    root.network ??
    pickFirst(root, [['overview', 'connections'], ['totals', 'connections']], {})
  const activityBlock =
    root.activity ??
    root.profiles ??
    root.profileCompletion ??
    pickFirst(root, [['overview', 'activity']], {})
  const moderationBlock =
    root.moderation ??
    root.moderationQueue ??
    pickFirst(root, [['overview', 'moderation']], {})

  const metrics = {
    companies: mapMetricBlock(companiesBlock, {
      subtitle: 'Total inscrites',
      period: 'ce mois',
      unit: '',
      preferPercent: true,
    }),
    connections: mapMetricBlock(connectionsBlock, {
      subtitle: 'Mises en relation',
      period: 'cette semaine',
      unit: '',
      preferPercent: false,
    }),
    activity: mapMetricBlock(activityBlock, {
      subtitle: 'Profils complétés',
      period: 'ce mois',
      unit: '%',
      preferPercent: true,
      valueType: 'percentage',
    }),
    moderation: mapMetricBlock(moderationBlock, {
      subtitle: 'En attente',
      period: 'à traiter',
      unit: '',
      preferPercent: false,
      overrideTrendType:
        (coerceNumber(pickFirst(moderationBlock, ['pending', 'total', 'count'])) ??
          0) > 0
          ? 'warning'
          : undefined,
    }),
  }

  return {
    metrics,
    raw: root,
  }
}

function normalizeDistribution(value) {
  const arrayLike = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.values(value)
      : []

  return arrayLike
    .map((entry) => {
      if (entry == null) return null
      if (typeof entry === 'string') {
        return { label: entry, percent: null, value: null }
      }
      if (typeof entry === 'number') {
        return { label: null, percent: entry, value: entry }
      }
      const percent = coercePercent(
        pickFirst(entry, ['percent', 'percentage', 'ratio', 'share'])
      )
      const value = coerceNumber(
        pickFirst(entry, ['value', 'count', 'total', 'amount', 'quantity'])
      )
      const label =
        coerceString(pickFirst(entry, ['label', 'name', 'sector', 'title'])) ??
        null

      return { label, percent, value }
    })
    .filter(Boolean)
}

function normalizeSystemStatsPayload(payload) {
  const root = payload?.stats ?? payload?.data ?? payload ?? {}

  const registrationsBlock =
    root.registrations ??
    root.signups ??
    root.enrollments ??
    pickFirst(root, [['dashboard', 'registrations']], {})
  const sectorsBlock =
    root.sectors ??
    root.sectorDistribution ??
    pickFirst(root, [['dashboard', 'sectors']], {})
  const connectionsBlock =
    root.connections ??
    root.network ??
    root.matches ??
    pickFirst(root, [['dashboard', 'connections']], {})

  const registrationsValue = coerceNumber(
    pickFirst(registrationsBlock, [
      'thisMonth',
      'current',
      'value',
      'total',
      'count',
    ])
  )
  const registrationsChange = coercePercent(
    pickFirst(registrationsBlock, [
      'changePercent',
      'deltaPercent',
      'variationPercent',
      'growth',
    ])
  )
  const registrationsLabel = formatChangeLabel({
    label: coerceString(
      pickFirst(registrationsBlock, [
        'changeLabel',
        'deltaLabel',
        'trendLabel',
      ])
    ),
    percent: registrationsChange,
    unit: '%',
    period:
      coerceString(
        pickFirst(registrationsBlock, ['period', 'window', 'rangeLabel'])
      ) ?? 'vs mois dernier',
  })
  const registrationsTrend = determineTrendType(
    pickFirst(registrationsBlock, [
      'trend',
      'changeType',
      'direction',
      'status',
    ]),
    { percent: registrationsChange }
  )

  const sectorDistribution = normalizeDistribution(
    pickFirst(sectorsBlock, ['distribution', 'values', 'data', 'sectors'])
  )
  const topSector = sectorDistribution.reduce(
    (acc, current) => {
      if (!current) return acc
      if (!acc) return current
      const currentScore = current.percent ?? current.value ?? 0
      const accScore = acc.percent ?? acc.value ?? 0
      return currentScore > accScore ? current : acc
    },
    sectorDistribution[0] ?? null
  )

  const connectionsValue = coerceNumber(
    pickFirst(connectionsBlock, [
      'total',
      'thisMonth',
      'current',
      'value',
      'count',
    ])
  )
  const connectionsChange = coercePercent(
    pickFirst(connectionsBlock, [
      'changePercent',
      'deltaPercent',
      'growth',
      'trendPercent',
    ])
  )

  const connectionsLabel = formatChangeLabel({
    label: coerceString(
      pickFirst(connectionsBlock, [
        'changeLabel',
        'deltaLabel',
        'trendLabel',
      ])
    ),
    percent: connectionsChange,
    unit: '%',
    period:
      coerceString(
        pickFirst(connectionsBlock, ['period', 'window', 'rangeLabel'])
      ) ?? 'sur 30 jours',
  })

  const connectionsTrend = determineTrendType(
    pickFirst(connectionsBlock, [
      'trend',
      'changeType',
      'direction',
      'status',
    ]),
    { percent: connectionsChange }
  )

  return {
    cards: [
      {
        key: 'registrations',
        title: 'Inscriptions par mois',
        value: registrationsValue,
        changeLabel: registrationsLabel,
        changeType: registrationsTrend,
        raw: registrationsBlock,
      },
      {
        key: 'sectors',
        title: 'Répartition par secteur',
        value:
          topSector?.percent ??
          topSector?.value ??
          (sectorDistribution.length ? 0 : null),
        valueLabel: topSector?.label ?? null,
        changeLabel: topSector
          ? `${numberFormatter.format(
              (topSector.percent ?? topSector.value ?? 0)
            )}% du total`
          : 'Aucune donnée secteur',
        changeType: 'neutral',
        raw: sectorsBlock,
      },
      {
        key: 'connections',
        title: 'Évolution des connexions',
        value: connectionsValue,
        changeLabel: connectionsLabel,
        changeType: connectionsTrend,
        raw: connectionsBlock,
      },
    ],
    raw: root,
  }
}

function normalizeStatus(status) {
  if (!status && status !== 0) {
    return {
      label: 'Inconnu',
      tone: 'inactive',
      value: null,
    }
  }

  const normalized = String(status).toLowerCase()
  const cleaned = normalized.replace(/[_\s-]+/g, ' ')

  if (['active', 'actif', 'approved', 'verified', 'enabled'].includes(cleaned)) {
    return { label: 'Actif', tone: 'success', value: status }
  }

  if (
    [
      'pending',
      'en attente',
      'moderating',
      'awaiting approval',
      'waiting',
      'review',
    ].includes(cleaned)
  ) {
    return { label: 'En attente', tone: 'pending', value: status }
  }

  if (
    [
      'inactive',
      'inactif',
      'disabled',
      'désactivé',
      'archived',
      'suspended',
      'suspendu',
    ].includes(cleaned)
  ) {
    return { label: 'Inactif', tone: 'inactive', value: status }
  }

  if (['rejected', 'refusé', 'blocked', 'bloqué'].includes(cleaned)) {
    return { label: 'Refusé', tone: 'inactive', value: status }
  }

  return { label: status, tone: 'inactive', value: status }
}

function normalizeOptions(options) {
  const arrayLike = Array.isArray(options)
    ? options
    : options && typeof options === 'object'
      ? Object.values(options)
      : []

  const map = new Map()

  arrayLike.forEach((option) => {
    if (option == null) {
      return
    }

    if (typeof option === 'string') {
      const value = option
      if (!map.has(value)) {
        map.set(value, {
          value,
          label: option,
        })
      }
      return
    }

    if (typeof option === 'object') {
      const rawValue =
        option.value ??
        option.id ??
        option.slug ??
        option.code ??
        option.name ??
        option.label
      if (!rawValue) {
        return
      }
      const value = String(rawValue)
      if (!map.has(value)) {
        map.set(value, {
          value,
          label:
            option.label ??
            option.name ??
            option.title ??
            option.display ??
            value,
        })
      }
    }
  })

  return Array.from(map.values())
}

function mapCompany(raw) {
  const id =
    pickFirst(raw, [
      'id',
      'company_id',
      'companyId',
      'uuid',
      'id_company',
      'identifier',
    ]) ?? null
  const name =
    coerceString(
      pickFirst(raw, [
        'name',
        'company_name',
        'companyName',
        'displayName',
        'raison_sociale',
      ])
    ) ?? 'Entreprise'
  const email = coerceString(
    pickFirst(raw, [
      'email',
      'contact_email',
      'company_email',
      'primaryEmail',
    ])
  )
  const sector = coerceString(
    pickFirst(raw, [
      'sector',
      'industry',
      'sector_name',
      'company_sector',
      'activity',
    ])
  )

  const statusRaw =
    pickFirst(raw, [
      'status',
      'state',
      'company_status',
      'moderation_status',
      'approvalStatus',
    ]) ?? 'unknown'
  const status = normalizeStatus(statusRaw)

  const createdAtRaw = pickFirst(raw, [
    'createdAt',
    'created_at',
    'registered_at',
    'registration_date',
    'joined_at',
  ])
  const createdAt = coerceDate(createdAtRaw)

  const lastActivityRaw = pickFirst(raw, [
    'lastActivityAt',
    'last_activity_at',
    'last_seen_at',
    'lastInteractionAt',
    'last_active_at',
  ])
  const lastActivityAt = coerceDate(lastActivityRaw)

  const phone = coerceString(
    pickFirst(raw, ['phone', 'phone_number', 'contact_phone'])
  )

  return {
    id: id ? String(id) : null,
    name,
    email,
    sector,
    status: status.label,
    statusTone: status.tone,
    rawStatus: status.value,
    createdAt,
    createdAtLabel:
      createdAt || typeof createdAtRaw !== 'string' ? null : createdAtRaw,
    lastActivityAt,
    lastActivityLabel:
      lastActivityAt || typeof lastActivityRaw !== 'string'
        ? null
        : lastActivityRaw,
    phone,
    raw,
  }
}

function normalizeCompaniesPayload(payload) {
  const root = payload?.data ?? payload ?? {}

  const items =
    pickFirst(root, [
      'items',
      'companies',
      'results',
      'data',
      ['payload', 'items'],
      ['payload', 'data'],
    ]) ?? []

  const parsedItems = Array.isArray(items) ? items : []

  const meta =
    root.meta ??
    root.pagination ??
    root.paging ??
    {
      current_page: root.page,
      per_page: root.perPage,
      total_pages: root.totalPages,
      total: root.total,
    }

  const page =
    coerceNumber(
      pickFirst(meta, [
        'current_page',
        'currentPage',
        'page',
        'pageNumber',
        'page_index',
      ])
    ) ?? 1
  const perPage =
    coerceNumber(
      pickFirst(meta, [
        'per_page',
        'perPage',
        'limit',
        'pageSize',
        'page_size',
      ])
    ) ?? parsedItems.length
  const totalItems =
    coerceNumber(pickFirst(meta, ['total', 'totalItems', 'count'])) ??
    (perPage ? page * perPage : parsedItems.length)
  const totalPages =
    coerceNumber(
      pickFirst(meta, [
        'total_pages',
        'totalPages',
        'last_page',
        'pageCount',
        'pages',
      ])
    ) ?? (perPage ? Math.ceil(totalItems / perPage) : 1)

  const filters = root.filters ?? {}

  return {
    items: parsedItems.map(mapCompany),
    pagination: {
      page,
      perPage,
      totalItems,
      totalPages,
    },
    filters: {
      statuses: normalizeOptions(
        filters.statuses ??
          filters.status ??
          pickFirst(root, ['availableStatuses', 'statusOptions'])
      ),
      sectors: normalizeOptions(
        filters.sectors ??
          filters.sector ??
          pickFirst(root, ['availableSectors', 'sectorOptions'])
      ),
    },
    raw: root,
  }
}

export async function fetchAdminMetrics() {
  try {
    const response = await api.get('/admin/dashboard/metrics')
    return normalizeMetricsPayload(response.data)
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallback = await api.get('/admin/dashboard')
      return normalizeMetricsPayload(fallback.data)
    }
    throw error
  }
}

export async function fetchAdminSystemStats() {
  try {
    const response = await api.get('/admin/system-stats')
    return normalizeSystemStatsPayload(response.data)
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallback = await api.get('/admin/dashboard/stats')
      return normalizeSystemStatsPayload(fallback.data)
    }
    throw error
  }
}

export async function fetchAdminCompanies(params = {}) {
  const queryParams = Object.fromEntries(
    Object.entries({
      page: params.page,
      perPage: params.perPage,
      status: params.status,
      sector: params.sector,
      search: params.search,
    }).filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).length > 0
    )
  )

  const response = await api.get('/admin/companies', {
    params: queryParams,
  })

  return normalizeCompaniesPayload(response.data)
}

export async function exportAdminCompanies(params = {}) {
  const queryParams = Object.fromEntries(
    Object.entries({
      status: params.status,
      sector: params.sector,
      search: params.search,
    }).filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).length > 0
    )
  )

  const response = await api.get('/admin/companies/export', {
    params: queryParams,
    responseType: 'blob',
  })

  const disposition = response.headers?.['content-disposition']
  let filename = `entreprises-${new Date().toISOString().slice(0, 10)}.csv`

  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/)
    if (match && match[1]) {
      filename = match[1]
    }
  }

  return {
    blob: response.data,
    filename,
  }
}

export default {
  fetchAdminMetrics,
  fetchAdminSystemStats,
  fetchAdminCompanies,
  exportAdminCompanies,
}
