"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { AddEventDialog } from "./add-event-dialog";
import { AddExpenseDialog } from "./add-expense-dialog";
import { ExpenseSummaryChart } from "./expense-summary-chart";
import { formatDateRange } from "@/lib/utils/dates";
import { updateTripStatus, deleteTripEvent, deleteTripExpense } from "@/lib/actions/travel";
import { EVENT_TYPES, EXPENSE_TYPES } from "@/lib/utils/constants";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  MapPin,
  Calendar,
  Target,
  Clock,
  Trash2,
  Check,
  Play,
  CheckCircle,
} from "lucide-react";
import type { BusinessTripWithDetails } from "@/types";
import type { UserRole } from "@/types";

type TripDetailClientProps = {
  trip: BusinessTripWithDetails;
  userRole: UserRole;
  currentUserId: string;
};

const STATUS_STEPS = ["planned", "approved", "in_progress", "completed"];

export function TripDetailClient({ trip, userRole, currentUserId }: TripDetailClientProps) {
  const router = useRouter();
  const isOwner = trip.profile_id === currentUserId;
  const canManage = isOwner || userRole === "manager" || userRole === "admin";
  const canApprove = (userRole === "manager" || userRole === "admin") && !isOwner;

  const totalExpenses = trip.trip_expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const budgetProgress = trip.total_budget
    ? (totalExpenses / Number(trip.total_budget)) * 100
    : 0;

  const currentStepIndex = STATUS_STEPS.indexOf(trip.status);

  async function handleStatusChange(status: "approved" | "in_progress" | "completed" | "cancelled") {
    const result = await updateTripStatus(trip.id, status);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Trip ${status.replace("_", " ")}`);
      router.refresh();
    }
  }

  async function handleDeleteEvent(eventId: string) {
    const result = await deleteTripEvent(eventId, trip.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Event deleted");
      router.refresh();
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    const result = await deleteTripExpense(expenseId, trip.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Expense deleted");
      router.refresh();
    }
  }

  const sortedEvents = [...trip.trip_events].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{trip.destination}, {trip.country}</h1>
            <StatusBadge status={trip.status} type="trip" />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDateRange(trip.start_date, trip.end_date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {trip.profiles.full_name}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {canApprove && trip.status === "planned" && (
            <Button size="sm" onClick={() => handleStatusChange("approved")}>
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
          )}
          {canManage && trip.status === "approved" && (
            <Button size="sm" onClick={() => handleStatusChange("in_progress")}>
              <Play className="mr-1 h-4 w-4" />
              Start Trip
            </Button>
          )}
          {canManage && trip.status === "in_progress" && (
            <Button size="sm" onClick={() => handleStatusChange("completed")}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Status Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    idx <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-xs capitalize">{step.replace("_", " ")}</span>
              </div>
            ))}
          </div>
          <Progress value={((currentStepIndex + 1) / STATUS_STEPS.length) * 100} className="mt-3" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="itinerary">
            Itinerary ({trip.trip_events.length})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses ({trip.trip_expenses.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Purpose
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{trip.purpose}</p>
              {trip.notes && (
                <p className="mt-2 text-sm text-muted-foreground">{trip.notes}</p>
              )}
            </CardContent>
          </Card>

          {trip.total_budget && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: {totalExpenses.toLocaleString()} {trip.currency}</span>
                    <span>Budget: {Number(trip.total_budget).toLocaleString()} {trip.currency}</span>
                  </div>
                  <Progress
                    value={Math.min(budgetProgress, 100)}
                    className={budgetProgress > 100 ? "[&>div]:bg-red-500" : ""}
                  />
                  {budgetProgress > 100 && (
                    <p className="text-xs text-red-600">
                      Over budget by {(totalExpenses - Number(trip.total_budget)).toLocaleString()} {trip.currency}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="space-y-4">
          <div className="flex justify-end">
            {canManage && trip.status !== "completed" && (
              <AddEventDialog tripId={trip.id} />
            )}
          </div>

          {sortedEvents.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No events added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEvents.map((event) => {
                const typeConfig = EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES];
                return (
                  <Card key={event.id}>
                    <CardContent className="flex items-start justify-between pt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{typeConfig?.label || event.event_type}</Badge>
                          <h3 className="font-medium">{event.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(event.start_time), "MMM d, h:mm a")}
                            {event.end_time && ` - ${format(parseISO(event.end_time), "h:mm a")}`}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                      {canManage && trip.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            {canManage && (
              <AddExpenseDialog tripId={trip.id} currency={trip.currency} />
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseSummaryChart expenses={trip.trip_expenses} currency={trip.currency} />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {canManage && <TableHead className="w-[40px]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trip.trip_expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground py-8">
                        No expenses recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trip.trip_expenses
                      .sort((a, b) => new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime())
                      .map((expense) => {
                        const typeConfig = EXPENSE_TYPES[expense.expense_type as keyof typeof EXPENSE_TYPES];
                        return (
                          <TableRow key={expense.id}>
                            <TableCell>
                              <Badge variant="outline">{typeConfig?.label || expense.expense_type}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(parseISO(expense.expense_date), "MMM d")}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                              {expense.description || "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {Number(expense.amount).toLocaleString()} {expense.currency}
                            </TableCell>
                            {canManage && (
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                  )}
                  {trip.trip_expenses.length > 0 && (
                    <TableRow className="font-medium">
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className="text-right">
                        {totalExpenses.toLocaleString()} {trip.currency}
                      </TableCell>
                      {canManage && <TableCell />}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
