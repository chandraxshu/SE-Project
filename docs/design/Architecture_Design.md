# Software Architecture and Design Document
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Version:** 1.0.0  
**Date:** November 2026  

---

## 1. Architectural Overview & Style

Khoj employs a modern **Jamstack / Serverless Tiered Architecture**:
1. **Presentation & Application Client Tier**: A Single Page Application (SPA) built using React 19, TypeScript, and Tailwind CSS, distributed globally via Cloudflare Pages edge network.
2. **Identity & Authentication Tier**: GoTrue (Supabase Auth) federated with Google Identity Services OAuth 2.0 with strict institutional domain filtering (`hd=iiita.ac.in`).
3. **Data & Business Rules Tier**: Supabase managed PostgreSQL with Row Level Security (RLS) policies, database triggers, security definer functions, and PostgREST API generation.
4. **Binary Asset & Storage Tier**: Supabase Object Storage partitioned into public (`item-photos`) and encrypted private (`claim-evidence`) S3-compatible buckets.

---

## 2. Technology Stack Justification

| Layer | Selected Tech | Trade-offs & Selection Justification |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | High type-safety, robust component ecosystem, zero-cost static compilation, predictable state lifecycle. |
| **Bundler & Tooling** | Vite 6 | Sub-second HMR, optimized tree-shaking, fast production build times. |
| **Styling System** | Tailwind CSS 3.4 | Utility-first styling providing consistent spacing, responsive breakpoints, and strict adherence to the university noticeboard theme without CSS bloat. |
| **Icons** | Lucide React | Lightweight, tree-shakable SVG icon set with consistent visual stroke weights. |
| **Routing** | React Router v7 | Client-side routing with nested layout hierarchies and protected route guards. |
| **Backend & Database** | Supabase (PostgreSQL 15+) | **Why selected over Firebase/MERN**: PostgreSQL provides real relational integrity (foreign keys, CHECK constraints, table joins) which NoSQL (Firestore) lacks. Crucially, Supabase offers Row Level Security (RLS) which executes authorization rules directly in the database engine, preventing data tampering even if malicious requests bypass the client frontend. Free plan provides 500MB DB, GoTrue auth, and real-time WebSockets with zero hosting maintenance. |
| **Deployment Platform** | Cloudflare Pages | Unlimited bandwidth on free tier, global edge CDN distribution with sub-50ms TTFB in India, automated Git deployments, and full HTTPS support without requiring paid SSL certificates or custom domains. |

---

## 3. Frontend Architecture

### 3.1 Modular Organization
```
src/
├── components/
│   ├── layout/         # Navbar, Footer, Layout, AdminLayout
│   ├── ui/             # Reusable primitives (Buttons, Modals, Spinners, Badges, Pagination)
│   ├── items/          # ItemCard, grids, filters
│   └── notifications/  # NotificationDropdown with live bell badge
├── contexts/           # AuthContext, NotificationContext
├── hooks/              # useItems, useClaims, useAdmin
├── lib/                # supabase client initialization & domain helpers
├── pages/              # Home, Login, Onboarding, Browse, Detail, Reports, Dashboard, 404
│   └── admin/          # AdminDashboard, Found, Lost, Claims, Handovers, Users, AuditLog
├── services/           # Storage service (MIME validation, uploads, signed URLs)
└── types/              # Comprehensive TypeScript interfaces & domain enums
```

### 3.2 State Management Strategy
- **Authentication & User Profile**: Centralized in `AuthContext` via React Context + `useCallback`. Automatically refreshes via Supabase session listener.
- **In-App Notifications**: Centralized in `NotificationContext` subscribing to PostgreSQL change streams via Supabase Realtime channels.
- **Entity Data (Items, Claims, Users, Logs)**: Encapsulated inside dedicated custom React hooks (`useItems`, `useClaims`, `useAdmin`) providing loading, error, and pagination states.

---

## 4. Backend & Security Architecture

### 4.1 Authentication Workflow & Institutional Guard
```
[User Browser]
      │
      ▼
1. Initiate Google OAuth (hd=iiita.ac.in)
      │
      ▼
[Google Accounts] ──(Validates Credentials)──► [OAuth Callback]
                                                     │
                                                     ▼
2. Client checks email.endsWith('@iiita.ac.in')
   ├── If FALSE ──► Force signOut() & Display Rejection Error
   └── If TRUE  ──► Query DB: SELECT * FROM profiles WHERE id = auth.uid()
                          ├── Found ──► Complete Auth, Load Dashboard
                          └── Not Found ──► Set needsOnboarding = true (Route to /onboarding)
```

### 4.2 Row Level Security (RLS) Policy Matrix
All 5 tables have Row Level Security enabled. Authorization rules are enforced at the database layer:

1. **`profiles` Table**:
   - `SELECT`: A user can read their own profile (`id = auth.uid()`) OR any administrator can read all profiles (`is_admin() = true`).
   - `INSERT`: A user can insert their own profile (`id = auth.uid()`).
   - `UPDATE`: A user can update their profile; non-admins are blocked from modifying the `role` column.

2. **`items` Table**:
   - `SELECT`: Authenticated users can view all non-archived items (`status != 'archived'`).
   - `INSERT`: Authenticated users can insert items where `reported_by = auth.uid()`.
   - `UPDATE`: Reporters can edit their active items; admins can update any item.

3. **`claims` Table**:
   - `SELECT`: Claimants can read their own claims (`claimant_id = auth.uid()`); item reporters can see claims on their items; admins can read all claims.
   - `INSERT`: Claimants can insert claims where `claimant_id = auth.uid()` (prevented if reporter = auth.uid()).
   - `UPDATE`: Only administrators (`is_admin() = true`) can approve, reject, or confirm handovers. Students cannot alter claim statuses.

4. **`notifications` Table**:
   - `SELECT`: Users can only read notifications where `user_id = auth.uid()`.
   - `UPDATE`: Users can update `is_read = true` for their own notifications.

5. **`audit_logs` Table**:
   - `SELECT`: Only administrators can view audit logs.
   - `INSERT`: Only administrators or system triggers can append audit logs.
   - `UPDATE` & `DELETE`: **FORBIDDEN** for all users. The audit trail is permanently append-only.

---

## 5. Storage Architecture
- **`item-photos` (Public)**:
  - Stores pictures of found/lost items.
  - Publicly readable via CDN URLs.
  - Write access restricted to authenticated users. Max 5MB, JPEG/PNG/WebP.
- **`claim-evidence` (Private)**:
  - Stores proof photographs, receipts, purchase invoices.
  - Private S3 bucket with zero public read access.
  - Read access granted exclusively to the specific claimant and administrators via time-limited signed URLs (`supabase.storage.createSignedUrl`).

---

## 6. Error-Handling Strategy
- **Client Side**: Form validations run before submission with descriptive inline messages. Network failures trigger localized error banners and `react-hot-toast` toasts.
- **API Failures**: Supabase PostgREST error codes (e.g. `23505` unique violation, `42501` insufficient privilege) are translated into clear English notifications.
- **Fallback Client**: If Supabase environment variables are missing during initial setup or tests, the client falls back to a placeholder configuration with a diagnostic console warning rather than crashing the bundle.
