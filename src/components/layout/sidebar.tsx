"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/clients", label: "クライアント", icon: "👥" },
  { href: "/tasks", label: "定期タスク", icon: "🔄" },
  { href: "/reports", label: "報告書", icon: "📄" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <h1 className="mb-8 text-xl font-bold">BackOffice</h1>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
              pathname === item.href
                ? "bg-gray-200 font-medium"
                : "hover:bg-gray-100"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
