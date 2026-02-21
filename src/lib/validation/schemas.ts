/**
 * Zod validation schemas for all 15 entity types — DOC-020 §3.1–3.15
 * Server-side authoritative validation per DOC-000 §10.1
 */
import { z } from 'zod';

// ─── Shared fields ──────────────────────────────────────────
const timestamps = {
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
};

const contentBase = {
  isActive: z.boolean(),
  order: z.number().int(),
  archivedAt: z.string().datetime().nullable().optional(),
  ...timestamps,
};

// ─── CRM: Lead (§3.1) ──────────────────────────────────────
export const leadStatusEnum = z.enum([
  'new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'archived',
]);

export const leadPriorityEnum = z.enum(['high', 'medium', 'low']);

export const leadSchema = z.object({
  _id: z.string(),
  _type: z.literal('lead'),
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  source: z.string().min(1),
  status: leadStatusEnum,
  priority: leadPriorityEnum.optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  servicesInterested: z.array(z.string()).optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  estimatedValue: z.number().optional(),
  referredBy: z.string().optional(),
  convertedToClientId: z.string().nullable().optional(),
  convertedAt: z.string().datetime().nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  ...timestamps,
});

/** Schema for public lead intake (contact form) */
export const leadIntakeSchema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  message: z.string().min(1, 'הודעה היא שדה חובה'),
  company: z.string().optional(),
  phone: z.string().optional(),
  servicesInterested: z.array(z.string()).optional(),
  turnstileToken: z.string().min(1).optional(),
  _honeypot: z.string().max(0, 'Bot detected').optional(),
});

// ─── CRM: Client CRM (§3.2) ────────────────────────────────
export const clientCrmStatusEnum = z.enum([
  'active', 'completed', 'inactive', 'archived',
]);

export const preferredContactEnum = z.enum(['phone', 'email', 'message']);

export const clientCrmSchema = z.object({
  _id: z.string(),
  _type: z.literal('clientCrm'),
  name: z.string().min(1),
  email: z.string().email(),
  status: clientCrmStatusEnum,
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  preferredContact: preferredContactEnum.optional(),
  sourceLead: z.object({ _ref: z.string() }).optional(),
  notes: z.string().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  ...timestamps,
});

// ─── CRM: Engagement (§3.3) ────────────────────────────────
export const engagementStatusEnum = z.enum([
  'new', 'in_progress', 'review', 'delivered', 'completed', 'paused', 'cancelled',
]);

export const engagementSchema = z.object({
  _id: z.string(),
  _type: z.literal('engagement'),
  title: z.string().min(1),
  client: z.object({ _ref: z.string() }),
  status: engagementStatusEnum.optional(),
  engagementType: z.string().optional(),
  value: z.number().optional(),
  estimatedDuration: z.string().optional(),
  scope: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  description: z.string().optional(),
  internalNotes: z.string().optional(),
  ...timestamps,
});

// ─── CRM: Activity (§3.4) ──────────────────────────────────
export const activityTypeEnum = z.enum([
  'status_change', 'note_added', 'lead_created', 'lead_converted',
  'client_created', 'lead_archived', 'client_archived', 'record_restored',
  'record_updated', 'duplicate_submission', 'bulk_operation',
  'call_logged', 'email_sent', 'email_received',
  'site_visit_scheduled', 'site_visit_completed',
  'quote_sent', 'quote_accepted', 'quote_rejected', 'custom',
]);

export const activityEntityTypeEnum = z.enum(['lead', 'client', 'engagement']);

export const activitySchema = z.object({
  _id: z.string(),
  _type: z.literal('activity'),
  entityType: activityEntityTypeEnum,
  entityId: z.string().min(1),
  type: activityTypeEnum,
  description: z.string().min(1),
  performedBy: z.string().min(1),
  metadata: z.object({
    previousStatus: z.string().optional(),
    newStatus: z.string().optional(),
    details: z.string().optional(),
  }).optional(),
  createdAt: z.string().datetime(),
});

// ─── CRM: CrmSettings (§3.5) ───────────────────────────────
const stageSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  color: z.string().min(1),
});

export const crmSettingsSchema = z.object({
  _id: z.string(),
  _type: z.literal('crmSettings'),
  pipelineStages: z.array(stageSchema),
  engagementStatuses: z.array(stageSchema),
  serviceTypes: z.array(z.string()),
  leadSources: z.array(z.string()),
  defaultPriority: z.string(),
  currency: z.string(),
  engagementLabel: z.string(),
  updatedAt: z.string().datetime(),
});

// ─── Content: Service (§3.6) ────────────────────────────────
export const serviceSchema = z.object({
  _id: z.string(),
  _type: z.literal('service'),
  name: z.string().min(1),
  slug: z.object({ current: z.string().min(1) }),
  description: z.string().min(1),
  tagline: z.string().optional(),
  icon: z.string().optional(),
  highlights: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  })).optional(),
  detailContent: z.array(z.unknown()).optional(),
  image: z.unknown().optional(),
  ...contentBase,
});

// ─── Content: Project (§3.7) ────────────────────────────────
export const projectSectorEnum = z.enum([
  'security', 'commercial', 'industrial', 'infrastructure', 'residential', 'public',
]);

export const projectSchema = z.object({
  _id: z.string(),
  _type: z.literal('project'),
  title: z.string().min(1),
  slug: z.object({ current: z.string().min(1) }),
  client: z.string().min(1),
  sector: projectSectorEnum,
  description: z.array(z.unknown()).optional(),
  scope: z.array(z.string()).optional(),
  location: z.string().optional(),
  images: z.array(z.unknown()).optional(),
  featuredImage: z.unknown().optional(),
  isFeatured: z.boolean().optional(),
  startDate: z.string().optional(),
  completedAt: z.string().optional(),
  ...contentBase,
});

// ─── Content: TeamMember (§3.8) ─────────────────────────────
export const teamCategoryEnum = z.enum([
  'founders', 'management', 'department-heads', 'project-managers',
]);

const degreeSchema = z.object({
  title: z.string().min(1),
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.number().optional(),
});

export const teamMemberSchema = z.object({
  _id: z.string(),
  _type: z.literal('teamMember'),
  name: z.string().min(1),
  role: z.string().min(1),
  category: teamCategoryEnum,
  image: z.unknown().optional(),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  degrees: z.array(degreeSchema).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  email: z.string().optional(),
  phone: z.string().optional(),
  ...contentBase,
});

// ─── Content: Client Content (§3.9) ────────────────────────
export const clientContentSchema = z.object({
  _id: z.string(),
  _type: z.literal('clientContent'),
  name: z.string().min(1),
  logo: z.unknown().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  ...contentBase,
});

// ─── Content: Testimonial (§3.10) ──────────────────────────
export const testimonialSchema = z.object({
  _id: z.string(),
  _type: z.literal('testimonial'),
  clientName: z.string().min(1),
  quote: z.string().min(1),
  projectRef: z.object({ _ref: z.string().min(1) }),
  companyName: z.string().optional(),
  role: z.string().optional(),
  isFeatured: z.boolean().optional(),
  image: z.unknown().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean(),
  archivedAt: z.string().datetime().nullable().optional(),
  ...timestamps,
});

// ─── Content: PressItem (§3.11) ─────────────────────────────
export const pressItemSchema = z.object({
  _id: z.string(),
  _type: z.literal('pressItem'),
  title: z.string().min(1),
  source: z.string().optional(),
  publishDate: z.string().optional(),
  excerpt: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  image: z.unknown().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean(),
  archivedAt: z.string().datetime().nullable().optional(),
  ...timestamps,
});

// ─── Content: Job (§3.12) ──────────────────────────────────
export const jobSchema = z.object({
  _id: z.string(),
  _type: z.literal('job'),
  title: z.string().min(1),
  description: z.array(z.unknown()).optional(),
  requirements: z.array(z.unknown()).optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  department: z.string().optional(),
  contactEmail: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean(),
  archivedAt: z.string().datetime().nullable().optional(),
  ...timestamps,
});

// ─── Content: ContentLibraryItem (§3.13) ───────────────────
export const contentLibraryItemSchema = z.object({
  _id: z.string(),
  _type: z.literal('contentLibraryItem'),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  image: z.unknown().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean(),
  archivedAt: z.string().datetime().nullable().optional(),
  ...timestamps,
});

// ─── Content: HeroSettings (§3.14) ─────────────────────────
export const heroSettingsSchema = z.object({
  _id: z.string(),
  _type: z.literal('heroSettings'),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  videoFile: z.unknown().optional(),
  backgroundImage: z.unknown().optional(),
  ...timestamps,
});

// ─── Content: SiteSettings (§3.15) ─────────────────────────
export const siteSettingsSchema = z.object({
  _id: z.string(),
  _type: z.literal('siteSettings'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  footerText: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
  }).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  ogImage: z.unknown().optional(),
  ...timestamps,
});
