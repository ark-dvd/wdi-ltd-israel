/**
 * GET /api/debug/sanity-test — Diagnostic route for Sanity connection
 * Returns connection status and env var availability (no secrets exposed).
 */
import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

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

  // Test read client (with token)
  try {
    const readClient = createClient({
      projectId,
      dataset,
      apiVersion: '2026-02-19',
      useCdn: false,
      token: token || undefined,
    });

    const count = await readClient.fetch('count(*[_type == "lead"])');
    diagnostics.sanity = {
      connected: true,
      readWorks: true,
      writeClientWorks: false,
      documentCount: count,
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

  // Test write client
  try {
    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion: '2026-02-19',
      useCdn: false,
      token: token || undefined,
    });

    // Test write permissions by doing a no-op patch on a non-existent doc
    // This will fail with "not found" (which means auth is OK) or with "unauthorized"
    await writeClient.patch('__test-write-permissions__').set({ _type: 'test' }).commit();
    (diagnostics.sanity as Record<string, unknown>).writeClientWorks = true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // "Document not found" means write auth works, just the doc doesn't exist
    if (msg.includes('not found') || msg.includes('No document')) {
      (diagnostics.sanity as Record<string, unknown>).writeClientWorks = true;
      (diagnostics.sanity as Record<string, unknown>).writeNote = 'Token has write permissions (test doc not found, which is expected)';
    } else if (msg.includes('nauthorized') || msg.includes('nsufficient') || msg.includes('forbidden') || msg.includes('403')) {
      (diagnostics.sanity as Record<string, unknown>).writeClientWorks = false;
      (diagnostics.sanity as Record<string, unknown>).writeError = 'Token does NOT have write permissions — needs Editor role, not Viewer';
    } else {
      (diagnostics.sanity as Record<string, unknown>).writeClientWorks = false;
      (diagnostics.sanity as Record<string, unknown>).writeError = msg;
    }
  }

  return NextResponse.json(diagnostics);
}
