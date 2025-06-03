'use client';

import { createRemoteComponent } from '@/components/remote-component';

// Create the remote component
const EditorApp = createRemoteComponent('editor', '/main');

export default function EditorPage() {
  // Handle when the component is loaded
  const handleLoaded = () => {
    console.log("Editor iframe loaded successfully");
  };
  
  // Handle errors
  const handleError = (err: Error) => {
    console.error("Failed to load Editor iframe:", err);
  };
  
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-white p-1">
      <EditorApp
        onLoaded={handleLoaded}
        onError={handleError}
        height="100%"
        width="100%"
        className="editor-iframe-container"
      />
    </div>
  );
}