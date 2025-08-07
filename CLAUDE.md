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
GROQ_API_KEY=gsk_your_groq_key_here
```

### Production
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

## Key Features

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

## Firebase Migration Note

The project has Firebase configuration files and migration scripts available, but currently uses a file-based approach for zero operational costs. Firebase integration is optional and configured for future scalability.

## Deployment Considerations

- Built for Vercel deployment with zero configuration
- TypeScript and ESLint checks disabled in build (handled by Vercel)
- PWA generation disabled in development
- Remote image optimization configured for event images