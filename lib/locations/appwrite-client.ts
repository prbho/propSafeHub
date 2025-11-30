// lib/locations/appwrite-client.ts
import { Client, Databases } from 'node-appwrite'

export function createLocationServiceClient() {
  const client = new Client()

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY

  if (!endpoint || !projectId || !apiKey) {
    throw new Error('Missing Appwrite environment variables')
  }

  client.setEndpoint(endpoint).setProject(projectId).setKey(apiKey)

  return new Databases(client)
}

export const locationDatabases = createLocationServiceClient()
