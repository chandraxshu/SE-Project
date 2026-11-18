# Key Architectural & Design Decisions (ADRs)
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Date:** November 2026  

---

### ADR-01: Selection of Supabase (PostgreSQL) Over Firebase / MongoDB
- **Context:** The application requires strict identity constraints, relational mapping between reporters, items, and multiple competing claimants, and server-side authorization.
- **Decision:** Use Supabase with PostgreSQL 15+ rather than Firebase Firestore or MongoDB.
- **Rationale:**
  1. Relational constraints: `claims` requires foreign key relationships with cascade rules and a compound unique constraint `UNIQUE(item_id, claimant_id)` which MongoDB cannot enforce natively.
  2. Row Level Security (RLS): PostgreSQL evaluates security policies directly at the query execution engine. Even if malicious actors query the Supabase endpoint directly with curl, database rules block unauthorized reads of confidential evidence.
  3. Cost: Supabase Free tier provides 500MB PostgreSQL, 1GB Storage, and 50,000 monthly active users at $0 cost.

---

### ADR-02: Two-Bucket Partitioning for Image Assets
- **Context:** The application stores two classes of images: public item photographs and private claim proof images (invoices, serial number photos).
- **Decision:** Partition storage into two distinct buckets:
  - `item-photos`: Public bucket with direct CDN access.
  - `claim-evidence`: Private bucket requiring time-limited signed URLs generated solely for authenticated administrators and the submitting claimant.
- **Trade-off:** Slightly higher complexity when rendering claimant evidence (requires generating signed URLs), but ensures absolute privacy of sensitive ownership documentation.

---

### ADR-03: Two-Stage Return Protocol (`Awaiting Handover` -> `Returned`)
- **Context:** In physical campus environments, approving a claim on a screen does not guarantee the claimant actually appeared to collect the item.
- **Decision:** Claims move from `pending_review` to `awaiting_handover` upon administrator approval. The item and claim only transition to `returned` when the administrator verifies the physical student ID card at the desk and enters the student's name and roll number.
- **Rationale:** Prevents false status claims where an item is marked returned in the system while still physically lying unclaimed at the security desk.

---

### ADR-04: Institutional Domain Isolation at Both Auth and DB Layers
- **Context:** Only `@iiita.ac.in` students and staff are allowed to participate.
- **Decision:** Implement domain validation in multiple defensive layers:
  1. Frontend OAuth parameter: Google OAuth `hd=iiita.ac.in` parameter guides Google account chooser.
  2. Frontend AuthContext check: If the returned Google email does not end in `@iiita.ac.in`, session is instantly killed via `supabase.auth.signOut()`.
  3. Database CHECK constraint: `CHECK (check_email_domain(email))` enforces that no profile with an external domain can ever be inserted into PostgreSQL.

---

### ADR-05: Non-SaaS University Noticeboard Aesthetic
- **Context:** Generic AI-generated applications often use inappropriate corporate SaaS aesthetics (purple gradients, glassmorphism, floating abstract shapes).
- **Decision:** Implement a design language inspired by a physical university noticeboard and campus lost-property desk. Use warm off-white surfaces (`surface-50` / `#fafaf9`), dark stone typography (`#1c1917`), a warm terracotta/orange accent (`#e9741e`), fine borders, and compact, readable tables.
