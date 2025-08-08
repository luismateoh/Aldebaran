# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aldebaran is a modern athletics events platform for Colombia built with Next.js 14. The system manages running events through Markdown files and provides both AI-enhanced and simple event creation workflows.

## Common Development Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production  
npm run start              # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues automatically
npm run typecheck          # TypeScript type checking
npm run format:write       # Format code with Prettier
npm run format:check       # Check code formatting

# Firebase (if using Firebase backend)
npm run firebase:emulators # Start Firebase emulators
npm run firebase:deploy    # Deploy to Firebase
npm run firebase:deploy-rules # Deploy Firestore rules and indexes

# Preview
npm run preview            # Build and start production server locally
```

## Architecture Overview

### Data Storage Strategy
- **Events**: Stored as Markdown files in `/events/` directory with frontmatter metadata
- **Comments**: JSON files in `/data/comments/` (file-based system for zero cost)
- **Images**: SVG files in `/public/images/events/` with fallback to defaults

### Dual Environment Approach
- **Development**: Full AI integration with Groq for event enhancement
- **Production**: Simple form submission with EmailJS for admin notifications

### Key Directories
- `app/`: Next.js 14 App Router pages and API routes
- `components/`: React components including UI components from Radix
- `lib/`: Shared utilities, types, and service functions
- `events/`: Markdown files for each athletics event
- `data/comments/`: JSON files for event comments
- `hooks/`: Custom React hooks
- `scripts/`: Utility scripts for setup and migration

## Event Data Structure

Events follow this TypeScript interface:
```typescript
type EventData = {
  id: string
  title: string
  author: string
  publishDate: string
  draft: boolean
  category: string
  tags: string[]
  snippet: string
  altitude: string
  eventDate: string
  organizer: string
  registrationDeadline: string
  registrationFeed: string
  website: string
  distances: string[]
  cover: string
  department: string
  municipality: string
  contentHtml: string
}
```

## Environment Variables Required

### Development (.env.local)
```bash
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin SDK (Required for API routes)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# AI Enhancement (Optional)
GROQ_API_KEY=gsk_your_groq_key_here

# Email Notifications (Optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

### Production
Same as development variables above.

## Key Features

### Firebase Authentication
- Google OAuth integration for secure admin access
- Restricted to luismateohm@gmail.com for admin privileges
- Server-side authentication using Firebase Admin SDK
- Client-side authentication state management
- User menu in navbar with profile photo and logout functionality

### AI Integration
- Uses Groq AI (free tier) for event content enhancement
- Only active in development environment
- Fallback to simple form submission in production

### Comment System
- File-based storage (no database required)
- Automatic moderation with word filtering
- Rate limiting through natural file system constraints

### PWA Support
- Progressive Web App configured with next-pwa
- Service worker for offline functionality
- Disabled in development mode

## Firebase Integration

The project now uses Firebase as the primary backend:
- **Authentication**: Google OAuth with admin role restrictions
- **Database**: Firestore for events and comments
- **Security**: Server-side authentication with Firebase Admin SDK
- **Client**: Real-time updates and client-side auth state management

## Deployment Considerations

- Built for Vercel deployment with zero configuration
- TypeScript and ESLint checks disabled in build (handled by Vercel)
- PWA generation disabled in development
- Remote image optimization configured for event images