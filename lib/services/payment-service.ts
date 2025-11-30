// lib/payment-service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PaymentRecord, PlanType } from '@/types'
import { ID, Models, Query } from 'appwrite'

import {
  DATABASE_ID,
  PAYMENT_COLLECTION_ID,
  serverDatabases,
} from '../appwrite-server'
import { PREMIUM_PLANS } from './premium-service'

export class PaymentService {
  private static paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!
  private static baseUrl = 'https://api.paystack.co'

  // Initialize payment with PayStack
  static async initializePayment(data: {
    email: string
    planType: PlanType
    propertyId: string
    agentId: string
    userId: string
  }) {
    const plan = PREMIUM_PLANS[data.planType]

    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        amount: plan.price,
        metadata: {
          userId: data.userId,
          agentId: data.agentId,
          propertyId: data.propertyId,
          planType: data.planType,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Payment initialization failed: ${error}`)
    }

    const result = await response.json()
    return result.data
  }

  // Verify PayStack payment
  static async verifyPayment(reference: string) {
    const response = await fetch(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to verify payment')
    }

    const result = await response.json()
    return result.data
  }

  // Create payment record in database
  static async createPaymentRecord(paymentData: any): Promise<PaymentRecord> {
    const plan = PREMIUM_PLANS[paymentData.metadata.planType as PlanType]

    const paymentDoc = await serverDatabases.createDocument(
      DATABASE_ID,
      PAYMENT_COLLECTION_ID,
      ID.unique(),
      {
        // Core identifiers
        userId: paymentData.metadata.userId,
        agentId: paymentData.metadata.agentId,
        propertyId: paymentData.metadata.propertyId,

        // Payment details
        amount: paymentData.amount / 100,
        currency: 'NGN',
        status: paymentData.status === 'success' ? 'completed' : 'failed',
        paymentMethod: paymentData.channel || 'card',
        paymentGateway: 'paystack',
        gatewayReference: paymentData.reference,

        // Plan information
        planType: paymentData.metadata.planType,
        duration: plan.duration,

        // Additional useful fields
        customerEmail: paymentData.customer?.email,
        ipAddress: paymentData.ip_address,
        fees: paymentData.fees || 0,
        paidAt: paymentData.paid_at || new Date().toISOString(),
        transactionDate: paymentData.transaction_date,

        // Card details (if available)
        cardBrand: paymentData.authorization?.brand,
        cardLast4: paymentData.authorization?.last4,
        bank: paymentData.authorization?.bank,

        // No metadata field!
      }
    )

    return this.mapToPaymentRecord(paymentDoc)
  }

  // Get payment by reference
  static async getPaymentByReference(
    reference: string
  ): Promise<PaymentRecord | null> {
    try {
      const result = await serverDatabases.listDocuments(
        DATABASE_ID,
        PAYMENT_COLLECTION_ID,
        [Query.equal('gatewayReference', reference)]
      )

      if (result.documents.length === 0) return null

      return this.mapToPaymentRecord(result.documents[0])
    } catch (error) {
      console.error('Error fetching payment:', error)
      return null
    }
  }

  // Helper method to map AppWrite document to PaymentRecord
  private static mapToPaymentRecord(doc: Models.Document): PaymentRecord {
    const typedDoc = doc as any

    return {
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      userId: typedDoc.userId,
      agentId: typedDoc.agentId,
      propertyId: typedDoc.propertyId,
      amount: typedDoc.amount,
      currency: typedDoc.currency,
      status: typedDoc.status,
      paymentMethod: typedDoc.paymentMethod,
      paymentGateway: typedDoc.paymentGateway,
      gatewayReference: typedDoc.gatewayReference,
      planType: typedDoc.planType,
      duration: typedDoc.duration,

      // Additional fields
      customerEmail: typedDoc.customerEmail,
      ipAddress: typedDoc.ipAddress,
      fees: typedDoc.fees,
      paidAt: typedDoc.paidAt,
      transactionDate: typedDoc.transactionDate,
      cardBrand: typedDoc.cardBrand,
      cardLast4: typedDoc.cardLast4,
      bank: typedDoc.bank,

      // No metadata field!
    }
  }
}
