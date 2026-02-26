export const VACATION_TYPES = {
  vacation: { label: "Vacation", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
} as const;

export const TRIP_STATUSES = {
  planned: { label: "Planned", color: "bg-yellow-500", textColor: "text-yellow-700" },
  approved: { label: "Approved", color: "bg-blue-500", textColor: "text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-purple-500", textColor: "text-purple-700" },
  completed: { label: "Completed", color: "bg-green-500", textColor: "text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-500", textColor: "text-gray-700" },
} as const;

export const REQUEST_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-50" },
  approved: { label: "Approved", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
  rejected: { label: "Rejected", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" },
  cancelled: { label: "Cancelled", color: "bg-gray-500", textColor: "text-gray-700", bgLight: "bg-gray-50" },
} as const;

export const EVENT_TYPES = {
  meeting: { label: "Meeting", icon: "Users" },
  conference: { label: "Conference", icon: "Presentation" },
  workshop: { label: "Workshop", icon: "GraduationCap" },
  site_visit: { label: "Site Visit", icon: "Building" },
  travel: { label: "Travel", icon: "Plane" },
  other: { label: "Other", icon: "Calendar" },
} as const;

export const EXPENSE_TYPES = {
  flights: { label: "Flights", icon: "Plane", color: "#3b82f6" },
  hotel: { label: "Hotel", icon: "Building", color: "#8b5cf6" },
  meals: { label: "Meals", icon: "UtensilsCrossed", color: "#f59e0b" },
  transport: { label: "Transport", icon: "Car", color: "#10b981" },
  other: { label: "Other", icon: "Receipt", color: "#6b7280" },
} as const;

export const ROLES = {
  employee: { label: "Employee", description: "Can view own data and request vacations" },
  manager: { label: "Manager", description: "Can approve department requests" },
  admin: { label: "Admin", description: "Full system access" },
} as const;
