import type { Profile, VacationRequest, VacationAllowance, BusinessTrip, TripEvent, TripExpense, Department } from "./database";

export type VacationRequestWithProfile = VacationRequest & {
  profiles: Pick<Profile, "full_name" | "email" | "avatar_url">;
  reviewer?: Pick<Profile, "full_name"> | null;
};

export type BusinessTripWithDetails = BusinessTrip & {
  profiles: Pick<Profile, "full_name" | "email" | "avatar_url">;
  trip_events: TripEvent[];
  trip_expenses: TripExpense[];
};

export type DepartmentWithManager = Department & {
  manager: Pick<Profile, "id" | "full_name" | "email"> | null;
  member_count?: number;
};

export type ProfileWithDepartment = Profile & {
  departments: Pick<Department, "id" | "name"> | null;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "vacation" | "business_trip" | "holiday";
  status: string;
  profileName: string;
  profileId: string;
};

export type UserRole = "employee" | "manager" | "admin";

export type TeamMemberWithStatus = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  vacation_allowance: VacationAllowance | null;
  current_vacation: VacationRequest | null;
  upcoming_vacations: VacationRequest[];
};
