/**
 * Input validation schemas (create/update variants) — DOC-040 §2
 * These omit server-set fields (_id, _type, createdAt, updatedAt).
 */
import { z } from 'zod';
import {
  leadStatusEnum, leadPriorityEnum, clientCrmStatusEnum,
  engagementStatusEnum, activityTypeEnum, activityEntityTypeEnum,
  projectSectorEnum, teamCategoryEnum, preferredContactEnum,
} from './schemas';

// ─── Team Member ────────────────────────────────────────────

const degreeInput = z.object({
  title: z.string().min(1),
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.number().optional(),
});

export const teamMemberCreateSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  category: teamCategoryEnum,
  image: z.any().optional(),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  degrees: z.array(degreeInput).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  email: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const teamMemberUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  category: teamCategoryEnum.optional(),
  image: z.any().optional(),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  degrees: z.array(degreeInput).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  email: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Project ────────────────────────────────────────────────

export const projectCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  client: z.string().min(1),
  sector: projectSectorEnum,
  description: z.string().optional(),
  scope: z.array(z.string()).optional(),
  location: z.string().optional(),
  featuredImage: z.any().optional(),
  images: z.array(z.any()).optional(),
  isFeatured: z.boolean().optional().default(false),
  startDate: z.string().optional(),
  completedAt: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const projectUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  client: z.string().min(1).optional(),
  sector: projectSectorEnum.optional(),
  description: z.string().optional(),
  scope: z.array(z.string()).optional(),
  location: z.string().optional(),
  featuredImage: z.any().optional(),
  images: z.array(z.any()).optional(),
  isFeatured: z.boolean().optional(),
  startDate: z.string().optional(),
  completedAt: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Service ────────────────────────────────────────────────

const highlightInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const serviceCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  tagline: z.string().optional(),
  icon: z.string().optional(),
  image: z.any().optional(),
  highlights: z.array(highlightInput).optional(),
  howWdiDoesIt: z.array(z.string()).optional(),
  ctaText: z.string().optional(),
  detailContent: z.any().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int(),
});

export const serviceUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  tagline: z.string().optional(),
  icon: z.string().optional(),
  image: z.any().optional(),
  highlights: z.array(highlightInput).optional(),
  howWdiDoesIt: z.array(z.string()).optional(),
  ctaText: z.string().optional(),
  detailContent: z.any().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Client Content ─────────────────────────────────────────

export const clientContentCreateSchema = z.object({
  name: z.string().min(1),
  logo: z.any().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  sector: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int(),
});

export const clientContentUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  name: z.string().min(1).optional(),
  logo: z.any().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  sector: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Testimonial (project-scoped) ───────────────────────────

export const testimonialCreateSchema = z.object({
  clientName: z.string().min(1),
  quote: z.string().min(1),
  companyName: z.string().optional(),
  role: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const testimonialUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  clientName: z.string().min(1).optional(),
  quote: z.string().min(1).optional(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Press ──────────────────────────────────────────────────

export const pressCreateSchema = z.object({
  title: z.string().min(1),
  source: z.string().optional(),
  publishDate: z.string().optional(),
  excerpt: z.string().optional(),
  summary: z.string().optional(),
  image: z.any().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const pressUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  title: z.string().min(1).optional(),
  source: z.string().optional(),
  publishDate: z.string().optional(),
  excerpt: z.string().optional(),
  summary: z.string().optional(),
  image: z.any().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Job ────────────────────────────────────────────────────

export const jobCreateSchema = z.object({
  title: z.string().min(1),
  description: z.any().optional(),
  requirements: z.any().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  department: z.string().optional(),
  contactEmail: z.string().optional(),
  jobNumber: z.string().optional(),
  region: z.string().optional(),
  workplace: z.string().optional(),
  isNew: z.boolean().optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const jobUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.any().optional(),
  requirements: z.any().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  department: z.string().optional(),
  contactEmail: z.string().optional(),
  jobNumber: z.string().optional(),
  region: z.string().optional(),
  workplace: z.string().optional(),
  isNew: z.boolean().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Content Library ────────────────────────────────────────

export const contentLibraryCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const contentLibraryUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// ─── Hero Settings (singleton) ──────────────────────────────

export const heroSettingsUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  backgroundImage: z.any().optional(),
  videoUrl: z.any().optional(),
});

// ─── Site Settings (singleton) ──────────────────────────────

export const siteSettingsUpdateSchema = z.object({
  updatedAt: z.string().min(1),
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
});

// ─── Lead (admin create) ────────────────────────────────────

export const leadAdminCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  company: z.string().optional(),
  phone: z.string().optional(),
  servicesInterested: z.array(z.string()).optional(),
  status: leadStatusEnum.optional(),
  priority: leadPriorityEnum.optional(),
  estimatedValue: z.number().optional(),
  referredBy: z.string().optional(),
  description: z.string().optional(),
});

export const leadUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  priority: leadPriorityEnum.optional(),
  estimatedValue: z.number().optional(),
  referredBy: z.string().optional(),
  description: z.string().optional(),
});

// ─── Lead Transition ────────────────────────────────────────

export const transitionSchema = z.object({
  updatedAt: z.string().min(1),
  targetStatus: z.string().min(1),
});

export const archiveSchema = z.object({
  updatedAt: z.string().min(1),
});

// ─── Lead Convert ───────────────────────────────────────────

export const leadConvertSchema = z.object({
  updatedAt: z.string().min(1),
  engagementTitle: z.string().optional(),
  engagementType: z.string().optional(),
  engagementValue: z.number().optional(),
});

// ─── Client CRM ─────────────────────────────────────────────

export const clientCrmCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  preferredContact: preferredContactEnum.optional(),
  status: clientCrmStatusEnum.optional(),
});

export const clientCrmUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  preferredContact: preferredContactEnum.optional(),
  notes: z.string().optional(),
});

// ─── Engagement ─────────────────────────────────────────────

export const engagementCreateSchema = z.object({
  title: z.string().min(1),
  client: z.string().min(1),
  engagementType: z.string().optional(),
  value: z.number().optional(),
  status: engagementStatusEnum.optional(),
  estimatedDuration: z.string().optional(),
  scope: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  description: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const engagementUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  title: z.string().min(1).optional(),
  engagementType: z.string().optional(),
  value: z.number().optional(),
  estimatedDuration: z.string().optional(),
  scope: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  description: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const engagementTransitionSchema = z.object({
  updatedAt: z.string().min(1),
  status: z.string().min(1),
});

export const engagementDeleteSchema = z.object({
  updatedAt: z.string().min(1),
});

// ─── Activity (manual creation) ─────────────────────────────

const manualActivityTypes = z.enum([
  'call_logged', 'email_sent', 'email_received',
  'site_visit_scheduled', 'site_visit_completed',
  'quote_sent', 'quote_accepted', 'quote_rejected', 'custom',
]);

export const manualActivityCreateSchema = z.object({
  entityType: activityEntityTypeEnum,
  entityId: z.string().min(1),
  type: manualActivityTypes,
  notes: z.string().min(1),
  callDuration: z.number().optional(),
  quoteAmount: z.number().optional(),
});

// ─── CRM Settings ───────────────────────────────────────────

const stageInput = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  color: z.string().min(1),
});

export const crmSettingsUpdateSchema = z.object({
  pipelineStages: z.array(stageInput).min(2).optional(),
  engagementStatuses: z.array(stageInput).min(2).optional(),
  serviceTypes: z.array(z.string().min(1)).min(1).optional(),
  leadSources: z.array(z.string().min(1)).min(1).optional(),
  defaultPriority: z.enum(['high', 'medium', 'low']).optional(),
  currency: z.string().min(1).max(3).optional(),
  engagementLabel: z.string().min(1).optional(),
});

// ─── Bulk CRM ───────────────────────────────────────────────

export const bulkOperationSchema = z.object({
  action: z.enum(['status_change', 'archive']),
  ids: z.array(z.string().min(1)).min(1),
  concurrencyTokens: z.record(z.string(), z.string()),
  targetStatus: z.string().optional(),
});

// ─── About Page (singleton) ─────────────────────────────────

const statInput = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const valueInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const aboutPageUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  vision: z.string().optional(),
  storyContent: z.any().optional(),
  stats: z.array(statInput).optional(),
  values: z.array(valueInput).optional(),
});

// ─── Supplier Form Settings (singleton) ─────────────────────

export const supplierFormSettingsUpdateSchema = z.object({
  updatedAt: z.string().min(1),
  formTitle: z.string().optional(),
  specialtyOptions: z.array(z.string().min(1)).optional(),
  regionOptions: z.array(z.string().min(1)).optional(),
});

// ─── CRM Search ─────────────────────────────────────────────

export const crmSearchSchema = z.object({
  q: z.string().min(2),
});
