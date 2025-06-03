"use client";
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

// Separate component that uses useRouter
function AuthCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthCallback] Redirecting to dashboard (Supabase auth does not use callbacks)');
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>Redirecting to dashboard...</div>
    </div>
  );
}

// This page is kept for backward compatibility but is no longer needed for Supabase auth
// It simply redirects to the dashboard
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}