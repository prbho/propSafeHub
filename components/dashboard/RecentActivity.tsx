// components/dashboard/RecentActivity.tsx
import { Calendar } from 'lucide-react'

interface Viewing {
  $id: string
  propertyTitle: string
  date: string
  time: string
  status: string
}

interface RecentActivityProps {
  viewings: Viewing[]
}

export default function RecentActivity({ viewings }: RecentActivityProps) {
  if (viewings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <p className="text-gray-500 text-center py-8">
          No recent activity to show.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {viewings.map((viewing) => (
          <div
            key={viewing.$id}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <Calendar className="w-4 h-4 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {viewing.propertyTitle}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(viewing.date).toLocaleDateString()} at {viewing.time}
              </p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                  viewing.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : viewing.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {viewing.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
