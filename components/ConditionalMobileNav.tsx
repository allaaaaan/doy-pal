"use client";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";

export default function ConditionalMobileNav() {
  const pathname = usePathname();
  if (pathname.includes("/admin")) return null;
  return <MobileNav />;
}
