// app/lib/email-templates.ts
export interface EmailTemplateParams {
  name: string
  email: string
  verificationUrl: string
  userType: 'buyer' | 'seller' | 'agent'
  phone?: string
  agency?: string
  city?: string
}

export function generateVerificationEmail(params: EmailTemplateParams): {
  subject: string
  html: string
} {
  const { name, email, verificationUrl, userType, phone, agency, city } = params

  // Extract token from URL for display
  const url = new URL(verificationUrl)
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
    default:
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
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            /* ... your existing styles ... */
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
                <p style="color: #64748b; margin: 10px 0 0 0;">Find Your Perfect Property Match</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">
                    Hello ${name}!
                    ${userTypeBadge[userType]}
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
