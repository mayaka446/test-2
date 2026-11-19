-- Run AFTER creating the School table and adding nullable schoolId columns.
-- This assigns existing single-school data to the original Mayakas workspace.
UPDATE "User" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Student" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Staff" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Subject" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "SchoolClass" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Enrollment" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "StudentAttendance" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "StaffAttendance" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "FeeStructure" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Payment" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Expense" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Examination" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Result" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Assignment" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "AssignmentSubmission" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "LessonNote" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "Announcement" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "AuditLog" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
UPDATE "GradingBand" SET "schoolId" = (SELECT id FROM "School" WHERE slug = 'mayakas') WHERE "schoolId" IS NULL;
