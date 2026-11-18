# Use Case Specifications
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Version:** 1.0.0  
**Date:** November 2026  

---

### UC-01: Sign In Using Institutional Google Account
- **Primary Actor:** IIITA Student / Administrator
- **Preconditions:** User possesses an active `@iiita.ac.in` Google Workspace account.
- **Trigger:** User clicks "Sign In" or "Continue with IIITA Google Account".
- **Main Success Scenario:**
  1. System redirects user to Google OAuth consent screen with `hd=iiita.ac.in`.
  2. User authenticates with institutional credentials.
  3. System validates that the returned email address ends with `@iiita.ac.in`.
  4. System establishes an authenticated session in Supabase Auth.
  5. System checks for an existing record in the `profiles` table.
  6. Existing profile found: user is directed to the Student Dashboard or intended route.
- **Alternative Flow (First-Time User):**
  - At Step 5, if no profile exists, system sets `needsOnboarding = true` and routes user to `/onboarding`.
- **Exception Flow (Non-Institutional Domain):**
  - If authenticated email does NOT end in `@iiita.ac.in`, system immediately terminates the session via `supabase.auth.signOut()`, records an error, and displays an explicit rejection banner.
- **Postconditions:** User is authenticated with session tokens persisted in browser local storage.

---

### UC-02: Complete Student Registration (Onboarding)
- **Primary Actor:** New IIITA Student
- **Preconditions:** Successful UC-01; no pre-existing profile record.
- **Trigger:** Automatic redirect to `/onboarding`.
- **Main Success Scenario:**
  1. System displays pre-filled Google full name and email.
  2. Student enters IIITA Roll Number (e.g., `IIT2023001`), selects Department and Academic Batch, and provides optional phone number.
  3. Student submits the form.
  4. System validates inputs and upserts a new record into `profiles` with default role `student`.
  5. System navigates student to `/dashboard` with a welcome confirmation toast.
- **Exception Flow:** Invalid roll number format or missing required fields prevents submission with inline error prompts.
- **Postconditions:** Student profile is saved in PostgreSQL; user never sees onboarding again.

---

### UC-03: Report a Found Item
- **Primary Actor:** Authenticated Student Finder
- **Preconditions:** Authenticated session; profile completed.
- **Trigger:** User navigates to `/report/found`.
- **Main Success Scenario:**
  1. Student fills in item title, category, description, campus location, date found, and optional time.
  2. Student attaches an image of the item.
  3. System validates file format (JPEG/PNG/WebP) and file size (≤ 5MB).
  4. Student submits report.
  5. System uploads photograph to the public `item-photos` storage bucket.
  6. System inserts a row into `items` with `report_type = 'found'`, `status = 'active'`, and `reported_by = auth.uid()`.
  7. System displays success confirmation and redirects to `/items/:id`.
- **Postconditions:** Item appears on the public campus noticeboard.

---

### UC-04: Report a Lost Item
- **Primary Actor:** Authenticated Student Loser
- **Preconditions:** Authenticated session; profile completed.
- **Trigger:** User navigates to `/report/lost`.
- **Main Success Scenario:**
  1. Student fills in title, category, description, last known location, date lost, and optional distinguishing marks.
  2. Student attaches an optional reference photo or invoice.
  3. Student submits report.
  4. System inserts row into `items` with `report_type = 'lost'`, `status = 'active'`.
  5. System confirms registration and directs student to noticeboard.
- **Postconditions:** Lost notice is active in system search for matching found items.

---

### UC-05: Browse & Search Found Items
- **Primary Actor:** Any Student / Guest
- **Preconditions:** None.
- **Trigger:** User navigates to `/browse`.
- **Main Success Scenario:**
  1. User enters keywords, selects categories, locations, or status filters.
  2. System executes indexed query against `items` table.
  3. System displays paginated grid of item cards with thumbnail, location, and status badge.
  4. Sensitive reporter contact details remain hidden.
- **Postconditions:** Filtered listings rendered on screen.

---

### UC-06: Submit an Item Claim
- **Primary Actor:** Authenticated Student Claimant
- **Preconditions:** Item report is `found` and `status = 'active'`; user is NOT the original reporter; user has no existing active claim on this item.
- **Trigger:** User clicks "Claim This Item" on `/items/:id`.
- **Main Success Scenario:**
  1. System checks `UNIQUE(item_id, claimant_id)`.
  2. Student enters explanation, confidential identifying details (marks, passcodes, contents), and attaches optional proof photo.
  3. System uploads proof photo to private `claim-evidence` bucket.
  4. System inserts claim with `status = 'pending_review'`.
  5. System triggers notification to reporter that a claim has been lodged.
  6. System redirects claimant to dashboard claims tracker.
- **Postconditions:** Claim registered in `pending_review` status awaiting administrative inspection.

---

### UC-07: Track Claim Status in Dashboard
- **Primary Actor:** Authenticated Student Claimant
- **Preconditions:** User has submitted one or more claims.
- **Trigger:** User navigates to `/dashboard` -> "My Claims".
- **Main Success Scenario:**
  1. System retrieves claims for user ID joined with item details.
  2. System displays claim status badge (`Pending Review`, `Approved`, `Rejected`, `Awaiting Handover`, `Returned`).
  3. If administrator included a message or note, system renders the notification banner.
- **Postconditions:** Student remains informed of claim progress.

---

### UC-08: Review Claim as Administrator
- **Primary Actor:** Campus Administrator (`role = 'admin'`)
- **Preconditions:** Administrator authenticated and validated via `is_admin()`.
- **Trigger:** Admin opens `/admin/claims`.
- **Main Success Scenario:**
  1. Admin selects a claim in `pending_review` status.
  2. System opens dossier showing claimant roll number, name, explanation, and private proof photo.
  3. Admin compares proof details against the physical item in storage.
- **Postconditions:** Admin has verified ownership evidence.

---

### UC-09: Approve or Reject Claim
- **Primary Actor:** Campus Administrator
- **Preconditions:** UC-08 executed.
- **Trigger:** Admin clicks "Approve Claim" or "Reject Claim".
- **Main Success Scenario (Approval):**
  1. Admin enters optional internal note and confirms approval.
  2. System sets target claim status to `awaiting_handover`.
  3. System sets item status to `claimed`.
  4. System rejects all other pending claims on that item with explanation note.
  5. System dispatches `claim_approved` in-app notification to claimant.
  6. System logs administrative action into `audit_logs`.
- **Alternative Flow (Rejection):**
  1. Admin enters rejection reason and optional student-facing message.
  2. System sets claim status to `rejected`.
  3. System dispatches `claim_rejected` notification to claimant.
  4. System logs rejection event into `audit_logs`.
- **Postconditions:** Item status updated; audit trail recorded.

---

### UC-10: Confirm Physical Handover
- **Primary Actor:** Campus Administrator
- **Preconditions:** Claim status is `awaiting_handover`; student presents physical IIITA ID card at desk.
- **Trigger:** Admin clicks "Record Handover" on `/admin/handovers`.
- **Main Success Scenario:**
  1. Admin inspects physical ID card.
  2. Admin enters verified recipient name and roll number.
  3. Admin confirms physical release.
  4. System updates claim status to `returned` and sets `handover_confirmed_at = now()`, `handover_confirmed_by = admin_id`.
  5. System updates item status to `returned`.
  6. System writes handover verification event into `audit_logs`.
  7. System dispatches `item_returned` notification to claimant and finder.
- **Postconditions:** Physical item release finalized; dispute prevention recorded in immutable ledger.

---

### UC-11: Manage Item Reports
- **Primary Actor:** Campus Administrator
- **Preconditions:** Admin privileges verified.
- **Trigger:** Admin opens `/admin/found-items` or `/admin/lost-items`.
- **Main Success Scenario:**
  1. Admin filters, searches, and inspects full report metadata, including confidential reporter identity.
  2. Admin archives abandoned, inappropriate, or expired listings.
- **Postconditions:** Noticeboard maintained with active records.

---

### UC-12: View Administrative Activity History (Audit Log)
- **Primary Actor:** Campus Administrator
- **Preconditions:** Admin privileges verified.
- **Trigger:** Admin opens `/admin/audit-log`.
- **Main Success Scenario:**
  1. System queries `audit_logs` ordered by `created_at DESC`.
  2. Admin reviews tamper-evident chronological event log of every approval, rejection, and handover.
- **Postconditions:** Complete accountability of desk operations.
