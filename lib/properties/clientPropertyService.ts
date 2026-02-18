/* eslint-disable @typescript-eslint/no-explicit-any */

import { toast } from 'sonner'

// lib/properties/clientPropertyService.ts
export const clientPropertyService = {
  async createProperty(propertyData: any) {
    try {
      const response = await fetch('/api/properties/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to create property',
        }))
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      return result
    } catch {
      throw toast.error('Failed to create property')
    }
  },

  async getProperties(filters: any = {}) {
    try {
      const params = new URLSearchParams()

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await fetch(`/api/properties?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`)
      }

      return await response.json()
    } catch {}
  },

  async getPropertyById(propertyId: string) {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch property: ${response.status}`)
      }

      return await response.json()
    } catch {}
  },

  async updateProperty(propertyId: string, updates: any) {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to update property',
        }))
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch {
      throw toast.error('Error updating property')
    }
  },

  async deleteProperty(propertyId: string) {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to delete property',
        }))
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch {
      throw toast.error('Error deleting property')
    }
  },
}

