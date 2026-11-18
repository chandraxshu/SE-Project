# Software Testing Plan
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Version:** 1.0.0  
**Date:** November 2026  

---

## 1. Testing Objectives
The primary objective of the testing program is to verify that Khoj meets all specified functional and non-functional requirements with strict fidelity to:
1. **Institutional Domain Enforcement**: Complete rejection of non-`@iiita.ac.in` domains.
2. **Access Control & RLS Verification**: Complete insulation of private evidence and admin operations.
3. **State Machine Invariants**: Correct transitions from `pending_review` to `awaiting_handover` to `returned`.
4. **UI/UX Consistency**: High responsiveness, accessible contrast, and absence of generic SaaS clichés.

---

## 2. Testing Scope
- **In Scope**:
  - Authentication workflows with Google OAuth & `@iiita.ac.in` verification.
  - One-time student profile onboarding and profile idempotence.
  - Reporting found and lost items with file upload validation.
  - Noticeboard search, filtering, and pagination.
  - Claim submission, duplicate claim prevention, and evidence handling.
  - Administrative review (approve, reject, dispute resolution).
  - Physical handover confirmation with roll number verification.
  - Immutable audit logging.
  - Automated unit testing via Vitest.
  - Production TypeScript compilation and bundler verification.
- **Out of Scope**:
  - Load testing beyond 10,000 concurrent users (far exceeding campus population).
  - Paid third-party SMS/voice gateway testing (explicitly prohibited by free-tier constraint).

---

## 3. Testing Strategy & Levels

```
               ┌──────────────────────┐
               │  Acceptance Testing  │  (End-to-End campus scenarios)
            ┌──┴──────────────────────┴──┐
            │       System Testing       │  (Full SPA + Supabase Cloud)
         ┌──┴────────────────────────────┴──┐
         │       Integration Testing        │  (Auth, DB RLS, Storage APIs)
      ┌──┴──────────────────────────────────┴──┐
      │             Unit Testing               │  (Vitest: business rules & logic)
      └────────────────────────────────────────┘
```

### 3.1 Unit Testing
- Executed via **Vitest**.
- Targets pure business logic: domain checking (`isAllowedEmail`), status transition logic, file type and size constraints.

### 3.2 Security & Authorization Testing
- Verifies that direct PostgREST API requests cannot bypass RLS.
- Verifies that regular students cannot modify the `role` column in `profiles`.
- Verifies that private claim evidence cannot be downloaded from `claim-evidence` without an admin or owner token.

### 3.3 Usability & Responsive Testing
- Mobile viewports (iPhone, Pixel at 375px - 414px).
- Tablet viewports (iPad at 768px - 820px).
- Desktop viewports (1280px - 1920px).
- Contrast checks complying with WCAG 2.1 AA (4.5:1 ratio).
