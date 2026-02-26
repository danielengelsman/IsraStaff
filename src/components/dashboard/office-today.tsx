import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home } from "lucide-react";
import type { OfficePresence } from "@/types";

type OfficeTodayProps = {
  presence: OfficePresence[];
};

export function OfficeToday({ presence }: OfficeTodayProps) {
  // If no presence data (e.g. Friday/Saturday), show a message
  if (presence.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Office Rota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No work day today.</p>
        </CardContent>
      </Card>
    );
  }

  const inOffice = presence.filter((p) => p.location === "office");
  const atHome = presence.filter((p) => p.location === "home");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          Who&apos;s in the Office Today
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            ({inOffice.length} in office)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* In Office */}
        {inOffice.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <Building2 className="h-3 w-3 text-green-600" />
              In Office ({inOffice.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {inOffice.map((p) => (
                <div
                  key={p.profileId}
                  className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {p.profileName.split(" ")[0]}
                  {p.notes && (
                    <span className="font-normal text-green-600/70">&middot; {p.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Working from Home */}
        {atHome.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <Home className="h-3 w-3 text-blue-600" />
              Working from Home ({atHome.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {atHome.map((p) => (
                <div
                  key={p.profileId}
                  className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {p.profileName.split(" ")[0]}
                  {p.notes && (
                    <span className="font-normal text-blue-600/70">&middot; {p.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
