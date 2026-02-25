"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/config/navigation";
import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  Palmtree,
  Plane,
  Settings,
  FileText,
  Calendar,
  Briefcase,
  Building2,
  Users,
  Calculator,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Palmtree,
  Plane,
  Settings,
  FileText,
  Calendar,
  Briefcase,
  Building2,
  Users,
  Calculator,
};

export function SidebarNav({ role, canAccessTravel }: { role: UserRole; canAccessTravel: boolean }) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Vacations: true,
    "Business Travel": true,
    Admin: true,
  });

  const filteredItems = navigationItems.filter(
    (item) =>
      (!item.roles || item.roles.includes(role)) &&
      (!item.requiresTravelAccess || canAccessTravel)
  );

  function toggleSection(title: string) {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {filteredItems.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openSections[item.title] ?? false;

        if (hasChildren) {
          return (
            <div key={item.title}>
              <button
                onClick={() => toggleSection(item.title)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="flex-1 text-left">{item.title}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l pl-3">
                  {item.children!.map((child) => {
                    const ChildIcon = iconMap[child.icon];
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          childActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {ChildIcon && <ChildIcon className="h-3.5 w-3.5" />}
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
