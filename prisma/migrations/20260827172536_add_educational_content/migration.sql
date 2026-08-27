-- CreateTable
CREATE TABLE "EducationalContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContentProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "viewedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "ContentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "EducationalContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EducationalContent_slug_key" ON "EducationalContent"("slug");

-- CreateIndex
CREATE INDEX "EducationalContent_tag_idx" ON "EducationalContent"("tag");

-- CreateIndex
CREATE INDEX "ContentProgress_userId_idx" ON "ContentProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentProgress_userId_contentId_key" ON "ContentProgress"("userId", "contentId");
