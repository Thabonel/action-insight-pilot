
export interface ProposalFormData {
  template_type: string;
  client_info: {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    industry: string;
  };
  project_details: {
    description: string;
    scope: string;
    services: string[];
    duration: number;
    features: string[];
  };
  call_transcript: string;
  budget_range: {
    min: number;
    max: number;
  };
}

export interface Proposal {
  id: string;
  client_name: string;
  template_type: string;
  status: string;
  created_at: string;
  value: number;
}

export interface GeneratedProposal {
  id: string;
  template_type: string;
  client_info: any;
  content: {
    executive_summary: string;
    proposed_services: string;
  };
  pricing: Array<{
    item: string;
    description: string;
    price: number;
    quantity?: number;
  }>;
  timeline: Array<{
    phase: string;
    duration: string;
    deliverables: string[];
  }>;
  terms: {
    payment_terms: string;
    warranty: string;
  };
  created_at: string;
  status: string;
}
