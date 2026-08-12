export function formatCurrency(
  value: number | undefined | null,
  currency = 'USD'
): string {
  if (value == null || isNaN(value)) return '$—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value)
}

export function formatNumber(
  value: number | undefined | null
): string {
  if (value == null || isNaN(value)) return '—'

  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }

  if (Math.abs(value) >= 1_000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return value.toLocaleString()
}

export function formatPct(
  value: number | undefined | null,
  showSign = false
): string {
  if (value == null || isNaN(value)) return '—'

  const sign = showSign && value > 0 ? '+' : ''

  return `${sign}${value.toFixed(1)}%`
}

export function formatDate(
  dateStr: string | undefined | null
): string {
  if (!dateStr) return '—'

  try {
    return new Date(dateStr).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )
  } catch {
    return dateStr
  }
}

export function truncate(
  str: string,
  max = 40
): string {
  return str.length > max
    ? str.slice(0, max) + '…'
    : str
}