// utils/auth-validations.ts
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/[^\d+]/g, '')
  if (!cleaned.startsWith('+234')) {
    return '+234' + cleaned.replace(/^\+?234?/, '')
  }
  return cleaned
}

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return true
  const phoneRegex = /^\+234[789][01]\d{8}$/
  return phoneRegex.test(phoneNumber)
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateAgentData = (
  licenseNumber: string,
  agency: string,
  city: string
): string | null => {
  if (!licenseNumber.trim()) {
    return 'License number is required for agents'
  }
  if (!agency.trim()) {
    return 'Agency name is required for agents'
  }
  if (!city.trim()) {
    return 'City is required for agents'
  }
  return null
}
