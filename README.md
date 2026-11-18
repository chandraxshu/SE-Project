# Khoj — IIITA Lost & Found Platform
**Official Campus Lost Property Web Application for Indian Institute of Information Technology Allahabad (IIIT Allahabad)**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue.svg)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B%20RLS-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()
[![Free Tier Ready](https://img.shields.io/badge/Deployment-100%25%20Free%20Tier-orange.svg)]()

---

## 1. Project Overview

**Khoj** is a centralized, secure web platform built specifically for the IIIT Allahabad campus community. It replaces ad-hoc WhatsApp groups, Telegram channels, and paper registers with an organized digital noticeboard and verifiable administrative claim-and-return system.

### Key Highlights
- **Institutional Access Only**: Google OAuth restricted strictly to `@iiita.ac.in` email addresses. Personal Gmail accounts and third-party domains are rejected both client-side and at the PostgreSQL database layer.
- **One-Time Student Onboarding**: Collects legal student name, official IIITA Roll Number (e.g. `IIT2023001`), Department, Academic Batch, and private contact number.
- **Dual Noticeboard System**: Separate, searchable sections for items reported as *Found* on campus and items registered as *Lost*.
- **Confidential Ownership Claims**: Students claim items by submitting secret distinguishing details, passcodes, or proof photographs (invoices, receipts). Evidence is stored in a private, encrypted bucket visible only to administrators.
- **Physical Handover Verification**: A claim approval does not automatically resolve an item. The student must physically present their IIITA Identity Card at the campus desk. The administrator records the physical transfer, verifying the student's name and roll number in an immutable audit ledger.
- **Real-Time Notifications**: Instant in-app alerts when claims are approved, rejected, or resolved.
- **100% Free-Tier Architecture**: Zero-cost operation using Cloudflare Pages for frontend hosting and the Supabase Free Plan for PostgreSQL, Auth, and Storage.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 3.4, React Router v7, Lucide Icons, react-hot-toast, date-fns.
- **Backend & Database**: Supabase (PostgreSQL 15+, GoTrue Auth, PostgREST API).
- **Security & Authorization**: PostgreSQL Row Level Security (RLS) with 23 granular policies.
- **Object Storage**: Supabase Storage (`item-photos` public CDN bucket + `claim-evidence` encrypted private bucket).
- **Deployment**: Cloudflare Pages (Frontend) + Supabase Cloud (Backend).

---

## 3. Step-by-Step Deployment & Configuration Guide

Follow this guide to deploy your own instance of Khoj on free cloud tiers.

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**.
3. Choose an organization, enter Project Name: `khoj-iiita`, set a secure database password, and select region **ap-south-1 (Mumbai)** for optimal latency to IIITA Jhalwa campus.
4. Click **Create new project**.

### Step 2: Apply Database Migrations
1. In your Supabase dashboard, navigate to the **SQL Editor** from the left navigation bar.
2. Open the file `supabase/migrations/001_initial_schema.sql` from this repository.
3. Paste the entire SQL content into the SQL Editor and click **Run**.
4. This script will automatically create:
   - All 5 tables: `profiles`, `items`, `claims`, `notifications`, `audit_logs`.
   - Security Definer helper functions: `is_admin()`, `check_email_domain()`, `handle_updated_at()`.
   - All performance indexes on foreign keys, categories, and created_at timestamps.
   - All 23 Row Level Security (RLS) policies.

### Step 3: Configure Storage Buckets
In the Supabase dashboard, navigate to **Storage**:
1. Click **New Bucket**:
   - Name: `item-photos`
   - Public bucket: **Enabled** (Checked)
   - File size limit: `5MB`
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
   - Click **Save**.
2. Click **New Bucket** again:
   - Name: `claim-evidence`
   - Public bucket: **Disabled** (Private)
   - File size limit: `5MB`
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
   - Click **Save**.

### Step 4: Configure Google OAuth 2.0 Credentials
To restrict logins to IIITA students:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `IIITA Lost and Found`.
3. Go to **APIs & Services** > **OAuth consent screen**:
   - User Type: **Internal** (if IIITA Google Workspace allows) or **External**.
   - App Name: `Khoj — IIITA Lost & Found`.
   - Support email: Your institutional email.
   - Developer contact email: Your institutional email.
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Khoj Web Client`.
   - **Authorized redirect URIs**: Enter your Supabase Auth callback URL:
     `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
   - Click **Create** and copy your **Client ID** and **Client Secret**.

### Step 5: Enable Google Provider in Supabase
1. In Supabase, go to **Authentication** > **Providers** > **Google**.
2. Toggle **Enable Google provider**.
3. Paste your **Client ID** and **Client Secret**.
4. In **Redirect URLs** (under Authentication > URL Configuration), add:
   - `http://localhost:5173/` (for local development)
   - `https://<YOUR-APP-NAME>.pages.dev/` (for Cloudflare Pages production)
5. Click **Save**.

### Step 6: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the values from your Supabase project settings (**Settings** > **API**):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Note: Never expose the Supabase service-role secret in frontend variables!)*

### Step 7: Promoting the First Administrator
All new users default strictly to the `student` role. To promote an administrator:
1. Log in once through the application using your `@iiita.ac.in` Google account and complete the one-time onboarding.
2. In your Supabase dashboard, open the **SQL Editor** and execute:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your.institutional.email@iiita.ac.in';
```
3. Refresh your application. An **Admin Portal** link will now appear in your navigation bar and profile dropdown.

### Step 8: Deploy to Cloudflare Pages (Free Hosting)
1. Push this repository to GitHub.
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Under **Environment variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
6. Click **Save and Deploy**. Your application will be live at `https://<your-project>.pages.dev`.

---

## 4. Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Commands
```bash
# Install dependencies
npm install

# Run automated unit tests
npm test

# Run local development server
npm run dev

# Run TypeScript compilation & production build
npm run build
```

---

## 5. Software Engineering Deliverables

The complete academic Software Development Life Cycle (SDLC) documentation is maintained in the [`/docs`](/docs) directory:
- [Software Requirements Specification (SRS)](/docs/requirements/SRS.md) — IEEE Std 830-1998 compliant document.
- [Requirement Analysis](/docs/requirements/Requirement_Analysis.md) — Stakeholder needs, business rules, constraints.
- [Use Case Specifications](/docs/requirements/Use_Case_Specifications.md) — UC-01 through UC-12 detailed specifications.
- [Requirements Traceability Matrix (RTM)](/docs/requirements/Requirements_Traceability_Matrix.md) — Mapping requirements to models, code, and test cases.
- [PlantUML Models](/docs/uml/) — 12 diagrams covering Use Cases, Domain Classes, Sequence Flows, State Machines, Components, Deployment, and ER schemas.
- [Software Architecture & Design](/docs/design/Architecture_Design.md) — Architectural style, tech trade-offs, RLS matrix.
- [Database Design](/docs/design/Database_Design.md) — Full data dictionary, indexes, constraints, triggers.
- [Test Plan](/docs/testing/Test_Plan.md) & [Test Cases](/docs/testing/Test_Cases.md) — 40 comprehensive positive, negative, boundary, and security test cases.
- [Test Execution Report](/docs/testing/Test_Execution_Report.md) — 100% test pass summary and defect resolution history.
- [Software Quality Assurance Plan](/docs/quality/Software_Quality_Assurance_Plan.md) & [Risk Register](/docs/quality/Risk_Register.md).
- [Project Plan](/docs/management/Project_Plan.md), [WBS](/docs/management/Work_Breakdown_Structure.md), [Gantt Chart](/docs/management/Gantt_Chart.md), [Team Responsibilities](/docs/management/Team_Responsibilities.md).
- [Software Maintenance Plan](/docs/maintenance/Software_Maintenance_Plan.md) — Corrective, adaptive, perfective, and preventive strategies.

---

## 6. Security Invariants Verified

1. **Domain Boundary**: All logins require Google verification and institutional domain checking. External accounts are rejected at both client and database levels.
2. **Confidentiality**: Claim evidence photographs and unique distinguishing marks cannot be accessed by other students or even the original finder.
3. **Dispute Prevention**: When an administrator approves one claim, competing pending claims for that item are automatically rejected.
4. **Physical Accountability**: Handovers are strictly logged with the recipient's verified roll number and the authorizing administrator's ID.
5. **Audit Immutability**: PostgreSQL RLS policies block `UPDATE` and `DELETE` queries on the `audit_logs` table.

---

## 7. License
Distributed under the MIT License. Developed for Indian Institute of Information Technology Allahabad (IIITA).
