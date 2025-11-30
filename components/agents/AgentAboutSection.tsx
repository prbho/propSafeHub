import { Agent } from '@/types'
import { Award } from 'lucide-react'

interface AgentAboutSectionProps {
  agent: Agent
}

export default function AgentAboutSection({ agent }: AgentAboutSectionProps) {
  return (
    <>
      {/* About Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          About {agent.name}
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg">{agent.bio}</p>
      </section>

      {/* Specialties Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Areas of Expertise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agent.specialties.map((specialty, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg"
            >
              <Award className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-gray-900">{specialty}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Languages Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Languages Spoken
        </h2>
        <div className="flex flex-wrap gap-2">
          {agent.languages.map((language: string, index: number) => (
            <span
              key={index}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium"
            >
              {language}
            </span>
          ))}
        </div>
      </section>
    </>
  )
}
