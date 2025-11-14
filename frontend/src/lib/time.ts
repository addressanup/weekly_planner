const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

const getRelativeUnit = (diffInMs: number) => {
  const seconds = Math.round(diffInMs / 1000)
  if (Math.abs(seconds) < 60) {
    return { value: seconds, unit: 'second' as const }
  }

  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) {
    return { value: minutes, unit: 'minute' as const }
  }

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) {
    return { value: hours, unit: 'hour' as const }
  }

  const days = Math.round(hours / 24)
  if (Math.abs(days) < 7) {
    return { value: days, unit: 'day' as const }
  }

  const weeks = Math.round(days / 7)
  if (Math.abs(weeks) < 4) {
    return { value: weeks, unit: 'week' as const }
  }

  const months = Math.round(days / 30)
  if (Math.abs(months) < 12) {
    return { value: months, unit: 'month' as const }
  }

  const years = Math.round(days / 365)
  return { value: years, unit: 'year' as const }
}

export const formatRelativeTime = (date: Date) => {
  const diff = date.getTime() - Date.now()
  const { value, unit } = getRelativeUnit(diff)
  return rtf.format(value, unit)
}

