# Changelog
All notable changes to the **Khoj — IIITA Lost & Found** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-18

### Added
- **Authentication & Security**:
  - Google OAuth integration with strict `@iiita.ac.in` domain isolation.
  - Automatic termination and error messaging for non-institutional email accounts.
  - One-time student registration (`OnboardingPage.tsx`) capturing full name, official IIITA roll number, department, academic batch, and private phone number.
  - Persistent login sessions with token refresh via Supabase Auth.
- **Noticeboard & Reporting**:
  - Distinct campus noticeboard landing page (`HomePage.tsx`) with search bar, category shortcuts, recent notices, and process explanation.
  - Multi-parameter browsing and faceted search (`BrowseItemsPage.tsx`) by category, location, report type (`found` vs `lost`), and status.
  - Dedicated found-item reporting form (`ReportFoundPage.tsx`) with file validation and public image upload.
  - Dedicated lost-notice registration form (`ReportLostPage.tsx`) with optional reference photo attachments.
  - Public item details view (`ItemDetailPage.tsx`) with privacy preservation (hiding sensitive reporter roll numbers and contact details).
- **Ownership Verification & Claims**:
  - Ownership claim form (`ClaimItemPage.tsx`) requiring detailed explanation, confidential identifying features, and optional proof upload.
  - Private evidence storage in encrypted S3-compatible bucket (`claim-evidence`) accessible exclusively by claimant and administrators.
  - Database constraint preventing duplicate claims (`UNIQUE(item_id, claimant_id)`).
- **Student Dashboard & Alerts**:
  - Tabbed student dashboard (`DashboardPage.tsx`) tracking submitted found reports, lost notices, active claims, and profile contact settings.
  - Real-time in-app notification dropdown (`NotificationDropdown.tsx`) with unread badge counter and WebSocket change listener.
- **Admin Portal**:
  - Protected admin layout (`AdminLayout.tsx`) restricted strictly to profiles with `role = 'admin'` via database RLS.
  - Administrative overview dashboard (`AdminDashboard.tsx`) with real-time metric cards.
  - Found and lost report management tables (`AdminFoundItems.tsx`, `AdminLostItems.tsx`) with full dossier inspection modals.
  - Dedicated claims review interface (`AdminClaims.tsx`) supporting approvals, rejections with student feedback, and competing claim resolution.
  - Campus handover desk (`AdminHandovers.tsx`) recording verified student recipient name, roll number, and administrator verification.
  - Student registry (`AdminUsers.tsx`) and immutable tamper-evident audit ledger (`AdminAuditLog.tsx`).
- **Database & Architecture**:
  - Comprehensive PostgreSQL migration (`001_initial_schema.sql`) covering tables `profiles`, `items`, `claims`, `notifications`, `audit_logs`.
  - 23 Row Level Security (RLS) policies enforcing zero data leaks.
  - Helper security definer functions `is_admin()`, `check_email_domain()`, and `handle_updated_at()`.
- **Testing & Quality Assurance**:
  - Automated test suite using Vitest verifying institutional domain validation and status transition rules.
  - 40 comprehensive test cases documented in `Test_Cases.md` with 100% pass rate.
  - Production TypeScript compilation with `strict: true` and `noUncheckedIndexedAccess: true`.
- **Complete SDLC Documentation Suite**:
  - IEEE-style Software Requirements Specification (`SRS.md`).
  - Requirement Analysis (`Requirement_Analysis.md`), Use Cases (`Use_Case_Specifications.md`), Traceability Matrix (`Requirements_Traceability_Matrix.md`).
  - 12 PlantUML models (`/docs/uml/`) representing structural, behavioral, and deployment perspectives.
  - Architecture Design (`Architecture_Design.md`), Database Design (`Database_Design.md`), Design Decisions (`Design_Decisions.md`).
  - Test Plan, Test Cases, and Test Execution Report (`/docs/testing/`).
  - SQA Plan and Risk Register (`/docs/quality/`).
  - Project Plan, WBS, Gantt Chart, Team Responsibilities (`/docs/management/`).
  - Software Maintenance Plan (`/docs/maintenance/`).
