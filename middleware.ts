import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Admin routes are now protected client-side with Firebase Auth
  // Server-side API routes are protected with Firebase Admin SDK
  return NextResponse.next()
}

export const config = {
  // Remove middleware matcher since we're using client-side auth guards
  matcher: []
}