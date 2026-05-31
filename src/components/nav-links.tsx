"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Settings, Shield } from "lucide-react";

export function NavLinks({
  username,
  isAdmin,
}: {
  username?: string;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/", icon: Home, label: "פיד", match: (p: string) => p === "/" },
    {
      href: username ? `/profile/${username}` : "/settings",
      icon: null,
      label: "פרופיל",
      match: (p: string) => p.startsWith("/profile"),
      isProfile: true,
    },
    { href: "/settings", icon: Settings, label: "הגדרות", match: (p: string) => p === "/settings" },
    ...(isAdmin
      ? [{ href: "/admin", icon: Shield, label: "ניהול", match: (p: string) => p === "/admin" }]
      : []),
  ];

  return (
    <>
      {links.map((link) => {
        const active = link.match(pathname);
        if (link.isProfile) return null;
        const Icon = link.icon!;
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
            className={cn(
              "relative rounded-xl p-2.5 transition-all duration-200 interactive-scale",
              active
                ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                : "text-zinc-500 hover:bg-violet-500/10 hover:text-violet-600 dark:text-zinc-400"
            )}
          >
            <Icon className="h-5 w-5" />
            {active && (
              <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-500" />
            )}
          </Link>
        );
      })}
    </>
  );
}
