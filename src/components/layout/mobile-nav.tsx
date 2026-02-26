"use client";

import { useState } from "react";
import Image from "next/image";
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
  canAccessTravel: boolean;
};

export function MobileNav({ name, email, role, canAccessTravel }: MobileNavProps) {
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
            <Image src="/logo.svg" alt="IsraTransfer" width={150} height={32} />
          </div>
          <div className="flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
            <SidebarNav role={role} canAccessTravel={canAccessTravel} />
          </div>
          <div className="border-t p-2">
            <SidebarUser name={name} email={email} role={role} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
