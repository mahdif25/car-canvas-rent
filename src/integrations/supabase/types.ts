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
      additional_drivers: {
        Row: {
          cin: string | null
          cin_expiry_date: string | null
          created_at: string
          dob: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          license_delivery_date: string | null
          license_number: string
          nationality: string | null
          passport: string | null
          phone: string | null
          reservation_id: string
        }
        Insert: {
          cin?: string | null
          cin_expiry_date?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          license_delivery_date?: string | null
          license_number: string
          nationality?: string | null
          passport?: string | null
          phone?: string | null
          reservation_id: string
        }
        Update: {
          cin?: string | null
          cin_expiry_date?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          license_delivery_date?: string | null
          license_number?: string
          nationality?: string | null
          passport?: string | null
          phone?: string | null
          reservation_id?: string
        }
        Relationships: []
      }
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
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          coupon_id: string | null
          created_at: string
          email: string
          friend_coupon_id: string | null
          id: string
          name: string | null
          status: string
        }
        Insert: {
          broadcast_id: string
          coupon_id?: string | null
          created_at?: string
          email: string
          friend_coupon_id?: string | null
          id?: string
          name?: string | null
          status?: string
        }
        Update: {
          broadcast_id?: string
          coupon_id?: string | null
          created_at?: string
          email?: string
          friend_coupon_id?: string | null
          id?: string
          name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "email_broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_recipients_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_recipients_friend_coupon_id_fkey"
            columns: ["friend_coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          created_at: string
          customer_email: string
          discount_applied: number
          id: string
          reservation_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          customer_email: string
          discount_applied: number
          id?: string
          reservation_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          customer_email?: string
          discount_applied?: number
          id?: string
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_amount: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_rental_days: number | null
          min_total_price: number | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_amount: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_rental_days?: number | null
          min_total_price?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_amount?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_rental_days?: number | null
          min_total_price?: number | null
        }
        Relationships: []
      }
      email_broadcasts: {
        Row: {
          body_html: string
          coupon_expires_at: string | null
          coupon_mode: string
          coupon_prefix: string | null
          created_at: string
          discount_amount: number
          filters_json: Json
          friend_discount_amount: number
          id: string
          recipient_count: number
          sent_count: number
          source_coupon_id: string | null
          status: string
          subject: string
        }
        Insert: {
          body_html?: string
          coupon_expires_at?: string | null
          coupon_mode?: string
          coupon_prefix?: string | null
          created_at?: string
          discount_amount?: number
          filters_json?: Json
          friend_discount_amount?: number
          id?: string
          recipient_count?: number
          sent_count?: number
          source_coupon_id?: string | null
          status?: string
          subject: string
        }
        Update: {
          body_html?: string
          coupon_expires_at?: string | null
          coupon_mode?: string
          coupon_prefix?: string | null
          created_at?: string
          discount_amount?: number
          filters_json?: Json
          friend_discount_amount?: number
          id?: string
          recipient_count?: number
          sent_count?: number
          source_coupon_id?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_broadcasts_source_coupon_id_fkey"
            columns: ["source_coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
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
      fleet_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          plate_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          plate_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          plate_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_expenses_plate_id_fkey"
            columns: ["plate_id"]
            isOneToOne: false
            referencedRelation: "fleet_plates"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_loans: {
        Row: {
          bank_name: string
          created_at: string
          id: string
          interest_rate: number
          is_active: boolean
          loan_amount: number
          loan_duration_months: number
          monthly_payment: number
          notes: string | null
          plate_id: string
          remaining_amount: number
          start_date: string
        }
        Insert: {
          bank_name: string
          created_at?: string
          id?: string
          interest_rate?: number
          is_active?: boolean
          loan_amount: number
          loan_duration_months: number
          monthly_payment: number
          notes?: string | null
          plate_id: string
          remaining_amount: number
          start_date: string
        }
        Update: {
          bank_name?: string
          created_at?: string
          id?: string
          interest_rate?: number
          is_active?: boolean
          loan_amount?: number
          loan_duration_months?: number
          monthly_payment?: number
          notes?: string | null
          plate_id?: string
          remaining_amount?: number
          start_date?: string
        }
        Relationships: []
      }
      fleet_plates: {
        Row: {
          brand: string
          created_at: string
          id: string
          image_flipped: boolean
          image_offset_y: number
          image_scale: number
          image_url: string | null
          is_active: boolean
          model: string
          notes: string | null
          plate_number: string
          vehicle_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          image_flipped?: boolean
          image_offset_y?: number
          image_scale?: number
          image_url?: string | null
          is_active?: boolean
          model: string
          notes?: string | null
          plate_number: string
          vehicle_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          image_flipped?: boolean
          image_offset_y?: number
          image_scale?: number
          image_url?: string | null
          is_active?: boolean
          model?: string
          notes?: string | null
          plate_number?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_plates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          capi_allowed: boolean
          cin: string | null
          cin_expiry_date: string | null
          created_at: string | null
          dob: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_reservation_step: number | null
          license_delivery_date: string | null
          license_number: string | null
          nationality: string | null
          passport: string | null
          phone: string | null
          pickup_date: string | null
          pickup_location: string | null
          pickup_time: string | null
          promo_code: string | null
          reservation_completed: boolean | null
          reservation_id: string | null
          return_date: string | null
          return_location: string | null
          return_time: string | null
          selected_addons: string[] | null
          selected_color_id: string | null
          session_id: string | null
          source: string
          updated_at: string | null
          vehicle_id: string | null
          visitor_id: string | null
        }
        Insert: {
          capi_allowed?: boolean
          cin?: string | null
          cin_expiry_date?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_reservation_step?: number | null
          license_delivery_date?: string | null
          license_number?: string | null
          nationality?: string | null
          passport?: string | null
          phone?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          pickup_time?: string | null
          promo_code?: string | null
          reservation_completed?: boolean | null
          reservation_id?: string | null
          return_date?: string | null
          return_location?: string | null
          return_time?: string | null
          selected_addons?: string[] | null
          selected_color_id?: string | null
          session_id?: string | null
          source?: string
          updated_at?: string | null
          vehicle_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          capi_allowed?: boolean
          cin?: string | null
          cin_expiry_date?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_reservation_step?: number | null
          license_delivery_date?: string | null
          license_number?: string | null
          nationality?: string | null
          passport?: string | null
          phone?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          pickup_time?: string | null
          promo_code?: string | null
          reservation_completed?: boolean | null
          reservation_id?: string | null
          return_date?: string | null
          return_location?: string | null
          return_time?: string | null
          selected_addons?: string[] | null
          selected_color_id?: string | null
          session_id?: string | null
          source?: string
          updated_at?: string | null
          vehicle_id?: string | null
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
          assigned_plate_id: string | null
          coupon_id: string | null
          created_at: string
          customer_cin: string | null
          customer_cin_expiry_date: string | null
          customer_dob: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_license: string
          customer_license_delivery_date: string | null
          customer_nationality: string | null
          customer_passport: string | null
          customer_phone: string
          delivery_fee: number
          deposit_amount: number
          deposit_status: Database["public"]["Enums"]["deposit_status"]
          discount_amount: number
          id: string
          is_manual: boolean
          marketing_consent: boolean
          payment_method: string
          pickup_date: string
          pickup_location: string
          pickup_time: string | null
          return_date: string
          return_location: string | null
          return_time: string | null
          selected_color_id: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          assigned_plate_id?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_cin?: string | null
          customer_cin_expiry_date?: string | null
          customer_dob?: string | null
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_license: string
          customer_license_delivery_date?: string | null
          customer_nationality?: string | null
          customer_passport?: string | null
          customer_phone: string
          delivery_fee?: number
          deposit_amount?: number
          deposit_status?: Database["public"]["Enums"]["deposit_status"]
          discount_amount?: number
          id?: string
          is_manual?: boolean
          marketing_consent?: boolean
          payment_method?: string
          pickup_date: string
          pickup_location: string
          pickup_time?: string | null
          return_date: string
          return_location?: string | null
          return_time?: string | null
          selected_color_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price?: number
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          assigned_plate_id?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_cin?: string | null
          customer_cin_expiry_date?: string | null
          customer_dob?: string | null
          customer_email?: string
          customer_first_name?: string
          customer_last_name?: string
          customer_license?: string
          customer_license_delivery_date?: string | null
          customer_nationality?: string | null
          customer_passport?: string | null
          customer_phone?: string
          delivery_fee?: number
          deposit_amount?: number
          deposit_status?: Database["public"]["Enums"]["deposit_status"]
          discount_amount?: number
          id?: string
          is_manual?: boolean
          marketing_consent?: boolean
          payment_method?: string
          pickup_date?: string
          pickup_location?: string
          pickup_time?: string | null
          return_date?: string
          return_location?: string | null
          return_time?: string | null
          selected_color_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price?: number
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_assigned_plate_id_fkey"
            columns: ["assigned_plate_id"]
            isOneToOne: false
            referencedRelation: "fleet_plates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_selected_color_id_fkey"
            columns: ["selected_color_id"]
            isOneToOne: false
            referencedRelation: "vehicle_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean
          name: string
          rating: number
          sort_order: number
          text: string
          time_label: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          rating?: number
          sort_order?: number
          text: string
          time_label?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          rating?: number
          sort_order?: number
          text?: string
          time_label?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          caution_policy_html: string
          conditions_generales_html: string
          facebook_capi_token: string | null
          facebook_pixel_id: string | null
          fb_leadads_app_secret: string
          fb_leadads_page_access_token: string
          fb_leadads_verify_token: string
          footer_address: string
          footer_copyright: string
          footer_description: string
          footer_email: string
          footer_phone: string
          google_analytics_id: string | null
          google_reviews_url: string | null
          google_tag_manager_id: string | null
          hero_bg_type: string
          hero_bg_value: string | null
          hero_overlay_opacity: number | null
          hero_subtitle_animation: string
          hero_subtitle_style: Json
          hero_subtitle_text: string
          hero_title_animation: string
          hero_title_highlight: string
          hero_title_style: Json
          hero_title_text: string
          hero_video_desktop_offset_x: number
          hero_video_desktop_offset_y: number
          hero_video_desktop_scale: number
          hero_video_mobile_offset_x: number
          hero_video_mobile_offset_y: number
          hero_video_mobile_scale: number
          hero_video_offset_x: number
          hero_video_offset_y: number
          hero_video_start_time: number
          hero_video_tablet_offset_x: number
          hero_video_tablet_offset_y: number
          hero_video_tablet_scale: number
          id: string
          lead_capture_mode: string
          logo_height: number
          notification_email: string | null
          privacy_policy_html: string
          send_reservation_emails: boolean | null
          show_reviews_section: boolean | null
          tiktok_pixel_id: string | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
          whatsapp_message: string | null
          whatsapp_number: string | null
        }
        Insert: {
          caution_policy_html?: string
          conditions_generales_html?: string
          facebook_capi_token?: string | null
          facebook_pixel_id?: string | null
          fb_leadads_app_secret?: string
          fb_leadads_page_access_token?: string
          fb_leadads_verify_token?: string
          footer_address?: string
          footer_copyright?: string
          footer_description?: string
          footer_email?: string
          footer_phone?: string
          google_analytics_id?: string | null
          google_reviews_url?: string | null
          google_tag_manager_id?: string | null
          hero_bg_type?: string
          hero_bg_value?: string | null
          hero_overlay_opacity?: number | null
          hero_subtitle_animation?: string
          hero_subtitle_style?: Json
          hero_subtitle_text?: string
          hero_title_animation?: string
          hero_title_highlight?: string
          hero_title_style?: Json
          hero_title_text?: string
          hero_video_desktop_offset_x?: number
          hero_video_desktop_offset_y?: number
          hero_video_desktop_scale?: number
          hero_video_mobile_offset_x?: number
          hero_video_mobile_offset_y?: number
          hero_video_mobile_scale?: number
          hero_video_offset_x?: number
          hero_video_offset_y?: number
          hero_video_start_time?: number
          hero_video_tablet_offset_x?: number
          hero_video_tablet_offset_y?: number
          hero_video_tablet_scale?: number
          id?: string
          lead_capture_mode?: string
          logo_height?: number
          notification_email?: string | null
          privacy_policy_html?: string
          send_reservation_emails?: boolean | null
          show_reviews_section?: boolean | null
          tiktok_pixel_id?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          caution_policy_html?: string
          conditions_generales_html?: string
          facebook_capi_token?: string | null
          facebook_pixel_id?: string | null
          fb_leadads_app_secret?: string
          fb_leadads_page_access_token?: string
          fb_leadads_verify_token?: string
          footer_address?: string
          footer_copyright?: string
          footer_description?: string
          footer_email?: string
          footer_phone?: string
          google_analytics_id?: string | null
          google_reviews_url?: string | null
          google_tag_manager_id?: string | null
          hero_bg_type?: string
          hero_bg_value?: string | null
          hero_overlay_opacity?: number | null
          hero_subtitle_animation?: string
          hero_subtitle_style?: Json
          hero_subtitle_text?: string
          hero_title_animation?: string
          hero_title_highlight?: string
          hero_title_style?: Json
          hero_title_text?: string
          hero_video_desktop_offset_x?: number
          hero_video_desktop_offset_y?: number
          hero_video_desktop_scale?: number
          hero_video_mobile_offset_x?: number
          hero_video_mobile_offset_y?: number
          hero_video_mobile_scale?: number
          hero_video_offset_x?: number
          hero_video_offset_y?: number
          hero_video_start_time?: number
          hero_video_tablet_offset_x?: number
          hero_video_tablet_offset_y?: number
          hero_video_tablet_scale?: number
          id?: string
          lead_capture_mode?: string
          logo_height?: number
          notification_email?: string | null
          privacy_policy_html?: string
          send_reservation_emails?: boolean | null
          show_reviews_section?: boolean | null
          tiktok_pixel_id?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
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
      vehicle_colors: {
        Row: {
          color_hex: string
          color_name: string
          created_at: string
          id: string
          image_flipped: boolean
          image_scale_detail: number
          image_scale_detail_mobile: number
          image_scale_detail_tablet: number
          image_scale_fleet: number
          image_scale_fleet_mobile: number
          image_scale_fleet_tablet: number
          image_scale_home: number
          image_scale_home_mobile: number
          image_scale_home_tablet: number
          image_scale_reservation: number
          image_scale_reservation_mobile: number
          image_scale_reservation_tablet: number
          image_scale_sidebar: number
          image_scale_sidebar_mobile: number
          image_scale_sidebar_tablet: number
          image_url: string
          is_default: boolean
          sort_order: number
          vehicle_id: string
        }
        Insert: {
          color_hex?: string
          color_name: string
          created_at?: string
          id?: string
          image_flipped?: boolean
          image_scale_detail?: number
          image_scale_detail_mobile?: number
          image_scale_detail_tablet?: number
          image_scale_fleet?: number
          image_scale_fleet_mobile?: number
          image_scale_fleet_tablet?: number
          image_scale_home?: number
          image_scale_home_mobile?: number
          image_scale_home_tablet?: number
          image_scale_reservation?: number
          image_scale_reservation_mobile?: number
          image_scale_reservation_tablet?: number
          image_scale_sidebar?: number
          image_scale_sidebar_mobile?: number
          image_scale_sidebar_tablet?: number
          image_url: string
          is_default?: boolean
          sort_order?: number
          vehicle_id: string
        }
        Update: {
          color_hex?: string
          color_name?: string
          created_at?: string
          id?: string
          image_flipped?: boolean
          image_scale_detail?: number
          image_scale_detail_mobile?: number
          image_scale_detail_tablet?: number
          image_scale_fleet?: number
          image_scale_fleet_mobile?: number
          image_scale_fleet_tablet?: number
          image_scale_home?: number
          image_scale_home_mobile?: number
          image_scale_home_tablet?: number
          image_scale_reservation?: number
          image_scale_reservation_mobile?: number
          image_scale_reservation_tablet?: number
          image_scale_sidebar?: number
          image_scale_sidebar_mobile?: number
          image_scale_sidebar_tablet?: number
          image_url?: string
          is_default?: boolean
          sort_order?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_colors_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          sort_order: number
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
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
          has_bluetooth: boolean
          has_camera: boolean
          has_climatisation: boolean
          has_gps: boolean
          has_usb: boolean
          id: string
          image_flipped: boolean
          image_scale_detail: number
          image_scale_detail_mobile: number
          image_scale_detail_tablet: number
          image_scale_fleet: number
          image_scale_fleet_mobile: number
          image_scale_fleet_tablet: number
          image_scale_home: number
          image_scale_home_mobile: number
          image_scale_home_tablet: number
          image_scale_reservation: number
          image_scale_reservation_mobile: number
          image_scale_reservation_tablet: number
          image_scale_sidebar: number
          image_scale_sidebar_mobile: number
          image_scale_sidebar_tablet: number
          image_url: string | null
          is_available: boolean
          luggage: number
          model: string
          name: string
          seats: number
          security_deposit: number
          slug: string | null
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
          has_bluetooth?: boolean
          has_camera?: boolean
          has_climatisation?: boolean
          has_gps?: boolean
          has_usb?: boolean
          id?: string
          image_flipped?: boolean
          image_scale_detail?: number
          image_scale_detail_mobile?: number
          image_scale_detail_tablet?: number
          image_scale_fleet?: number
          image_scale_fleet_mobile?: number
          image_scale_fleet_tablet?: number
          image_scale_home?: number
          image_scale_home_mobile?: number
          image_scale_home_tablet?: number
          image_scale_reservation?: number
          image_scale_reservation_mobile?: number
          image_scale_reservation_tablet?: number
          image_scale_sidebar?: number
          image_scale_sidebar_mobile?: number
          image_scale_sidebar_tablet?: number
          image_url?: string | null
          is_available?: boolean
          luggage?: number
          model: string
          name: string
          seats?: number
          security_deposit?: number
          slug?: string | null
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
          has_bluetooth?: boolean
          has_camera?: boolean
          has_climatisation?: boolean
          has_gps?: boolean
          has_usb?: boolean
          id?: string
          image_flipped?: boolean
          image_scale_detail?: number
          image_scale_detail_mobile?: number
          image_scale_detail_tablet?: number
          image_scale_fleet?: number
          image_scale_fleet_mobile?: number
          image_scale_fleet_tablet?: number
          image_scale_home?: number
          image_scale_home_mobile?: number
          image_scale_home_tablet?: number
          image_scale_reservation?: number
          image_scale_reservation_mobile?: number
          image_scale_reservation_tablet?: number
          image_scale_sidebar?: number
          image_scale_sidebar_mobile?: number
          image_scale_sidebar_tablet?: number
          image_url?: string | null
          is_available?: boolean
          luggage?: number
          model?: string
          name?: string
          seats?: number
          security_deposit?: number
          slug?: string | null
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
