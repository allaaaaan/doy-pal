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
          description: string;
          points: number;
          timestamp: string;
          day_of_week: string;
          day_of_month: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          description: string;
          points: number;
          timestamp?: string;
          day_of_week: string;
          day_of_month: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          description?: string;
          points?: number;
          timestamp?: string;
          day_of_week?: string;
          day_of_month?: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
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
