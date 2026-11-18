# Database Design Document
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**DBMS:** PostgreSQL 15+ (Hosted on Supabase Cloud)  
**Version:** 1.0.0  
**Date:** November 2026  

---

## 1. Schema Overview & Relational Architecture

The database comprises 5 primary relational tables engineered to support campus lost-and-found operations, multi-claim dispute resolution, and audit trail compliance.

```
┌──────────────┐          1:N          ┌──────────────┐
│   profiles   ├───────────────────────►│    items     │
└──────┬───────┘                       └──────┬───────┘
       │                                      │
       │ 1:N                                  │ 1:N
       ▼                                      ▼
┌──────────────┐                       ┌──────────────┐
│notifications │                       │    claims    │
└──────────────┘                       └──────┬───────┘
                                              │
┌──────────────┐          1:N                 │
│  audit_logs  │◄─────────────────────────────┘
└──────────────┘
```

---

## 2. Data Dictionary

### 2.1 Table: `profiles`
Represents verified IIITA students and administrators. Primary key is linked 1:1 with `auth.users.id`.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, REFERENCES `auth.users(id)` ON DELETE CASCADE | Authenticated Supabase user ID |
| `email` | TEXT | NOT NULL, UNIQUE, CHECK `@iiita.ac.in` | Verified institutional email address |
| `full_name` | TEXT | NOT NULL | Student's full legal name |
| `roll_number` | TEXT | NOT NULL, UNIQUE | IIITA enrollment/roll number (e.g. `IIT2023001`) |
| `department` | TEXT | NOT NULL | Academic branch/department |
| `academic_batch`| TEXT | NOT NULL | Enrollment year (e.g. `2024`) |
| `phone` | TEXT | NULLABLE | Student contact phone (kept private) |
| `avatar_url` | TEXT | NULLABLE | Profile picture URL from Google |
| `role` | TEXT | NOT NULL, DEFAULT `'student'`, CHECK (`'student'`,`'admin'`) | Access control level |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Timestamp of registration |
| `updated_at` | TIMESTAMPTZ | DEFAULT `now()` | Timestamp of last profile edit |

### 2.2 Table: `items`
Represents found items and lost notices reported on the campus noticeboard.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Unique item identifier |
| `title` | TEXT | NOT NULL | Clear item title / name |
| `category` | TEXT | NOT NULL, CHECK (`electronics`,`documents`,`wallets`,`keys`,`books`,`clothing`,`bottles`,`other`) | Item category taxonomy |
| `description` | TEXT | NOT NULL | General description of item and circumstances |
| `report_type` | TEXT | NOT NULL, CHECK (`found`,`lost`) | Notice type |
| `location` | TEXT | NOT NULL | Campus location (e.g. CC3, Library) |
| `date_occurred`| DATE | NOT NULL | Date item was found or lost |
| `time_occurred`| TIME | NULLABLE | Approximate time |
| `photo_url` | TEXT | NULLABLE | URL to photograph in `item-photos` bucket |
| `distinguishing_details` | TEXT | NULLABLE | Specific visible or secret details |
| `status` | TEXT | NOT NULL, DEFAULT `'active'`, CHECK (`active`,`claimed`,`returned`,`archived`) | Listing lifecycle status |
| `reported_by` | UUID | NOT NULL, REFERENCES `profiles(id)` | Profile ID of the reporting student |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Post creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT `now()` | Timestamp of last modification |

### 2.3 Table: `claims`
Represents an ownership claim submitted by a student against a reported found item.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Unique claim identifier |
| `item_id` | UUID | NOT NULL, REFERENCES `items(id)` ON DELETE CASCADE | Associated item |
| `claimant_id` | UUID | NOT NULL, REFERENCES `profiles(id)` | Student claiming ownership |
| `claim_message`| TEXT | NOT NULL | Explanation of why item belongs to user |
| `proof_details`| TEXT | NULLABLE | Secret identifying marks (confidential) |
| `proof_photo_url`| TEXT | NULLABLE | Private URL to invoice or photo in `claim-evidence` |
| `location_lost`| TEXT | NULLABLE | Where claimant believes item was misplaced |
| `date_lost` | DATE | NULLABLE | Approximate date lost |
| `status` | TEXT | NOT NULL, DEFAULT `'pending_review'`, CHECK (`pending_review`,`approved`,`rejected`,`awaiting_handover`,`returned`) | Review and handover status |
| `reviewed_by` | UUID | NULLABLE, REFERENCES `profiles(id)` | Admin who reviewed the claim |
| `reviewed_at` | TIMESTAMPTZ | NULLABLE | Timestamp of administrative review |
| `review_note` | TEXT | NULLABLE | Internal admin review note |
| `admin_message`| TEXT | NULLABLE | Note visible to claimant |
| `handover_confirmed_at` | TIMESTAMPTZ | NULLABLE | Timestamp of physical collection |
| `handover_confirmed_by` | UUID | NULLABLE, REFERENCES `profiles(id)` | Admin who verified desk ID |
| `recipient_name` | TEXT | NULLABLE | Name of person receiving item |
| `recipient_roll_number` | TEXT | NULLABLE | Roll number of person receiving item |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT `now()` | Last status update |

**Table Constraint:** `UNIQUE(item_id, claimant_id)` — Prevents duplicate active claims by one student for one item.

### 2.4 Table: `notifications`
Represents real-time in-app alerts sent to students.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Notification ID |
| `user_id` | UUID | NOT NULL, REFERENCES `profiles(id)` ON DELETE CASCADE | Target recipient |
| `title` | TEXT | NOT NULL | Short alert title |
| `message` | TEXT | NOT NULL | Notification body |
| `type` | TEXT | NOT NULL, CHECK (`claim_approved`,`claim_rejected`,`admin_message`,`item_returned`,`new_claim`,`general`) | Event classification |
| `related_item_id` | UUID | NULLABLE, REFERENCES `items(id)` | Link to item |
| `related_claim_id`| UUID | NULLABLE, REFERENCES `claims(id)` | Link to claim |
| `is_read` | BOOLEAN | DEFAULT `false` | Read status |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Dispatch timestamp |

### 2.5 Table: `audit_logs`
Immutable administrative event ledger.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Audit record ID |
| `action` | TEXT | NOT NULL | Event name (e.g. `claim_approved`, `handover_confirmed`) |
| `entity_type` | TEXT | NOT NULL | Affected entity (`claim`, `item`, `profile`) |
| `entity_id` | TEXT | NOT NULL | UUID of affected entity |
| `performed_by`| UUID | NOT NULL, REFERENCES `profiles(id)` | Acting administrator ID |
| `details` | JSONB | NULLABLE | Structured metadata snapshot |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Immutable timestamp |

---

## 3. Database Indexes

To maintain sub-150ms query latencies under large item volumes, the following B-tree indexes are implemented:
```sql
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_report_type ON public.items(report_type);
CREATE INDEX idx_items_reported_by ON public.items(reported_by);
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);

CREATE INDEX idx_claims_item_id ON public.claims(item_id);
CREATE INDEX idx_claims_claimant_id ON public.claims(claimant_id);
CREATE INDEX idx_claims_status ON public.claims(status);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX idx_audit_logs_performed_by ON public.audit_logs(performed_by);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
```

---

## 4. Helper Functions & Triggers

### 4.1 Trigger: Auto-Update `updated_at`
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 4.2 Security Definer: `is_admin()`
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
```
