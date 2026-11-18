// Core application types

export type UserRole = 'student' | 'admin';

export type ItemCategory =
  | 'electronics'
  | 'documents'
  | 'wallets'
  | 'keys'
  | 'books'
  | 'clothing'
  | 'bottles'
  | 'other';

export type ReportType = 'found' | 'lost';

export type ItemStatus = 'active' | 'claimed' | 'returned' | 'archived';

export type ClaimStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'awaiting_handover'
  | 'returned';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  roll_number: string;
  department: string;
  academic_batch: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  report_type: ReportType;
  location: string;
  date_occurred: string;
  time_occurred: string | null;
  photo_url: string | null;
  distinguishing_details: string | null;
  status: ItemStatus;
  reported_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  reporter?: Pick<Profile, 'full_name' | 'email' | 'roll_number' | 'department'>;
  claims_count?: number;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  claim_message: string;
  proof_details: string | null;
  proof_photo_url: string | null;
  location_lost: string | null;
  date_lost: string | null;
  status: ClaimStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  admin_message: string | null;
  handover_confirmed_at: string | null;
  handover_confirmed_by: string | null;
  recipient_name: string | null;
  recipient_roll_number: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  item?: Pick<Item, 'id' | 'title' | 'category' | 'photo_url' | 'status' | 'location'>;
  claimant?: Pick<Profile, 'full_name' | 'email' | 'roll_number' | 'department'>;
  reviewer?: Pick<Profile, 'full_name'>;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'claim_approved' | 'claim_rejected' | 'admin_message' | 'item_returned' | 'new_claim' | 'general';
  related_item_id: string | null;
  related_claim_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  performed_by: string;
  details: Record<string, unknown> | null;
  created_at: string;
  // Joined
  performer?: Pick<Profile, 'full_name' | 'email'>;
}

// Form types
export interface ReportFoundItemForm {
  title: string;
  category: ItemCategory;
  description: string;
  location: string;
  date_occurred: string;
  time_occurred: string;
  distinguishing_details: string;
  photo: File | null;
}

export interface ReportLostItemForm {
  title: string;
  category: ItemCategory;
  description: string;
  location: string;
  date_occurred: string;
  time_occurred: string;
  distinguishing_details: string;
  photo: File | null;
}

export interface ClaimItemForm {
  claim_message: string;
  proof_details: string;
  location_lost: string;
  date_lost: string;
  proof_photo: File | null;
}

export interface OnboardingForm {
  full_name: string;
  roll_number: string;
  department: string;
  academic_batch: string;
  phone: string;
}

// Constants
export const ITEM_CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'documents', label: 'Documents & ID Cards' },
  { value: 'wallets', label: 'Wallets & Money' },
  { value: 'keys', label: 'Keys' },
  { value: 'books', label: 'Books & Stationery' },
  { value: 'clothing', label: 'Clothing & Accessories' },
  { value: 'bottles', label: 'Water Bottles' },
  { value: 'other', label: 'Other' },
];

export const CAMPUS_LOCATIONS = [
  'CC1 (Computer Centre 1)',
  'CC2 (Computer Centre 2)',
  'CC3 (Computer Centre 3)',
  'Library',
  'Lecture Hall Complex',
  'Admin Block',
  'Boys Hostel 1',
  'Boys Hostel 2',
  'Boys Hostel 3',
  'Boys Hostel 4',
  'Girls Hostel 1',
  'Girls Hostel 2',
  'Cafeteria / Mess',
  'Sports Complex',
  'Gymnasium',
  'Workshop',
  'Seminar Hall',
  'Playground',
  'Parking Area',
  'Main Gate',
  'Back Gate',
  'Other',
];

export const DEPARTMENTS = [
  'Information Technology',
  'Electronics & Communication Engineering',
  'Applied Sciences',
  'Management Studies',
  'Design',
  'Biotechnology (if applicable)',
  'Other',
];

export const ACADEMIC_BATCHES = (() => {
  const currentYear = new Date().getFullYear();
  const batches: string[] = [];
  for (let y = currentYear + 1; y >= currentYear - 5; y--) {
    batches.push(`${y}`);
  }
  return batches;
})();

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  awaiting_handover: 'Awaiting Handover',
  returned: 'Successfully Returned',
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  active: 'Available',
  claimed: 'Claimed',
  returned: 'Returned',
  archived: 'Archived',
};

export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  electronics: 'Smartphone',
  documents: 'FileText',
  wallets: 'Wallet',
  keys: 'Key',
  books: 'BookOpen',
  clothing: 'Shirt',
  bottles: 'GlassWater',
  other: 'Package',
};
