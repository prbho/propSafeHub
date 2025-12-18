// app/api/favorites/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { ID, Query } from 'node-appwrite'

import {
  AGENTS_COLLECTION_ID, // ← ADD THIS
  DATABASE_ID,
  databases,
  FAVORITES_COLLECTION_ID,
  PROPERTIES_COLLECTION_ID,
  USERS_COLLECTION_ID,
} from '@/lib/appwrite-server'
import { triggerFavoriteNotification } from '@/lib/services/server/notificationTriggers'

// GET /api/favorites - Get user's favorites with property details
export async function GET(request: NextRequest) {
  console.log('🔍 [FAVORITES API] GET /api/favorites called')
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')

    console.log('🔍 Query params:', { userId, propertyId, category })

    if (!userId) {
      console.log('❌ Missing userId')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const queries = [Query.equal('userId', userId)]

    if (propertyId) {
      queries.push(Query.equal('propertyId', propertyId))
    }

    if (category) {
      queries.push(Query.equal('category', category))
    }

    queries.push(Query.orderDesc('$createdAt'))

    console.log('🔍 Appwrite queries:', queries)

    const favoritesResponse = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      queries
    )

    console.log('🔍 Found favorites:', favoritesResponse.total)

    // If we need property details, fetch them
    if (favoritesResponse.total > 0 && !propertyId) {
      const favoritesWithDetails = await Promise.all(
        favoritesResponse.documents.map(async (favorite) => {
          try {
            // Fetch property details
            const property = await databases.getDocument(
              DATABASE_ID,
              PROPERTIES_COLLECTION_ID,
              favorite.propertyId
            )

            return {
              ...favorite,
              property, // Include full property details
            }
          } catch (error) {
            console.error(
              '❌ [API /favorites] Error fetching property:',
              favorite.propertyId,
              error
            )
            return {
              ...favorite,
              property: null, // Property might be deleted
            }
          }
        })
      )

      return NextResponse.json({
        favorites: favoritesWithDetails,
        total: favoritesResponse.total,
      })
    }

    return NextResponse.json({
      favorites: favoritesResponse.documents,
      total: favoritesResponse.total,
    })
  } catch (error: any) {
    console.error('❌ [FAVORITES API] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Add to favorites with validation
export async function POST(request: NextRequest) {
  console.log('🔍 [FAVORITES API] POST /api/favorites called - Start')
  console.log('🔍 Request URL:', request.url)

  try {
    const body = await request.json()
    console.log('🔍 Request body:', body)

    const { userId, propertyId, notes, category } = body

    if (!userId || !propertyId) {
      console.log('❌ Missing required fields:', { userId, propertyId })
      return NextResponse.json(
        { error: 'User ID and Property ID are required' },
        { status: 400 }
      )
    }

    // 🔧 FIXED: Validate that user exists in either agents or users collection
    console.log('🔍 Validating user:', userId)
    let user = null
    let userCollection = ''

    // Try agents collection first, then users collection
    const userCollections = [AGENTS_COLLECTION_ID, USERS_COLLECTION_ID] // ← USE CONSTANTS

    for (const collection of userCollections) {
      try {
        console.log(`🔍 Checking ${collection} collection...`)
        user = await databases.getDocument(DATABASE_ID, collection, userId)
        console.log(`✅ User found in ${collection} collection:`, user.name)
        userCollection = collection
        break // Exit loop once user is found
      } catch (error: any) {
        console.log(`❌ User not in ${collection} collection`)
        continue
      }
    }

    // If user is still not found after checking both collections
    if (!user) {
      console.error('❌ User not found in agents or users collection:', userId)
      return NextResponse.json(
        {
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    console.log(`✅ Using user from ${userCollection} collection`)

    // Validate that property exists
    let property
    try {
      console.log('🔍 Validating property:', propertyId)
      property = await databases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
      console.log('✅ Property found:', property.title)
      console.log('🔍 Property agentId:', property.agentId)
      console.log('🔍 Property ownerId:', property.ownerId)
    } catch (error: any) {
      console.error('❌ Property not found:', propertyId, error.message)
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check if already favorited
    console.log('🔍 Checking if already favorited...')
    const existingFavorites = await databases.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [Query.equal('userId', userId), Query.equal('propertyId', propertyId)]
    )

    if (existingFavorites.total > 0) {
      console.log('❌ Already favorited')
      return NextResponse.json(
        { error: 'Property is already in favorites' },
        { status: 409 }
      )
    }

    const favoriteData = {
      userId,
      propertyId,
      addedAt: new Date().toISOString(),
      notes: notes || '',
      category: category || 'wishlist',
    }

    console.log('🔍 Creating favorite document:', favoriteData)

    const response = await databases.createDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      ID.unique(),
      favoriteData
    )

    console.log('✅ Favorite created with ID:', response.$id)

    // 🔔 TRIGGER FAVORITE NOTIFICATION
    try {
      console.log('🔍 Checking notification...')
      // Determine who should get the notification (property owner or agent)
      const notificationRecipientId = property.agentId || property.ownerId
      console.log('🔍 Notification recipient:', notificationRecipientId)

      if (notificationRecipientId && notificationRecipientId !== userId) {
        console.log('🔔 Triggering notification...')
        await triggerFavoriteNotification({
          propertyOwnerId: notificationRecipientId,
          userName: user.name || 'A user',
          propertyId: propertyId,
          propertyTitle: property.title,
        })
        console.log('✅ Notification triggered')
      } else {
        console.log('ℹ️ No notification needed (same user or no recipient)')
      }
    } catch (error: any) {
      console.error('❌ Notification failed:', error.message)
      // Silently fail if notification fails
    }

    // After the favorite is successfully created, optionally create a lead
    try {
      console.log('🔍 Checking lead creation...')
      console.log('🔍 Property agentId:', property.agentId)
      console.log('🔍 Current userId:', userId)
      console.log(
        '🔍 Are they different?',
        property.agentId && property.agentId !== userId
      )

      // Only create lead if property belongs to an agent and user is not the agent
      if (property.agentId && property.agentId !== userId) {
        console.log('🎯 Creating lead...')
        const leadUrl = `${request.nextUrl.origin}/api/favorites/leads`
        console.log('🔗 Lead creation URL:', leadUrl)

        const leadResponse = await fetch(leadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            propertyId,
            notes: notes || '',
            favoriteId: response.$id,
          }),
        })

        console.log('📡 Lead creation response status:', leadResponse.status)

        if (!leadResponse.ok) {
          const errorText = await leadResponse.text()
          console.error(
            '❌ Lead creation failed with status:',
            leadResponse.status
          )
          console.error('❌ Lead creation error:', errorText)
          // Don't throw, just log
        } else {
          const leadResult = await leadResponse.json()
          console.log('✅ Lead created:', leadResult)
        }
      } else {
        console.log('ℹ️ No lead creation needed (no agent or same user)')
      }
    } catch (error: any) {
      console.error('❌ Lead creation exception:', error.message)
      // Don't fail the favorite request if lead creation fails
    }

    // Update the property's favorites count atomically
    try {
      console.log('🔍 Updating property favorites count...')
      const currentFavorites = property.favorites || 0
      console.log('🔍 Current favorites:', currentFavorites)

      await databases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          favorites: currentFavorites + 1,
        }
      )
      console.log('✅ Favorites count updated to:', currentFavorites + 1)
    } catch (error: any) {
      console.error('❌ Failed to update favorites count:', error.message)
      // Silently fail if favorites count update fails
    }

    console.log('✅ [FAVORITES API] POST completed successfully')
    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('❌ [FAVORITES API] POST error:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  console.log('🔍 [FAVORITES API] DELETE /api/favorites called')
  try {
    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get('favoriteId')
    const propertyId = searchParams.get('propertyId')

    console.log('🔍 Query params:', { favoriteId, propertyId })

    if (!favoriteId || !propertyId) {
      console.log('❌ Missing required params')
      return NextResponse.json(
        { error: 'Favorite ID and Property ID are required' },
        { status: 400 }
      )
    }

    // Get the property first to get current favorites count
    let currentFavorites = 0
    try {
      console.log('🔍 Getting property:', propertyId)
      const property = await databases.getDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId
      )
      currentFavorites = property.favorites || 0
      console.log('🔍 Current favorites:', currentFavorites)
    } catch (error: any) {
      console.error('❌ Failed to get property:', error.message)
      // Use default value if property fetch fails
    }

    // Delete the favorite
    console.log('🔍 Deleting favorite:', favoriteId)
    await databases.deleteDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      favoriteId
    )
    console.log('✅ Favorite deleted')

    // Update the property's favorites count atomically
    try {
      const newFavoritesCount = Math.max(0, currentFavorites - 1)
      console.log('🔍 New favorites count:', newFavoritesCount)

      await databases.updateDocument(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        propertyId,
        {
          favorites: newFavoritesCount,
        }
      )
      console.log('✅ Property favorites count updated')
    } catch (error: any) {
      console.error('❌ Failed to update favorites count:', error.message)
      // Silently fail if favorites count update fails
    }

    console.log('✅ [FAVORITES API] DELETE completed successfully')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ [FAVORITES API] DELETE error:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
