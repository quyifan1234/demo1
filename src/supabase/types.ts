export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_apps: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_favorite: boolean
          name: string
          note: string | null
          quota_remaining: number | null
          quota_total: number | null
          quota_unit: string
          quota_updated_at: string | null
          rating: number
          specialties: string[]
          status: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_favorite?: boolean
          name: string
          note?: string | null
          quota_remaining?: number | null
          quota_total?: number | null
          quota_unit?: string
          quota_updated_at?: string | null
          rating?: number
          specialties?: string[]
          status?: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_favorite?: boolean
          name?: string
          note?: string | null
          quota_remaining?: number | null
          quota_total?: number | null
          quota_unit?: string
          quota_updated_at?: string | null
          rating?: number
          specialties?: string[]
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_value: string
          name: string
          note: string | null
          platform: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_value: string
          name: string
          note?: string | null
          platform?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_value?: string
          name?: string
          note?: string | null
          platform?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_key_links: {
        Row: {
          app_id: string
          created_at: string
          id: string
          key_id: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          key_id: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          key_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_key_links_app_id_fkey"
            columns: ["app_id"]
            referencedRelation: "ai_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_key_links_key_id_fkey"
            columns: ["key_id"]
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      app_outputs: {
        Row: {
          app_id: string
          asset_url: string | null
          content: string | null
          created_at: string
          id: string
          kind: string
          title: string
          user_id: string
        }
        Insert: {
          app_id: string
          asset_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          kind?: string
          title: string
          user_id: string
        }
        Update: {
          app_id?: string
          asset_url?: string | null
          content?: string | null
          created_at?: string
          id?: string
          kind?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_outputs_app_id_fkey"
            columns: ["app_id"]
            referencedRelation: "ai_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          nickname: string | null
          openid: string | null
          unionid: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          nickname?: string | null
          openid?: string | null
          unionid?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          nickname?: string | null
          openid?: string | null
          unionid?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      skill_app_links: {
        Row: {
          app_id: string
          created_at: string
          id: string
          skill_id: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          skill_id: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_app_links_app_id_fkey"
            columns: ["app_id"]
            referencedRelation: "ai_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_app_links_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          name: string
          scene: string | null
          tags: string[]
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          name: string
          scene?: string | null
          tags?: string[]
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          name?: string
          scene?: string | null
          tags?: string[]
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_prefs: {
        Row: {
          created_at: string
          default_sort: string
          quota_threshold: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_sort?: string
          quota_threshold?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_sort?: string
          quota_threshold?: number
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
