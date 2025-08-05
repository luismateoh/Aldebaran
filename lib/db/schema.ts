import { pgTable, serial, text, timestamp, boolean, integer, varchar, jsonb } from 'drizzle-orm/pg-core'

// Tabla de eventos
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(), // ej: "2024-12-15_cali_carrerariocali"
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  
  // Metadata del evento
  category: varchar('category', { length: 50 }).notNull().default('Running'),
  snippet: text('snippet'),
  altitude: varchar('altitude', { length: 20 }),
  
  // Fechas y ubicación
  eventDate: timestamp('event_date').notNull(),
  registrationDeadline: timestamp('registration_deadline'),
  municipality: varchar('municipality', { length: 100 }).notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  
  // Organización
  organizer: text('organizer'),
  website: text('website'),
  registrationFee: varchar('registration_fee', { length: 50 }),
  
  // Contenido
  content: text('content'), // Contenido markdown
  contentHtml: text('content_html'), // HTML renderizado
  cover: text('cover'), // URL de imagen de portada
  
  // Distancias como JSON
  distances: jsonb('distances').$type<string[]>().default([]),
  
  // Tags como JSON
  tags: jsonb('tags').$type<string[]>().default([]),
  
  // Metadatos de sistema
  author: varchar('author', { length: 100 }).default('Luis Hincapie'),
  publishDate: timestamp('publish_date').defaultNow(),
  draft: boolean('draft').default(false),
  featured: boolean('featured').default(false),
  
  // URLs de Blob Storage
  markdownUrl: text('markdown_url'), // URL del archivo MD en Blob Storage
  
  // Auditoría
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  
  // Estadísticas
  views: integer('views').default(0),
  commentsCount: integer('comments_count').default(0),
})

// Tabla de comentarios
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull(),
  author: varchar('author', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  
  // Moderación
  approved: boolean('approved').default(true),
  flagged: boolean('flagged').default(false),
  
  // Metadatos
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
})

// Tabla de propuestas de eventos
export const eventProposals = pgTable('event_proposals', {
  id: serial('id').primaryKey(),
  
  // Datos del evento propuesto
  title: text('title').notNull(),
  eventDate: timestamp('event_date').notNull(),
  municipality: varchar('municipality', { length: 100 }).notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  organizer: text('organizer'),
  website: text('website'),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('Running'),
  registrationFee: varchar('registration_fee', { length: 50 }),
  distances: jsonb('distances').$type<string[]>().default([]),
  
  // Metadatos de la propuesta
  submittedBy: varchar('submitted_by', { length: 100 }).default('public_form'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  
  // Estado de la propuesta
  status: varchar('status', { length: 20 }).default('pending'), // pending, approved, rejected, published
  reviewedBy: varchar('reviewed_by', { length: 100 }),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  
  // Si se convirtió en evento
  publishedEventId: varchar('published_event_id', { length: 255 }),
  
  // Metadatos técnicos
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
})

// Tabla de estadísticas
export const siteStats = pgTable('site_stats', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Tabla de logs de actividad
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 100 }).notNull(),
  details: jsonb('details'),
  timestamp: timestamp('timestamp').defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
})

// Tipos TypeScript
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type EventProposal = typeof eventProposals.$inferSelect
export type NewEventProposal = typeof eventProposals.$inferInsert