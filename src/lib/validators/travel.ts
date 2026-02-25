import { z } from "zod";

export const tripSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  country: z.string().min(1, "Country is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
  total_budget: z.coerce.number().positive().optional(),
  currency: z.string().default("USD"),
}).refine((data) => {
  return new Date(data.end_date) >= new Date(data.start_date);
}, {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

export const tripEventSchema = z.object({
  trip_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  event_type: z.enum(["meeting", "conference", "workshop", "site_visit", "travel", "other"]),
  location: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().optional(),
});

export const tripExpenseSchema = z.object({
  trip_id: z.string().uuid(),
  expense_type: z.enum(["flights", "hotel", "meals", "transport", "other"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  description: z.string().optional(),
  expense_date: z.string().min(1, "Date is required"),
});

export type TripInput = z.infer<typeof tripSchema>;
export type TripEventInput = z.infer<typeof tripEventSchema>;
export type TripExpenseInput = z.infer<typeof tripExpenseSchema>;
