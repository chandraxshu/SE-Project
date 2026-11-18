# Project Management & Implementation Plan
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Course:** Software Engineering (CS/IT Core)  
**Academic Cycle:** Autumn 2026  

---

## 1. Project Objectives & Deliverables
Khoj is an enterprise-grade academic software engineering project implementing a production-ready, cloud-hosted Lost & Found platform for IIIT Allahabad.

### Key Deliverables:
1. **Fully Functional Web Application**: React 19 + TypeScript + Vite + Tailwind CSS frontend.
2. **Cloud Database & Storage Backend**: PostgreSQL database with complete RLS policies and bucket configurations.
3. **Comprehensive SDLC Documentation**: IEEE-style SRS, Requirements Analysis, Use Cases, RTM, Architecture, Database Design, Test Plan, Test Cases, SQA Plan, Maintenance Plan.
4. **Complete UML Artifacts**: 12 editable PlantUML models spanning structural, behavioral, and deployment perspectives.

---

## 2. SDLC Development Phases & Milestones

```
Phase 1: Inception & Requirements Analysis [Week 1]
    ├── Stakeholder identification & user stories
    ├── IEEE-style Software Requirements Specification (SRS)
    └── Requirements Traceability Matrix baseline
Phase 2: Architectural & Database Design [Week 2]
    ├── System architecture & technology selection
    ├── Relational database schema & RLS policies
    └── Complete PlantUML modeling (12 diagrams)
Phase 3: Core Implementation & Services [Week 3 - 4]
    ├── Supabase client, AuthContext, domain checks
    ├── Reporting workflows (found/lost) & storage uploads
    ├── Noticeboard browsing, filtering, search
    ├── Claim submission & student dashboards
    └── Admin portal (review, handovers, audit logs)
Phase 4: Quality Assurance & Automated Testing [Week 5]
    ├── Automated unit testing via Vitest
    ├── Security & authorization validation
    ├── Cross-device responsive testing
    └── Production Vite compilation
Phase 5: Deployment Preparation & Maintenance [Week 6]
    ├── Cloudflare Pages deployment configuration
    ├── Supabase migration packaging
    ├── Software Maintenance Plan & Runbooks
    └── Final project completion documentation
```

---

## 3. Milestone Schedule

| Milestone | Deliverable Description | Scheduled Completion | Status |
|---|---|---|---|
| **M1: Requirements Freeze** | SRS, Requirement Analysis, Use Cases, RTM | End of Week 1 | **Completed** |
| **M2: Architecture & DB Design** | Architecture document, Database schema, 12 UML diagrams | End of Week 2 | **Completed** |
| **M3: Core Frontend & Backend** | Auth, reporting, browsing, claims, student dashboard | End of Week 4 | **Completed** |
| **M4: Admin Operations Desk** | Claims investigation, dispute resolution, handovers, audit log | End of Week 4 | **Completed** |
| **M5: QA & Test Execution** | Vitest automated suite (8 tests), 40 test cases, build pass | End of Week 5 | **Completed** |
| **M6: Deployment & Handover** | Deployment guides, Maintenance Plan, README, CHANGELOG | End of Week 6 | **Completed** |
