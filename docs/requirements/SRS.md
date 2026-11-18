# Software Requirements Specification (SRS)
## Khoj — IIITA Lost & Found Platform
**Document Version:** 1.0.0  
**Target Institution:** Indian Institute of Information Technology Allahabad (IIIT Allahabad)  
**Standard:** IEEE Std 830-1998 Compliant  
**Date:** November 2026  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the definitive functional and non-functional requirements for **Khoj — IIITA Lost & Found**, a centralized, cloud-hosted campus web application engineered specifically for the Indian Institute of Information Technology Allahabad (IIIT Allahabad). Khoj streamlines the reporting, searching, claiming, verifying, and physical returning of items lost or found within the Jhalwa campus premises.

### 1.2 Scope
Khoj encompasses:
- Institutional authentication restricted strictly to `@iiita.ac.in` domain accounts.
- One-time student profile onboarding and persistent session state.
- Separation of public item notice listings and private claim ownership evidence.
- Dual-mode reporting for found items and lost notices.
- Multi-parameter search, category filtering, and location filtering.
- Two-stage verification workflow (administrator review followed by verified physical handover).
- In-app notification system tracking claims and returns.
- Protected Administrative Desk Portal with audit logging.
- Free-tier deployment on Supabase (PostgreSQL, Auth, Storage) and Cloudflare Pages.

### 1.3 Intended Audience
- **Software Engineering Faculty & Evaluators**: For assessing requirements analysis, architectural integrity, and SDLC compliance.
- **System Developers & Maintainers**: For technical implementation, test verification, and maintenance.
- **IIIT Allahabad Administration & Security Staff**: For operational management and lost property return protocols.
- **IIITA Student Community**: End-users reporting and reclaiming lost personal property.

### 1.4 Definitions, Acronyms, and Abbreviations
- **IIITA**: Indian Institute of Information Technology Allahabad.
- **Khoj**: The project title ("Khoj" means search/discovery in Hindi).
- **RLS**: Row Level Security (PostgreSQL authorization mechanism).
- **OAuth 2.0**: Open Authorization protocol used via Google Identity.
- **SRS**: Software Requirements Specification.
- **RTM**: Requirements Traceability Matrix.
- **UUID**: Universally Unique Identifier.
- **Handover**: The physical transfer of a claimed item from the campus lost property desk to the verified owner.

### 1.5 References
- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications.
- PostgreSQL 15+ Documentation (Row Level Security & Functions).
- Supabase Documentation (Auth, Database, Storage APIs).
- RFC 6749: The OAuth 2.0 Authorization Framework.

---

## 2. Overall Description

### 2.1 Product Perspective
Khoj is a self-contained, cloud-native web system replacing informal campus WhatsApp groups, Telegram channels, and paper noticeboards. It interfaces with Google OAuth for identity assertion and Supabase for cloud persistence, structured queries, and secure object storage.

### 2.2 Product Functions
1. **Student Access**: Google Sign-In with institutional domain constraint (`@iiita.ac.in`).
2. **Student Profile Registry**: One-time onboarding capturing name, roll number, department, academic batch, and private phone number.
3. **Item Reporting**: Posting found items (with photos) and lost notices (with optional photos).
4. **Public Item Browsing**: Searching and filtering listings without exposing private student contact info.
5. **Ownership Claiming**: Submitting confidential proof of ownership (distinguishing marks, serial numbers, receipts).
6. **Student Dashboard**: Tracking submitted reports, claim statuses, admin feedback, and handovers.
7. **Administrative Desk**: Reviewing claims, approving/rejecting claims, resolving disputes, and recording physical handovers.
8. **Audit Trail**: Immutable logging of all administrative review and return actions.

### 2.3 User Classes and Characteristics
| User Class | Description | Technical Privilege |
|---|---|---|
| **Guest / Anonymous** | Any campus visitor accessing the portal | Read public item notices; cannot report or claim |
| **IIITA Student** | Enrolled student authenticated via `@iiita.ac.in` | Report items, view notices, file claims, manage profile |
| **Campus Administrator** | Designated security / student welfare officer | Full review permissions, claim approval/rejection, handover confirmation, audit inspection |

### 2.4 Operating Environment
- **Client Tier**: Modern web browsers (Chrome, Firefox, Safari, Edge) on desktop, tablet, and mobile devices.
- **Frontend CDN**: Cloudflare Pages edge delivery.
- **Backend Tier**: Supabase cloud managed PostgreSQL, GoTrue auth daemon, PostgREST API engine.

### 2.5 Design Constraints
- **Zero Cost / Free Tier**: All infrastructure must execute within free-tier quotas of Cloudflare Pages and Supabase.
- **Strict Institutional Isolation**: No external email domains permitted.
- **Database-Level Enforcement**: Authorization must be enforced at the PostgreSQL RLS layer, not merely frontend UI conditional renders.

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- **FR-01 (Institutional OAuth)**: The system shall permit authentication solely through Google OAuth restricted to emails ending in `@iiita.ac.in`.
- **FR-02 (Domain Rejection)**: The system shall automatically reject any non-IIITA email (including personal `@gmail.com` accounts), terminate the session, and display an explicit error message.
- **FR-03 (One-Time Student Onboarding)**: Upon first authenticated login with no existing profile, the system shall require the user to complete an onboarding form (Full Name, Roll Number, Department, Batch, Phone).
- **FR-04 (Profile Idempotence)**: On subsequent logins, returning users shall be directed straight to their dashboard without re-displaying the registration form.
- **FR-05 (Session Persistence)**: Authentication state shall persist across browser restarts, page refreshes, and device wake-ups using Supabase session refresh tokens.
- **FR-06 (Role Escalation Protection)**: Default user role shall strictly be `student`. The system shall prevent students from modifying their own `role` field via RLS policies.

### 3.2 Item Management
- **FR-07 (Report Found Item)**: Authenticated students shall be able to post found items specifying title, category, description, campus location, date found, optional time, and a photograph (JPEG/PNG/WebP under 5MB).
- **FR-08 (Report Lost Item)**: Authenticated students shall be able to register lost notices specifying title, category, description, last known location, date lost, optional time, and an optional reference photo.
- **FR-09 (Reporter Identification)**: Item reports shall automatically link to the authenticated student's profile UUID; spoofing reporter identity shall be prevented by RLS.
- **FR-10 (Noticeboard Filtering & Search)**: The system shall provide full-text search and faceted filtering by category, campus location, report type (`found` vs `lost`), and status (`active`, `claimed`, `returned`).
- **FR-11 (Privacy Boundary)**: Public item listings shall never expose a reporter's full roll number, personal phone number, or internal administrative notes.

### 3.3 Claims & Ownership Verification
- **FR-12 (Claim Submission)**: An authenticated student (other than the reporter) shall be able to submit an ownership claim specifying an explanation, confidential proof details (serial numbers, distinguishing marks), and optional proof photo evidence.
- **FR-13 (Duplicate Claim Prevention)**: The system shall enforce a unique constraint `UNIQUE(item_id, claimant_id)` preventing a user from submitting multiple active claims on the exact same item.
- **FR-14 (Private Evidence Security)**: Claim proof photographs and confidential details shall be stored in a private bucket (`claim-evidence`) accessible only to the claimant and administrators.
- **FR-15 (Initial Claim Status)**: All submitted claims shall default to the `pending_review` status. Automated approvals are strictly forbidden.

### 3.4 Administrative Desk Operations
- **FR-16 (Admin Overview Metrics)**: Administrators shall have a protected dashboard displaying real-time counts of found reports, lost notices, total claims, pending claims, awaiting handovers, returned items, and registered students.
- **FR-17 (Claim Review & Dispute Resolution)**: Administrators shall be able to inspect claimant identity, proof details, and evidence photos, with actions to Approve or Reject the claim.
- **FR-18 (Automatic Conflict Handling)**: Approving a claim shall automatically update that claim to `awaiting_handover`, update the item to `claimed`, and reject all other pending claims on the same item.
- **FR-19 (Rejection Feedback)**: When rejecting a claim, administrators shall provide an internal note and an optional explanatory message transmitted to the student.
- **FR-20 (Physical Handover Recording)**: Administrators shall record physical transfers by confirming the recipient's name and roll number against their physical IIITA ID card, setting both the claim and item to `returned`.
- **FR-21 (Audit Logging)**: All administrative approvals, rejections, and handover confirmations shall generate an immutable record in the `audit_logs` table.

### 3.5 Student Dashboard & Notifications
- **FR-22 (Dashboard Tracking)**: Students shall be able to track all found reports, lost notices, active claims, and their respective statuses in a tabbed personal dashboard.
- **FR-23 (Real-Time In-App Notifications)**: Students shall receive immediate in-app notifications when a claim is approved, rejected, receives an admin message, or is handed over.
- **FR-24 (Unread Badge Count)**: The system shall display real-time unread notification counts and permit marking items as read.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Security (NFR-01 - NFR-04)
- **NFR-01 (Domain Restriction)**: Institutional email verification must be enforced both on client OAuth initiation and by database constraints and RLS security functions.
- **NFR-02 (Row Level Security)**: All PostgreSQL tables (`profiles`, `items`, `claims`, `notifications`, `audit_logs`) must have RLS enabled with explicit SELECT, INSERT, UPDATE, and DELETE policies.
- **NFR-03 (Service Role Isolation)**: The Supabase `service_role` key must never be bundled into client-side code or exposed in `VITE_` variables. Only the public `anon` key is permitted in frontend bundles.
- **NFR-04 (File Upload Validation)**: Uploaded photos must strictly be validated for MIME type (`image/jpeg`, `image/png`, `image/webp`) and capped at 5MB.

### 4.2 Performance (NFR-05 - NFR-07)
- **NFR-05 (Page Load Time)**: Initial application bundle load time over a standard campus Wi-Fi connection (10 Mbps) shall not exceed 1.8 seconds.
- **NFR-06 (Database Query Latency)**: Filtered noticeboard queries with pagination shall execute in under 150ms through PostgreSQL indexing on `category`, `status`, `report_type`, and `created_at`.
- **NFR-07 (Image Optimization)**: Thumbnail previews shall be loaded lazily with asynchronous decoding.

### 4.3 Usability & Accessibility (NFR-08 - NFR-10)
- **NFR-08 (Visual Aesthetics)**: The design system must avoid generic SaaS tropes (no heavy glassmorphism, no purple-blue gradients, no excessive animations). It must reflect an organized university campus noticeboard with warm neutrals and orange accents.
- **NFR-09 (Responsive Layout)**: Full responsive design spanning mobile viewports (360px+), tablets (768px+), and desktops (1024px+).
- **NFR-10 (WCAG 2.1 AA Contrast)**: All text elements must satisfy a contrast ratio of at least 4.5:1 against their background.

### 4.4 Reliability & Maintainability (NFR-11 - NFR-13)
- **NFR-11 (Session Resilience)**: User sessions must withstand intermittent network dropouts and browser tab reloads.
- **NFR-12 (Data Integrity)**: Foreign keys with `ON DELETE CASCADE` or `RESTRICT` and strict PostgreSQL CHECK constraints must prevent orphaned records or invalid statuses.
- **NFR-13 (TypeScript Strict Mode)**: Codebase must compile with zero errors under `strict: true` and `noUncheckedIndexedAccess: true`.

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Noticeboard Home (`/`)
- Public Browse & Search (`/browse`)
- Item Detail (`/items/:id`)
- Found Reporting Form (`/report/found`)
- Lost Registration Form (`/report/lost`)
- Claim Ownership Form (`/items/:id/claim`)
- Student Dashboard (`/dashboard`)
- Admin Operations Portal (`/admin/*`)

### 5.2 Software Interfaces
- **Supabase JS Client (`@supabase/supabase-js v2.49+`)**: Data layer and storage driver.
- **Google OAuth 2.0 Identity Endpoint**: Authentication provider with `hd=iiita.ac.in`.
- **Cloudflare Pages CDN**: Production static asset hosting and client-side routing fallback.

---

## 6. System Constraints and Limitations
1. **Free-Tier Limits**: Storage is bound to Supabase free plan limits (1GB total storage, 500MB database). File uploads are constrained to 5MB per image.
2. **Offline Mode**: As a live campus registry, network connectivity is required for real-time claim verification and item reporting.

---

## 7. Acceptance Criteria
1. Non-`@iiita.ac.in` logins fail with a domain error notification.
2. An approved claim locks the item from other claims and transitions to `awaiting_handover`.
3. An administrative physical handover logs the recipient's roll number and admin ID in the immutable audit table.
4. Production build runs with zero TypeScript or bundler errors.
