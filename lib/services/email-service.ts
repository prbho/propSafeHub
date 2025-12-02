// app/services/email-service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Resend } from 'resend'

import {
  EmailTemplateParams,
  generateVerificationEmail,
} from '@/lib/email-templates'

export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!)
  }

  async sendVerificationEmail(
    params: EmailTemplateParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { subject, html } = generateVerificationEmail(params)

      const fromAddress = this.getFromAddress(params.userType)

      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: params.email,
        subject,
        html,
      })

      if (error) {
        console.error('❌ Email sending error:', error)
        return { success: false, error: error.message }
      }

      console.log(
        `✅ ${params.userType.charAt(0).toUpperCase() + params.userType.slice(1)} verification email sent to: ${params.email}`
      )
      return { success: true }
    } catch (error: any) {
      console.error('❌ Email service error:', error.message)
      return { success: false, error: error.message }
    }
  }

  private getFromAddress(userType: 'buyer' | 'seller' | 'agent'): string {
    switch (userType) {
      case 'agent':
        return 'PropSafeHub Agent Network <noreply@notifications.propsafehub.com>'
      case 'seller':
        return 'PropSafeHub Seller Support <noreply@notifications.propsafehub.com>'
      case 'buyer':
      default:
        return 'PropSafeHub <noreply@notifications.propsafehub.com>'
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService()
