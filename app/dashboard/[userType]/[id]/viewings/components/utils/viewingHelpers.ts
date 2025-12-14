// app/agent/dashboard/viewings/utils/viewingHelpers.ts
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'secondary'
    case 'confirmed':
      return 'default'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatTime = (timeString: string) => {
  try {
    // If it's already in HH:MM format, return as is
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString
    }

    // If it's an ISO string or date object, extract time
    const date = new Date(timeString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }

    // Return original if parsing fails
    return timeString
  } catch {
    return timeString
  }
}
