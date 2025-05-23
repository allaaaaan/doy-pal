export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          name?: string;
          description: string;
          points: number;
          timestamp: string;
          day_of_week: string;
          day_of_month: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          normalized_description?: string;
          description_embedding?: number[];
          template_id?: string;
        };
        Insert: {
          id?: string;
          name?: string;
          description: string;
          points: number;
          timestamp?: string;
          day_of_week: string;
          day_of_month: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          normalized_description?: string;
          description_embedding?: number[];
          template_id?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          points?: number;
          timestamp?: string;
          day_of_week?: string;
          day_of_month?: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          normalized_description?: string;
          description_embedding?: number[];
          template_id?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          default_points: number;
          frequency: number;
          ai_confidence?: number;
          last_seen?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          default_points: number;
          frequency?: number;
          ai_confidence?: number;
          last_seen?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          default_points?: number;
          frequency?: number;
          ai_confidence?: number;
          last_seen?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      point_summaries: {
        Row: {
          total_points: number;
          weekly_points: number;
          monthly_points: number;
        };
      };
    };
  };
}
