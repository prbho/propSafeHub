// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PlanType } from '@/types'

import { PaymentService } from '@/lib/services/payment-service'
import { PREMIUM_PLANS } from '@/lib/services/premium-service'

export async function POST(request: NextRequest) {
  try {
    const { email, planType, propertyId, agentId, userId } =
      await request.json()

    // Validate plan type with type guard
    const validPlanType = planType as PlanType
    if (!PREMIUM_PLANS[validPlanType]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Initialize payment
    const paymentData = await PaymentService.initializePayment({
      email,
      planType: validPlanType,
      propertyId,
      agentId,
      userId,
    })

    return NextResponse.json({
      success: true,
      authorizationUrl: paymentData.authorization_url,
      reference: paymentData.reference,
    })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
