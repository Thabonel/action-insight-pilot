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
          user_id: string | null
        }
        Insert: {
          action: string
          asset_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          asset_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
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
      campaigns: {
        Row: {
          budget_allocated: number | null
          budget_spent: number | null
          channel: string
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          settings: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_audience: Json | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at: string | null
        }
        Insert: {
          budget_allocated?: number | null
          budget_spent?: number | null
          channel: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: Json | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string | null
        }
        Update: {
          budget_allocated?: number | null
          budget_spent?: number | null
          channel?: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          settings?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: Json | null
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string | null
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
      lead_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          lead_id: string | null
          occurred_at: string | null
          source: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          occurred_at?: string | null
          source?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
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
        }
        Insert: {
          campaign_type?: string | null
          created_at?: string | null
          email_content?: string | null
          headline?: string | null
          id?: number
        }
        Update: {
          campaign_type?: string | null
          created_at?: string | null
          email_content?: string | null
          headline?: string | null
          id?: number
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
          target_audience: Json | null
          type: Database["public"]["Enums"]["campaign_type"] | null
          updated_at: string | null
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_user_role: {
        Args: { company_uuid: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
      campaign_type: "email" | "social" | "content" | "paid_ads" | "partnership"
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
      ],
      campaign_type: ["email", "social", "content", "paid_ads", "partnership"],
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
