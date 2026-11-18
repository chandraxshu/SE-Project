# Requirements Traceability Matrix (RTM)
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Version:** 1.0.0  
**Date:** November 2026  

---

| Req ID | Requirement Description | Use Case | UML Model Reference | Implementation Module | Test Case ID | Status |
|---|---|---|---|---|---|---|
| **FR-01** | Google OAuth restricted to `@iiita.ac.in` | UC-01 | `Authentication_Sequence.puml` | `src/contexts/AuthContext.tsx`, `src/lib/supabase.ts` | TC-01, TC-02 | Tested (Passed) |
| **FR-02** | Reject personal Gmail and external domains | UC-01 | `Authentication_Sequence.puml` | `src/contexts/AuthContext.tsx`, `supabase/migrations/001_initial_schema.sql` | TC-03, TC-04 | Tested (Passed) |
| **FR-03** | One-time onboarding registration | UC-02 | `Authentication_Sequence.puml` | `src/pages/OnboardingPage.tsx`, `profiles` table | TC-05, TC-06 | Tested (Passed) |
| **FR-04** | Profile idempotence across logins | UC-01 | `Authentication_Sequence.puml` | `src/contexts/AuthContext.tsx` | TC-07 | Tested (Passed) |
| **FR-05** | Persistent session across page reloads | UC-01 | `Authentication_Sequence.puml` | `src/lib/supabase.ts`, Supabase Auth | TC-08 | Tested (Passed) |
| **FR-06** | Student role escalation prevention via RLS | UC-02 | `Class_Diagram.puml` | `001_initial_schema.sql` (profiles RLS update policy) | TC-09, TC-10 | Tested (Passed) |
| **FR-07** | Report found item with photo | UC-03 | `Found_Item_Sequence.puml` | `src/pages/ReportFoundPage.tsx`, `src/hooks/useItems.ts` | TC-11, TC-12 | Tested (Passed) |
| **FR-08** | Report lost item notice | UC-04 | `Lost_Item_Sequence.puml` | `src/pages/ReportLostPage.tsx`, `src/hooks/useItems.ts` | TC-13 | Tested (Passed) |
| **FR-09** | Automatic reporter UUID association | UC-03, UC-04 | `Found_Item_Sequence.puml` | `items` table RLS insert rule (`reported_by = auth.uid()`) | TC-14 | Tested (Passed) |
| **FR-10** | Multi-parameter search & filtering | UC-05 | `Use_Case_Diagram.puml` | `src/pages/BrowseItemsPage.tsx`, `src/hooks/useItems.ts` | TC-15, TC-16 | Tested (Passed) |
| **FR-11** | Privacy preservation (hide sensitive contact) | UC-05 | `Use_Case_Diagram.puml` | `src/pages/ItemDetailPage.tsx`, `001_initial_schema.sql` | TC-17 | Tested (Passed) |
| **FR-12** | Submit ownership claim with proof details | UC-06 | `Claim_Sequence.puml` | `src/pages/ClaimItemPage.tsx`, `src/hooks/useClaims.ts` | TC-18, TC-19 | Tested (Passed) |
| **FR-13** | Duplicate claim prevention | UC-06 | `State_Diagram.puml` | `claims` table constraint `UNIQUE(item_id, claimant_id)` | TC-20 | Tested (Passed) |
| **FR-14** | Confidential claim evidence storage | UC-06 | `Component_Diagram.puml` | `src/services/storage.ts` (`claim-evidence` private bucket) | TC-21 | Tested (Passed) |
| **FR-15** | Default `pending_review` status | UC-06 | `State_Diagram.puml` | `claims` table CHECK constraint | TC-22 | Tested (Passed) |
| **FR-16** | Admin overview metrics | UC-11 | `Component_Diagram.puml` | `src/pages/admin/AdminDashboard.tsx`, `src/hooks/useAdmin.ts` | TC-23 | Tested (Passed) |
| **FR-17** | Admin claim inspection & dossier review | UC-08 | `Claim_Sequence.puml` | `src/pages/admin/AdminClaims.tsx` | TC-24 | Tested (Passed) |
| **FR-18** | Single-winner approval & conflict resolution | UC-09 | `State_Diagram.puml` | `src/hooks/useAdmin.ts` (`approveClaim` transaction) | TC-25, TC-26 | Tested (Passed) |
| **FR-19** | Claim rejection with feedback | UC-09 | `Claim_Sequence.puml` | `src/pages/admin/AdminClaims.tsx`, `src/hooks/useAdmin.ts` | TC-27 | Tested (Passed) |
| **FR-20** | Physical handover verification at desk | UC-10 | `Handover_Sequence.puml` | `src/pages/admin/AdminHandovers.tsx`, `src/hooks/useAdmin.ts` | TC-28, TC-29 | Tested (Passed) |
| **FR-21** | Immutable administrative audit logging | UC-12 | `Activity_Diagrams.puml` | `audit_logs` table, `src/pages/admin/AdminAuditLog.tsx` | TC-30 | Tested (Passed) |
| **FR-22** | Student tabbed dashboard tracking | UC-07 | `Use_Case_Diagram.puml` | `src/pages/DashboardPage.tsx` | TC-31 | Tested (Passed) |
| **FR-23** | Real-time in-app notifications | UC-07 | `Component_Diagram.puml` | `src/contexts/NotificationContext.tsx`, Supabase Realtime | TC-32 | Tested (Passed) |
| **FR-24** | Unread count badge & mark-as-read | UC-07 | `Component_Diagram.puml` | `src/components/notifications/NotificationDropdown.tsx` | TC-33 | Tested (Passed) |
| **NFR-01** | Strict institutional domain check server-side | UC-01 | `Authentication_Sequence.puml` | `001_initial_schema.sql` (`check_email_domain()`) | TC-34 | Tested (Passed) |
| **NFR-02** | Row Level Security enabled on all tables | All | `Architecture_Design.md` | `001_initial_schema.sql` (23 granular RLS policies) | TC-35 | Tested (Passed) |
| **NFR-03** | Service-role key isolated from frontend | All | `Deployment_Diagram.puml` | `vite-env.d.ts`, `src/lib/supabase.ts` | TC-36 | Tested (Passed) |
| **NFR-04** | Image MIME type & 5MB file size validation | UC-03 | `Component_Diagram.puml` | `src/services/storage.ts`, `src/components/ui/ImageUpload.tsx`| TC-37 | Tested (Passed) |
| **NFR-05** | Production build with strict TypeScript | All | `Component_Diagram.puml` | `tsconfig.json`, `vite.config.ts` | TC-38 | Tested (Passed) |
| **NFR-08** | Non-SaaS campus noticeboard design system | All | `Architecture_Design.md` | `tailwind.config.js`, `src/index.css` | TC-39 | Tested (Passed) |
| **NFR-09** | Responsive across mobile, tablet, desktop | All | `Architecture_Design.md` | Responsive Tailwind utility layout | TC-40 | Tested (Passed) |
