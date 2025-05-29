import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase-utils';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    const supabase = createSupabaseServerClient(request, response);
    
    // Get credentials from request body
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/login`,
      },
    });
    
    if (error) {
      console.error('[API] Sign up error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return response;
  } catch (error) {
    console.error('[API] Sign up exception:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}