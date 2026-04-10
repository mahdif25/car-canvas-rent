export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addon_options: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          price_per_day: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          price_per_day?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          price_per_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          os: string | null
          page_path: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          os?: string | null
          page_path?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          os?: string | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_reservation_step: number | null
          license_number: string | null
          phone: string | null
          reservation_completed: boolean | null
          reservation_id: string | null
          session_id: string | null
          updated_at: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_reservation_step?: number | null
          license_number?: string | null
          phone?: string | null
          reservation_completed?: boolean | null
          reservation_id?: string | null
          session_id?: string | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_reservation_step?: number | null
          license_number?: string | null
          phone?: string | null
          reservation_completed?: boolean | null
          reservation_id?: string | null
          session_id?: string | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          delivery_fee: number
          id: string
          is_enabled: boolean
          is_free: boolean
          name: string
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          id?: string
          is_enabled?: boolean
          is_free?: boolean
          name: string
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          id?: string
          is_enabled?: boolean
          is_free?: boolean
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservation_addons: {
        Row: {
          addon_id: string
          id: string
          reservation_id: string
        }
        Insert: {
          addon_id: string
          id?: string
          reservation_id: string
        }
        Update: {
          addon_id?: string
          id?: string
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addon_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_addons_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          customer_dob: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_license: string
          customer_nationality: string | null
          customer_phone: string
          delivery_fee: number
          deposit_amount: number
          deposit_status: Database["public"]["Enums"]["deposit_status"]
          id: string
          pickup_date: string
          pickup_location: string
          pickup_time: string | null
          return_date: string
          return_location: string | null
          return_time: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          customer_dob?: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_license: string
          customer_nationality?: string | null
          customer_phone: string
          delivery_fee?: number
          deposit_amount?: number
          deposit_status?: Database["public"]["Enums"]["deposit_status"]
          id?: string
          pickup_date: string
          pickup_location: string
          pickup_time?: string | null
          return_date: string
          return_location?: string | null
          return_time?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price?: number
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          customer_dob?: string | null
          customer_email?: string
          customer_first_name?: string
          customer_last_name?: string
          customer_license?: string
          customer_nationality?: string | null
          customer_phone?: string
          delivery_fee?: number
          deposit_amount?: number
          deposit_status?: Database["public"]["Enums"]["deposit_status"]
          id?: string
          pickup_date?: string
          pickup_location?: string
          pickup_time?: string | null
          return_date?: string
          return_location?: string | null
          return_time?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price?: number
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_pricing_tiers: {
        Row: {
          created_at: string
          daily_rate: number
          id: string
          max_days: number | null
          min_days: number
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          daily_rate: number
          id?: string
          max_days?: number | null
          min_days: number
          vehicle_id: string
        }
        Update: {
          created_at?: string
          daily_rate?: number
          id?: string
          max_days?: number | null
          min_days?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_pricing_tiers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at: string
          doors: number
          features: string[] | null
          fuel: string
          id: string
          image_url: string | null
          is_available: boolean
          luggage: number
          model: string
          name: string
          seats: number
          security_deposit: number
          transmission: string
          updated_at: string
          year: number
        }
        Insert: {
          brand: string
          category?: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          doors?: number
          features?: string[] | null
          fuel?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          luggage?: number
          model: string
          name: string
          seats?: number
          security_deposit?: number
          transmission?: string
          updated_at?: string
          year: number
        }
        Update: {
          brand?: string
          category?: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          doors?: number
          features?: string[] | null
          fuel?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          luggage?: number
          model?: string
          name?: string
          seats?: number
          security_deposit?: number
          transmission?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      deposit_status: "pending" | "collected" | "returned"
      reservation_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
      vehicle_category: "SUV" | "Sedan" | "Compact" | "Luxury" | "Minivan"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      deposit_status: ["pending", "collected", "returned"],
      reservation_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
      ],
      vehicle_category: ["SUV", "Sedan", "Compact", "Luxury", "Minivan"],
    },
  },
} as const
