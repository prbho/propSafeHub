'use client'

import { createContext, ReactNode, useContext } from 'react'

interface SEOContextType {
  setMetaTitle: (title: string) => void
  setMetaDescription: (description: string) => void
}

const SEOContext = createContext<SEOContextType | undefined>(undefined)

export function SEOProvider({ children }: { children: ReactNode }) {
  const setMetaTitle = (title: string) => {
    if (typeof document !== 'undefined') {
      document.title = title
    }
  }

  const setMetaDescription = (description: string) => {
    if (typeof document !== 'undefined') {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      }
    }
  }

  return (
    <SEOContext.Provider value={{ setMetaTitle, setMetaDescription }}>
      {children}
    </SEOContext.Provider>
  )
}

export function useSEO() {
  const context = useContext(SEOContext)
  if (context === undefined) {
    throw new Error('useSEO must be used within an SEOProvider')
  }
  return context
}
