import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase-utils';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  
  const supabase = createSupabaseServerClient(request, response);
  
  // Sign out the user from Supabase
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error.message);
  } else {
    console.log('Logout successful, redirecting to login');
  }
  
  // Clear all cookies to ensure complete logout
  for (const cookie of request.cookies.getAll()) {
    response.cookies.delete(cookie.name);
  }
  
  return response;
}

// Also support GET requests for direct browser navigation
export async function GET(request: NextRequest) {
  return POST(request);
}