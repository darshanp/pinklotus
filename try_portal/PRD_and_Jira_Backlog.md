# Blossom Foundation Retreat Platform
## Consolidated PRD + Addendum + Jira-Ready Backlog

Document Version: 1.0  
Date: February 14, 2026  
Scope: V0 Web, V1 Mobile-readiness, V2 Future Requirements Captured

## 1. Product Overview
Build a role-based retreat platform that supports:
- User account creation and login
- Terms acceptance with signed legal acknowledgment
- Identity verification via Didit
- Retreat product (SKU) management by admins
- Retreat registration and payment via Stripe
- Family/friends invitation and linked registration flow
- Volunteer participation and admin visibility
- Compliance-aware account deletion and data lifecycle

V0 is web-first. V1 adds mobile apps (iOS/Android) and phone OTP purchase gating. V2 includes QR-code based reminder/check-in and parking ops.

## 2. Goals
1. Enable an end-to-end registration journey from signup to confirmed payment.
2. Enforce compliance and trust checks before purchase (email verification in V0, phone OTP in V1, Didit verification policy).
3. Give admins operational control over retreat inventory and participant data.
4. Support family/friends group registration with explicit invite acceptance.
5. Maintain legal/compliance posture for consent, retention, deletion, and financial records.

## 3. Non-Goals (V0)
- Native mobile apps
- Complex marketing automation/CRM journeys
- Marketplace/multi-vendor model
- Full accounting ERP replacement

## 4. Roles & Permissions
- Guest: browse retreats, sign up, sign in
- User: manage profile, verification, relationships, registrations, volunteer info
- Admin: manage SKUs, view registrations/payments/volunteers, perform admin actions
- Super Admin (recommended): role assignment, policy/config controls
- Parking Admin (planned V2): QR scan + campus/vehicle check-in

## 5. Scope by Version
### V0 (Web)
- Auth + password reset + email verification
- Account creation wizard (details + terms + legal name signature)
- Terms PDF generation and delivery
- Didit identity verification (status + webhook)
- Retreat listing/detail + SKU-based registration
- Stripe checkout + webhook-driven confirmation
- Family/friends invite + accept/decline + linked attendee selection
- Volunteer intake (skills, availability, prior experience)
- Admin dashboard for SKU CRUD, registrations, volunteer lists
- Account deletion workflow and compliant data handling

### V1 (Mobile)
- iOS and Android apps with core user-flow parity
- Phone OTP verification required before purchase
- Shared backend APIs and business rules

### V2 (Future captured now)
- Automated reminder emails N days before retreat
- QR code sent in email for gate check-in
- Scan flow for admin/parking admin
- Vehicle check-in details: state, license plate, color, optionally make/model

## 6. Core Functional Requirements
### 6.1 Authentication & Access
- Unique email registration
- Strong password policy
- Login/logout/session security
- Forgot/reset password
- RBAC for user/admin/super admin

### 6.2 Verification Gating Policy
- V0: Email verification required before checkout/purchase
- V1: Email + phone OTP required before checkout/purchase
- Identity verification validity is configurable by policy (not fixed annual)
- Didit status lifecycle must be persisted and enforceable

### 6.3 Terms Acceptance and PDF Record
- User must accept current Terms version and provide legal-name signature
- On successful account completion:
  - Generate immutable Terms Acceptance PDF snapshot
  - Email copy to user
  - Store PDF in object storage
  - Store metadata in database (no PDF blob in DB)

### 6.4 Family/Friends Linked Accounts (V0 required)
- User invites existing account by email as family or friend
- Invitee accepts/declines via email-driven confirmation
- Only accepted links can be selected as attendees in purchaser’s registration
- Revocation/expiry supported

### 6.5 Retreat Products and Registration
- Admin creates retreat SKUs (price, capacity, schedule, active state)
- Users browse and register for available products
- Registration can include self + accepted linked users
- Capacity and duplicate-attendee rules enforced

### 6.6 Payments (Stripe)
- Stripe Checkout Session or Payment Intent
- Webhook is source of truth for payment success/failure/refund
- Idempotent processing required for all webhook events
- Currency in V0: USD only
- Tax: standard Stripe tax setup, finalized with nonprofit legal/accounting guidance

### 6.7 Volunteer Flow
Required fields in V0:
- Skills (multi-select): cooking, gardening, yoga, photography, cleaning, assign me any task
- Availability
- Prior experience (single-select):
  - yes, at blossom foundation
  - yes, at another non-profit
  - no

### 6.8 Profile Photo
- Optional profile picture upload/update/delete
- Store files in object storage; DB stores keys/URLs + metadata
- Validate size/type, remove EXIF metadata, malware scan recommended

### 6.9 Account Deletion (GDPR/CCPA-oriented)
- User can request account deletion
- Deletion workflow: request -> optional grace period -> execute
- On execute:
  - Delete/anonymize personal profile PII
  - Revoke sessions/tokens
  - Remove personal files (profile photo, terms PDF if policy allows)
  - Preserve legally required accounting/audit records with pseudonymized references
- Relationship records should not dangle:
  - Mark terminated_due_to_deletion, null out personal contact fields where needed
- Maintain data subject request log

## 7. Screen-by-Screen Requirements Matrix
| Screen | Role | Purpose | Inputs/Data | Key Actions | Rules |
|---|---|---|---|---|---|
| Login | Guest | Authenticate | Email, password | Sign in, forgot password | Credential validation |
| Create Account Step 1 | Guest | Capture account/profile basics | Name, DOB, gender, phone, emergency contact, credentials | Continue | Field validation, unique email |
| Create Account Step 2 | Guest | Legal acceptance | Terms check, typed legal name | Create account | Must accept terms + signature |
| Email Verification | User | Enable purchase gating | Verification token status | Verify, resend | Must be verified before checkout |
| Identity Verification (Not Verified) | User | Start Didit | Current status | Start verification | Checkout blocked until verified |
| Identity Verification (Verified) | User | Confirm status | Verified date, expiry | Browse retreats | Policy-based expiry check |
| Retreat Listing | Guest/User | Discover products | Retreat cards | View/register | Availability and active SKU only |
| Retreat Detail | User | Purchase preparation | Dates, price, location, capacity | Register | Verification gates enforced |
| Family & Friends | User | Manage linked attendees | Invites, accepted links | Invite/respond/revoke | Accepted only eligible for shared registration |
| Registration Builder | User | Compose attendee set | Self + accepted links | Proceed to checkout | No duplicate attendees |
| Checkout | User | Payment | Registration ID, totals | Pay via Stripe | USD only, webhook authoritative |
| My Registrations | User | View/manage registrations | Status timeline | Cancel (policy-based), view receipt | Cancellation/refund policy enforcement |
| Volunteer Form | User | Register volunteer interest | Skills, availability, prior exp | Submit/update | Required fields enforced |
| Profile Menu/Profile | User/Admin | Account nav & profile mgmt | Profile + picture | Update profile, sign out | RBAC |
| Admin SKU Management | Admin | Product operations | SKU fields | Create/edit/archive | Date/capacity/price validations |
| Admin Registrations | Admin | Participant operations | User/attendee/payment state | Filter/export/refund/cancel | Audit logging |
| Admin Volunteers | Admin | Volunteer operations | Skill/availability/experience | Filter/export | Audit logging |
| V2 Gate Scan | Parking Admin | Check-in at campus | QR token + vehicle details | Scan/check-in | One-time/controlled use |

## 8. API Contract Draft (v1)
### 8.1 Auth & Account
- POST `/auth/register/draft`
- POST `/legal/consents`
- POST `/auth/register/complete`
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/password/forgot`
- POST `/auth/password/reset`
- POST `/auth/email/send`
- POST `/auth/email/verify`
- GET `/me`
- DELETE `/me` (deletion request)

### 8.2 Identity (Didit)
- POST `/identity/didit/session`
- GET `/identity/status`
- POST `/webhooks/didit`

Identity status states:
`not_started -> pending -> verified | rejected | expired | manual_review`

### 8.3 Retreats/SKUs
- GET `/retreats`
- GET `/retreats/{retreat_id}`
- GET `/retreats/{retreat_id}/skus`
- POST `/admin/retreat-skus`
- PATCH `/admin/retreat-skus/{sku_id}`
- POST `/admin/retreat-skus/{sku_id}/archive`

### 8.4 Family/Friends Relationships
- POST `/relationships/invite`
- GET `/relationships`
- POST `/relationships/{relationship_id}/respond`
- POST `/relationships/{relationship_id}/revoke`

Relationship states:
`pending -> accepted | declined | expired`
`accepted -> revoked`

### 8.5 Registrations & Payments
- POST `/registrations`
- GET `/me/registrations`
- GET `/registrations/{registration_id}`
- POST `/registrations/{registration_id}/cancel`
- POST `/checkout/session`
- POST `/webhooks/stripe`

Registration states:
`draft -> pending_payment -> confirmed`
`pending_payment -> payment_failed | expired`
`confirmed -> cancelled | refunded_partial | refunded_full`

Payment states:
`initiated -> processing -> succeeded | failed`
`succeeded -> refunded_partial | refunded_full`

### 8.6 Volunteer
- POST `/volunteers/profile`
- POST `/volunteers/applications`
- GET `/admin/volunteers`

### 8.7 Documents & Media
- POST `/documents/terms/{consent_id}/generate`
- GET `/documents/{document_id}`
- POST `/profile/photo/upload-url`
- DELETE `/profile/photo`

### 8.8 Admin Ops
- GET `/admin/registrations`
- POST `/admin/registrations/{id}/refund`
- GET `/admin/reports/registrations.csv`
- GET `/admin/reports/volunteers.csv`

## 9. Data Model (Normalized, Postgres)
Core tables:
- users
- user_profiles
- terms_versions
- terms_consents
- user_documents (terms PDFs and other generated artifacts)
- identity_verifications
- retreats
- retreat_skus
- relationships
- registrations
- registration_attendees
- payments
- volunteer_profiles
- volunteer_profile_skills
- volunteer_applications
- webhook_events
- data_subject_requests
- audit_logs

Storage strategy:
- Binary files (PDF/profile images) in object storage (S3/R2 compatible)
- DB stores metadata (storage_key, checksum, mime_type, size_bytes)

## 10. Compliance, Retention & Deletion Strategy
- Maintain a retention policy matrix by data type:
  - Financial records: retain per legal/accounting requirements
  - Identity artifacts: retain minimal fields and provider reference only
  - User profile/contact data: delete/anonymize on request where legally allowed
- Use pseudonymization instead of hard-delete for linked transactional records
- Prevent dangling pointers with controlled FK strategy and soft-delete states where needed
- Log all deletion-related events in `data_subject_requests` and `audit_logs`

## 11. Non-Functional Requirements
- Security: OWASP controls, rate limiting, secure secret management
- Reliability: webhook retries + idempotency constraints
- Performance: acceptable page/API SLAs under projected load (<25k users)
- Accessibility: WCAG 2.1 AA
- Observability: centralized logs, error tracking, alerting
- Maintainability: migration-driven schema evolution

## 12. Stack Recommendation (Velocity + Low Cost + Flexibility)
Recommended initial stack:
- Frontend: Next.js (TypeScript) on Vercel
- Backend: FastAPI on Render or Railway
- Database: Managed Postgres (Neon or Supabase)
- Object storage: Cloudflare R2 (or S3)
- Queue/cache: Upstash Redis
- Async workers: Celery or Dramatiq
- Email: Postmark or Resend
- Payments: Stripe
- Identity verification: Didit
- Migrations: Alembic
- Error monitoring: Sentry

Rationale:
- Fast iteration and low ops burden
- Strong relational model fit
- Easy mobile extension via API-first approach
- Cost-efficient for <25,000 users at launch

## 13. Delivery Milestones
- M1: Auth + email verification + terms flow
- M2: Didit verification integration
- M3: Retreat SKU, registration, Stripe checkout/webhooks
- M4: Family/friends invite and attendee registration
- M5: Volunteer + admin panels + exports
- M6: Compliance hardening + deletion workflow

---

## 14. Jira-Ready Backlog (Implementation Order with Dependencies)

### Epic E0: Foundations & DevOps
- Story E0-S1: Create monorepo structure and coding standards
- Story E0-S2: Set up CI/CD (frontend + backend)
- Story E0-S3: Provision environments (dev/stage/prod)
- Story E0-S4: Configure observability baseline (Sentry/logging)
- Story E0-S5: Configure object storage + Redis + secrets

Dependencies:
- E0-S1 -> E0-S2, E0-S3
- E0-S3 -> E0-S4, E0-S5

### Epic E1: Identity, Auth, and Consent
- Story E1-S1: DB schema v1 (users/profiles/terms/roles)
- Story E1-S2: Auth APIs (register/login/logout/reset)
- Story E1-S3: Email verification flow and gating middleware
- Story E1-S4: Terms versioning + acceptance endpoint
- Story E1-S5: Create account UI (2-step wizard)
- Story E1-S6: Terms acceptance UI + legal-name signature UX

Dependencies:
- E1-S1 -> E1-S2, E1-S4
- E1-S2 -> E1-S3
- E1-S4 -> E1-S6
- E1-S5 -> E1-S6

### Epic E2: Terms PDF and Document Management
- Story E2-S1: Document metadata model + APIs
- Story E2-S2: Terms PDF rendering service
- Story E2-S3: Email PDF delivery workflow
- Story E2-S4: Document retrieval/audit access for admins

Dependencies:
- E1-S4 -> E2-S2
- E2-S1 -> E2-S2, E2-S4
- E2-S2 -> E2-S3

### Epic E3: Didit Verification
- Story E3-S1: Identity verification schema + status model
- Story E3-S2: Start verification endpoint + redirect integration
- Story E3-S3: Didit webhook endpoint + signature validation
- Story E3-S4: Verification status UI (not verified/pending/verified/fail)
- Story E3-S5: Policy engine for verification expiry config

Dependencies:
- E1-S2 -> E3-S2
- E3-S1 -> E3-S3, E3-S5
- E3-S2 -> E3-S4
- E3-S3 -> E3-S4

### Epic E4: Retreat Catalog and Admin SKU Management
- Story E4-S1: Retreat and SKU schema
- Story E4-S2: Admin SKU CRUD APIs
- Story E4-S3: Admin SKU management UI
- Story E4-S4: Public/auth retreat listing API + UI
- Story E4-S5: SKU availability/capacity logic

Dependencies:
- E4-S1 -> E4-S2, E4-S4, E4-S5
- E4-S2 -> E4-S3
- E4-S5 -> E4-S4

### Epic E5: Family/Friends Workflow
- Story E5-S1: Relationship schema + state transitions
- Story E5-S2: Invite by email API + token handling
- Story E5-S3: Accept/decline UI and APIs
- Story E5-S4: Revoke/expire relationship handling
- Story E5-S5: Include accepted links in attendee selector

Dependencies:
- E1-S2 -> E5-S2
- E5-S1 -> E5-S2, E5-S3, E5-S4
- E5-S3 -> E5-S5

### Epic E6: Registration & Checkout (Stripe)
- Story E6-S1: Registration schema + attendee model
- Story E6-S2: Create registration API with eligibility checks
- Story E6-S3: Stripe checkout session creation API
- Story E6-S4: Stripe webhook + idempotency event store
- Story E6-S5: Registration status UI (my registrations/detail)
- Story E6-S6: Purchase gating middleware (email verified + identity verified)

Dependencies:
- E4-S5 -> E6-S2
- E5-S5 -> E6-S2
- E6-S1 -> E6-S2, E6-S5
- E6-S2 -> E6-S3
- E6-S3 -> E6-S4
- E1-S3 + E3-S5 -> E6-S6
- E6-S6 -> E6-S3

### Epic E7: Volunteer Module
- Story E7-S1: Volunteer schema (profile/skills/application)
- Story E7-S2: Volunteer submission API
- Story E7-S3: Volunteer form UI
- Story E7-S4: Admin volunteer list/filter/export

Dependencies:
- E7-S1 -> E7-S2, E7-S4
- E7-S2 -> E7-S3

### Epic E8: Profile Photo Media
- Story E8-S1: Profile photo metadata schema
- Story E8-S2: Signed upload URL API + validation
- Story E8-S3: Profile UI upload/update/delete
- Story E8-S4: Image processing pipeline (resize, EXIF strip)

Dependencies:
- E0-S5 -> E8-S2, E8-S4
- E8-S1 -> E8-S2
- E8-S2 -> E8-S3

### Epic E9: Admin Operations, Refunds, and Reporting
- Story E9-S1: Admin registrations list/filter
- Story E9-S2: Refund/cancel APIs + policy checks
- Story E9-S3: CSV exports (registrations/volunteers)
- Story E9-S4: Admin audit trail UI/API

Dependencies:
- E6-S4 -> E9-S1, E9-S2
- E7-S4 -> E9-S3
- E1-S1 -> E9-S4

### Epic E10: Compliance & Data Subject Management
- Story E10-S1: Data retention policy matrix implementation
- Story E10-S2: Data subject request model and APIs
- Story E10-S3: Account deletion workflow (request/confirm/execute)
- Story E10-S4: Pseudonymization service for retained records
- Story E10-S5: Relationship termination handling on deletion
- Story E10-S6: Compliance admin report/audit endpoints

Dependencies:
- E1-S1 -> E10-S2
- E10-S2 -> E10-S3
- E10-S1 -> E10-S4
- E5-S1 -> E10-S5
- E10-S3 + E10-S4 + E10-S5 -> E10-S6

### Epic E11: QA, Hardening, and Release
- Story E11-S1: Integration tests for auth/verification/checkout/webhooks
- Story E11-S2: Security tests and rate-limit validation
- Story E11-S3: Accessibility audit and fixes
- Story E11-S4: Load/performance smoke tests
- Story E11-S5: Release checklist + rollback runbook

Dependencies:
- E6-S4 + E10-S3 -> E11-S1
- E0-S4 -> E11-S5

---

## 15. Critical Path
1. E0 foundations
2. E1 auth/consent
3. E3 verification + E4 SKUs
4. E5 relationships
5. E6 checkout/webhooks
6. E9 admin ops
7. E10 compliance
8. E11 hardening/release

## 16. Parallel Workstreams
- Workstream A: Frontend UX (E1/E4/E5/E6/E7/E8)
- Workstream B: Backend APIs and schema (E1..E10)
- Workstream C: Integrations (Didit/Stripe/Email/Object storage)
- Workstream D: Compliance and audit tooling (E9/E10)

## 17. Definition of Done (applies to all stories)
- Acceptance criteria met and tested
- API contracts documented (OpenAPI)
- Migrations included and reversible
- Logs/metrics added for key operations
- Security and permission checks verified
- QA signoff in staging

