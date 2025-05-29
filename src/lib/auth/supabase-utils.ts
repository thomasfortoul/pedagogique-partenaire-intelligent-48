import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, CookieOptions } from '@supabase/ssr';

// Default client (no auth)
export const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL!, // Use import.meta.env
  import.meta.env.VITE_SUPABASE_ANON_KEY! // Use import.meta.env
);

/**
 * Creates a Supabase server client with consistent cookie handling
 *
 * This helper function ensures we use the same cookie handling logic
 * across all server components and API routes.
 *
 * @param request The Next.js request object
 * @param response The Next.js response object
 * @returns A Supabase server client
 */
export function createSupabaseServerClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL!, // Use import.meta.env
    import.meta.env.VITE_SUPABASE_ANON_KEY!, // Use import.meta.env
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for browser usage
 *
 * @returns A Supabase client
 */
export function createBrowserClient() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL!, // Use import.meta.env
    import.meta.env.VITE_SUPABASE_ANON_KEY! // Use import.meta.env
  );
}