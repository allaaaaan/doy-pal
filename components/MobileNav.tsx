"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, GiftIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function MobileNav() {
  const pathname = usePathname();
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  // Don't render with theme-specific classes until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around shadow-lg z-40">
        {/* Default placeholder content */}
        <div className="w-20 h-full"></div>
        <div className="w-20 h-full"></div>
        <div className="w-20 h-full"></div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";
  const bgClass = isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-t";
  const iconActive = isDark ? "text-blue-400" : "text-blue-600";
  const iconInactive = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-16 ${bgClass} flex items-center justify-around shadow-lg z-40`}
    >
      <Link
        href="/home"
        className="flex flex-col items-center justify-center w-20 h-full"
      >
        <HomeIcon
          className={`h-6 w-6 ${isActive("/home") ? iconActive : iconInactive}`}
        />
        <span
          className={`text-xs mt-1 ${
            isActive("/home") ? iconActive + " font-semibold" : iconInactive
          }`}
        >
          Home
        </span>
      </Link>
      <Link
        href="/event"
        className="flex flex-col items-center justify-center w-20 h-full"
      >
        <CalendarIcon
          className={`h-6 w-6 ${
            isActive("/event") ? iconActive : iconInactive
          }`}
        />
        <span
          className={`text-xs mt-1 ${
            isActive("/event") ? iconActive + " font-semibold" : iconInactive
          }`}
        >
          Events
        </span>
      </Link>
      <Link
        href="/redeem"
        className="flex flex-col items-center justify-center w-20 h-full"
      >
        <GiftIcon
          className={`h-6 w-6 ${
            isActive("/redeem") ? iconActive : iconInactive
          }`}
        />
        <span
          className={`text-xs mt-1 ${
            isActive("/redeem") ? iconActive + " font-semibold" : iconInactive
          }`}
        >
          Redeem
        </span>
      </Link>
    </div>
  );
}
