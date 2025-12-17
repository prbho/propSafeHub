import '@/lib/appwrite-build-fix'
// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { PaymentService } from '@/lib/services/payment-service'
import { PremiumListingService } from '@/lib/services/premium-service'
import { PropertyService } from '@/lib/services/property-service'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    // Check if payment already processed
    const existingPayment =
      await PaymentService.getPaymentByReference(reference)
    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      )
    }

    // Verify payment with PayStack
    const paymentVerification = await PaymentService.verifyPayment(reference)

    if (paymentVerification.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment failed or pending' },
        { status: 400 }
      )
    }

    // Create payment record
    const paymentRecord =
      await PaymentService.createPaymentRecord(paymentVerification)

    // Create premium listing
    const { metadata } = paymentVerification
    const premiumListing = await PremiumListingService.createPremiumListing({
      propertyId: metadata.propertyId,
      agentId: metadata.agentId,
      userId: metadata.userId,
      planType: metadata.planType,
      paymentId: paymentRecord.$id,
    })

    // ✅ AUTO-FEATURE: Sync property with premium status
    try {
      await PropertyService.syncPropertyWithPremium(metadata.propertyId)
      console.log(
        `✅ Property ${metadata.propertyId} featured status synced with premium`
      )
    } catch (featureError) {
      console.error('Error syncing property featured status:', featureError)
      // Don't fail the entire request if featuring fails
    }

    return NextResponse.json({
      success: true,
      premiumListing,
      paymentRecord,
      message: 'Premium listing activated successfully!',
    })
  } catch {
    return NextResponse.json({ status: 500 })
  }
}
