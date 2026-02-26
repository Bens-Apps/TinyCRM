-- Split name into firstName + lastName
ALTER TABLE "Contact" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Contact" ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';

-- Migrate existing data: first word -> firstName, rest -> lastName
UPDATE "Contact" SET
  "firstName" = CASE
    WHEN position(' ' in "name") > 0 THEN substring("name" from 1 for position(' ' in "name") - 1)
    ELSE "name"
  END,
  "lastName" = CASE
    WHEN position(' ' in "name") > 0 THEN substring("name" from position(' ' in "name") + 1)
    ELSE ''
  END;

-- Drop old column and index
DROP INDEX IF EXISTS "Contact_userId_name_idx";
ALTER TABLE "Contact" DROP COLUMN "name";

-- Remove the default now that data is migrated
ALTER TABLE "Contact" ALTER COLUMN "firstName" DROP DEFAULT;

-- New index
CREATE INDEX "Contact_userId_lastName_firstName_idx" ON "Contact"("userId", "lastName", "firstName");
