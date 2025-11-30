/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Property } from '@/types'
import { ID, Query } from 'appwrite'
import {
  Bath,
  Bed,
  Calendar,
  Home,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Send,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { databases } from '@/lib/appwrite'

import { Avatar, AvatarImage } from '../ui/avatar'

interface ChatMessage {
  id: string
  type: 'user' | 'bot' | 'card'
  content: string
  timestamp: Date
  propertyData?: Property[] // Store property data separately for cards
}

interface LeadFormData {
  name: string
  email: string
  phone: string
  propertyInterest?: string
  budget?: string
  timeline?: string
  message?: string
  bedrooms?: string
  location?: string
}

interface Memory {
  propertyType?: string
  budget?: string
  location?: string
  bedrooms?: string
  bathrooms?: string
  name?: string
  email?: string
  phone?: string
}

// Local storage keys
const LS_MEMORY_KEY = 'reva_memory'
const LS_CONVO_KEY = 'reva_conversation'
const LS_VOICE_MUTED_KEY = 'reva_voice_muted'

// Environment variables with fallbacks
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'propertyDB'
const PROPERTIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID || 'properties'
const LEADS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_LEADS_TABLE_ID || 'leads'

// Free AI API configuration - Google Gemini API (FREE)
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

// Counter for truly unique IDs
let messageCounter = 0

// More robust unique ID generation
const generateUniqueId = (): string => {
  messageCounter++
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${messageCounter}`
}

// Helper function to convert Appwrite document to Property type
const mapDocumentToProperty = (doc: any): Property => ({
  $id: doc.$id || '',
  $collectionId: doc.$collectionId || '',
  $databaseId: doc.$databaseId || '',
  $createdAt: doc.$createdAt || '',
  $updatedAt: doc.$updatedAt || '',
  $permissions: doc.$permissions || [],
  agentId: doc.agentId || '',
  propertyId: doc.propertyId || doc.$id || '',
  agentName: doc.agentName || '',
  title: doc.title || '',
  description: doc.description || '',
  propertyType: doc.propertyType || 'house',
  status: doc.status || 'for-sale',
  price: doc.price || 0,
  priceUnit: doc.priceUnit || 'total',
  originalPrice: doc.originalPrice,
  priceHistory: doc.priceHistory || [],
  address: doc.address || '',
  paymentOutright: doc.paymentOutright || '',
  phone: doc.phone || '',
  city: doc.city || '',
  state: doc.state || '',
  zipCode: doc.zipCode || '',
  country: doc.country || '',
  neighborhood: doc.neighborhood,
  latitude: doc.latitude || 0,
  longitude: doc.longitude || 0,
  bedrooms: doc.bedrooms || 0,
  bathrooms: doc.bathrooms || 0,
  squareFeet: doc.squareFeet || 0,
  lotSize: doc.lotSize,
  yearBuilt: doc.yearBuilt,
  features: doc.features || [],
  amenities: doc.amenities || [],
  images: doc.images || [],
  videos: doc.videos || [],
  ownerId: doc.ownerId || '',
  listedBy: doc.listedBy || 'agent',
  listDate: doc.listDate || '',
  lastUpdated: doc.lastUpdated || '',
  isActive: doc.isActive !== undefined ? doc.isActive : true,
  isFeatured: doc.isFeatured || false,
  isVerified: doc.isVerified || false,
  tags: doc.tags || [],
  views: doc.views || 0,
  favorites: doc.favorites || 0,
  outright: doc.outright || false,
  paymentPlan: doc.paymentPlan || false,
  mortgageEligible: doc.mortgageEligible || false,
  customPlanAvailable: doc.customPlanAvailable || false,
  customPlanDepositPercent: doc.customPlanDepositPercent || 0,
  customPlanMonths: doc.customPlanMonths || 0,
})

// Simple Property Card for Chatbot
const SimplePropertyCard = ({
  property,
  onScheduleViewing,
  botReply, // Add this prop
}: {
  property: Property
  onScheduleViewing: (property: Property) => void
  botReply: (content: string) => void // Add this type
}) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(1)}K`
    }
    return `₦${price.toLocaleString()}`
  }

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : '/placeholder-property.jpg'

  // Function to handle card click (view property details)
  const handleCardClick = () => {
    botReply(
      `Let me tell you more about "${property.title}"! This beautiful property in ${property.city} features ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms. Would you like to schedule a viewing?`
    )
  }

  return (
    <div
      className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex gap-3">
        {/* Image */}
        <div className="shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
          <Image
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover"
            width={44}
            height={44}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 mb-1 hover:text-emerald-600">
            {property.title}
          </h4>

          <div className="flex items-center text-gray-600 text-xs mb-1">
            <MapPin size={12} className="mr-1" />
            <span className="line-clamp-1">
              {property.address}, {property.city}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            <div className="flex items-center">
              <Bed size={12} className="mr-1" />
              {property.bedrooms} bed
            </div>
            <div className="flex items-center">
              <Bath size={12} className="mr-1" />
              {property.bathrooms} bath
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-emerald-600 font-bold text-sm">
          {formatPrice(property.price)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation() // Prevent card click when clicking button
            onScheduleViewing(property)
          }}
          className="bg-emerald-600 text-white text-xs py-1 px-2 rounded hover:bg-emerald-700 transition-colors"
        >
          Schedule Viewing
        </button>
      </div>
    </div>
  )
}

// Enhanced intent detection with better NLP
const detectIntent = (message: string, memory: Memory) => {
  const text = message.toLowerCase().trim()

  // Basic Q&A detection
  // Enhanced Basic Q&A detection - should come FIRST
  if (
    // Name and identity questions
    /(what'?s your name|what is your name|who are you|what are you|introduce yourself|tell me about yourself|who is this)/i.test(
      text
    ) ||
    /(are you (a|an) (bot|ai|assistant|agent)|are you human|are you real)/i.test(
      text
    ) ||
    // Capabilities and functionality questions
    /(what can you do|what do you do|how can you help|what are your (functions|capabilities|features))/i.test(
      text
    ) ||
    /(what else can you do|what other things|what more can you)/i.test(text) ||
    /(can you help me with|can you assist with|what kind of help)/i.test(
      text
    ) ||
    // How it works questions
    /(how do you work|how does this work|how do you function)/i.test(text) ||
    /(how does (the|this) (chatbot|assistant) work)/i.test(text) ||
    // Purpose and scope questions
    /(what is your (purpose|role|job)|why were you created)/i.test(text) ||
    /(what is this (chat|conversation)|what is this about)/i.test(text) ||
    // Specific feature questions
    /(can you find properties|do you search for (homes|houses|properties))/i.test(
      text
    ) ||
    /(can you schedule viewings|do you book appointments)/i.test(text) ||
    /(can you connect me with agents|do you contact realtors)/i.test(text) ||
    // Limitations questions
    /(what can'?t you do|what are your limitations|what don'?t you do)/i.test(
      text
    ) ||
    /(are there any restrictions|is there anything you can'?t help with)/i.test(
      text
    ) ||
    // General help about the bot
    /(help me understand|explain yourself|tell me more about you)/i.test(
      text
    ) ||
    /(how to use you|how to talk to you|how should I use this)/i.test(text)
  ) {
    return 'basic_qa'
  }

  // Location search should come NEXT - before greeting
  if (
    /(properties|houses|homes|apartments|listings).*(in|at|near|around|within).*(lagos|abuja|ikeja|lekki|yaba|ikoyi|surulere|ajah|victoria island)/i.test(
      text
    ) ||
    /(in|at|near|around|within).*(lagos|abuja|ikeja|lekki|yaba|ikoyi|surulere|ajah|victoria island).*(properties|houses|homes|apartments)/i.test(
      text
    ) ||
    /(find|search|show|see|get).*(properties|houses|homes|apartments).*(in|at|near|around|within).*(lagos|abuja|ikeja|lekki)/i.test(
      text
    ) ||
    /(lagos|abuja|ikeja|lekki|yaba|ikoyi).*(properties|houses|homes|apartments|real estate)/i.test(
      text
    ) ||
    /(show me|i want|looking for).*(properties|houses).*(in|at).*(lagos|abuja|ikeja)/i.test(
      text
    ) ||
    /(properties|houses).*(for).*(lagos|abuja|ikeja)/i.test(text) ||
    // ADD THESE SIMPLE LOCATION PATTERNS:
    /^(lagos|abuja|ikeja|lekki|yaba|ikoyi|surulere|ajah|victoria island|vi)$/i.test(
      text
    ) ||
    /(i want|show me|find).*(in|at).*(lagos|abuja|ikeja|lekki)/i.test(text)
  ) {
    return 'location_search'
  }

  // Enhanced greeting detection
  if (
    /(hi|hello|hey|good\s(morning|afternoon|evening)|yo|what's up)/i.test(text)
  ) {
    return 'greeting'
  }

  // Enhanced thanks detection
  if (/(thanks|thank you|appreciate it|cheers|gracias)/i.test(text)) {
    return 'thanks'
  }

  // Enhanced property search
  if (
    /(property|properties|house|home|apartment|condo|townhouse|villa|duplex|estate|real estate)/i.test(
      text
    ) ||
    /(looking for|find|search|show me|browse).*(property|house|apartment)/i.test(
      text
    )
  ) {
    return 'property_search'
  }

  // Enhanced viewing request
  if (
    /(viewing|tour|visit|see|look at|inspect|schedule).*(property|house|apartment)/i.test(
      text
    ) ||
    /(can i see|want to visit|would like to view)/i.test(text)
  ) {
    return 'schedule_viewing'
  }

  // Enhanced agent contact
  if (
    /(agent|realtor|contact|speak with|talk to|representative|consultant)/i.test(
      text
    ) ||
    /(connect me|get in touch|reach out).*(agent)/i.test(text)
  ) {
    return 'contact_agent'
  }

  // Enhanced budget inquiry
  if (
    /(price|cost|budget|how much|afford|expensive|cheap)/i.test(text) ||
    /(what.*price|how much.*cost)/i.test(text)
  ) {
    return 'budget_info'
  }

  // Clear chat
  if (/(clear|reset|start over|new chat|restart)/i.test(text)) {
    return 'clear_chat'
  }

  // Help request
  if (
    /(help|what can you do|how does this work|what are my options)/i.test(text)
  ) {
    return 'help'
  }

  // Personal info sharing
  if (
    /(my name is|I am|call me|I'm)/i.test(text) ||
    (memory.name === undefined && /(name)/i.test(text))
  ) {
    return 'share_name'
  }

  // Contact info sharing
  if (
    /(email|phone|number|contact).*(is|mine)/i.test(text) ||
    /(my (email|phone) is)/i.test(text)
  ) {
    return 'share_contact'
  }

  // Property details questions
  if (
    /(tell me about|details|information|describe).*(property|house|apartment)/i.test(
      text
    ) ||
    /(what features|amenities|location|price).*(property)/i.test(text)
  ) {
    return 'property_details'
  }

  return 'unknown'
}

// Enhanced rule-based responses with more natural language
const getEnhancedRuleBasedResponse = (
  intent: string,
  userMessage: string,
  memory: Memory,
  propertiesCount: number = 0
): string => {
  switch (intent) {
    case 'greeting':
      const greetings = [
        `Hello${memory.name ? ` ${memory.name}` : ''}! 👋 It's wonderful to connect with you! How can I assist with your property journey today?`,
        `Hi there${memory.name ? ` ${memory.name}` : ''}! 🌟 So glad you're here! What kind of property adventure shall we embark on today?`,
        `Welcome back${memory.name ? ` ${memory.name}` : ''}! 🏡 Ready to find your perfect space? How can I help you today?`,
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]

    case 'thanks':
      const thanks = [
        "You're most welcome! 😊 I'm always delighted to help you find your perfect space. Is there anything else you'd like to explore?",
        "My pleasure! 🌟 I'm here whenever you need assistance with your property search. What would you like to do next?",
        "You're very welcome! 🏡 It's always a joy helping you. Feel free to ask me anything else about properties!",
      ]
      return thanks[Math.floor(Math.random() * thanks.length)]

    case 'property_search':
      if (propertiesCount > 0) {
        const successResponses = [
          `Fantastic! I've discovered ${propertiesCount} amazing propert${propertiesCount === 1 ? 'y' : 'ies'} that match your dreams! Let me show you these gems! 💎`,
          `Wonderful news! I found ${propertiesCount} propert${propertiesCount === 1 ? 'y' : 'ies'} that perfectly align with what you're seeking. Get ready to be impressed! 👀`,
          `Excellent! ${propertiesCount} beautiful propert${propertiesCount === 1 ? 'y' : 'ies'} are waiting for you! Let me present these wonderful options! 🏠`,
        ]
        return successResponses[
          Math.floor(Math.random() * successResponses.length)
        ]
      } else {
        return "I'd be thrilled to help you discover the perfect property! To find your ideal match, could you share:\n• Your preferred location?\n• Number of bedrooms needed?\n• Your comfortable budget range?\n• Any specific features you're dreaming of?"
      }

    case 'schedule_viewing':
      const viewingResponses = [
        "I'd be absolutely delighted to arrange a viewing for you! Which property has captured your heart, or shall I show you some stunning options first?",
        "How exciting! I'd love to help schedule a viewing. Have any properties caught your eye, or would you like me to showcase some beautiful options?",
        "Perfect! Let's get you inside your future home. Which property are you interested in viewing, or shall I present some wonderful choices?",
      ]
      return viewingResponses[
        Math.floor(Math.random() * viewingResponses.length)
      ]

    case 'contact_agent':
      if (memory.name && memory.email && memory.phone) {
        return `Perfect ${memory.name}! I have all your details and I'm connecting you with our expert real estate specialist right away! They'll reach out to you personally within the next few hours. 📞`
      } else {
        return "I'd be happy to connect you with one of our real estate experts who specializes in exactly what you're looking for! To ensure they can provide you with personalized assistance, could you share your name and contact information?"
      }

    case 'budget_info':
      return "Understanding your budget helps me find properties that are perfect for you without any stress! What price range feels comfortable for you? You could say something like 'around ₦50M' or 'between ₦20M to ₦80M' - whatever works best for you!"

    case 'clear_chat':
      return "I've refreshed our conversation! 🆕 Let's start anew - how can I assist you with your property search today?"

    case 'help':
      return `Of course! I'm your friendly real estate companion, here to make your property journey smooth and enjoyable! Here's how I can help:

🏠 **Discover Properties**: Find homes that match your style, budget, and dreams
📅 **Arrange Viewings**: Schedule visits at your convenience  
👨‍💼 **Expert Connections**: Get personalized help from specialist agents
💰 **Budget Planning**: Find perfect matches within your comfort zone
📍 **Area Insights**: Learn about neighborhoods and communities
💫 **Personalized Service**: Remember your preferences for better recommendations

What aspect of your property journey shall we explore together?`

    case 'share_name':
      const nameMatch = userMessage.match(
        /(?:my name is|I am|call me|I'm)\s+([A-Za-z\s]+)/i
      )
      const name = nameMatch
        ? nameMatch[1].trim()
        : userMessage.replace(/(name|call me|I am|I'm)/gi, '').trim()

      const nameResponses = [
        `What a beautiful name, ${name}! 😊 I'll remember that. How can I assist you with finding your perfect property today?`,
        `Lovely to meet you, ${name}! 🌟 I'm excited to help you on your property journey. What are we looking for today?`,
        `Hello ${name}! 🏡 It's a pleasure to make your acquaintance! How can I help you discover your dream property?`,
      ]
      return nameResponses[Math.floor(Math.random() * nameResponses.length)]

    case 'share_contact':
      const emailMatch = userMessage.match(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
      )
      const phoneMatch = userMessage.match(/(\+?[\d\s\-\(\)]{10,})/)

      let response = 'Thank you for sharing your contact details! '
      if (emailMatch) response += `I've saved your email (${emailMatch[1]}). `
      if (phoneMatch) response += `I've noted your phone number. `
      response += 'How may I assist you further with your property search?'
      return response

    case 'basic_qa':
      if (/(what.*your name|who.*you)/i.test(userMessage)) {
        return "I'm Reva, your friendly and dedicated real estate assistant! 🤗 I'm here to help you find your perfect property, schedule viewings, and connect with expert agents. Think of me as your personal property companion!"
      }
      if (/(what can you do|how can you help)/i.test(userMessage)) {
        return `I'm your all-in-one real estate companion! Here's how I can make your property journey amazing:

🏠 **Property Discovery**: Find homes that match your unique style and budget
📅 **Viewing Coordination**: Arrange property visits that fit your schedule  
👨‍💼 **Expert Introductions**: Connect you with specialized real estate agents
💰 **Budget Guidance**: Help find perfect properties within your range
📍 **Location Insights**: Share information about neighborhoods and areas
📝 **Personalized Service**: Remember your preferences for better recommendations
💬 **Friendly Support**: Be here whenever you have questions or need help

I'm here to make your property search enjoyable and successful! What would you like to start with?`
      }
      if (/(how.*work|how do you function)/i.test(userMessage)) {
        return 'I work by understanding your property needs through our conversation! I can search our database for matching properties, help schedule viewings, connect you with agents, and answer your questions. I learn your preferences to provide better recommendations over time! 🤖✨'
      }
      return "I'm Reva, your friendly real estate assistant! I help people find their perfect properties, schedule viewings, and connect with expert agents. How can I assist you with your property search today?"

    case 'property_details':
      return "I'd love to tell you more about our properties! While I can show you available listings with prices, features, and locations, for detailed specific information about particular properties, I recommend scheduling a viewing with our agents who can provide comprehensive details and answer all your questions! 🏡"

    case 'unknown':
    default:
      const unknownResponses = [
        "I'd be delighted to help you with your property search! You can ask me to:\n• Find properties in specific areas\n• Schedule viewings of interesting properties\n• Connect you with expert real estate agents\n• Get pricing information and guidance\n• Or simply tell me what you're dreaming of in a property!",
        "I'm here to assist with all things real estate! Feel free to:\n• Browse available properties\n• Arrange property viewings\n• Get connected with specialist agents\n• Learn about pricing and neighborhoods\n• Or share what kind of property you're looking for!",
        'Let me help you find your perfect property! You can:\n• Search for homes matching your criteria\n• Schedule visits to interesting properties\n• Connect with experienced agents\n• Get information about areas and pricing\n• Or simply describe your dream property to me!',
      ]
      return unknownResponses[
        Math.floor(Math.random() * unknownResponses.length)
      ]
  }
}

// Free AI API call function - Google Gemini
const callFreeAI = async (
  userMessage: string,
  conversationHistory: ChatMessage[],
  memory: Memory
): Promise<string | null> => {
  // Try Google Gemini API first (completely free)
  if (GEMINI_API_KEY) {
    try {
      const messages = [
        {
          role: 'user',
          parts: [
            {
              text: `You are Reva, a friendly and helpful real estate assistant. Context: ${JSON.stringify(memory)}. Recent conversation: ${conversationHistory
                .slice(-4)
                .map((msg) => `${msg.type}: ${msg.content}`)
                .join(
                  '\n'
                )}. Current message: ${userMessage}. Respond helpfully and concisely as a real estate assistant.`,
            },
          ],
        },
      ]

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null
    } catch (error) {
      console.warn('Gemini API failed, falling back to rule-based:', error)
    }
  }

  return null
}

// Enhanced smart response generator with free AI
const generateSmartResponse = async (
  intent: string,
  userMessage: string,
  memory: Memory,
  propertiesCount: number = 0,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  // For complex or unknown intents, try free AI first
  if (
    (intent === 'unknown' || userMessage.length > 20) &&
    conversationHistory.length > 2
  ) {
    try {
      const aiResponse = await callFreeAI(
        userMessage,
        conversationHistory,
        memory
      )
      if (aiResponse) {
        return aiResponse
      }
    } catch {}
  }

  // Fallback to enhanced rule-based responses
  return getEnhancedRuleBasedResponse(
    intent,
    userMessage,
    memory,
    propertiesCount
  )
}

export default function EnhancedChatbot() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadData, setLeadData] = useState<LeadFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    propertyInterest: '',
    budget: '',
    timeline: '',
    message: '',
    bedrooms: '',
    location: '',
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceMuted, setIsVoiceMuted] = useState(false)
  const [memory, setMemory] = useState<Memory>({})
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Clear chat function - completely resets everything
  const clearChat = () => {
    const welcomeMessage1: ChatMessage = {
      id: generateUniqueId(),
      type: 'bot',
      content:
        "I've cleared our conversation. How can I help you start fresh today? 🆕",
      timestamp: new Date(),
    }

    const welcomeMessage2: ChatMessage = {
      id: generateUniqueId(),
      type: 'bot',
      content: `Of course! I'm here to make your property search easier. Here's what I can help you with:

• **Find properties** that match your style and budget
• **Schedule viewings** at your convenience  
• **Connect with agents** who specialize in your preferred areas
• **Answer questions** about neighborhoods and pricing

What would you like to explore first?`,
      timestamp: new Date(),
    }

    setMessages([welcomeMessage1, welcomeMessage2])
    setMemory({})
    setProperties([])
    setDisplayedProperties([])
    localStorage.removeItem(LS_CONVO_KEY)
    localStorage.removeItem(LS_MEMORY_KEY)
  }

  // Load saved data from localStorage - only load text messages
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Load conversation - only load text messages, skip card messages
        const savedConvo = localStorage.getItem(LS_CONVO_KEY)
        if (savedConvo) {
          const parsed = JSON.parse(savedConvo)
          // Only load messages that are strings (text messages)
          const textMessages = parsed
            .filter(
              (msg: any) =>
                typeof msg.content === 'string' && msg.type !== 'card'
            )
            .map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          setMessages(textMessages)
        }

        // Load memory
        const savedMemory = localStorage.getItem(LS_MEMORY_KEY)
        if (savedMemory) {
          setMemory(JSON.parse(savedMemory))
        }

        // Load voice preference
        const savedVoiceMuted = localStorage.getItem(LS_VOICE_MUTED_KEY)
        setIsVoiceMuted(savedVoiceMuted === 'true')
      } catch (error) {
        console.warn('Error loading saved data:', error)
        // If there's an error loading, clear the corrupted data
        localStorage.removeItem(LS_CONVO_KEY)
        localStorage.removeItem(LS_MEMORY_KEY)
      }
    }

    loadSavedData()
  }, [])

  // Save conversation to localStorage - only save text messages
  useEffect(() => {
    if (messages.length > 0) {
      // Only save text messages (not card messages with React elements)
      const textMessages = messages.filter(
        (msg) => typeof msg.content === 'string' && msg.type !== 'card'
      )
      if (textMessages.length > 0) {
        localStorage.setItem(LS_CONVO_KEY, JSON.stringify(textMessages))
      }
    }
  }, [messages])

  // Save memory to localStorage
  useEffect(() => {
    if (Object.keys(memory).length > 0) {
      localStorage.setItem(LS_MEMORY_KEY, JSON.stringify(memory))
    }
  }, [memory])

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition ||
      null

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: generateUniqueId(),
        type: 'bot',
        content:
          "Hello there! 👋 I'm Reva, your friendly real estate assistant. I'm here to help you find your perfect home or investment property. What kind of property are you dreaming of today?",
        timestamp: new Date(),
      }

      setMessages([welcomeMessage])
    }
  }, [isOpen])

  // Load properties from Appwrite
  const loadProperties = async (
    filters?: Partial<Memory>
  ): Promise<Property[]> => {
    setIsLoadingProperties(true)
    try {
      const queries = [Query.equal('isActive', true), Query.limit(10)]

      const mem = { ...memory, ...filters }

      if (mem.bedrooms) {
        queries.push(Query.equal('bedrooms', parseInt(mem.bedrooms)))
      }

      // Enhanced location search - search in multiple fields
      if (mem.location) {
        const locationQueries = [
          Query.search('city', mem.location),
          Query.search('address', mem.location),
          Query.search('neighborhood', mem.location),
          Query.search('state', mem.location),
        ]
        queries.push(Query.or(locationQueries))
      }

      if (mem.propertyType) {
        queries.push(Query.equal('propertyType', mem.propertyType))
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        queries
      )

      const mappedProperties = response.documents.map(mapDocumentToProperty)
      setProperties(mappedProperties)
      return mappedProperties
    } catch (error) {
      console.error('Error loading properties:', error)
      botReply(
        "I'm having trouble accessing our property database right now. Please try again in a moment."
      )
      return []
    } finally {
      setIsLoadingProperties(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Process message with free AI integration
    setTimeout(async () => {
      await processUserMessage(inputMessage)
      setIsTyping(false)
    }, 1000)
  }

  // Enhanced memory update with better extraction
  const updateMemoryFromText = (text: string) => {
    const updates: Partial<Memory> = {}

    // Extract name
    const nameMatch = text.match(
      /(?:my name is|I am|call me|I'm)\s+([A-Za-z\s]+)/i
    )
    if (nameMatch) {
      updates.name = nameMatch[1].trim()
    }

    // Extract email
    const emailMatch = text.match(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    )
    if (emailMatch) {
      updates.email = emailMatch[1]
    }

    // Extract phone
    const phoneMatch = text.match(/(\+?[\d\s\-\(\)]{10,})/)
    if (phoneMatch) {
      updates.phone = phoneMatch[1].replace(/\s/g, '')
    }

    // Extract bedrooms
    const bedMatch = text.match(/(\d+)[\s-]?(bed|br|bedroom)/i)
    if (bedMatch) updates.bedrooms = bedMatch[1]

    // Extract location
    const locations = [
      'lagos',
      'ikeja',
      'sangotedo',
      'abuja',
      'lekki',
      'yaba',
      'ikoyi',
      'surulere',
      'ajah',
      'victoria island',
      'vi',
      'gwarinpa',
      'maitama',
      'asokoro',
      'port harcourt',
      'benin',
      'delta',
      'imo',
      'owerri',
      'agege',
      'ibadan',
      'kano',
      'aba',
      'owerri',
    ]
    for (const loc of locations) {
      if (text.includes(loc)) {
        updates.location = loc
        break
      }
    }

    // Extract property type
    const types = ['house', 'apartment', 'condo', 'land', 'townhouse']
    for (const type of types) {
      if (text.includes(type)) {
        updates.propertyType = type
        break
      }
    }

    // Extract budget
    const budgetMatch = text.match(
      /(\d+(?:[.,]?\d+)?)\s?(m|million|k|thousand)/i
    )
    if (budgetMatch) updates.budget = budgetMatch[0]

    if (Object.keys(updates).length > 0) {
      setMemory((prev) => ({ ...prev, ...updates }))
    }
  }

  const processUserMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Update memory with enhanced extraction
    updateMemoryFromText(message)

    // Detect intent using smart NLP
    const intent = detectIntent(message, memory)

    let botResponse = ''

    // Handle different intents
    switch (intent) {
      case 'clear_chat':
        clearChat()
        return

      case 'location_search':
        // Extract location from message
        const locationMatch = lowerMessage.match(
          /(lagos|abuja|ikeja|lekki|yaba|ikoyi|surulere|ajah|victoria island|vi|gwarinpa|maitama|asokoro|agege|sangotedo|delta|port-harcourt|benin|ogun|abeokuta)/i
        )
        const detectedLocation = locationMatch
          ? locationMatch[1].toLowerCase()
          : memory.location

        if (detectedLocation) {
          // Load properties for this location
          const properties = await loadProperties({
            location: detectedLocation,
          })
          if (properties.length > 0) {
            botResponse = `Great! I found ${properties.length} properties in ${detectedLocation.charAt(0).toUpperCase() + detectedLocation.slice(1)}. Let me show you what's available! 🏡`

            // First send the bot response
            botReply(botResponse)

            // Then add property cards as separate messages
            setTimeout(() => {
              const propertyMessages: ChatMessage[] = properties
                .slice(0, 3)
                .map((property) => ({
                  id: generateUniqueId(),
                  type: 'card',
                  content: 'property_card', // Special identifier
                  timestamp: new Date(),
                  propertyData: [property], // Store single property in array
                }))

              setMessages((prev) => [...prev, ...propertyMessages])
            }, 500)

            return // Return early since we manually sent messages
          } else {
            botResponse = `I searched but couldn't find any available properties in ${detectedLocation.charAt(0).toUpperCase() + detectedLocation.slice(1)} at the moment. Would you like to try a different location?`
          }
        } else {
          botResponse =
            "I'd love to help you find properties in specific areas! Which location are you interested in? You can say areas like Lagos, Abuja, Ikeja, Lekki, etc."
        }
        break

      case 'property_search':
        const properties = await loadProperties()
        if (properties.length > 0) {
          botResponse = await generateSmartResponse(
            intent,
            message,
            memory,
            properties.length,
            messages
          )

          // First send the bot response
          botReply(botResponse)

          // Then add property cards as separate messages
          setTimeout(() => {
            const propertyMessages: ChatMessage[] = properties
              .slice(0, 3)
              .map((property) => ({
                id: generateUniqueId(),
                type: 'card',
                content: 'property_card',
                timestamp: new Date(),
                propertyData: [property],
              }))

            setMessages((prev) => [...prev, ...propertyMessages])
          }, 500)

          return // Return early since we manually sent messages
        } else {
          botResponse = await generateSmartResponse(
            intent,
            message,
            memory,
            0,
            messages
          )
        }
        break

      case 'schedule_viewing':
        botResponse = await generateSmartResponse(
          intent,
          message,
          memory,
          0,
          messages
        )
        setShowLeadForm(true)
        setCurrentStep(2)
        break

      case 'contact_agent':
        botResponse = await generateSmartResponse(
          intent,
          message,
          memory,
          0,
          messages
        )
        setShowLeadForm(true)
        setCurrentStep(0)
        break

      case 'budget_info':
        botResponse = await generateSmartResponse(
          intent,
          message,
          memory,
          0,
          messages
        )
        setShowLeadForm(true)
        setCurrentStep(3)
        break

      default:
        botResponse = await generateSmartResponse(
          intent,
          message,
          memory,
          0,
          messages
        )
    }

    botReply(botResponse)
  }

  const botReply = (content: string) => {
    const botMessage: ChatMessage = {
      id: generateUniqueId(),
      type: 'bot',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
    speakIfAvailable(content)
  }

  const handleScheduleViewing = (property: Property) => {
    setShowLeadForm(true)
    setCurrentStep(2)
    setLeadData((prev) => ({
      ...prev,
      propertyInterest: property.title,
      message: `I'm interested in viewing: ${property.title} in ${property.city}`,
    }))
    botReply(
      `Perfect! I've started scheduling a viewing for "${property.title}". Please fill in your details below and let me know your preferred viewing time.`
    )
  }

  // Render message content safely
  const renderMessageContent = (message: ChatMessage) => {
    if (
      message.type === 'card' &&
      message.propertyData &&
      message.propertyData.length > 0
    ) {
      return (
        <div className="space-y-3">
          {message.propertyData.map((property) => (
            <SimplePropertyCard
              key={`property-${property.$id}-${message.id}`}
              property={property}
              onScheduleViewing={handleScheduleViewing}
              botReply={botReply}
            />
          ))}
          <div className="text-center text-sm text-gray-600 mt-2">
            <p>Found {message.propertyData.length} properties</p>
            {properties.length > 3 && (
              <button
                onClick={() => {
                  botReply('Let me load more properties for you...')
                  loadProperties(memory).then((props) => {
                    if (props.length > 0) {
                      // Create new card messages with more properties
                      const morePropertyMessages: ChatMessage[] = props
                        .slice(0, 6)
                        .map((property) => ({
                          id: generateUniqueId(),
                          type: 'card',
                          content: '',
                          timestamp: new Date(),
                          propertyData: [property],
                        }))

                      // Remove the current property cards and add new ones
                      setMessages((prev) => [
                        ...prev.filter((msg) => msg.type !== 'card'),
                        ...morePropertyMessages,
                      ])
                    }
                  })
                }}
                className="mt-1 text-emerald-600 hover:text-emerald-800 font-medium underline text-xs"
              >
                Load more properties
              </button>
            )}
          </div>
        </div>
      )
    }

    // For regular messages
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      botReply("I'm listening... Please tell me what you're looking for!")
    }
  }

  const toggleVoiceOutput = () => {
    const newMutedState = !isVoiceMuted
    setIsVoiceMuted(newMutedState)
    localStorage.setItem(LS_VOICE_MUTED_KEY, String(newMutedState))
  }

  const speakIfAvailable = (text: string) => {
    if (!('speechSynthesis' in window) || isVoiceMuted) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.lang = 'en-US'

    const voices = window.speechSynthesis.getVoices()
    const femaleVoice = voices.find(
      (voice) =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman')
    )

    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const handleLeadFormChange = (field: keyof LeadFormData, value: string) => {
    setLeadData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveLeadToAppwrite = async (leadData: LeadFormData) => {
    try {
      // Validate that we have the required collection IDs
      if (!DATABASE_ID || !LEADS_COLLECTION_ID) {
        throw new Error(
          'Missing database configuration. Please check your environment variables.'
        )
      }

      const leadDocument = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        propertyInterest: leadData.propertyInterest || '',
        budget: leadData.budget || '',
        timeline: leadData.timeline || '',
        message: leadData.message || '',
        bedrooms: leadData.bedrooms || '',
        location: leadData.location || '',
        source: 'chatbot',
        status: 'new',
        assignedAgentId: null,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      }

      const result = await databases.createDocument(
        DATABASE_ID,
        LEADS_COLLECTION_ID,
        ID.unique(),
        leadDocument
      )

      console.log('Lead saved to Appwrite:', result)
      return result
    } catch (error) {
      console.error('Error saving lead to Appwrite:', error)
      throw error
    }
  }

  const handleLeadSubmit = async () => {
    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.phone) {
      botReply(
        "To help you best, I'll need your name, email, and phone number. Please fill in all the required fields."
      )
      return
    }

    try {
      setIsTyping(true)
      await saveLeadToAppwrite(leadData)

      // Success message
      botReply(
        'Thank you so much! Your information has been saved and one of our expert agents will contact you shortly. They will reach out to you within the next 24 hours. 📞'
      )

      // Reset form and close it
      setShowLeadForm(false)
      setLeadData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        propertyInterest: '',
        budget: '',
        timeline: '',
        message: '',
        bedrooms: '',
        location: '',
      })
      setCurrentStep(0)
    } catch (error) {
      console.error('Lead submission error:', error)
      botReply(
        "Thank you for your information! While I'm having some technical difficulties saving it right now, our team will still be able to assist you. Please try again in a moment or call us directly."
      )
    } finally {
      setIsTyping(false)
    }
  }

  const quickReplies = [
    {
      label: '🏠 Browse Properties',
      action: () => {
        botReply(
          'Let me show you some wonderful properties we have available...'
        )
        loadProperties().then((props) => {
          if (props.length > 0) {
            setDisplayedProperties(props.slice(0, 3))
          }
        })
      },
    },
    {
      label: '📅 Schedule Viewing',
      action: () => {
        setShowLeadForm(true)
        setCurrentStep(2)
        botReply("I'd be happy to schedule a viewing for you!")
      },
    },
    {
      label: '👨‍💼 Contact Agent',
      action: () => {
        setShowLeadForm(true)
        setCurrentStep(0)
        botReply('Let me connect you with one of our expert agents!')
      },
    },
    {
      label: '🗑️ Clear Chat',
      action: () => {
        clearChat()
      },
    },
    {
      label: '📍 Search by Location',
      action: () => {
        botReply(
          'Which location are you interested in? You can say areas like Lagos, Abuja, Ikeja, Lekki, etc.'
        )
      },
    },
  ]

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-50 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-0 lg:bottom-6 right-0 lg:right-6 w-full lg:w-96 lg:h-[600px] h-screen bg-white lg:rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 lg:rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Avatar>
                  <AvatarImage src="/bot.jpg" alt="Reva" />
                </Avatar>
              </div>
              <div>
                <h3 className="font-semibold">Reva</h3>
                <p className="text-emerald-100 text-xs">
                  Online • Ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceOutput}
                className="p-1 hover:bg-emerald-700 hover:rounded-full hover:transition-all hover:bg-opacity-10 rounded transition-colors"
                title={isVoiceMuted ? 'Unmute voice' : 'Mute voice'}
              >
                {isVoiceMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={toggleVoiceInput}
                className={`p-1 rounded transition-colors ${
                  isListening
                    ? 'bg-emerald-700 bg-opacity-20'
                    : 'hover:bg-emerald-700 hover:rounded-full hover:transition-all hover:bg-opacity-10'
                }`}
                title="Voice input"
              >
                <Mic size={16} className={isListening ? 'text-red-300' : ''} />
              </button>
              <button
                onClick={clearChat}
                className="p-1 hover:bg-emerald-700 hover:rounded-full hover:transition-all hover:bg-opacity-10 rounded transition-colors"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-red-600 hover:bg-opacity-10 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.type === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : message.type === 'bot'
                          ? 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                          : 'bg-white border border-gray-200 rounded-lg w-full'
                    }`}
                  >
                    {renderMessageContent(message)}
                    <p
                      className={`text-xs mt-1 ${
                        message.type === 'user'
                          ? 'text-emerald-200'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none p-3 border border-gray-200 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Reva is thinking...
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Replies */}
              {messages.length > 2 && !showLeadForm && (
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={`quick-reply-${index}-${reply.label}-${generateUniqueId()}`}
                      onClick={reply.action}
                      className="bg-white border border-gray-300 rounded-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {reply.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Property Cards Display */}
              {displayedProperties.length > 0 && !showLeadForm && (
                <div className="space-y-3">
                  {displayedProperties.map((property) => (
                    <SimplePropertyCard
                      key={`property-${property.$id}-${generateUniqueId()}`}
                      property={property}
                      onScheduleViewing={handleScheduleViewing}
                      botReply={botReply}
                    />
                  ))}
                </div>
              )}

              {/* Lead Capture Form */}
              {showLeadForm && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Please share your details:
                  </h4>

                  <div className="space-y-3">
                    {currentStep === 0 && (
                      <>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="w-4 h-4" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={leadData.name}
                            onChange={(e) =>
                              handleLeadFormChange('name', e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={leadData.email}
                            onChange={(e) =>
                              handleLeadFormChange('email', e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={leadData.phone}
                            onChange={(e) =>
                              handleLeadFormChange('phone', e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <Home className="w-4 h-4" />
                          Property Type
                        </label>
                        <select
                          value={leadData.propertyInterest}
                          onChange={(e) =>
                            handleLeadFormChange(
                              'propertyInterest',
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Select property type</option>
                          <option value="house">House</option>
                          <option value="apartment">Apartment</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="land">Land</option>
                        </select>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4" />
                          When would you like to visit?
                        </label>
                        <input
                          type="text"
                          value={leadData.timeline}
                          onChange={(e) =>
                            handleLeadFormChange('timeline', e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., This weekend, Next week..."
                        />
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-2">
                        <label className="text-sm text-gray-700">
                          Budget Range
                        </label>
                        <select
                          value={leadData.budget}
                          onChange={(e) =>
                            handleLeadFormChange('budget', e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Select budget range</option>
                          <option value="under-10m">Under ₦10M</option>
                          <option value="10m-30m">₦10M - ₦30M</option>
                          <option value="30m-60m">₦30M - ₦60M</option>
                          <option value="60m-plus">₦60M+</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm text-gray-700">
                        Additional Message (Optional)
                      </label>
                      <textarea
                        value={leadData.message}
                        onChange={(e) =>
                          handleLeadFormChange('message', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Any specific requirements or questions?"
                        rows={2}
                      />
                    </div>

                    <button
                      onClick={handleLeadSubmit}
                      disabled={
                        !leadData.name ||
                        !leadData.email ||
                        !leadData.phone ||
                        isTyping
                      }
                      className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isTyping ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Information'
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          {!showLeadForm && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
