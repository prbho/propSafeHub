// config/premium-plans.ts
export const PREMIUM_PLANS = {
  featured: {
    name: 'Featured Listing',
    description: 'Get your property featured at the top of search results',
    price: 5000, // in kobo (₦50.00)
    duration: 7, // days
    priority: 8,
    features: [
      'Top of search results',
      'Featured badge',
      '7 days visibility',
      'Priority placement',
    ],
  },
  premium: {
    name: 'Premium Listing',
    description: 'Maximum visibility with premium placement',
    price: 15000, // in kobo (₦150.00)
    duration: 30, // days
    priority: 9,
    features: [
      'Top of search results',
      'Premium badge',
      '30 days visibility',
      'Highest priority',
      'Featured in premium section',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For agencies with multiple premium listings',
    price: 50000, // in kobo (₦500.00)
    duration: 30,
    priority: 10,
    features: [
      'Multiple listings',
      'Agency branding',
      'Highest priority',
      'Dedicated support',
      'Analytics dashboard',
    ],
  },
} as const

export type PlanType = keyof typeof PREMIUM_PLANS
