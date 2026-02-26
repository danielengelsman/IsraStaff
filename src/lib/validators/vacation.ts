import { z } from "zod";

export const vacationRequestSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  type: z.literal("vacation"),
  notes: z.string().optional(),
}).refine((data) => {
  return new Date(data.end_date) >= new Date(data.start_date);
}, {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

export const reviewRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  review_notes: z.string().optional(),
});

export type VacationRequestInput = z.infer<typeof vacationRequestSchema>;
export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;
