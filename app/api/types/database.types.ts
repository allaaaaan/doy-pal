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
          name: string | null;
          description: string;
          points: number;
          timestamp: string;
          day_of_week: string;
          day_of_month: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          description_embedding: number[] | null;
          normalized_description: string | null;
          template_id: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          description: string;
          points: number;
          timestamp?: string;
          day_of_week: string;
          day_of_month: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          description_embedding?: number[] | null;
          normalized_description?: string | null;
          template_id?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          description?: string;
          points?: number;
          timestamp?: string;
          day_of_week?: string;
          day_of_month?: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          description_embedding?: number[] | null;
          normalized_description?: string | null;
          template_id?: string | null;
          profile_id?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          default_points: number;
          frequency: number;
          last_seen: string | null;
          ai_confidence: number | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          generation_batch: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          default_points?: number;
          frequency?: number;
          last_seen?: string | null;
          ai_confidence?: number | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          generation_batch?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          default_points?: number;
          frequency?: number;
          last_seen?: string | null;
          ai_confidence?: number | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          generation_batch?: string | null;
          profile_id?: string | null;
        };
      };
      template_analysis: {
        Row: {
          id: string;
          batch_id: string;
          analyzed_events_count: number | null;
          ai_model_used: string | null;
          analysis_prompt: string | null;
          ai_response_raw: any | null;
          templates_generated: number | null;
          created_at: string;
          profile_id: string | null;
        };
        Insert: {
          id?: string;
          batch_id: string;
          analyzed_events_count?: number | null;
          ai_model_used?: string | null;
          analysis_prompt?: string | null;
          ai_response_raw?: any | null;
          templates_generated?: number | null;
          created_at?: string;
          profile_id?: string | null;
        };
        Update: {
          id?: string;
          batch_id?: string;
          analyzed_events_count?: number | null;
          ai_model_used?: string | null;
          analysis_prompt?: string | null;
          ai_response_raw?: any | null;
          templates_generated?: number | null;
          created_at?: string;
          profile_id?: string | null;
        };
      };
      rewards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          point_cost: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          profile_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          point_cost: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          profile_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          point_cost?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          profile_id?: string | null;
        };
      };
      redemptions: {
        Row: {
          id: string;
          reward_id: string;
          points_spent: number;
          redeemed_at: string;
          status: string;
          profile_id: string | null;
        };
        Insert: {
          id?: string;
          reward_id: string;
          points_spent: number;
          redeemed_at?: string;
          status?: string;
          profile_id?: string | null;
        };
        Update: {
          id?: string;
          reward_id?: string;
          points_spent?: number;
          redeemed_at?: string;
          status?: string;
          profile_id?: string | null;
        };
      };
    };
    Views: {
      point_summaries: {
        Row: {
          profile_id: string;
          total_points: number;
          weekly_points: number;
          monthly_points: number;
        };
      };
    };
    Functions: {
      find_similar_events: {
        Args: {
          search_embedding: number[];
          similarity_threshold: number;
          max_results: number;
        };
        Returns: {
          id: string;
          description: string;
          points: number;
          timestamp: string;
          day_of_week: string;
          is_active: boolean;
          similarity: number;
        }[];
      };
      categorize_events: {
        Args: {
          similarity_threshold?: number;
        };
        Returns: {
          category_id: number;
          sample_description: string;
          event_count: number;
        }[];
      };
    };
  };
}
