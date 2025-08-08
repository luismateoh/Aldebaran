import { NextRequest } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import './firebase-admin'
import { adminServiceServer } from './admin-firebase-server'

export interface AuthResult {
  success: boolean
  user?: {
    uid: string
    email: string
    email_verified?: boolean
  }
  error?: string
}

export interface LegacyAuthResult {
  isAuthenticated: boolean
  isAdmin: boolean
  user: {
    uid: string
    email: string | null
  } | null
  error?: string
}

/**
 * New admin token verification using Firestore multi-admin system
 */
export async function verifyAdminToken(request: NextRequest): Promise<AuthResult> {
  try {
    console.log('🔐 verifyAdminToken: Starting authentication...')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.log('❌ verifyAdminToken: No authorization header')
      return { success: false, error: 'No authorization header' }
    }

    // Extract the token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.log('❌ verifyAdminToken: No token provided')
      return { success: false, error: 'No token provided' }
    }

    console.log('🔐 verifyAdminToken: Token found, verifying...')

    // Verify the ID token with additional validation
    const decodedToken = await getAuth().verifyIdToken(token, true)
    console.log('✅ verifyAdminToken: Token verified for user:', decodedToken.email)
    
    if (!decodedToken.email) {
      console.log('❌ verifyAdminToken: No email in token')
      return { success: false, error: 'No email in token' }
    }

    console.log('👤 verifyAdminToken: Checking admin status for:', decodedToken.email)

    // Check if user is admin using the new multi-admin system
    const isAdmin = await adminServiceServer.isAdmin(decodedToken.email)
    console.log('🔍 verifyAdminToken: Admin check result:', isAdmin)
    
    if (!isAdmin) {
      console.log('❌ verifyAdminToken: User is not an administrator')
      return { success: false, error: 'User is not an administrator' }
    }

    console.log('✅ verifyAdminToken: Admin verified, updating last login...')

    // Update last login for the admin
    await adminServiceServer.updateAdministratorLastLogin(decodedToken.email)

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified || false
      }
    }
  } catch (error) {
    console.error('Error verifying admin token:', error)
    
    // Handle specific Firebase auth errors
    if (error instanceof Error) {
      if (error.message.includes('no "kid" claim')) {
        console.log('🔄 verifyAdminToken: Token missing kid claim - client should refresh token')
        return { 
          success: false, 
          error: 'Token invalid - please refresh and try again'
        }
      }
      
      if (error.message.includes('expired')) {
        console.log('⏰ verifyAdminToken: Token expired')
        return { 
          success: false, 
          error: 'Token expired - please sign in again'
        }
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Token verification failed'
    }
  }
}

/**
 * Legacy function for backwards compatibility
 */
export async function verifyAuth(request: NextRequest): Promise<LegacyAuthResult> {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: 'No valid authorization header'
      }
    }

    const idToken = authHeader.split('Bearer ')[1]
    
    if (!idToken) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: 'No token provided'
      }
    }

    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken)
    
    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null
    }

    // Use the new multi-admin system
    const isAdmin = user.email ? await adminServiceServer.isAdmin(user.email) : false

    return {
      isAuthenticated: true,
      isAdmin,
      user
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      error: 'Invalid token'
    }
  }
}

export function requireAuth(handler: (request: NextRequest, authResult: LegacyAuthResult) => Promise<Response>) {
  return async (request: NextRequest) => {
    const authResult = await verifyAuth(request)
    
    if (!authResult.isAuthenticated) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return handler(request, authResult)
  }
}

export function requireAdmin(handler: (request: NextRequest, authResult: LegacyAuthResult) => Promise<Response>) {
  return async (request: NextRequest) => {
    const authResult = await verifyAuth(request)
    
    if (!authResult.isAuthenticated) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!authResult.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return handler(request, authResult)
  }
}