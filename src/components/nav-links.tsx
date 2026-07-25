"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Users, User } from "lucide-react";

const links = [
  { href: "/", label: "דף הבית", icon: Home },
  { href: "/family-tree", label: "אילן יוחסין", icon: Users },
  { href: "/profile/me", label: "הפרופיל שלי", icon: User },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
              ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }
            `}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
