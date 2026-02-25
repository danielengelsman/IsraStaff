"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import type { UserRole } from "@/types";

type MobileNavProps = {
  name: string;
  email: string;
  role: UserRole;
};

export function MobileNav({ name, email, role }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <h2 className="text-lg font-bold">IsraStaff</h2>
          </div>
          <div className="flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
            <SidebarNav role={role} />
          </div>
          <div className="border-t p-2">
            <SidebarUser name={name} email={email} role={role} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
