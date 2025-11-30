import { Agent } from '@/types'
import { Globe, Mail, Phone } from 'lucide-react'

interface AgentSidebarProps {
  agent: Agent
}

export default function AgentSidebar({ agent }: AgentSidebarProps) {
  return (
    <div className="lg:w-80 shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Contact Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Contact Agent
          </h3>

          <div className="space-y-4">
            <a
              href={`tel:${agent.mobilePhone}`}
              className="flex items-center gap-3 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Mobile</div>
                <div className="font-medium text-gray-900 group-hover:text-emerald-600">
                  {agent.mobilePhone}
                </div>
              </div>
            </a>

            <a
              href={`tel:${agent.officePhone}`}
              className="flex items-center gap-3 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Office</div>
                <div className="font-medium text-gray-900 group-hover:text-emerald-600">
                  {agent.officePhone}
                </div>
              </div>
            </a>

            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-3 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium text-gray-900 group-hover:text-emerald-600">
                  {agent.email}
                </div>
              </div>
            </a>

            {agent.website && (
              <a
                href={agent.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3  border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Website</div>
                  <div className="font-medium text-gray-900 group-hover:text-emerald-600 truncate">
                    {agent.website.replace('https://', '')}
                  </div>
                </div>
              </a>
            )}
          </div>

          <button className="w-full mt-6 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Schedule Consultation
          </button>
        </div>

        {/* License Verification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            License Verification
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">License Number:</span>
              <span className="font-medium text-gray-900">
                {agent.licenseNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verified:</span>
              <span className="font-medium text-green-600">
                {agent.isVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
