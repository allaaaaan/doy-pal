"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function FloatingActionButton() {
  return (
    <Link
      href="/event"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
    >
      <PlusIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
      <span className="sr-only">Add Event</span>
    </Link>
  );
}
