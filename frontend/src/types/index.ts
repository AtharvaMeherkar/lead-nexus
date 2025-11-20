export interface UserProfile {
  id: string;
  email: string;
  role: string;
  subscription_status: string;
  plan?: string | null;
  billing_address?: Record<string, string> | null;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  company_name: string;
  location?: string | null;
  domain?: string | null;
  lead_score?: number | null; // ML-based lead quality score (0-100)
}

export interface LeadGroup {
  company_name: string;
  leads: Lead[];
}

export interface LeadList {
  id: string;
  list_name: string;
}

export interface Invoice {
  id: string;
  plan_name: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface BillingAddress {
  full_name: string;
  country: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
}


