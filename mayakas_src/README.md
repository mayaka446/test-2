# Mayakas Management System

A full-stack school-management application foundation for schools running both the Kenyan CBC and Cambridge curricula.

## Included in this first implementation

- Next.js App Router application with responsive school dashboard.
- Four roles: ADMIN, TEACHER, STUDENT and BURSAR.
- Password-hashed sign-in and signed, HTTP-only session cookies.
- Role-aware navigation and server-side route authorization.
- PostgreSQL / Prisma data model for students, guardians, staff, classes, subjects, attendance, fees, payments, expenses, examinations, results, assignments, submissions, lesson notes, announcements and audit logs.
- Working student registration and student listing.
- Working fee payment recording with receipt number and audit log.
- Dashboard metrics and financial/management summary pages.
- CBC and Cambridge curriculum separation in core academic records.

## Requirements

- Node.js 20+
- PostgreSQL 15+
- npm

## Run locally

1. Extract this project.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `mayakas_sms`.
4. Copy `.env.example` to `.env` and set a strong `SESSION_SECRET` and your database URL.
5. Create tables and generate Prisma client:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. Add demo accounts and starter subjects:

   ```bash
   npm run db:seed
   ```

7. Start the application:

   ```bash
   npm run dev
   ```

8. Open http://localhost:3000.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@mayakas.school | ChangeMe123! |
| Teacher | teacher@mayakas.school | ChangeMe123! |
| Student | student@mayakas.school | ChangeMe123! |
| Bursar | bursar@mayakas.school | ChangeMe123! |

**Security:** Demo credentials are for local development only. Change or remove them before any real deployment. Use HTTPS, a production-grade secret, database backups, secure file storage and appropriate data-protection controls.

## Important implementation notes

This is a runnable MVP foundation, not yet a production-complete school ERP. The schema supports both curricula, but CBC rubrics and Cambridge grading scales need to be configured by the school before automatic report-card generation. Bulk attendance screens, staff registration, class/subject administration, assignment authoring/submission, lesson-note uploads, PDF report cards, parent access, payment-provider integration and advanced analytics are planned follow-on modules.

The file upload fields currently store resource URLs. Connect a private object-storage provider and validate file type/size before accepting real school documents. Do not expose student records or uploaded resources publicly.

## Recommended next delivery milestones

1. Complete CRUD screens for staff, classes, subjects, guardians and fee structures.
2. Build daily bulk attendance for students and staff.
3. Add curriculum-specific assessment configuration, grade calculation and printable report cards.
4. Add assignment publishing, student submissions, grading and lesson-note uploads.
5. Add downloadable financial reports, arrears ageing, expenditure controls and audit exports.
6. Add parent/guardian portal, notifications, backups and deployment automation.


## Operational features added in the next build

- Bulk daily attendance for students and staff, with Present / Absent / Late / Excused and "mark all present".
- Staff registration and staff directory.
- Class and subject setup with CBC/Cambridge separation.
- Examination creation, score entry and automatic grade assignment.
- Configurable grading-band database model; sensible default bands are provided as fallbacks. School-approved grade bands should be seeded before formal use.
- Printable browser report-card view (selective filtering via `?studentId=...&examinationId=...`).
- Homework creation and publishing.
- Lesson-note resource catalogue using secure resource URLs.
- Fee structures by curriculum, grade, academic year and term.
- Student fee balance report based on recorded fee structures and payments.
- Audit log entries for fee payments, attendance and results.

### Operational caveats

The report-card route is a print-friendly HTML view, not a signed/official PDF. The finance balance calculation currently totals all matching fee structures for a student's curriculum and grade, so the bursar must reconcile the intended school year/term and any discounts, scholarships, waivers or opening balances before relying on it as an official statement. A proper production rollout should add fee allocations/invoices per learner and term, refund/reversal workflows, maker-checker approvals, and reconciliation to bank/mobile-money statements.

Assignment submissions currently expose a protected API endpoint; the student-facing submission form and teacher grading inbox are still follow-on work. Lesson notes and homework attachments currently use URL fields; configure private object storage and signed access URLs for confidential content. The report-card default grading fallback is illustrative only; configure school-approved CBC and Cambridge grade bands before publishing results.


Additional learner workflows in this update:
- Students can view published homework and submit written responses or a resource URL when their login is linked to their Student profile.
- Teachers/admins can review submissions and record marks/feedback.
- Students can access their own printable report-card view; the report-card endpoint restricts student sessions to their linked profile.
- Admins can define curriculum-specific grading bands from Classes & subjects. Use school-approved grade boundaries and ensure bands do not overlap before recording formal marks.

## Mayakas ERP development build (November 2026)

This delivery is the first ERP-hardening and interface pass on the supplied project. It preserves the existing Next.js/Prisma architecture and database model rather than replacing the application.

### Improvements in this pass

- Refreshed the application shell with a responsive navigation layout, consistent school branding, improved typography, and a compact user profile area.
- Added a server-side sign-out action that clears the HTTP-only session cookie.
- Tightened learner assignment visibility so student accounts only receive published assignments matching their own curriculum and grade.
- Validated assignment subject/curriculum consistency when assignments are created.
- Added learner curriculum, grade, publication status, and due-date checks before accepting a submission.
- Added examination, learner, and subject curriculum/grade consistency checks before saving marks.
- Escaped database-sourced text in printable report-card HTML to reduce stored cross-site scripting risk.

### Important status

This is still a development build, not a certified production school ERP. Before live learner data is entered, complete a full dependency install and production build, configure PostgreSQL and secrets, test every role with separate accounts, and arrange backups and private document storage. A package install/build could not be completed in the isolated build environment because package downloads timed out; no claim of a successful production build is made.

### Next ERP delivery stages

1. **School setup and people:** school profile, academic calendar, guardian records, admissions workflow, class enrolment, staff accounts, teacher-to-class/subject allocation.
2. **Teaching and assessment:** configurable CBC rubrics/strands and Cambridge grading, assessment schedules, bulk mark entry/import, moderation, class analysis, learner progress reports and printable report cards.
3. **Finance:** learner-specific invoices/fee allocations, discounts and bursaries, receipt printing, reversals/refunds, arrears ageing, expenditure approvals and reconciliation.
4. **Operations:** bulk attendance, timetable, behaviour/pastoral records, transport, library, inventory/assets and school communications.
5. **Parent and learner portals:** guardian-linked accounts, announcements, attendance and results visibility, fee statements and secure notifications.
6. **Production readiness:** role/permission matrix, audit exports, privacy controls, automated tests, monitoring, backup/restore drills and deployment configuration.

Do not use the demo accounts or demo password in a live deployment. Replace all seeded credentials and set a unique, strong `SESSION_SECRET` before deployment.

## Multi-school (tenant) workspaces

This build adds the first multi-school layer:

- A `School` tenant record with a unique school code (`slug`), school identity, contact details, timezone and currency.
- A nullable `schoolId` tenant key and relation on every school-owned data model.
- A school registration page at `/register-school`. Each registration creates a school workspace and its first `ADMIN` account in one database transaction.
- Sign-in now requires the school's code, email and password. A user's session is bound to both their user ID and school ID.
- The main student, staff, academic setup, fee structure, attendance, examination, assignment, lesson note, grading and finance endpoints now apply school scoping or tenant checks in their implemented paths.
- The original seeded demo school uses school code `mayakas`.

### Upgrade an existing Mayakas database

1. Back up PostgreSQL.
2. Run `npx prisma migrate dev --name multi_school_tenants` (or create/apply a reviewed production migration with `prisma migrate deploy`).
3. Run `npm run db:seed` to ensure the original `mayakas` school and demo users exist.
4. Run the SQL in `prisma/tenant-backfill.sql` to attach pre-existing records with a null `schoolId` to the original Mayakas school. Review the SQL and confirm the `mayakas` school exists before running it.
5. Test sign-in and verify that each school's records are isolated before importing real learner data.

### Multi-school limitations to address before public production launch

This is a multi-tenant development foundation, not yet a security-certified SaaS release. Some less-used endpoints and nested relation writes still need a complete tenant-isolation audit, automated cross-tenant penetration tests and stricter foreign-key ownership checks. A few identifiers (including user email, admission number, staff number and subject code) are still globally unique rather than unique per school. The platform-level `SUPER_ADMIN` role is reserved in the role enum but a platform owner console and tenant suspension/billing tools are not yet implemented. Production deployment must also use a strong `SESSION_SECRET`, HTTPS, database backups, private object storage, rate limiting, monitoring and a reviewed migration process.

## Controlled multi-school registration (platform approval)

New school applications now enter a review queue. A school is created with status `PENDING` and `active = false`; its administrator cannot sign in until a platform owner approves it. The platform owner can approve, reject, suspend or reactivate a school from `/platform/schools`.

### Set up the platform owner

1. Add `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` to your server-side `.env` file. Use a unique email and a strong password (at least 14 characters is recommended). Do not commit `.env` to source control.
2. Apply the Prisma migration: `npx prisma migrate deploy` in production, or `npx prisma migrate dev` in local development.
3. Generate the Prisma client: `npx prisma generate`.
4. Run `npm run db:seed`. This provisions the platform owner only when both environment variables are set. The seed also keeps the original `mayakas` demo tenant approved.
5. Sign in at `/login` using school code `platform`, then the platform owner's email and password. This opens the platform control centre at `/platform/schools`.
6. Review new applications and choose Approve or Reject. Approved school administrators can then sign in with their school's code, email and password.

### Approval workflow and controls

- Registration does not create an authenticated session and does not grant access.
- Pending, rejected and suspended schools are blocked at login.
- Only a session with role `SUPER_ADMIN` and no school tenant can access the platform school-list API.
- Approved schools can be suspended; suspended or rejected schools can be reactivated by the platform owner.
- The platform owner account is provisioned from server environment variables; there is no public Super Admin registration form.

### Production security checklist

Before real school records are added, complete the full tenant-isolation audit across every API route and nested Prisma relation, add automated cross-tenant authorization tests, add rate limiting and monitoring, verify password reset and account recovery, and perform database backup/restore drills. Protect the platform owner's credentials and enable HTTPS. The current approval workflow is a development feature and has not yet been independently security audited or production-build tested.
