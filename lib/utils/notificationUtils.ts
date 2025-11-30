// lib/utils/notificationUtils.ts
export const getNotificationConfig = (type: string) => {
  const configs = {
    userMessage: {
      // Messages
      icon: '💬',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Message',
    },
    propertyUpdate: {
      // Favorites and property views
      icon: '📊',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Property Update',
    },
    appointmentReminder: {
      // Viewing requests
      icon: '📅',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Appointment',
    },
    systemAlert: {
      // System notifications
      icon: '⚠️',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'System',
    },
  }

  return (
    configs[type as keyof typeof configs] || {
      icon: '🔔',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'Notification',
    }
  )
}
