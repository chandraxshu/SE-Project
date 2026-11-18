# Software Maintenance Plan
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Standard:** IEEE Std 1219 / ISO/IEC 14764 Compliant  
**Version:** 1.0.0  
**Date:** November 2026  

---

## 1. Overview of Maintenance Categories

To ensure longevity and reliability across semesters at IIIT Allahabad, maintenance is structured into the four standard categories:

```
                          ┌──────────────────────────┐
                          │   Software Maintenance   │
                          └────────────┬─────────────┘
          ┌─────────────────┬──────────┴──────────┬─────────────────┐
          ▼                 ▼                     ▼                 ▼
   ┌─────────────┐   ┌─────────────┐       ┌─────────────┐   ┌─────────────┐
   │ Corrective  │   │  Adaptive   │       │ Perfective  │   │ Preventive  │
   │ Maintenance │   │ Maintenance │       │ Maintenance │   │ Maintenance │
   └─────────────┘   └─────────────┘       └─────────────┘   └─────────────┘
```

### 1.1 Corrective Maintenance (Bug & Vulnerability Remediation)
- **Triage Protocol**: Defects reported via campus IT helpdesk or admin portal are categorized by severity (Critical: Auth/Security breach; High: Handover/Claim failure; Medium: UI/Filter glitch; Low: Typographical).
- **Security Patches**: Immediate patching if any npm package exposes high or critical CVE vulnerabilities via `npm audit`.
- **Database Hotfixes**: Applied non-destructively through sequential numbered SQL migrations (e.g. `002_hotfix_xxx.sql`).

### 1.2 Adaptive Maintenance (Platform & Environment Evolution)
- **Supabase JS SDK Updates**: Adapting to breaking changes or major releases in `@supabase/supabase-js`.
- **Google OAuth Policy Compliance**: Google periodically updates OAuth client credential requirements and branding guidelines. The system accommodates redirect URL updates and client ID rotations.
- **Browser Compatibility**: Monitoring evergreen browser updates across Chromium, Gecko, and WebKit engines.
- **Cloudflare Pages Runtime**: Ensuring static asset routing rules (`_routes.json`) adhere to Cloudflare Pages edge hosting updates.

### 1.3 Perfective Maintenance (Functional Enhancements)
- **Automated Text Matching**: Implementing pg_trgm (trigram matching) in PostgreSQL to automatically notify students when a newly reported found item matches a registered lost notice.
- **QR-Code Desk Handovers**: Generating a secure, single-use QR code in the student's dashboard upon claim approval. The administrator scans the QR code at the desk to instantly pull up the claim dossier and record the handover.
- **Progressive Web App (PWA)**: Adding service worker caching and web app manifests for home-screen installation on student mobile devices.

### 1.4 Preventive Maintenance (Proactive Health & Optimization)
- **Database VACUUM & Reindexing**: Running periodic maintenance routines on PostgreSQL indexes to ensure noticeboard search queries stay under 150ms.
- **Storage Quota Governance**: Monitoring free-tier storage (1GB limit). Archived or returned items older than 180 days can have high-resolution photos purged or compressed to prevent quota exhaustion.
- **Dependency Upgrades**: Bi-monthly `npm outdated` reviews and dependency updates.

---

## 2. Database Migration Strategy & Versioning

All database changes must strictly adhere to sequential SQL migrations:
1. Migration files are stored under `supabase/migrations/` prefixed with a 3-digit version code:
   - `001_initial_schema.sql` (Baseline complete schema)
   - `002_feature_name.sql` (Future schema enhancements)
2. **Rules for Schema Changes**:
   - Never use `DROP TABLE` or `DROP COLUMN` on production data.
   - Use `ADD COLUMN ... DEFAULT` with non-null constraints added in two steps.
   - Test migrations against a local development container or secondary free Supabase staging project before production deployment.

---

## 3. Backup, Disaster Recovery & Business Continuity

- **Daily Logical Backups**: Automated daily PostgreSQL dumps using the Supabase CLI (`supabase db dump`) or automated database snapshots provided by Supabase.
- **Recovery Time Objective (RTO)**: Sub-30 minutes for complete disaster recovery.
- **Recovery Point Objective (RPO)**: Under 24 hours of data loss in a worst-case disaster scenario.
- **Disaster Recovery Procedure**:
  1. Provision a fresh free Supabase project.
  2. Execute `001_initial_schema.sql` in the SQL Query Editor.
  3. Restore table data from the latest SQL backup dump.
  4. Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Cloudflare Pages deployment environment.

---

## 4. Known Limitations & Edge Cases

1. **Email Domain Granularity**: The application accepts any `@iiita.ac.in` domain. If IIITA introduces subdomains (e.g. `@student.iiita.ac.in`), the domain validator function `check_email_domain()` and frontend `ALLOWED_EMAIL_DOMAIN` can be expanded with an array of allowed subdomains.
2. **Free-Tier Inactivity Pause**: Free-tier Supabase projects pause after 7 days of zero API traffic. For a live campus application with daily student visits, this will not occur; however, if paused during semester vacations, an administrator can unpause the project with one click in the Supabase dashboard.
