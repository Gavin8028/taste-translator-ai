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
      admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          country: string | null
          created_at: string
          device: string | null
          event_name: string
          id: string
          path: string | null
          props: Json
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device?: string | null
          event_name: string
          id?: string
          path?: string | null
          props?: Json
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device?: string | null
          event_name?: string
          id?: string
          path?: string | null
          props?: Json
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      anonymous_scans: {
        Row: {
          ip: unknown
          last_scan_at: string
        }
        Insert: {
          ip: unknown
          last_scan_at?: string
        }
        Update: {
          ip?: unknown
          last_scan_at?: string
        }
        Relationships: []
      }
      menu_dishes: {
        Row: {
          created_at: string
          cuisine: string
          description: string
          dietary: string[]
          id: string
          image_url: string | null
          ingredients: string[]
          menu_id: string
          name_original: string
          name_translated: string
          position: number
          price_text: string | null
          spice_level: number
          translations: Json
        }
        Insert: {
          created_at?: string
          cuisine?: string
          description?: string
          dietary?: string[]
          id?: string
          image_url?: string | null
          ingredients?: string[]
          menu_id: string
          name_original: string
          name_translated: string
          position?: number
          price_text?: string | null
          spice_level?: number
          translations?: Json
        }
        Update: {
          created_at?: string
          cuisine?: string
          description?: string
          dietary?: string[]
          id?: string
          image_url?: string | null
          ingredients?: string[]
          menu_id?: string
          name_original?: string
          name_translated?: string
          position?: number
          price_text?: string | null
          spice_level?: number
          translations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "menu_dishes_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "restaurant_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_menus: {
        Row: {
          created_at: string
          edit_token: string
          id: string
          name: string
          owner_id: string | null
          paddle_transaction_id: string | null
          paid: boolean
          paid_at: string | null
          slug: string
          source_language: string | null
          target_language: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          edit_token: string
          id?: string
          name: string
          owner_id?: string | null
          paddle_transaction_id?: string | null
          paid?: boolean
          paid_at?: string | null
          slug: string
          source_language?: string | null
          target_language?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          edit_token?: string
          id?: string
          name?: string
          owner_id?: string | null
          paddle_transaction_id?: string | null
          paid?: boolean
          paid_at?: string | null
          slug?: string
          source_language?: string | null
          target_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          client_id: string | null
          created_at: string
          dish_count: number
          id: string
          payload: Json
          source_language: string | null
          target_language: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          dish_count?: number
          id?: string
          payload: Json
          source_language?: string | null
          target_language?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          dish_count?: number
          id?: string
          payload?: Json
          source_language?: string | null
          target_language?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trusted_ips: {
        Row: {
          created_at: string
          ip: unknown
          label: string | null
        }
        Insert: {
          created_at?: string
          ip: unknown
          label?: string | null
        }
        Update: {
          created_at?: string
          ip?: unknown
          label?: string | null
        }
        Relationships: []
      }
      user_scan_credits: {
        Row: {
          free_remaining: number
          lifetime_paid_purchased: number
          lifetime_used: number
          paid_remaining: number
          updated_at: string
          user_id: string
        }
        Insert: {
          free_remaining?: number
          lifetime_paid_purchased?: number
          lifetime_used?: number
          paid_remaining?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          free_remaining?: number
          lifetime_paid_purchased?: number
          lifetime_used?: number
          paid_remaining?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_anonymous_scan: { Args: { _ip: unknown }; Returns: string }
      consume_scan_credit: { Args: { _user_id: string }; Returns: string }
      grant_paid_credits: {
        Args: { _amount: number; _user_id: string }
        Returns: undefined
      }
      has_active_premium: { Args: { _user_id: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_trusted_ip: { Args: { _ip: unknown }; Returns: boolean }
      refund_anonymous_scan: { Args: { _ip: unknown }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
