/**
 * GET /api/debug/sanity-test — Diagnostic route for Sanity connection
 * Returns connection status, env var availability, type distribution.
 */
import { NextResponse } from 'next/server';
import { createClient, type SanityClient } from '@sanity/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
  const token = process.env.SANITY_API_TOKEN ?? '';

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SANITY_PROJECT_ID: projectId || '(NOT SET)',
      NEXT_PUBLIC_SANITY_DATASET: dataset,
      SANITY_API_TOKEN: token ? `set (${token.length} chars, starts with ${token.slice(0, 4)}...)` : '(NOT SET)',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '(NOT SET)',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : '(NOT SET)',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : '(NOT SET)',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'set' : '(NOT SET)',
      NODE_ENV: process.env.NODE_ENV,
    },
    sanity: {
      connected: false,
      readWorks: false,
      writeClientWorks: false,
      error: null as string | null,
    },
  };

  if (!projectId) {
    diagnostics.sanity = {
      connected: false,
      readWorks: false,
      writeClientWorks: false,
      error: 'NEXT_PUBLIC_SANITY_PROJECT_ID is not set',
    };
    return NextResponse.json(diagnostics);
  }

  let client: SanityClient;

  // Test read + type distribution
  try {
    client = createClient({
      projectId,
      dataset,
      apiVersion: '2026-02-19',
      useCdn: false,
      token: token || undefined,
    });

    // Get type distribution — group all documents by _type and count
    const allTypes: string[] = await client.fetch(
      `*[!(_type match "system.*") && _type != "sanity.imageAsset"]._type`,
    );

    const typeDistribution: Record<string, number> = {};
    for (const t of allTypes) {
      typeDistribution[t] = (typeDistribution[t] ?? 0) + 1;
    }

    // Sort by type name
    const sorted: Record<string, number> = {};
    for (const key of Object.keys(typeDistribution).sort()) {
      sorted[key] = typeDistribution[key]!;
    }

    const totalDocs = allTypes.length;

    diagnostics.sanity = {
      connected: true,
      readWorks: true,
      writeClientWorks: false,
      totalDocuments: totalDocs,
      typeDistribution: sorted,
      error: null,
    };
  } catch (err) {
    diagnostics.sanity = {
      connected: false,
      readWorks: false,
      writeClientWorks: false,
      error: err instanceof Error ? err.message : String(err),
    };
    return NextResponse.json(diagnostics);
  }

  // Test write permissions
  try {
    await client.patch('__test-write-permissions__').set({ _type: 'test' }).commit();
    (diagnostics.sanity as Record<string, unknown>).writeClientWorks = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('not found') || msg.includes('No document')) {
      (diagnostics.sanity as Record<string, unknown>).writeClientWorks = true;
      (diagnostics.sanity as Record<string, unknown>).writeNote = 'Token has write permissions (test doc not found — expected)';
    } else if (msg.includes('nauthorized') || msg.includes('nsufficient') || msg.includes('forbidden') || msg.includes('403')) {
      (diagnostics.sanity as Record<string, unknown>).writeClientWorks = false;
      (diagnostics.sanity as Record<string, unknown>).writeError = 'Token does NOT have write permissions — needs Editor role';
    } else {
      (diagnostics.sanity as Record<string, unknown>).writeClientWorks = false;
      (diagnostics.sanity as Record<string, unknown>).writeError = msg;
    }
  }

  // Field mismatch check — verify critical fields exist on each type
  try {
    const checks = await client.fetch(`{
      "services": *[_type == "service"][0..0]{ _id, name, title, slug, description, shortDescription, isActive },
      "projects": *[_type == "project"][0..0]{ _id, title, slug, sector, category, isActive, isFeatured, featured },
      "heroSettings": *[_type == "heroSettings"][0..0]{ _id, title, subtitle }
    }`);
    (diagnostics as Record<string, unknown>).fieldCheck = checks;
  } catch {
    // Non-critical, skip
  }

  return NextResponse.json(diagnostics);
}
