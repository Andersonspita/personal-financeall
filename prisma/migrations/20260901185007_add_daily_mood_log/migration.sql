-- CreateTable
CREATE TABLE "DailyMoodLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "noteEncrypted" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyMoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DailyMoodLog_userId_date_idx" ON "DailyMoodLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMoodLog_userId_date_key" ON "DailyMoodLog"("userId", "date");
