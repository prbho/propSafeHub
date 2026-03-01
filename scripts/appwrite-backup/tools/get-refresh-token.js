// tools/get-refresh-token.js
import readline from 'node:readline'
import { google } from 'googleapis'

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    'Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in env.'
  )
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
)

const SCOPES = ['https://www.googleapis.com/auth/drive']
// If your script creates folders + lists/deletes for retention, you may need full drive:
// ["https://www.googleapis.com/auth/drive"]

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // important to force refresh_token
  scope: SCOPES,
})

console.log('\nOpen this URL in your browser:\n', authUrl, '\n')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('Paste the code from the browser here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim())
    console.log('\nRefresh token:\n', tokens.refresh_token, '\n')
    rl.close()
  } catch (e) {
    console.error('Failed to exchange code for tokens:', e?.message || e)
    rl.close()
    process.exit(1)
  }
})
