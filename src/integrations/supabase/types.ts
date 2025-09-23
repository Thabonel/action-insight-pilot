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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_learning_data: {
        Row: {
          agent_type: string
          confidence_score: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          pattern_data: Json
          success_rate: number | null
          usage_count: number | null
        }
        Insert: {
          agent_type: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data: Json
          success_rate?: number | null
          usage_count?: number | null
        }
        Update: {
          agent_type?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data?: Json
          success_rate?: number | null
          usage_count?: number | null
        }
        Relationships: []
      }
      agent_logs: {
        Row: {
          agent_id: number | null
          completed_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: number
          input_data: Json | null
          output_data: Json | null
          started_at: string | null
          status: string
          task_type: string
        }
        Insert: {
          agent_id?: number | null
          completed_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: number
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status: string
          task_type: string
        }
        Update: {
          agent_id?: number | null
          completed_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: number
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: number
          last_run_at: string | null
          name: string
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          last_run_at?: string | null
          name: string
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          last_run_at?: string | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          description: string
          id: string
          impact_score: number | null
          level: string
          recommendations: Json | null
          timestamp: string | null
          title: string
        }
        Insert: {
          description: string
          id: string
          impact_score?: number | null
          level: string
          recommendations?: Json | null
          timestamp?: string | null
          title: string
        }
        Update: {
          description?: string
          id?: string
          impact_score?: number | null
          level?: string
          recommendations?: Json | null
          timestamp?: string | null
          title?: string
        }
        Relationships: []
      }
      ai_interaction_feedback: {
        Row: {
          context_data: Json
          created_at: string | null
          feedback_score: number | null
          id: string
          interaction_type: string
          original_suggestion: Json
          session_id: string | null
          timestamp: string | null
          user_id: string
          user_modification: Json | null
        }
        Insert: {
          context_data: Json
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          interaction_type: string
          original_suggestion: Json
          session_id?: string | null
          timestamp?: string | null
          user_id: string
          user_modification?: Json | null
        }
        Update: {
          context_data?: Json
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          interaction_type?: string
          original_suggestion?: Json
          session_id?: string | null
          timestamp?: string | null
          user_id?: string
          user_modification?: Json | null
        }
        Relationships: []
      }
      analytics_reports: {
        Row: {
          created_at: string | null
          executive_summary: string | null
          id: string
          insights: Json | null
          metrics: Json
          period_end: string
          period_start: string
          recommendations: Json | null
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string | null
          executive_summary?: string | null
          id: string
          insights?: Json | null
          metrics: Json
          period_end: string
          period_start: string
          recommendations?: Json | null
          report_type: string
          title: string
        }
        Update: {
          created_at?: string | null
          executive_summary?: string | null
          id?: string
          insights?: Json | null
          metrics?: Json
          period_end?: string
          period_start?: string
          recommendations?: Json | null
          report_type?: string
          title?: string
        }
        Relationships: []
      }
      asset_usage_analytics: {
        Row: {
          action: string
          asset_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          asset_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          asset_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_usage_analytics_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "digital_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: Database["public"]["Enums"]["action_type"]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          next_trigger_at: string | null
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["trigger_type"]
        }
        Insert: {
          action_config: Json
          action_type: Database["public"]["Enums"]["action_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          next_trigger_at?: string | null
          trigger_config: Json
          trigger_type: Database["public"]["Enums"]["trigger_type"]
        }
        Update: {
          action_config?: Json
          action_type?: Database["public"]["Enums"]["action_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          next_trigger_at?: string | null
          trigger_config?: Json
          trigger_type?: Database["public"]["Enums"]["trigger_type"]
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          asset_data: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_primary: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          asset_data: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          asset_data?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_copilot_sessions: {
        Row: {
          brief_data: Json
          created_at: string | null
          generated_campaign: Json | null
          id: string
          interaction_history: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brief_data: Json
          created_at?: string | null
          generated_campaign?: Json | null
          id?: string
          interaction_history?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brief_data?: Json
          created_at?: string | null
          generated_campaign?: Json | null
          id?: string
          interaction_history?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_logs: {
        Row: {
          campaign_type: string | null
          content_id: number | null
          id: number
          recipient_email: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_type?: string | null
          content_id?: number | null
          id?: number
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_type?: string | null
          content_id?: number | null
          id?: number
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      campaign_metrics: {
        Row: {
          additional_data: Json | null
          campaign_id: string | null
          id: string
          metric_date: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          additional_data?: Json | null
          campaign_id?: string | null
          id?: string
          metric_date: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          additional_data?: Json | null
          campaign_id?: string | null
          id?: string
          metric_date?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_performance_metrics: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_performance_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_performance_monitor: {
        Row: {
          auto_actions_taken: Json | null
          benchmark_metrics: Json | null
          campaign_id: string
          channel: string
          created_at: string | null
          id: string
          measured_at: string | null
          metrics: Json
          optimization_suggestions: Json | null
          performance_score: number | null
        }
        Insert: {
          auto_actions_taken?: Json | null
          benchmark_metrics?: Json | null
          campaign_id: string
          channel: string
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metrics: Json
          optimization_suggestions?: Json | null
          performance_score?: number | null
        }
        Update: {
          auto_actions_taken?: Json | null
          benchmark_metrics?: Json | null
          campaign_id?: string
          channel?: string
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metrics?: Json
          optimization_suggestions?: Json | null
          performance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_performance_monitor_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_performance_monitor_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_predictions: {
        Row: {
          accuracy_score: number | null
          actual_outcome: Json | null
          based_on_campaigns: Json | null
          campaign_id: string
          confidence_score: number
          created_at: string | null
          id: string
          prediction_data: Json
          prediction_type: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          based_on_campaigns?: Json | null
          campaign_id: string
          confidence_score: number
          created_at?: string | null
          id?: string
          prediction_data: Json
          prediction_type: string
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          based_on_campaigns?: Json | null
          campaign_id?: string
          confidence_score?: number
          created_at?: string | null
          id?: string
          prediction_data?: Json
          prediction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_predictions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_predictions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget_allocated: number | null
          budget_breakdown: Json | null
          budget_spent: number | null
          campaign_group_id: string | null
          channel: string
          channel_budget_allocation: Json | null
          channels: Json | null
          compliance_checklist: Json | null
          content: Json | null
          created_at: string | null
          created_by: string
          demographics: Json | null
          description: string | null
          end_date: string | null
          id: string
          kpi_targets: Json | null
          metrics: Json | null
          name: string
          parent_campaign_id: string | null
          primary_objective: string | null
          settings: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_audience: string | null
          total_budget: number | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at: string | null
        }
        Insert: {
          budget_allocated?: number | null
          budget_breakdown?: Json | null
          budget_spent?: number | null
          campaign_group_id?: string | null
          channel: string
          channel_budget_allocation?: Json | null
          channels?: Json | null
          compliance_checklist?: Json | null
          content?: Json | null
          created_at?: string | null
          created_by: string
          demographics?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          kpi_targets?: Json | null
          metrics?: Json | null
          name: string
          parent_campaign_id?: string | null
          primary_objective?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: string | null
          total_budget?: number | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string | null
        }
        Update: {
          budget_allocated?: number | null
          budget_breakdown?: Json | null
          budget_spent?: number | null
          campaign_group_id?: string | null
          channel?: string
          channel_budget_allocation?: Json | null
          channels?: Json | null
          compliance_checklist?: Json | null
          content?: Json | null
          created_at?: string | null
          created_by?: string
          demographics?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          kpi_targets?: Json | null
          metrics?: Json | null
          name?: string
          parent_campaign_id?: string | null
          primary_objective?: string | null
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: string | null
          total_budget?: number | null
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_parent_campaign_id_fkey"
            columns: ["parent_campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_parent_campaign_id_fkey"
            columns: ["parent_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          agent_type: string | null
          ai_response: Json
          id: string
          metadata: Json | null
          session_id: string
          timestamp: string
          user_message: string
        }
        Insert: {
          agent_type?: string | null
          ai_response: Json
          id?: string
          metadata?: Json | null
          session_id: string
          timestamp?: string
          user_message: string
        }
        Update: {
          agent_type?: string | null
          ai_response?: Json
          id?: string
          metadata?: Json | null
          session_id?: string
          timestamp?: string
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          query: string | null
          response: string | null
          session_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          query?: string | null
          response?: string | null
          session_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          query?: string | null
          response?: string | null
          session_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      competitors: {
        Row: {
          company_size: Database["public"]["Enums"]["company_size"] | null
          created_at: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          last_analyzed_at: string | null
          monitoring_keywords: string[] | null
          name: string
          website_url: string | null
        }
        Insert: {
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          last_analyzed_at?: string | null
          monitoring_keywords?: string[] | null
          name: string
          website_url?: string | null
        }
        Update: {
          company_size?: Database["public"]["Enums"]["company_size"] | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          last_analyzed_at?: string | null
          monitoring_keywords?: string[] | null
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          assets: string[] | null
          assigned_to: string | null
          content_data: Json | null
          content_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          platform: string[] | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assets?: string[] | null
          assigned_to?: string | null
          content_data?: Json | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          platform?: string[] | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assets?: string[] | null
          assigned_to?: string | null
          content_data?: Json | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          platform?: string[] | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_embeddings: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      content_performance: {
        Row: {
          content_id: string | null
          created_at: string | null
          id: string
          measured_at: string | null
          metrics: Json
          platform: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metrics: Json
          platform: string
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metrics?: Json
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_calendar"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pieces: {
        Row: {
          content: string | null
          content_type: string
          created_at: string | null
          generated_by_agent: number | null
          id: number
          keywords: string[] | null
          published_at: string | null
          seo_score: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          content_type: string
          created_at?: string | null
          generated_by_agent?: number | null
          id?: number
          keywords?: string[] | null
          published_at?: string | null
          seo_score?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string
          created_at?: string | null
          generated_by_agent?: number | null
          id?: number
          keywords?: string[] | null
          published_at?: string | null
          seo_score?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pieces_generated_by_agent_fkey"
            columns: ["generated_by_agent"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          preview_image: string | null
          tags: string[] | null
          template_data: Json
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          preview_image?: string | null
          tags?: string[] | null
          template_data: Json
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          preview_image?: string | null
          tags?: string[] | null
          template_data?: Json
          template_type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_journeys: {
        Row: {
          conversion_probability: number | null
          created_at: string | null
          id: string
          journey_stage: string
          lead_id: string | null
          next_action_recommended: string | null
          stage_duration_days: number | null
          touchpoints: Json | null
          updated_at: string | null
        }
        Insert: {
          conversion_probability?: number | null
          created_at?: string | null
          id?: string
          journey_stage: string
          lead_id?: string | null
          next_action_recommended?: string | null
          stage_duration_days?: number | null
          touchpoints?: Json | null
          updated_at?: string | null
        }
        Update: {
          conversion_probability?: number | null
          created_at?: string | null
          id?: string
          journey_stage?: string
          lead_id?: string | null
          next_action_recommended?: string | null
          stage_duration_days?: number | null
          touchpoints?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_journeys_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          confirmation_required: boolean
          created_at: string
          id: string
          request_id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confirmation_required?: boolean
          created_at?: string
          id?: string
          request_id: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confirmation_required?: boolean
          created_at?: string
          id?: string
          request_id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          download_url: string | null
          id: string
          request_id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          request_id: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          request_id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          folder_id: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          name: string
          tags: string[] | null
          thumbnail_path: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name: string
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_assets_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          rule_name: string
          trigger_conditions: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          trigger_conditions?: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          recipient_segments: Json | null
          send_date: string | null
          subject_line: string
          template_id: string | null
          total_clicked: number | null
          total_delivered: number | null
          total_opened: number | null
          total_sent: number | null
          total_unsubscribed: number | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          recipient_segments?: Json | null
          send_date?: string | null
          subject_line: string
          template_id?: string | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          recipient_segments?: Json | null
          send_date?: string | null
          subject_line?: string
          template_id?: string | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          total_unsubscribed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_contacts: {
        Row: {
          company: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string
          first_name: string | null
          id: string
          last_activity: string | null
          last_name: string | null
          subscribed: boolean | null
          tags: Json | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email: string
          first_name?: string | null
          id: string
          last_activity?: string | null
          last_name?: string | null
          subscribed?: boolean | null
          tags?: Json | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string
          first_name?: string | null
          id?: string
          last_activity?: string | null
          last_name?: string | null
          subscribed?: boolean | null
          tags?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_type: string
          html_content: string
          id: string
          name: string
          subject_line: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_type: string
          html_content: string
          id: string
          name: string
          subject_line: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_type?: string
          html_content?: string
          id?: string
          name?: string
          subject_line?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          brief: Json
          content: Json
          created_at: string | null
          engagement_prediction: number | null
          id: string
          readability_score: number | null
          seo_score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          brief: Json
          content: Json
          created_at?: string | null
          engagement_prediction?: number | null
          id: string
          readability_score?: number | null
          seo_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          brief?: Json
          content?: Json
          created_at?: string | null
          engagement_prediction?: number | null
          id?: string
          readability_score?: number | null
          seo_score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      generated_content_pieces: {
        Row: {
          approval_status: string | null
          campaign_id: string
          content: string
          content_type: string
          created_at: string | null
          created_by_agent: string | null
          id: string
          metadata: Json | null
          performance_data: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          campaign_id: string
          content: string
          content_type: string
          created_at?: string | null
          created_by_agent?: string | null
          id?: string
          metadata?: Json | null
          performance_data?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          campaign_id?: string
          content?: string
          content_type?: string
          created_at?: string | null
          created_by_agent?: string | null
          id?: string
          metadata?: Json | null
          performance_data?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_pieces_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_content_pieces_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      gtm_strategies: {
        Row: {
          created_at: string | null
          id: string
          inputs: Json
          product_name: string
          research_data: Json | null
          session_id: string | null
          status: string | null
          strategy_content: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inputs?: Json
          product_name: string
          research_data?: Json | null
          session_id?: string | null
          status?: string | null
          strategy_content: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inputs?: Json
          product_name?: string
          research_data?: Json | null
          session_id?: string | null
          status?: string | null
          strategy_content?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          configuration: Json | null
          connection_status: string | null
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          service_name: string
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          connection_status?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          service_name: string
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json | null
          connection_status?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          service_name?: string
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      keyword_research: {
        Row: {
          created_at: string
          created_by: string
          id: string
          keywords: Json
          query: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          keywords?: Json
          query: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          keywords?: Json
          query?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_access_logs: {
        Row: {
          agent_type: string | null
          bucket_id: string | null
          chunk_id: string | null
          created_at: string
          document_id: string | null
          id: string
          query_text: string | null
          similarity_score: number | null
          used_in_response: boolean | null
          user_id: string | null
        }
        Insert: {
          agent_type?: string | null
          bucket_id?: string | null
          chunk_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          query_text?: string | null
          similarity_score?: number | null
          used_in_response?: boolean | null
          user_id?: string | null
        }
        Update: {
          agent_type?: string | null
          bucket_id?: string | null
          chunk_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          query_text?: string | null
          similarity_score?: number | null
          used_in_response?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_access_logs_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "knowledge_buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_access_logs_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "knowledge_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_buckets: {
        Row: {
          bucket_type: string
          campaign_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_type: string
          campaign_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_type?: string
          campaign_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_buckets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_buckets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          bucket_id: string
          chunk_index: number
          content: string
          content_hash: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
          token_count: number | null
        }
        Insert: {
          bucket_id: string
          chunk_index: number
          content: string
          content_hash: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          token_count?: number | null
        }
        Update: {
          bucket_id?: string
          chunk_index?: number
          content?: string
          content_hash?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "knowledge_buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          bucket_id: string
          content: string
          created_at: string
          created_by: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          processing_error: string | null
          status: string
          title: string
          updated_at: string
          upload_path: string | null
        }
        Insert: {
          bucket_id: string
          content: string
          created_at?: string
          created_by: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          processing_error?: string | null
          status?: string
          title: string
          updated_at?: string
          upload_path?: string | null
        }
        Update: {
          bucket_id?: string
          content?: string
          created_at?: string
          created_by?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          processing_error?: string | null
          status?: string
          title?: string
          updated_at?: string
          upload_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "knowledge_buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string | null
          occurred_at: string | null
          source: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string | null
          occurred_at?: string | null
          source?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string | null
          occurred_at?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scoring_rules: {
        Row: {
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          rule_name: string
          score_weight: number
          updated_at: string | null
        }
        Insert: {
          conditions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          score_weight?: number
          updated_at?: string | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          score_weight?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          annual_revenue: number | null
          company: string | null
          company_size: Database["public"]["Enums"]["company_size"] | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          enriched_data: Json | null
          first_name: string | null
          id: string
          industry: string | null
          job_title: string | null
          last_activity_at: string | null
          last_name: string | null
          lead_score: number | null
          source: string
          source_details: Json | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          annual_revenue?: number | null
          company?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          enriched_data?: Json | null
          first_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          source: string
          source_details?: Json | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          annual_revenue?: number | null
          company?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          enriched_data?: Json | null
          first_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_activity_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          source?: string
          source_details?: Json | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_insights: {
        Row: {
          action_recommended: string | null
          agent_id: number | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          id: number
          insight_type: string
          priority_level: number | null
          source_data: Json | null
          title: string
        }
        Insert: {
          action_recommended?: string | null
          agent_id?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          insight_type: string
          priority_level?: number | null
          source_data?: Json | null
          title: string
        }
        Update: {
          action_recommended?: string | null
          agent_id?: number | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          insight_type?: string
          priority_level?: number | null
          source_data?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_insights_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_content: {
        Row: {
          campaign_type: string | null
          created_at: string | null
          email_content: string | null
          headline: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          campaign_type?: string | null
          created_at?: string | null
          email_content?: string | null
          headline?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          campaign_type?: string | null
          created_at?: string | null
          email_content?: string | null
          headline?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      oauth_connections: {
        Row: {
          access_token_encrypted: string
          connection_metadata: Json | null
          connection_status: string
          created_at: string
          id: string
          platform_name: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          connection_metadata?: Json | null
          connection_status?: string
          created_at?: string
          id?: string
          platform_name: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          connection_metadata?: Json | null
          connection_status?: string
          created_at?: string
          id?: string
          platform_name?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          platform_name: string
          redirect_uri: string
          state_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          platform_name: string
          redirect_uri: string
          state_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          platform_name?: string
          redirect_uri?: string
          state_token?: string
          user_id?: string
        }
        Relationships: []
      }
      pam_analytics_logs: {
        Row: {
          api_calls_count: number | null
          confidence: number | null
          confidence_level: string | null
          created_at: string | null
          day_of_week: number | null
          error_message: string | null
          error_type: string | null
          has_error: boolean | null
          hour_of_day: number | null
          intent: string | null
          is_weekend: boolean | null
          log_id: string
          log_level: string | null
          message: string | null
          message_preview: string | null
          raw_context: Json | null
          response_time_ms: number | null
          session_id: string | null
          timestamp: string | null
          trace_id: string | null
          user_id: string | null
          validation_passed: boolean | null
          voice_enabled: boolean | null
          workflow_name: string | null
        }
        Insert: {
          api_calls_count?: number | null
          confidence?: number | null
          confidence_level?: string | null
          created_at?: string | null
          day_of_week?: number | null
          error_message?: string | null
          error_type?: string | null
          has_error?: boolean | null
          hour_of_day?: number | null
          intent?: string | null
          is_weekend?: boolean | null
          log_id: string
          log_level?: string | null
          message?: string | null
          message_preview?: string | null
          raw_context?: Json | null
          response_time_ms?: number | null
          session_id?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_id?: string | null
          validation_passed?: boolean | null
          voice_enabled?: boolean | null
          workflow_name?: string | null
        }
        Update: {
          api_calls_count?: number | null
          confidence?: number | null
          confidence_level?: string | null
          created_at?: string | null
          day_of_week?: number | null
          error_message?: string | null
          error_type?: string | null
          has_error?: boolean | null
          hour_of_day?: number | null
          intent?: string | null
          is_weekend?: boolean | null
          log_id?: string
          log_level?: string | null
          message?: string | null
          message_preview?: string | null
          raw_context?: Json | null
          response_time_ms?: number | null
          session_id?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_id?: string | null
          validation_passed?: boolean | null
          voice_enabled?: boolean | null
          workflow_name?: string | null
        }
        Relationships: []
      }
      pam_memory: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          message: string | null
          response: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message?: string | null
          response?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          message?: string | null
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_analytics: {
        Row: {
          created_at: string | null
          created_by: string | null
          date_recorded: string
          dimensions: Json | null
          id: string
          metric_category: string
          metric_name: string
          metric_value: number
          time_period: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date_recorded: string
          dimensions?: Json | null
          id?: string
          metric_category: string
          metric_name: string
          metric_value: number
          time_period: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date_recorded?: string
          dimensions?: Json | null
          id?: string
          metric_category?: string
          metric_name?: string
          metric_value?: number
          time_period?: string
        }
        Relationships: []
      }
      privacy_audit_log: {
        Row: {
          created_at: string
          details: Json
          event_type: string
          id: string
          ip_address: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          event_type: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          event_type?: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proposal_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          sections: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          sections?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sections?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_name: string
          content: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          pricing: Json | null
          status: string
          template_type: string
          terms: Json | null
          timeline: Json | null
          updated_at: string | null
        }
        Insert: {
          client_name: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          pricing?: Json | null
          status?: string
          template_type: string
          terms?: Json | null
          timeline?: Json | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          pricing?: Json | null
          status?: string
          template_type?: string
          terms?: Json | null
          timeline?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      real_time_metrics: {
        Row: {
          change_percentage: number | null
          current_value: number
          entity_id: string
          entity_type: string
          id: string
          metric_type: string
          previous_value: number | null
          recorded_at: string | null
          user_id: string | null
        }
        Insert: {
          change_percentage?: number | null
          current_value: number
          entity_id: string
          entity_type: string
          id?: string
          metric_type: string
          previous_value?: number | null
          recorded_at?: string | null
          user_id?: string | null
        }
        Update: {
          change_percentage?: number | null
          current_value?: number
          entity_id?: string
          entity_type?: string
          id?: string
          metric_type?: string
          previous_value?: number | null
          recorded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      route_data: {
        Row: {
          end_date: string | null
          end_location: string
          id: string
          last_checked: string | null
          start_date: string | null
          start_location: string
          user_id: string | null
          waypoints: Json | null
        }
        Insert: {
          end_date?: string | null
          end_location: string
          id?: string
          last_checked?: string | null
          start_date?: string | null
          start_location: string
          user_id?: string | null
          waypoints?: Json | null
        }
        Update: {
          end_date?: string | null
          end_location?: string
          id?: string
          last_checked?: string | null
          start_date?: string | null
          start_location?: string
          user_id?: string | null
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "route_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_data: {
        Row: {
          agent_id: number | null
          confidence_score: number | null
          data_type: string
          id: number
          processed_data: Json | null
          raw_data: Json | null
          scraped_at: string | null
          source_url: string
          user_id: string | null
        }
        Insert: {
          agent_id?: number | null
          confidence_score?: number | null
          data_type: string
          id?: number
          processed_data?: Json | null
          raw_data?: Json | null
          scraped_at?: string | null
          source_url: string
          user_id?: string | null
        }
        Update: {
          agent_id?: number | null
          confidence_score?: number | null
          data_type?: string
          id?: number
          processed_data?: Json | null
          raw_data?: Json | null
          scraped_at?: string | null
          source_url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_data_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      secret_audit_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          operation: string
          service_name: string
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          operation: string
          service_name: string
          success: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          operation?: string
          service_name?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_engagement: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          id: string
          platform: string
          post_id: string | null
          requires_response: boolean | null
          responded: boolean | null
          sentiment: string | null
          timestamp: string
          type: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          id: string
          platform: string
          post_id?: string | null
          requires_response?: boolean | null
          responded?: boolean | null
          sentiment?: string | null
          timestamp: string
          type: string
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          platform?: string
          post_id?: string | null
          requires_response?: boolean | null
          responded?: boolean | null
          sentiment?: string | null
          timestamp?: string
          type?: string
        }
        Relationships: []
      }
      social_platform_connections: {
        Row: {
          access_token_encrypted: string | null
          connection_metadata: Json | null
          connection_status: string | null
          created_at: string | null
          id: string
          platform_name: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connection_metadata?: Json | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          platform_name: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connection_metadata?: Json | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          platform_name?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          campaign_id: string | null
          content: string
          created_at: string | null
          engagement_metrics: Json | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          platform: string
          post_id: string | null
          posted_at: string | null
          scheduled_time: string | null
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          content: string
          created_at?: string | null
          engagement_metrics?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform: string
          post_id?: string | null
          posted_at?: string | null
          scheduled_time?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: string
          created_at?: string | null
          engagement_metrics?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          post_id?: string | null
          posted_at?: string | null
          scheduled_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "active_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          session_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          session_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          session_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preference_category: string
          preference_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_category: string
          preference_data?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_category?: string
          preference_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_privacy_settings: {
        Row: {
          analytics_consent: boolean
          created_at: string
          data_processing_consent: boolean
          data_retention_days: number
          id: string
          marketing_consent: boolean
          right_to_be_deleted_requested: boolean
          third_party_consent: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_consent?: boolean
          created_at?: string
          data_processing_consent?: boolean
          data_retention_days?: number
          id?: string
          marketing_consent?: boolean
          right_to_be_deleted_requested?: boolean
          third_party_consent?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_consent?: boolean
          created_at?: string
          data_processing_consent?: boolean
          data_retention_days?: number
          id?: string
          marketing_consent?: boolean
          right_to_be_deleted_requested?: boolean
          third_party_consent?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_secrets: {
        Row: {
          created_at: string | null
          encrypted_value: string
          id: string
          initialization_vector: string
          is_active: boolean | null
          last_used_at: string | null
          metadata: Json | null
          service_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_value: string
          id?: string
          initialization_vector: string
          is_active?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          service_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_value?: string
          id?: string
          initialization_vector?: string
          is_active?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          service_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean | null
          last_response_code: number | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          secret_token: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_response_code?: number | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          secret_token?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_response_code?: number | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          secret_token?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string | null
          status: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          workflow_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_campaigns: {
        Row: {
          budget_allocated: number | null
          budget_spent: number | null
          channel: string | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string | null
          last_metric_update: string | null
          metrics: Json | null
          metrics_count: number | null
          name: string | null
          settings: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_audience: string | null
          type: Database["public"]["Enums"]["campaign_type"] | null
          updated_at: string | null
        }
        Relationships: []
      }
      campaign_groups: {
        Row: {
          campaign_group_id: string | null
          campaign_ids: string[] | null
          channel_count: number | null
          channels: string[] | null
          created_at: string | null
          end_date: string | null
          group_name: string | null
          start_date: string | null
          total_budget: number | null
        }
        Relationships: []
      }
      lead_pipeline_summary: {
        Row: {
          avg_score: number | null
          lead_count: number | null
          new_this_month: number | null
          new_this_week: number | null
          status: Database["public"]["Enums"]["lead_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_oauth_states: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never> | { company_uuid: string }
        Returns: string
      }
      search_knowledge_chunks: {
        Args: {
          p_bucket_type?: string
          p_campaign_id?: string
          p_limit?: number
          p_query_embedding: string
          p_similarity_threshold?: number
          p_user_id: string
        }
        Returns: {
          bucket_id: string
          bucket_name: string
          chunk_content: string
          chunk_id: string
          chunk_index: number
          document_id: string
          document_title: string
          metadata: Json
          similarity_score: number
        }[]
      }
      seed_demo_data: {
        Args: Record<PropertyKey, never> | { demo_user_id?: string }
        Returns: undefined
      }
      user_has_role: {
        Args: { check_role: string }
        Returns: boolean
      }
    }
    Enums: {
      action_type: "run_agent" | "send_notification" | "update_data"
      agent_status: "idle" | "running" | "paused" | "error"
      agent_type:
        | "market_intelligence"
        | "content_generation"
        | "lead_generation"
        | "campaign_orchestration"
        | "customer_journey"
      asset_type: "image" | "video" | "document" | "audio" | "archive" | "other"
      campaign_status:
        | "draft"
        | "scheduled"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
        | "archived"
      campaign_type:
        | "email"
        | "social"
        | "content"
        | "paid_ads"
        | "partnership"
        | "lead_generation"
        | "brand_awareness"
        | "product_launch"
      company_size: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+"
      confidence_level: "low" | "medium" | "high"
      content_status: "draft" | "review" | "approved" | "published" | "archived"
      content_type:
        | "blog_post"
        | "social_post"
        | "email"
        | "ad_copy"
        | "landing_page"
      data_type:
        | "competitor_pricing"
        | "social_mention"
        | "product_launch"
        | "marketing_campaign"
        | "customer_review"
        | "industry_news"
        | "lead_contact"
        | "company_profile"
      insight_type:
        | "competitor_analysis"
        | "trend_analysis"
        | "pricing_intelligence"
        | "sentiment_analysis"
        | "market_opportunity"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "opportunity"
        | "customer"
        | "lost"
      task_status: "started" | "completed" | "failed" | "timeout"
      template_type:
        | "social_media"
        | "email"
        | "landing_page"
        | "ad_creative"
        | "brand_kit"
      trigger_type: "schedule" | "event" | "condition"
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
      action_type: ["run_agent", "send_notification", "update_data"],
      agent_status: ["idle", "running", "paused", "error"],
      agent_type: [
        "market_intelligence",
        "content_generation",
        "lead_generation",
        "campaign_orchestration",
        "customer_journey",
      ],
      asset_type: ["image", "video", "document", "audio", "archive", "other"],
      campaign_status: [
        "draft",
        "scheduled",
        "active",
        "paused",
        "completed",
        "cancelled",
        "archived",
      ],
      campaign_type: [
        "email",
        "social",
        "content",
        "paid_ads",
        "partnership",
        "lead_generation",
        "brand_awareness",
        "product_launch",
      ],
      company_size: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
      confidence_level: ["low", "medium", "high"],
      content_status: ["draft", "review", "approved", "published", "archived"],
      content_type: [
        "blog_post",
        "social_post",
        "email",
        "ad_copy",
        "landing_page",
      ],
      data_type: [
        "competitor_pricing",
        "social_mention",
        "product_launch",
        "marketing_campaign",
        "customer_review",
        "industry_news",
        "lead_contact",
        "company_profile",
      ],
      insight_type: [
        "competitor_analysis",
        "trend_analysis",
        "pricing_intelligence",
        "sentiment_analysis",
        "market_opportunity",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "opportunity",
        "customer",
        "lost",
      ],
      task_status: ["started", "completed", "failed", "timeout"],
      template_type: [
        "social_media",
        "email",
        "landing_page",
        "ad_creative",
        "brand_kit",
      ],
      trigger_type: ["schedule", "event", "condition"],
    },
  },
} as const
