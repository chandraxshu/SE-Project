# Work Breakdown Structure (WBS)
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Date:** November 2026  

---

```
1.0 Project Management & Initiation
    1.1 Project Charter & Scope Definition
    1.2 Work Breakdown Structure (WBS) Creation
    1.3 Risk Identification & Register Setup
    1.4 Milestone Schedule & Gantt Baseline

2.0 Requirements Engineering
    2.1 Stakeholder Needs Identification
    2.2 Functional Requirements Specification (FR-01 to FR-24)
    2.3 Non-Functional Requirements Specification (NFR-01 to NFR-13)
    2.4 Detailed Use Case Specifications (UC-01 to UC-12)
    2.5 Requirements Traceability Matrix (RTM) Baseline

3.0 System Architecture & UML Modeling
    3.1 Architectural Style & Tech Stack Justification
    3.2 Relational Database Modeling & ER Diagram
    3.3 Structural UML Modeling
        3.3.1 Use Case Diagram (Use_Case_Diagram.puml)
        3.3.2 Class Diagram (Class_Diagram.puml)
        3.3.3 Component Diagram (Component_Diagram.puml)
        3.3.4 Deployment Diagram (Deployment_Diagram.puml)
    3.4 Behavioral UML Modeling
        3.4.1 Authentication Sequence (Authentication_Sequence.puml)
        3.4.2 Found Item Sequence (Found_Item_Sequence.puml)
        3.4.3 Lost Item Sequence (Lost_Item_Sequence.puml)
        3.4.4 Claim Sequence (Claim_Sequence.puml)
        3.4.5 Handover Sequence (Handover_Sequence.puml)
        3.4.6 Activity Diagrams (Activity_Diagrams.puml)
        3.4.7 State Machine Diagram (State_Diagram.puml)

4.0 Database & Cloud Backend Engineering
    4.1 Schema Definition SQL Migration (001_initial_schema.sql)
        4.1.1 Profiles Table & Domain Constraints
        4.1.2 Items Table & Categorization
        4.1.3 Claims Table & Unique Item-Claimant Constraints
        4.1.4 Notifications Table & Realtime Triggers
        4.1.5 Audit Logs Table (Append-Only Ledger)
    4.2 Security Definer Functions (is_admin, check_email_domain)
    4.3 Row Level Security (RLS) Policy Implementation (23 Policies)
    4.4 Supabase Storage Bucket Configuration (item-photos & claim-evidence)

5.0 Frontend Application Development
    5.1 Project Tooling Setup (Vite 6, TypeScript, Tailwind CSS, Lucide Icons)
    5.2 Reusable UI Design System (LoadingSpinner, EmptyState, Badges, Modals, ImageUpload)
    5.3 Centralized Contexts & State Providers
        5.3.1 AuthContext with @iiita.ac.in Validation & Onboarding Guard
        5.3.2 NotificationContext with Supabase Realtime Channels
    5.4 Custom Data Hooks (useItems, useClaims, useAdmin)
    5.5 Client-Facing Pages
        5.5.1 Noticeboard Landing Page (HomePage.tsx)
        5.5.2 Institutional Login Page (LoginPage.tsx)
        5.5.3 One-Time Student Onboarding (OnboardingPage.tsx)
        5.5.4 Faceted Item Browsing & Search (BrowseItemsPage.tsx)
        5.5.5 Public Item Detail View (ItemDetailPage.tsx)
        5.5.6 Report Found Item Form (ReportFoundPage.tsx)
        5.5.7 Register Lost Notice Form (ReportLostPage.tsx)
        5.5.8 Ownership Claim Submission Form (ClaimItemPage.tsx)
        5.5.9 Tabbed Student Dashboard (DashboardPage.tsx)
    5.6 Protected Administrative Desk Portal
        5.6.1 Admin Overview & Metrics (AdminDashboard.tsx)
        5.6.2 Found Items Manager (AdminFoundItems.tsx)
        5.6.3 Lost Notices Manager (AdminLostItems.tsx)
        5.6.4 Claims Dossier & Review Desk (AdminClaims.tsx)
        5.6.5 Physical Handover Desk (AdminHandovers.tsx)
        5.6.6 Student Directory (AdminUsers.tsx)
        5.6.7 Immutable Audit Ledger Viewer (AdminAuditLog.tsx)

6.0 Quality Assurance & Verification
    6.1 Automated Unit Testing Suite Setup (Vitest)
    6.2 Test Case Authoring (TC-01 through TC-40)
    6.3 Automated Test Execution & Status Reporting
    6.4 Responsive Layout & Accessibility Auditing
    6.5 TypeScript Strict Build Compilation

7.0 Deployment & Handover
    7.1 Cloudflare Pages Configuration & Routing Rules
    7.2 Complete Deployment & Setup Runbook (README.md)
    7.3 Software Maintenance Plan
    7.4 Project Completion Report & Changelog
```
