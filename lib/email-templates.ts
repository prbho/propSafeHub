// app/lib/email-templates.ts
export interface EmailTemplateParams {
  name: string
  email: string
  verificationUrl?: string
  resetUrl?: string
  userType: 'buyer' | 'seller' | 'agent' | 'user'
  phone?: string
  agency?: string
  city?: string
  userAgent?: string
}

export function generateVerificationEmail(params: EmailTemplateParams): {
  subject: string
  html: string
} {
  const { name, verificationUrl, userType, phone, agency, city } = params

  // Extract token from URL for display
  const url = new URL(verificationUrl || '')
  const pathParts = url.pathname.split('/')
  const verificationToken = pathParts[pathParts.length - 1]

  let subject = ''
  let welcomeMessage = ''
  let actionDescription = ''
  let specialInstructions = ''

  switch (userType) {
    case 'agent':
      subject = `Welcome to PropSafeHub Agent Network - Verify Your Email`
      welcomeMessage = `Welcome to our professional real estate agent network!`
      actionDescription =
        'complete your agent profile verification and start managing your listings'
      specialInstructions = `
        <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #065f46; display: block; margin-bottom: 10px;">🎯 Welcome to Our Agent Network!</strong>
          <p style="color: #047857; margin: 5px 0; font-size: 14px;">
            <strong>Your Agency:</strong> ${agency || 'Not specified'}
          </p>
          <p style="color: #047857; margin: 5px 0; font-size: 14px;">
            <strong>Location:</strong> ${city || 'Not specified'}
          </p>
          <p style="color: #047857; margin: 10px 0 0 0; font-size: 14px;">
            As a verified agent, you'll get access to:
            • Listing management dashboard
            • Client connection tools
            • Professional analytics
            • Marketing resources
          </p>
        </div>
      `
      break

    case 'seller':
      subject = `Welcome to PropSafeHub - Verify Your Seller Account`
      welcomeMessage = `Welcome to PropSafeHub's seller community!`
      actionDescription =
        'verify your seller account and start listing your properties'
      specialInstructions = `
        <div style="background: #e0f2fe; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #075985; display: block; margin-bottom: 10px;">🏠 Ready to Sell Your Property?</strong>
          <p style="color: #0369a1; margin: 5px 0; font-size: 14px;">
            After verification, you can:
            • List properties with high-quality photos
            • Connect with verified agents
            • Track property views and inquiries
            • Set up virtual tours
          </p>
        </div>
      `
      break

    case 'buyer':
      subject = `Welcome to PropSafeHub - Verify Your Account`
      welcomeMessage = `Welcome to PropSafeHub!`
      actionDescription =
        'complete your account verification and start exploring properties'
      specialInstructions = `
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #075985; display: block; margin-bottom: 10px;">🔍 Start Your Property Search!</strong>
          <p style="color: #0369a1; margin: 5px 0; font-size: 14px;">
            After verification, you can:
            • Save favorite properties
            • Set up personalized alerts
            • Schedule property viewings
            • Connect with trusted agents
            • Get market insights
          </p>
        </div>
      `
      break

    case 'user':
      subject = `Welcome to PropSafeHub - Verify Your Account`
      welcomeMessage = `Welcome to PropSafeHub!`
      actionDescription =
        'complete your account verification and start exploring properties'
      specialInstructions = `
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #075985; display: block; margin-bottom: 10px;">🔍 Start Your Property Search!</strong>
          <p style="color: #0369a1; margin: 5px 0; font-size: 14px;">
            After verification, you can:
            • Save favorite properties
            • Set up personalized alerts
            • Schedule property viewings
            • Connect with trusted agents
            • Get market insights
          </p>
        </div>
      `
      break
  }

  const userTypeBadge = {
    agent:
      '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px;">Professional Agent</span>',
    seller:
      '<span style="background: #0ea5e9; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px;">Property Seller</span>',
    buyer:
      '<span style="background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px;">Property Buyer</span>',
    user: '<span style="background: #8b5cf6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px;">Property Buyer</span>',
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #374151; 
                margin: 0; 
                padding: 20px; 
                background-color: #f9fafb;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
                background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                padding: 40px 30px; 
                text-align: center; 
                color: white;
            }
            .content { 
                padding: 40px 30px;
            }
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                color: white; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 600; 
                font-size: 16px; 
                border: none; 
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(5, 150, 105, 0.2);
            }
            .link-box { 
                background: #f3f4f6; 
                padding: 12px 16px; 
                border-radius: 6px; 
                border: 1px solid #e5e7eb; 
                word-break: break-all; 
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                font-size: 13px; 
                color: #4b5563; 
                margin: 15px 0;
            }
            .contact-info {
                background: #f0f9ff;
                border: 1px solid #0ea5e9;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .warning {
                background: #fef3c7;
                border-top: 1px solid #f59e0b;
                padding: 20px 30px;
                color: #92400e;
                font-size: 14px;
            }
            .footer {
                background: #f9fafb;
                padding: 25px 30px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                border-top: 1px solid #e5e7eb;
            }
            .footer a {
                color: #2563eb;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            h2 {
                color: #1e293b;
                margin-top: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img 
                    src="https://fra.cloud.appwrite.io/v1/storage/buckets/6917066d002198df0c33/files/692f3007003c9a8fc197/view?project=6916ed0c0019cfe6bd36" 
                    alt="PropSafeHub Logo" 
                    style="width: 160px; height: auto; display: block; margin: 0 auto; border: 0;"
                />
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Find Your Perfect Property Match</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">
                    Hello ${name}!
                    ${userTypeBadge[userType] || ''}
                </h2>
                
                <p style="color: #475569; margin-bottom: 15px; font-size: 16px;">
                    <strong>${welcomeMessage}</strong>
                </p>
                
                <p style="color: #475569; margin-bottom: 25px;">
                    Thank you for registering as a ${userType} on PropSafeHub. To ${actionDescription}, please verify your email address by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                
                <div class="link-box">
                    ${verificationUrl}
                </div>
                
                ${specialInstructions}
                
                ${
                  phone
                    ? `
                <div class="contact-info">
                    <strong>📱 Registered Contact:</strong>
                    <p style="margin: 5px 0; color: #475569;">${phone}</p>
                </div>
                `
                    : ''
                }
                
                ${
                  userType === 'agent'
                    ? `
                <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <strong style="color: #92400e;">📋 Next Steps for Agents:</strong>
                    <p style="color: #92400e; margin: 10px 0 0 0; font-size: 14px;">
                        1. Verify your email (this link expires in 24 hours)<br>
                        2. Complete your professional profile<br>
                        3. Upload your real estate license (optional)<br>
                        4. Start creating your first listing
                    </p>
                </div>
                `
                    : ''
                }
            </div>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This verification link will expire in 24 hours.
            </div>
            
            <div class="footer">
                <p>Need help? Contact our support team at <a href="mailto:support@propsafehub.com" style="color: #2563eb;">support@propsafehub.com</a></p>
                <p>&copy; ${new Date().getFullYear()} PropSafeHub. All rights reserved.</p>
                <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                    You're receiving this email because you signed up for a PropSafeHub account.<br>
                    If this wasn't you, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  return { subject, html }
}

export function generatePasswordResetEmail(params: EmailTemplateParams): {
  subject: string
  html: string
} {
  const { name, email, resetUrl, userAgent } = params

  const subject = 'Reset Your Password - PropSafe Hub'

  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #374151; 
                margin: 0; 
                padding: 20px; 
                background-color: #f9fafb;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header { 
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
                padding: 40px 30px; 
                text-align: center; 
                color: white;
            }
            .security-header {
                background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
                padding: 20px 30px;
                color: white;
                text-align: center;
                font-size: 14px;
            }
            .content { 
                padding: 40px 30px;
            }
            .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
                color: white; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: 600; 
                font-size: 16px; 
                border: none; 
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
            }
            .link-box { 
                background: #f3f4f6; 
                padding: 12px 16px; 
                border-radius: 6px; 
                border: 1px solid #e5e7eb; 
                word-break: break-all; 
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                font-size: 13px; 
                color: #4b5563; 
                margin: 15px 0;
            }
            .info-box {
                background: #fef2f2;
                border: 1px solid #fecaca;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .security-note {
                background: #fffbeb;
                border: 1px solid #fcd34d;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .warning {
                background: #fef3c7;
                border-top: 1px solid #f59e0b;
                padding: 20px 30px;
                color: #92400e;
                font-size: 14px;
            }
            .footer {
                background: #f9fafb;
                padding: 25px 30px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                border-top: 1px solid #e5e7eb;
            }
            .footer a {
                color: #2563eb;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            .device-info {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 13px;
                color: #475569;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img 
                    src="https://fra.cloud.appwrite.io/v1/storage/buckets/6917066d002198df0c33/files/692f3007003c9a8fc197/view?project=6916ed0c0019cfe6bd36" 
                    alt="PropSafeHub Logo" 
                    style="width: 160px; height: auto; display: block; margin: 0 auto; border: 0;"
                />
                <h1 style="margin: 15px 0 0 0; font-size: 24px;">Account Security Alert</h1>
            </div>
            
            <div class="security-header">
                <strong>🔒 SECURITY NOTIFICATION</strong> • Password Reset Requested
            </div>
            
            <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">
                    Hello${name ? ` ${name}` : ''},
                </h2>
                
                <p style="color: #475569; margin-bottom: 15px; font-size: 16px;">
                    <strong>A password reset was requested for your PropSafeHub account.</strong>
                </p>
                
                <div class="info-box">
                    <strong>📋 Request Details:</strong>
                    <p style="margin: 8px 0; color: #7f1d1d;">
                        <strong>Account:</strong> ${email}
                    </p>
                    <p style="margin: 8px 0; color: #7f1d1d;">
                        <strong>Request Time:</strong> ${currentTime}
                    </p>
                    ${
                      userAgent
                        ? `<p style="margin: 8px 0; color: #7f1d1d;">
                            <strong>Device:</strong> ${userAgent}
                          </p>`
                        : ''
                    }
                </div>
                
                <p style="color: #475569; margin-bottom: 25px;">
                    If you requested this password reset, click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
                    Or copy and paste this link into your browser:
                </p>
                
                <div class="link-box">
                    ${resetUrl}
                </div>
                
                <div class="security-note">
                    <strong style="color: #92400e; display: block; margin-bottom: 10px;">⚠️ Important Security Information:</strong>
                    <ul style="color: #92400e; margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                        <li>This password reset link will expire in <strong>1 hour</strong></li>
                        <li>If you didn't request this password reset, please ignore this email</li>
                        <li>Your account password will remain unchanged until you use this link</li>
                        <li>Never share this link or your password with anyone</li>
                    </ul>
                </div>
                
                <div class="device-info">
                    <strong>💡 Security Tip:</strong>
                    <p style="margin: 8px 0 0 0;">
                        For enhanced security, consider enabling two-factor authentication in your account settings.
                    </p>
                </div>
            </div>
            
            <div class="warning">
                <strong>🚨 If this wasn't you:</strong> 
                Someone may be trying to access your account. Please contact our security team immediately if you suspect unauthorized activity.
            </div>
            
            <div class="footer">
                <p>For security assistance, contact: <a href="mailto:security@propsafehub.com" style="color: #2563eb;">security@propsafehub.com</a></p>
                <p>&copy; ${new Date().getFullYear()} PropSafeHub Security Team. All rights reserved.</p>
                <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                    This is an automated security notification. Please do not reply to this email.<br>
                    PropSafeHub will never ask for your password or personal information via email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  return { subject, html }
}
