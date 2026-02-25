export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "employee" | "manager" | "admin";
          department_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: "employee" | "manager" | "admin";
          department_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "employee" | "manager" | "admin";
          department_id?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          manager_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vacation_allowances: {
        Row: {
          id: string;
          profile_id: string;
          year: number;
          total_days: number;
          used_days: number;
          sick_days: number;
          used_sick: number;
          personal_days: number;
          used_personal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          year: number;
          total_days?: number;
          used_days?: number;
          sick_days?: number;
          used_sick?: number;
          personal_days?: number;
          used_personal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          year?: number;
          total_days?: number;
          used_days?: number;
          sick_days?: number;
          used_sick?: number;
          personal_days?: number;
          used_personal?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vacation_allowances_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vacation_requests: {
        Row: {
          id: string;
          profile_id: string;
          start_date: string;
          end_date: string;
          type: "vacation" | "sick" | "personal";
          status: "pending" | "approved" | "rejected" | "cancelled";
          notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          total_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          start_date: string;
          end_date: string;
          type: "vacation" | "sick" | "personal";
          status?: "pending" | "approved" | "rejected" | "cancelled";
          notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          total_days: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          start_date?: string;
          end_date?: string;
          type?: "vacation" | "sick" | "personal";
          status?: "pending" | "approved" | "rejected" | "cancelled";
          notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          total_days?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vacation_requests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vacation_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      business_trips: {
        Row: {
          id: string;
          profile_id: string;
          destination: string;
          country: string;
          start_date: string;
          end_date: string;
          purpose: string;
          status: "planned" | "approved" | "in_progress" | "completed" | "cancelled";
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          total_budget: number | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          destination: string;
          country: string;
          start_date: string;
          end_date: string;
          purpose: string;
          status?: "planned" | "approved" | "in_progress" | "completed" | "cancelled";
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          total_budget?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          destination?: string;
          country?: string;
          start_date?: string;
          end_date?: string;
          purpose?: string;
          status?: "planned" | "approved" | "in_progress" | "completed" | "cancelled";
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          total_budget?: number | null;
          currency?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_trips_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "business_trips_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_events: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          description: string | null;
          event_type: "meeting" | "conference" | "workshop" | "site_visit" | "travel" | "other";
          location: string | null;
          start_time: string;
          end_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          title: string;
          description?: string | null;
          event_type: "meeting" | "conference" | "workshop" | "site_visit" | "travel" | "other";
          location?: string | null;
          start_time: string;
          end_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          event_type?: "meeting" | "conference" | "workshop" | "site_visit" | "travel" | "other";
          location?: string | null;
          start_time?: string;
          end_time?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_events_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "business_trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_expenses: {
        Row: {
          id: string;
          trip_id: string;
          expense_type: "flights" | "hotel" | "meals" | "transport" | "other";
          amount: number;
          currency: string;
          description: string | null;
          receipt_url: string | null;
          expense_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          expense_type: "flights" | "hotel" | "meals" | "transport" | "other";
          amount: number;
          currency?: string;
          description?: string | null;
          receipt_url?: string | null;
          expense_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          expense_type?: "flights" | "hotel" | "meals" | "transport" | "other";
          amount?: number;
          currency?: string;
          description?: string | null;
          receipt_url?: string | null;
          expense_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_expenses_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "business_trips";
            referencedColumns: ["id"];
          },
        ];
      };
      holidays: {
        Row: {
          id: string;
          name: string;
          date: string;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date: string;
          country?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          date?: string;
          country?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_user_department: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_department_manager: {
        Args: { dept_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type VacationAllowance = Database["public"]["Tables"]["vacation_allowances"]["Row"];
export type VacationRequest = Database["public"]["Tables"]["vacation_requests"]["Row"];
export type BusinessTrip = Database["public"]["Tables"]["business_trips"]["Row"];
export type TripEvent = Database["public"]["Tables"]["trip_events"]["Row"];
export type TripExpense = Database["public"]["Tables"]["trip_expenses"]["Row"];
export type Holiday = Database["public"]["Tables"]["holidays"]["Row"];
