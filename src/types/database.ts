export type TradeType = 'plumber' | 'hvac' | 'electrician' | 'general' | 'roofing' | 'painter' | 'landscaper' | 'other';
export type PlanType = 'starter' | 'pro' | 'team';
export type RateType = 'hourly' | 'per_square' | 'per_sqft' | 'per_linear_ft' | 'flat_rate';
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'deposit_paid' | 'cancelled';

export type PipelineStage =
  | 'lead'
  | 'follow_up'
  | 'quote_created'
  | 'quote_sent'
  | 'deposit_collected'
  | 'job_scheduled'
  | 'in_progress'
  | 'completed';

export interface JobPhoto {
  url: string;
  category: 'before' | 'during' | 'after';
  caption: string | null;
  created_at: string;
}

export interface JobNote {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface JobTask {
  id: string;
  text: string;
  done: boolean;
  created_at: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  trade_type: TradeType | null;
  logo_url: string | null;
  hourly_rate: number | null;
  rate_type: RateType;
  default_deposit_percent: number;
  default_tax_rate: number | null;
  stripe_account_id: string | null;
  profile_slug: string | null;
  profile_bio: string | null;
  profile_public: boolean;
  plan: PlanType;
  webhook_url: string | null;
  brand_color: string | null;
  auto_follow_up: boolean;
  follow_up_templates: string[];
  show_reviews_on_quotes: boolean;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  reviews_last_fetched_at: string | null;
  onboarded: boolean;
  created_at: string;
}

export interface Quote {
  id: string;
  contractor_id: string;
  client_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  job_address: string | null;
  status: QuoteStatus;
  photos: string[];
  ai_description: string | null;
  scope_of_work: string | null;
  line_items: LineItem[];
  inspection_findings: InspectionFinding[] | null;
  subtotal: number;
  tax_rate: number | null;
  discount_amount: number | null;
  discount_percent: number | null;
  total: number;
  deposit_amount: number;
  deposit_percent: number;
  notes: string | null;
  internal_notes: string | null;
  pdf_url: string | null;
  stripe_payment_intent_id: string | null;
  sent_at: string | null;
  approved_at: string | null;
  payment_method: string | null;
  payment_note: string | null;
  customer_signature: string | null;
  customer_signed_name: string | null;
  paid_at: string | null;
  expires_at: string | null;
  quote_number: number | null;
  reminder_sent_at: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_duration: string | null;
  archived: boolean;
  pipeline_stage: PipelineStage;
  job_photos: JobPhoto[];
  job_notes: JobNote[];
  job_tasks: JobTask[];
  completed_at: string | null;
  started_at: string | null;
  created_at: string;
}

export interface QuoteTemplate {
  id: string;
  contractor_id: string;
  name: string;
  line_items: LineItem[];
  notes: string | null;
  scope_of_work: string | null;
  created_at: string;
}

export type NotificationType = 'quote_viewed' | 'quote_approved' | 'quote_paid';

export interface Notification {
  id: string;
  user_id: string;
  quote_id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  contractor_id: string;
  quote_id: string | null;
  customer_name: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
}

export interface InspectionFinding {
  photo_index: number;
  finding: string;
  severity: 'critical' | 'moderate' | 'minor';
  urgency_message: string;
}

export type EventType =
  | 'estimate'
  | 'follow_up'
  | 'job_scheduled'
  | 'material_dropoff'
  | 'production'
  | 'walkthrough'
  | 'payment_collection'
  | 'blocked_time';

export interface CalendarEvent {
  id: string;
  contractor_id: string;
  quote_id: string | null;
  title: string;
  event_type: EventType;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  notes: string | null;
  color: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  // Joined from quotes table when fetching
  customer_name?: string;
  job_address?: string;
  customer_phone?: string;
  quote_number?: number;
  pipeline_stage?: string;
  total?: number;
}

export interface FollowUp {
  id: string;
  quote_id: string;
  contractor_id: string;
  follow_up_number: number;
  channel: 'sms' | 'email';
  message: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed';
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  total_revenue?: number;
  job_count?: number;
  last_job_date?: string;
}

export interface TeamMember {
  id: string;
  owner_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member';
  status: 'invited' | 'active';
  invited_at: string;
  joined_at: string | null;
}

export interface LeadSource {
  id: string;
  contractor_id: string;
  name: string;
  slug: string;
  api_key: string;
  is_active: boolean;
  lead_count: number;
  last_lead_at: string | null;
  field_mapping: Record<string, string>;
  created_at: string;
}

export interface AIQuoteResponse {
  job_summary: string;
  scope_of_work: string;
  line_items: LineItem[];
  estimated_duration: string;
  notes: string;
  inspection_findings: InspectionFinding[];
}
