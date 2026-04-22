"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Главная", icon: "📊" },
  { href: "/dashboard/posts", label: "Статьи", icon: "📝" },
  { href: "/dashboard/subscribers", label: "Подписчики", icon: "👥" },
  { href: "/dashboard/settings", label: "Настройки", icon: "⚙️" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white min-h-screen hidden lg:block">
      <div className="p-6">
        <Link href="/" className="text-lg font-bold text-gray-900">
          SubStack RU
        </Link>
      </div>
      <nav className="px-3">
        {links.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 mt-6">
        <Link
          href="/dashboard/posts/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
        >
          + Новая статья
        </Link>
      </div>
    </aside>
  );
}
