# Software Quality Assurance (SQA) Plan
## Khoj — IIITA Lost & Found Platform
**Institution:** Indian Institute of Information Technology Allahabad  
**Standard:** IEEE Std 730-2014 Compliant  
**Version:** 1.0.0  
**Date:** November 2026  

---

## 1. Quality Objectives & Quality Attributes

Khoj is engineered according to the **ISO/IEC 25010 Software Quality Model**:
- **Functional Suitability**: Complete implementation of all 24 Functional Requirements without placeholder mock data.
- **Reliability & Fault Tolerance**: Graceful recovery from network dropouts and fallback states for missing credentials.
- **Performance Efficiency**: Indexed PostgreSQL execution (<150ms queries) and optimized Vite bundle footprint.
- **Operability & Usability**: Clean typography hierarchy, WCAG 2.1 AA accessible contrast, and responsive viewports.
- **Security**: Strict institutional isolation (`@iiita.ac.in`), multi-layer Row Level Security (RLS), and private storage isolation.
- **Maintainability & Portability**: Clean modular TypeScript with strict type checking and vendor independence.

---

## 2. Engineering Standards & Conventions

### 2.1 TypeScript & Coding Standards
- `strict: true` and `noUncheckedIndexedAccess: true` enabled in `tsconfig.json`.
- Zero tolerance for `any` types in domain logic; all entities must implement interfaces from `src/types/index.ts`.
- Functional components exclusively with React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`).
- Separation of concerns: UI components contain zero raw Supabase SQL queries; all data operations are encapsulated in `src/hooks/` and `src/services/`.

### 2.2 Security Standards
- Row Level Security (RLS) enabled on 100% of database tables.
- No client-side storage of authentication secrets or service-role keys.
- Private evidence files stored in separate private buckets accessed exclusively via short-lived signed URLs.
- Audit logging for all administrative reviews and physical handovers.

### 2.3 UI/UX Standards
- Avoid generic SaaS design tropes (no excessive glassmorphism, no floating pastel shapes, no purple-blue gradients).
- Theme: Warm stone neutral (`surface-*`), warm terracotta accent (`primary-*`), green verification accent (`accent-*`).
- Semantic HTML tags (`<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`).

---

## 3. Code Review & Verification Practices
1. **Automated Static Analysis**: ESLint and TypeScript compilation pass before commit.
2. **Automated Unit Testing**: Vitest suite validates business rules and status transitions.
3. **Build Verification**: `npm run build` must succeed without warnings or errors.
