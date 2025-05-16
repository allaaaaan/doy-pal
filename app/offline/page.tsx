"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">You are offline</h1>
      <p className="text-gray-600 text-center mb-6">
        Please check your internet connection and try again.
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
