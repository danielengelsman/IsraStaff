"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Building2, Home } from "lucide-react";
import { setRotaDefaults } from "@/lib/actions/rota";
import { toast } from "sonner";
import { ISRAEL_WORK_DAYS } from "@/types";
import type { RotaDefault } from "@/types/database";

type RotaDefaultsDialogProps = {
  profileId: string;
  profileName: string;
  currentDefaults: RotaDefault[];
};

export function RotaDefaultsDialog({
  profileId,
  profileName,
  currentDefaults,
}: RotaDefaultsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize state from current defaults, defaulting to "office"
  const defaultMap = new Map(currentDefaults.map((d) => [d.day_of_week, d.location]));
  const [days, setDays] = useState<Record<number, "office" | "home">>(() => {
    const result: Record<number, "office" | "home"> = {};
    for (const wd of ISRAEL_WORK_DAYS) {
      result[wd.value] = (defaultMap.get(wd.value) as "office" | "home") ?? "office";
    }
    return result;
  });

  function toggleDay(dayValue: number) {
    setDays((prev) => ({
      ...prev,
      [dayValue]: prev[dayValue] === "office" ? "home" : "office",
    }));
  }

  async function handleSubmit() {
    setLoading(true);

    const defaults = ISRAEL_WORK_DAYS.map((wd) => ({
      day_of_week: wd.value,
      location: days[wd.value],
    }));

    const result = await setRotaDefaults({
      profile_id: profileId,
      defaults,
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Default pattern saved for ${profileName}`);
      setOpen(false);
      router.refresh();
    }
  }

  // Reset state when dialog opens
  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      const result: Record<number, "office" | "home"> = {};
      for (const wd of ISRAEL_WORK_DAYS) {
        result[wd.value] = (defaultMap.get(wd.value) as "office" | "home") ?? "office";
      }
      setDays(result);
    }
    setOpen(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Weekly Pattern — {profileName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Set the default work location for each day. Overrides for specific dates take precedence.
          </p>
          {ISRAEL_WORK_DAYS.map((wd) => {
            const isOffice = days[wd.value] === "office";
            return (
              <div
                key={wd.value}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <Label className="text-sm font-medium">{wd.label}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`w-24 gap-1.5 ${
                    isOffice
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  }`}
                  onClick={() => toggleDay(wd.value)}
                >
                  {isOffice ? (
                    <>
                      <Building2 className="h-3.5 w-3.5" />
                      Office
                    </>
                  ) : (
                    <>
                      <Home className="h-3.5 w-3.5" />
                      Home
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Defaults"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
