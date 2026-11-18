# Project Gantt Chart & Milestone Timeline
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Course:** Software Engineering  
**Academic Cycle:** Autumn 2026  

---

```mermaid
gantt
    title Khoj IIITA SDLC Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Requirements
    Project Initiation & Charter       :done,    p1_1, 2026-10-01, 3d
    Stakeholder Needs & Analysis       :done,    p1_2, 2026-10-04, 4d
    IEEE-Style SRS Authoring           :done,    p1_3, 2026-10-08, 4d
    Use Case Specifications & RTM      :done,    p1_4, 2026-10-12, 3d
    
    section Phase 2: Design & UML
    Architecture & Tech Evaluation     :done,    p2_1, 2026-10-15, 3d
    Relational DB Schema & RLS Design  :done,    p2_2, 2026-10-18, 4d
    PlantUML Structural Diagrams       :done,    p2_3, 2026-10-22, 3d
    PlantUML Behavioral Sequences      :done,    p2_4, 2026-10-25, 4d
    
    section Phase 3: Core Implementation
    Vite + Tailwind + TypeScript Setup :done,    p3_1, 2026-10-29, 2d
    PostgreSQL Initial Migration       :done,    p3_2, 2026-10-31, 3d
    AuthContext & Domain Protection    :done,    p3_3, 2026-11-03, 3d
    Item & Claim Reporting Workflows   :done,    p3_4, 2026-11-06, 5d
    Student Dashboard & Notifications  :done,    p3_5, 2026-11-11, 3d
    
    section Phase 4: Admin Desk
    Admin Claims Review Module         :done,    p4_1, 2026-11-14, 3d
    Physical Handover Desk & Audit Log :done,    p4_2, 2026-11-17, 3d
    
    section Phase 5: Testing & QA
    Vitest Automated Unit Testing      :done,    p5_1, 2026-11-18, 2d
    Security & Boundary Verification   :done,    p5_2, 2026-11-19, 2d
    Production Build Verification      :done,    p5_3, 2026-11-20, 1d
    
    section Phase 6: Deployment
    Cloudflare Pages & Documentation   :done,    p6_1, 2026-11-21, 2d
    Project Handover & Review          :done,    p6_2, 2026-11-23, 2d
```

---

## SDLC Work Breakdown by Phase

| Phase | Duration | Core Deliverables | Verification Metric |
|---|---|---|---|
| **Phase 1: Inception & Requirements** | 14 Days | SRS.md, Requirement_Analysis.md, Use_Cases.md, RTM.md | Stakeholder sign-off & traceability matrix baseline |
| **Phase 2: Architectural & DB Design** | 14 Days | Architecture_Design.md, Database_Design.md, 12 PlantUML models | Relational 3NF validation, RLS design review |
| **Phase 3: Client & Backend Engineering** | 14 Days | Supabase migration, React components, hooks, storage integration | Unit testing of domain constraints & file upload validation |
| **Phase 4: Admin Portal Operations** | 7 Days | Claims management, handover tracking, audit logging | Dispute resolution and multi-claim testing |
| **Phase 5: Quality Assurance & Testing** | 5 Days | Test_Plan.md, Test_Cases.md (40 cases), Vitest automated suite | 100% test pass rate & strict TypeScript build pass |
| **Phase 6: Deployment & Handover** | 4 Days | Cloudflare Pages config, Maintenance Plan, README, CHANGELOG | Production web bundle ready for edge deployment |
