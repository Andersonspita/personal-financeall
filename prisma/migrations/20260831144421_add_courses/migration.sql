-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EducationalContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "lessonOrder" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EducationalContent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EducationalContent" ("body", "createdAt", "estimatedMinutes", "id", "order", "slug", "summary", "tag", "title") SELECT "body", "createdAt", "estimatedMinutes", "id", "order", "slug", "summary", "tag", "title" FROM "EducationalContent";
DROP TABLE "EducationalContent";
ALTER TABLE "new_EducationalContent" RENAME TO "EducationalContent";
CREATE UNIQUE INDEX "EducationalContent_slug_key" ON "EducationalContent"("slug");
CREATE INDEX "EducationalContent_tag_idx" ON "EducationalContent"("tag");
CREATE INDEX "EducationalContent_courseId_idx" ON "EducationalContent"("courseId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_tag_idx" ON "Course"("tag");
