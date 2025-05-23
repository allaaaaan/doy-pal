"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, LightBulbIcon } from "@heroicons/react/24/outline";

export default function TemplateQuickTip() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the tip before
    const hasSeenTip = localStorage.getItem("template-tip-seen");
    if (!hasSeenTip) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("template-tip-seen", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
      <div className="flex items-start space-x-3">
        <LightBulbIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
            🎉 New: Template Selection!
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Save time by selecting from common activities, or create manually
            for custom events. Templates learn from your usage patterns!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-400"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
