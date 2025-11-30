import FeaturedPropertiesCarousel from '@/components/FeaturedPropertiesCarousel'
import Hero from '@/components/Hero/Hero'
import ServicesSection from '@/components/ServicesSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <div className="relative z-10">
        <Hero />
      </div>
      <div className="relative z-0">
        <FeaturedPropertiesCarousel />
      </div>
      <div className="relative z-0">
        <ServicesSection />
      </div>
    </main>
  )
}
