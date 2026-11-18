# Team Responsibility Allocation Matrix
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Course:** Software Engineering Project  
**Academic Cycle:** Autumn 2026  

---

## 1. Project Organizational Roles

The project responsibilities are mapped to standard Software Engineering roles. Editable member placeholders allow assignment to project team members:

| Role Title | Primary Responsibilities | Assigned Member Placeholder |
|---|---|---|
| **Project Lead & Architect** | Overall SDLC governance, technical architecture design, technology evaluation, milestone tracking. | `[Team Lead / Architect Name]` |
| **Requirements Engineer** | Stakeholder interviewing, IEEE-style SRS drafting, Use Case specifications, Requirements Traceability Matrix. | `[Requirements Engineer Name]` |
| **Database Designer & Backend Engineer** | PostgreSQL schema design, Supabase migration scripts, Row Level Security (RLS) policies, storage bucket policies. | `[Database / Backend Engineer Name]` |
| **Frontend Engineer & UI/UX Designer** | React component hierarchy, Tailwind styling, design system implementation, responsive layouts, accessibility compliance. | `[Frontend Engineer Name]` |
| **Security & QA Test Engineer** | Vitest test suite implementation, test case authoring (TC-01 - TC-40), security penetration checks, build auditing. | `[QA / Test Engineer Name]` |
| **DevOps & Release Engineer** | Cloudflare Pages deployment configuration, environment variables management, documentation packaging, CHANGELOG maintenance. | `[DevOps / Release Engineer Name]` |

---

## 2. RACI Responsibility Assignment Matrix

- **R** = Responsible (The role that performs the activity)
- **A** = Accountable (The role with final approval authority)
- **C** = Consulted (Role providing inputs and expertise)
- **I** = Informed (Role updated on progress)

| SDLC Activity | Project Lead | Requirements Engineer | Database Engineer | Frontend Engineer | QA Engineer | DevOps Engineer |
|---|---|---|---|---|---|---|
| Stakeholder Requirements & SRS | **A** | **R** | C | C | C | I |
| UML Diagrams & Architecture | **A** | C | **R** | C | I | I |
| Database Schema & RLS Policies | A | I | **R** | C | C | I |
| React UI & Design System | A | I | C | **R** | C | I |
| Auth & Domain Guard Integration | A | C | **R** | **R** | C | I |
| Claims & Handover Desks | A | I | **R** | **R** | C | I |
| Vitest Automated Testing | A | I | C | C | **R** | I |
| Security & RLS Policy Auditing | A | I | C | I | **R** | C |
| Cloudflare Deployment & Build | A | I | I | C | C | **R** |
| Final Documentation & Review | **A** | **R** | C | C | C | C |
