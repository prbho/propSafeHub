'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AccessibilitySettings {
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  grayscaleMode: boolean
  linkUnderline: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void
  resetSettings: () => void
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  grayscaleMode: false,
  linkUnderline: true,
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  // Initialize with localStorage value directly to avoid double render
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') return defaultSettings

    const savedSettings = localStorage.getItem('accessibilitySettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        return { ...defaultSettings, ...parsed }
      } catch (error) {
        console.error('Error loading accessibility settings:', error)
        return defaultSettings
      }
    }
    return defaultSettings
  })

  // Apply settings to document when they change
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Apply font size
    root.style.fontSize = `${settings.fontSize}%`

    // Apply high contrast
    if (settings.highContrast) {
      body.classList.add('high-contrast')
    } else {
      body.classList.remove('high-contrast')
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      body.classList.add('reduce-motion')
    } else {
      body.classList.remove('reduce-motion')
    }

    // Apply grayscale
    if (settings.grayscaleMode) {
      body.classList.add('grayscale')
    } else {
      body.classList.remove('grayscale')
    }

    // Apply link underline
    if (settings.linkUnderline) {
      body.classList.add('link-underline')
    } else {
      body.classList.remove('link-underline')
    }

    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <AccessibilityContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    )
  }
  return context
}
