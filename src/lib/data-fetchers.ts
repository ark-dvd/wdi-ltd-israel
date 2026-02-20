/**
 * Server-side data fetcher functions — DOC-040 §2.10
 * Internal TypeScript functions for Next.js SSR.
 * List fetchers return [] on error. Single-entity fetchers return null.
 */
import { sanityClient } from './sanity/client';

// ─── Services ───────────────────────────────────────────────

export async function getActiveServices() {
  try {
    return await sanityClient.fetch(
      `*[_type == "service" && isActive == true] | order(order asc){
        _id, name, slug, description, tagline, icon, highlights, detailContent, image, order
      }`,
    );
  } catch {
    return [];
  }
}

export async function getService(slug: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "service" && slug.current == $slug && isActive == true][0]`,
      { slug },
    );
  } catch {
    return null;
  }
}

// ─── Projects ───────────────────────────────────────────────

export async function getActiveProjects() {
  try {
    return await sanityClient.fetch(
      `*[_type == "project" && isActive == true] | order(order asc){
        _id, title, slug, client, sector, description, scope, location, images, featuredImage, isFeatured, startDate, completedAt, order
      }`,
    );
  } catch {
    return [];
  }
}

export async function getActiveProjectsBySector(sector: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "project" && isActive == true && sector == $sector] | order(order asc){
        _id, title, slug, client, sector, featuredImage, isFeatured, order
      }`,
      { sector },
    );
  } catch {
    return [];
  }
}

export async function getProject(slug: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "project" && slug.current == $slug && isActive == true][0]{
        ...,
        "linkedTestimonials": *[_type == "testimonial" && projectRef._ref == ^._id && isActive == true] | order(order asc){
          _id, clientName, quote, companyName, role, isFeatured, image, order
        }
      }`,
      { slug },
    );
  } catch {
    return null;
  }
}

// ─── Team Members ───────────────────────────────────────────

export async function getTeamMembers() {
  try {
    return await sanityClient.fetch(
      `*[_type == "teamMember" && isActive == true] | order(
        select(
          category == "founders" => 0,
          category == "management" => 1,
          category == "department-heads" => 2,
          category == "project-managers" => 3,
          4
        ) asc, order asc
      ){
        _id, name, role, category, image, bio, qualifications, degrees, linkedin, email, phone, order
      }`,
    );
  } catch {
    return [];
  }
}

export async function getTeamMembersByCategory(category: string) {
  try {
    return await sanityClient.fetch(
      `*[_type == "teamMember" && isActive == true && category == $category] | order(order asc){
        _id, name, role, category, image, bio, qualifications, degrees, linkedin, email, phone, order
      }`,
      { category },
    );
  } catch {
    return [];
  }
}

// ─── Client Content ─────────────────────────────────────────

export async function getActiveClientsContent() {
  try {
    return await sanityClient.fetch(
      `*[_type == "clientContent" && isActive == true] | order(order asc){
        _id, name, logo, websiteUrl, order
      }`,
    );
  } catch {
    return [];
  }
}

// ─── Testimonials ───────────────────────────────────────────

export async function getFeaturedTestimonials() {
  try {
    return await sanityClient.fetch(
      `*[_type == "testimonial" && isFeatured == true && isActive == true] | order(order asc){
        _id, clientName, quote, companyName, role, image, "projectTitle": projectRef->title
      }`,
    );
  } catch {
    return [];
  }
}

export async function getActiveTestimonials() {
  try {
    return await sanityClient.fetch(
      `*[_type == "testimonial" && isActive == true] | order(order asc){
        _id, clientName, quote, companyName, role, image, isFeatured, "projectTitle": projectRef->title
      }`,
    );
  } catch {
    return [];
  }
}

// ─── Press ──────────────────────────────────────────────────

export async function getActivePressItems() {
  try {
    return await sanityClient.fetch(
      `*[_type == "pressItem" && isActive == true] | order(publishDate desc){
        _id, title, source, publishDate, excerpt, externalUrl, image, order
      }`,
    );
  } catch {
    return [];
  }
}

// ─── Jobs ───────────────────────────────────────────────────

export async function getActiveJobs() {
  try {
    return await sanityClient.fetch(
      `*[_type == "job" && isActive == true] | order(order asc){
        _id, title, description, requirements, location, type, department, contactEmail, order
      }`,
    );
  } catch {
    return [];
  }
}

// ─── Content Library ────────────────────────────────────────

export async function getActiveContentLibraryItems() {
  try {
    return await sanityClient.fetch(
      `*[_type == "contentLibraryItem" && isActive == true] | order(order asc){
        _id, title, description, category, fileUrl, externalUrl, image, order
      }`,
    );
  } catch {
    return [];
  }
}

// ─── Singletons ─────────────────────────────────────────────

export async function getHeroSettings() {
  try {
    return await sanityClient.fetch(
      `*[_type == "heroSettings" && _id == "heroSettings"][0]`,
    );
  } catch {
    return null;
  }
}

export async function getSiteSettings() {
  try {
    return await sanityClient.fetch(
      `*[_type == "siteSettings" && _id == "siteSettings"][0]`,
    );
  } catch {
    return null;
  }
}
