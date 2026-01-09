import FeaturedPropertiesCarousel from '@/components/FeaturedPropertiesCarousel'
import Hero from '@/components/Hero/Hero'
import ServicesSection from '@/components/ServicesSection'
import TestimonialsSection from '@/components/Testimonialssection'
import TrustCredibilitySection from '@/components/TrustCredibilitySection'

export default function Home() {
  return (
    <>
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

        <div className="relative z-0">
          <TestimonialsSection />
        </div>

        <div className="relative z-0">
          {/* Trust and Credibility Section */}
          {/* Assuming TrustCredibilitySection is imported */}
          <TrustCredibilitySection />
        </div>
      </main>
    </>
  )
}
