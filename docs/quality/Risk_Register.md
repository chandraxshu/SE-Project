# Project Risk Register
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Version:** 1.0.0  
**Date:** November 2026  

---

| Risk ID | Risk Description | Category | Likelihood | Impact | Severity Score | Mitigation Strategy | Contingency Plan |
|---|---|---|---|---|---|---|---|
| **RSK-01** | Non-IIITA users attempt to access system via personal Gmail accounts | Security | High | High | **High** | Multi-layer domain validation: Google OAuth `hd=iiita.ac.in` parameter + `AuthContext` domain check + PostgreSQL `check_email_domain()` constraint. | Immediate session termination with explicit error banner explaining institutional restriction. |
| **RSK-02** | Fraudulent user submits fake claim on high-value item (e.g. laptop) | Operational | Medium | Critical | **High** | Two-stage handover: private evidence review by administrator + mandatory physical student ID verification at desk. | Administrator rejects claim and flags suspicious behavior; original item remains safely locked. |
| **RSK-03** | Cloud storage quota exhaustion on free tier | Resource | Medium | High | **Medium** | 5MB per-file upload cap enforced in frontend and storage policies; MIME type filtering (JPEG/PNG/WebP only). | Automated admin alert when storage hits 80%; batch cleanup of archived items older than 180 days. |
| **RSK-04** | Accidental exposure of Supabase `service_role` secret | Security | Low | Critical | **High** | `service_role` key is strictly prohibited from frontend code and `.env.example`; only public `anon` key used. | Immediate key rotation in Supabase console if repository commit leak occurs. |
| **RSK-05** | Competing claims for same item causing race conditions | Technical | Medium | High | **Medium** | PostgreSQL transaction in `approveClaim` automatically transitions competing pending claims to `rejected`. | Administrator manually audits claims in Admin Claims view and contacts students if ambiguity persists. |
| **RSK-06** | Browser crash during file upload | Technical | Low | Low | **Low** | Chunked upload with client-side preview and retry capability. | User re-selects file and resubmits report. |
| **RSK-07** | Network failure during physical desk handover | Operational | Low | Medium | **Low** | Offline fallback logging on paper register with manual entry once connectivity resumes. | Physical handover verified through student ID card; logged into portal retroactively. |
