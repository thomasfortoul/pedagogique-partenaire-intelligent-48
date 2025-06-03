'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Separate component that uses useRouter
function HomeContent() {
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  );
}

// Main component that wraps the content in a Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
