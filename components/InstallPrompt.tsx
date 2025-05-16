"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler as any);
    return () =>
      window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Show the browser install prompt
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      // Reset the deferredPrompt value
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  // Don't show anything if there's no install prompt
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-semibold mb-2">Install DoY Pal App</h3>
      <p className="text-sm mb-3">
        Add this app to your home screen for quick access!
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowPrompt(false)}
          className="px-3 py-1.5 text-sm text-gray-600"
        >
          Not now
        </button>
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
        >
          Install
        </button>
      </div>
    </div>
  );
}
