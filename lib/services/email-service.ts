// app/services/email-service.ts - COMPLETE WORKING VERSION
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Resend } from 'resend'

import {
  EmailTemplateParams,
  generatePasswordResetEmail,
  generateVerificationEmail,
} from '@/lib/email-templates'

export class EmailService {
  private resend: Resend

  constructor() {
    // Make sure RESEND_API_KEY is set in your .env.local file
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY is not set in environment variables')
      throw new Error('RESEND_API_KEY is required')
    }
    this.resend = new Resend(apiKey)
  }

  async sendVerificationEmail(
    params: EmailTemplateParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { subject, html } = generateVerificationEmail(params)

      const fromAddress = this.getFromAddress(params.userType)

      console.log('📤 Sending verification email to:', params.email)

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
      console.log('📧 Email ID:', data?.id)
      return { success: true }
    } catch (error: any) {
      console.error('❌ Email service error:', error.message)
      return { success: false, error: error.message }
    }
  }

  async sendPasswordResetEmail(
    params: EmailTemplateParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { subject, html } = generatePasswordResetEmail(params)

      const fromAddress =
        'PropSafeHub Account Security <security@notifications.propsafehub.com>'

      console.log('📤 Sending password reset email to:', params.email)

      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: params.email,
        subject,
        html,
      })

      if (error) {
        console.error('❌ Password reset email sending error:', error)
        return { success: false, error: error.message }
      }

      console.log(`✅ Password reset email sent to: ${params.email}`)
      console.log('📧 Email ID:', data?.id)
      return { success: true }
    } catch (error: any) {
      console.error('❌ Password reset email service error:', error.message)
      return { success: false, error: error.message }
    }
  }

  async sendPasswordResetSuccessEmail(
    params: EmailTemplateParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subject = 'Password Reset Successful - PropSafe Hub'

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .security-note { background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0; }
            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful</h1>
            </div>
            <div class="content">
              <h2>Hello${params.name ? ` ${params.name}` : ''},</h2>
              <p>Your PropSafe Hub account password has been successfully reset.</p>
              
              <div class="info-box">
                <p><strong>Account Email:</strong> ${params.email}</p>
                <p><strong>Time of Reset:</strong> ${new Date().toLocaleString(
                  'en-US',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short',
                  }
                )}</p>
              </div>
              
              <div class="security-note">
                <p><strong>Security Alert:</strong></p>
                <ul>
                  <li>If you initiated this password reset, you can safely ignore this email</li>
                  <li>If you did NOT reset your password, please contact our support team immediately</li>
                  <li>Consider enabling two-factor authentication for added security</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Sign In to Your Account</a>
              </div>
              
              <p>For your security, we recommend:</p>
              <ul>
                <li>Using a unique password that you don't use elsewhere</li>
                <li>Changing your password regularly</li>
                <li>Never sharing your password with anyone</li>
                <li>Logging out of shared devices</li>
              </ul>
              
              <p>Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #059669;">Contact our support team</a>.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The PropSafe Hub Security Team</p>
              <p>© ${new Date().getFullYear()} PropSafe Hub. All rights reserved.</p>
              <p style="font-size: 12px; color: #9ca3af;">
                This is an automated security notification. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const fromAddress =
        'PropSafeHub Account Security <security@notifications.propsafehub.com>'

      console.log('📤 Sending password reset success email to:', params.email)

      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: params.email,
        subject,
        html,
      })

      if (error) {
        console.error('❌ Password reset success email sending error:', error)
        return { success: false, error: error.message }
      }

      console.log(
        `✅ Password reset success notification sent to: ${params.email}`
      )
      console.log('📧 Email ID:', data?.id)
      return { success: true }
    } catch (error: any) {
      console.error(
        '❌ Password reset success email service error:',
        error.message
      )
      return { success: false, error: error.message }
    }
  }

  // Helper method for testing
  async sendTestEmail(
    to: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📤 Sending test email to:', to)

      const { data, error } = await this.resend.emails.send({
        from: 'PropSafeHub Test <test@notifications.propsafehub.com>',
        to,
        subject: 'Test Email from PropSafeHub',
        html: '<h1>Test Email</h1><p>This is a test email from PropSafeHub.</p>',
      })

      if (error) {
        console.error('❌ Test email error:', error)
        return { success: false, error: error.message }
      }

      console.log(`✅ Test email sent to: ${to}`)
      console.log('📧 Email ID:', data?.id)
      return { success: true }
    } catch (error: any) {
      console.error('❌ Test email service error:', error.message)
      return { success: false, error: error.message }
    }
  }

  private getFromAddress(
    userType: 'buyer' | 'seller' | 'agent' | 'user'
  ): string {
    switch (userType) {
      case 'agent':
        return 'PropSafeHub Agent Network <noreply@notifications.propsafehub.com>'
      case 'seller':
        return 'PropSafeHub Seller Support <noreply@notifications.propsafehub.com>'
      case 'buyer':
        return 'PropSafeHub <noreply@notifications.propsafehub.com>'
      case 'user':
      default:
        return 'PropSafeHub <noreply@notifications.propsafehub.com>'
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService()
