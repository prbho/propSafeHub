// components/agents/SortSelect.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  currentSort: string
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (sortValue === 'rating') {
      params.delete('sortBy')
    } else {
      params.set('sortBy', sortValue)
    }

    router.push(`/agents?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <option value="rating">Highest Rated</option>
        <option value="experience">Most Experienced</option>
        <option value="listings">Most Listings</option>
        <option value="name">Name A-Z</option>
      </select>
    </div>
  )
}
