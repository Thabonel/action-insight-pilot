export interface LeadCaptureForm {
  id: string;
  name: string;
  campaign_id?: string;
  fields: FormField[];
  created_at: string;
  updated_at?: string;
  status?: string;
}

export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
}
