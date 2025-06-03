import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { CookieOptions } from '@supabase/ssr';

// For Next.js 15.x, params is a Promise that needs to be awaited
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathParts: string[],
  method: string
) {
  const path = pathParts.join('/');
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  
  // Validate authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Determine target service based on path
  let targetUrl: string;
  if (path.startsWith('coder/')) {
    targetUrl = `http://localhost:3001/api/${path.substring(6)}`;
  } else if (path.startsWith('editor/')) {
    targetUrl = `http://localhost:3002/api/${path.substring(7)}`;
  } else {
    // Default API endpoints in the shell
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }
  
  // Forward the request
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);
  
  const response2 = await fetch(targetUrl, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined,
  });
  
  // Return the response
  return new NextResponse(await response2.text(), {
    status: response2.status,
    headers: {
      'Content-Type': response2.headers.get('Content-Type') || 'application/json',
    },
  });
}