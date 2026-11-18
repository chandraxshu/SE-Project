# Requirement Analysis Document
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad (IIIT Allahabad)  
**Document Version:** 1.0.0  
**Date:** November 2026  

---

## 1. Stakeholder Identification & Needs

| Stakeholder | Role / Description | Primary Needs & Pain Points |
|---|---|---|
| **Student Finder** | Enrolled student who discovers an item on campus | Needs an effortless way to report an item without exposing personal phone numbers or having to hold physical custody indefinitely. |
| **Student Loser / Claimant** | Student searching for a lost item | Needs a searchable repository, instant notifications of matching reports, and a confidential way to prove ownership. |
| **Security & Administrative Desk** | Campus security guards, hostel caretakers, Student Welfare Office | Needs an organized ledger replacing paper registers, verification safeguards against false claims, and audit tracking. |
| **System Administrator / Maintainer** | Technical staff or student development leads | Requires a zero-maintenance, serverless architecture operating strictly within free cloud quotas with resilient security policies. |

---

## 2. Business Rules (BR)

- **BR-01 (Institutional Domain Isolation)**: Only Google accounts ending in `@iiita.ac.in` can authenticate. Personal Gmail accounts and third-party domains are rejected immediately.
- **BR-02 (Single Active Claim Per User-Item Pair)**: A student cannot file multiple simultaneous claims on the same item (`UNIQUE(item_id, claimant_id)`).
- **BR-03 (Reporter Exclusion)**: A student who reported a found item cannot submit an ownership claim on that item.
- **BR-04 (Evidence Confidentiality)**: Identifying proof details (serial numbers, distinguishing markings, proof photos) are strictly confidential and only visible to administrators.
- **BR-05 (Two-Stage Transfer Protocol)**: A claim approval does NOT automatically mark an item as returned. The item first enters `awaiting_handover` and only transitions to `returned` when an administrator verifies physical ID card credentials at the desk.
- **BR-06 (Single Winner Invariant)**: Approving one claim on an item automatically transitions any other pending claims on that item to `rejected`.
- **BR-07 (Role Immutability)**: Regular students cannot elevate their own role to `admin`. The default role is immutable through client APIs.

---

## 3. Functional Dependencies
- User Onboarding depends on successful Google OAuth authentication with an `@iiita.ac.in` domain.
- Claim submission depends on the existence of an `active` found item.
- Claim approval requires an authenticated user possessing the `admin` role.
- Handover confirmation depends on an approved claim in the `awaiting_handover` state.
- In-app notification creation triggers automatically upon claim state transitions.

---

## 4. System Constraints
- **Hosting Quotas**: Maximum 500MB PostgreSQL database and 1GB storage on the Supabase Free Plan.
- **Upload Restrictions**: Maximum 5MB per photograph with MIME type restricted to JPEG, PNG, or WebP.
- **Cost Requirement**: Zero recurring fees or paid third-party dependencies (no paid Twilio SMS, no paid SendGrid, no paid domain registration).

---

## 5. Potential Risks & Mitigations
| Risk ID | Risk Description | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|---|
| **R-01** | Student uses personal Gmail to access portal | High | High | Server-side domain verification in GoTrue and PostgreSQL CHECK constraints reject non-`@iiita.ac.in` emails. |
| **R-02** | Fraudulent claimant claims an expensive laptop | Medium | Critical | Private evidence review + desk verification of physical ID card + audit ledger logging recipient roll number. |
| **R-03** | Cloud storage quota exhaustion from huge image uploads | Medium | Medium | Frontend and storage policy limits image size to 5MB and enforces file type filtering. |
| **R-04** | Malicious client attempts direct Supabase API manipulation | Low | Critical | PostgreSQL Row Level Security (RLS) policies enforce ownership and admin roles directly at the database engine. |
