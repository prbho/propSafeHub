import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        brands: '#0FA36B',
        'brand-secondary': '#0D2A52',
        'brand-gray': '#F3F4F6',
      },
      backgroundImage: {
        // 'hero-pattern': "url('/images/hero-pattern.png')",
        // 'dots-pattern': "url('/images/dots-pattern.svg')",
        // 'gradient-radial': 'radial-gradient(circle, #1E40AF, #F97316)',
        // 'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, #1E40AF, #F97316)',
      },
    },
  },
  plugins: [],
}

export default config
