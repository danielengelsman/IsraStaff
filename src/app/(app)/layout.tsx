import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SidebarUser } from "@/components/layout/sidebar-user";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const role = profile.role as UserRole;
  const canAccessTravel = role === "admin" || profile.can_access_travel;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <h1 className="text-lg font-bold">IsraStaff</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav role={role} canAccessTravel={canAccessTravel} />
        </div>
        <Separator />
        <div className="p-2">
          <SidebarUser
            name={profile.full_name}
            email={profile.email}
            role={role}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b px-4 md:hidden">
          <MobileNav
            name={profile.full_name}
            email={profile.email}
            role={role}
            canAccessTravel={canAccessTravel}
          />
          <h1 className="text-lg font-bold">IsraStaff</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
