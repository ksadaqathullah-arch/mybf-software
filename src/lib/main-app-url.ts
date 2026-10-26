/**
 * Resolves the canonical base URL of the main MYBF public and chapter application.
 *
 * Deployment Topology:
 * - Admin Workspace: https://mybf-admin.vercel.app (Port 4000 locally)
 * - Main Application: https://mybf-software.vercel.app (Port 3000 locally)
 *
 * Chapter Executive Hubs (/chapter/[slug]) and public chapter pages (/chapters/[slug])
 * are hosted exclusively by the main application, not the separate Super Admin portal.
 */
export function getMainAppBaseUrl(): string {
  // 1. Dedicated public application base URL via environment variable
  const envUrl =
    process.env.NEXT_PUBLIC_MAIN_APP_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_APP_URL;

  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Client-side origin heuristic
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (host.includes('mybf-admin.vercel.app')) {
      return 'https://mybf-software.vercel.app';
    }
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
      return 'http://localhost:3000';
    }
  }

  // 3. Fallback for server-side evaluation in production
  return 'https://mybf-software.vercel.app';
}

/**
 * Generates the canonical Chapter Hub URL on the main application using the database-backed chapter slug.
 */
export function getChapterHubUrl(chapterSlug: string): string {
  const baseUrl = getMainAppBaseUrl();
  const cleanSlug = encodeURIComponent(chapterSlug.trim().toLowerCase());
  return `${baseUrl}/chapter/${cleanSlug}`;
}
