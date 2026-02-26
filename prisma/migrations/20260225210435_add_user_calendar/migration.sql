-- CreateTable
CREATE TABLE "UserCalendar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#4285f4',
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCalendar_userId_idx" ON "UserCalendar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCalendar_userId_calendarId_key" ON "UserCalendar"("userId", "calendarId");

-- AddForeignKey
ALTER TABLE "UserCalendar" ADD CONSTRAINT "UserCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
