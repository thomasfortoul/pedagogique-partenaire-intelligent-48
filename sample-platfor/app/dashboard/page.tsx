'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, Suspense } from 'react';

// Separate component that uses useRouter
function DashboardContent() {
  const { user, isLoading, error } = useAuth();
  const router = useRouter();

  console.log('Dashboard: Component mounted', { isLoading, hasUser: !!user });

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    console.log('Dashboard: Rendering loading state');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    console.error('Dashboard: Auth error', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-red-600">Authentication error. Please try logging in again.</div>
      </div>
    );
  }
  
  if (!user) {
    console.log('Dashboard: No user, rendering empty state');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Not authenticated. Redirecting...</div>
      </div>
    );
  }
  
  console.log('Dashboard: Rendering dashboard content for user', user.email);

  return (
    <div className="bg-gray-100 w-full">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border border-gray-200 p-6 min-h-96 bg-white shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Welcome to Oxkair Platform</h2>
            <p className="mb-6 text-gray-700">
              You are signed in as: {user.user_metadata?.firstName || ''} {user.user_metadata?.lastName || ''} {!user.user_metadata?.firstName && !user.user_metadata?.lastName && user.email}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Oxkair Editor</h3>
                <p className="text-gray-600 mb-4">Medical note analysis and interactive editing</p>
                <button
                  onClick={() => router.push('/editor')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Launch Editor
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Oxkair Coder</h3>
                <p className="text-gray-600 mb-4">Medical coding automation and compliance</p>
                <button
                  onClick={() => router.push('/coder')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Launch Coder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the dashboard content in a Suspense boundary
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}