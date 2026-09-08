export type UserRole = 'admin' | 'qa_qc' | 'purchase' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface Department {
  code: string;
  name: string;
  head: string;
  description: string;
  budgetCode: string;
}

export interface Vendor {
  id: string;
  name: string;
  department: string;
  defaultCategory: string;
  gstin: string;
  contactPerson: string;
  email: string;
  phone: string;
  paymentTerms: string;
}

export interface InvoiceRecord {
  id: string;
  sr_no: number;
  department: string;
  invoice_no: string;
  company_name: string;
  invoice_date: string; // DD-MM-YYYY
  gst_no: string;
  invoice_amount: number;
  purchase_category: string;
  entry_date: string; // DD-MM-YYYY HH:mm:ss
  entered_by: string;
  status: 'Approved' | 'Pending Review' | 'Draft';
  file_name?: string;
  image_url?: string;
  notes?: string;
  verification_flags?: {
    gstValid: boolean;
    duplicateDetected: boolean;
    vendorMatched: boolean;
  };
  raw_extracted_text?: string;
}

export interface ScanInvoiceResult {
  department: string;
  invoice_no: string;
  company_name: string;
  invoice_date: string;
  gst_no: string;
  amount: string | number;
  purchase_category: string;
  matched_vendor_id?: string;
  confidence_score?: number;
  duplicate_detected?: boolean;
  existing_invoice_id?: string;
  raw_text?: string;
  engine_used: 'gemini-vision' | 'local-ocr';
}

export interface SystemStats {
  totalInvoices: number;
  todayCount: number;
  totalExpenditure: number;
  departmentBreakdown: Record<string, { count: number; totalAmount: number }>;
  monthlyTrend: { month: string; count: number; amount: number }[];
  categoryBreakdown: Record<string, number>;
}
