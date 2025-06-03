'use client';

import { createRemoteComponent } from '@/components/remote-component';

// Create the remote component
const CoderApp = createRemoteComponent('coder', '/dashboard');

export default function CoderPage() {
  // Handle when the component is loaded
  const handleLoaded = () => {
    console.log("Coder iframe loaded successfully");
  };
  
  // Handle errors
  const handleError = (err: Error) => {
    console.error("Failed to load Coder iframe:", err);
  };
  
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-white p-1">
      <CoderApp
        onLoaded={handleLoaded}
        onError={handleError}
        height="100%"
        width="100%"
        className="coder-iframe-container"
      />
    </div>
  );
}