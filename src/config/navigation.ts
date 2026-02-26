import type { UserRole } from "@/types";

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  roles?: UserRole[];
  requiresTravelAccess?: boolean;
  children?: NavItem[];
};

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Vacations",
    href: "/vacations",
    icon: "Palmtree",
    children: [
      { title: "Requests", href: "/vacations", icon: "FileText" },
      { title: "Calendar", href: "/vacations/calendar", icon: "Calendar" },
    ],
  },
  {
    title: "Business Travel",
    href: "/travel",
    icon: "Plane",
    requiresTravelAccess: true,
    children: [
      { title: "Trips", href: "/travel", icon: "Briefcase" },
      { title: "Calendar", href: "/travel/calendar", icon: "Calendar" },
    ],
  },
  {
    title: "Office Rota",
    href: "/rota",
    icon: "Building2",
  },
  {
    title: "Admin",
    href: "/admin",
    icon: "Settings",
    roles: ["admin"],
    children: [
      { title: "Departments", href: "/admin/departments", icon: "Building2" },
      { title: "Employees", href: "/admin/employees", icon: "Users" },
      { title: "Holidays", href: "/admin/holidays", icon: "CalendarHeart" },
    ],
  },
];
