-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LEETCODE', 'CODECHEF', 'CODEFORCES', 'GFG');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('VERY_HIGH', 'HIGH', 'OCCASIONAL');

-- CreateEnum
CREATE TYPE "UserQuestionStatus" AS ENUM ('UNSOLVED', 'IN_PROGRESS', 'SOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "salt" TEXT,
    "avatarUrl" TEXT,
    "college" TEXT,
    "branch" TEXT,
    "socialLinks" JSONB DEFAULT '{}',
    "year" TEXT NOT NULL,
    "role" TEXT,
    "branchChangesCount" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "overallRank" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "username" TEXT NOT NULL,
    "rating" INTEGER,
    "stars" INTEGER,
    "problemsSolved" INTEGER,
    "rankLabel" TEXT,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "topicBreakdown" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "logoUrl" TEXT,
    "eligibility_criteria" TEXT,
    "rounds_info" TEXT,
    "oa_platform" TEXT,
    "top_topics" TEXT[],
    "other_info" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "company_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ctc_lpa" DOUBLE PRECISION,
    "stipend_month" DOUBLE PRECISION,
    "type" TEXT,
    "category" TEXT,
    "eligible_branches" TEXT[],
    "min_cgpa" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSet" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT,
    "lastUpdated" TEXT,
    "easyCount" INTEGER NOT NULL DEFAULT 0,
    "easyTotal" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "mediumTotal" INTEGER NOT NULL DEFAULT 0,
    "hardCount" INTEGER NOT NULL DEFAULT 0,
    "hardTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayName" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "leetcodeUrl" TEXT,
    "sourcePlatform" "Platform",
    "sourceId" TEXT,
    "sourceSlug" TEXT,
    "slug" TEXT,
    "sourceUrl" TEXT,
    "sourceRating" INTEGER,
    "paidOnly" BOOLEAN,
    "acceptanceRate" DOUBLE PRECISION,
    "frequency" "Frequency",
    "statement" TEXT,
    "examples" JSONB,
    "constraints" JSONB,
    "acceptedCount" INTEGER,
    "submissionCount" INTEGER,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyQuestion" (
    "companyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "frequency" "Frequency",
    "solved" BOOLEAN,
    "order" INTEGER,

    CONSTRAINT "CompanyQuestion_pkey" PRIMARY KEY ("companyId","questionId")
);

-- CreateTable
CREATE TABLE "RelatedQuestion" (
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,

    CONSTRAINT "RelatedQuestion_pkey" PRIMARY KEY ("fromId","toId")
);

-- CreateTable
CREATE TABLE "UserQuestion" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" "UserQuestionStatus" NOT NULL DEFAULT 'UNSOLVED',
    "solvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestion_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sheet" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "author" TEXT,
    "sourceUrl" TEXT,
    "coverImage" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "totalProblems" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetSection" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SheetSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetProblem" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "difficulty" "Difficulty",
    "articleUrl" TEXT,
    "youtubeUrl" TEXT,
    "practiceUrl" TEXT,
    "plusUrl" TEXT,
    "editorialUrl" TEXT,
    "questionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SheetProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSheetProblem" (
    "userId" TEXT NOT NULL,
    "sheetProblemId" TEXT NOT NULL,
    "status" "UserQuestionStatus" NOT NULL DEFAULT 'UNSOLVED',
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "solvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSheetProblem_pkey" PRIMARY KEY ("userId","sheetProblemId")
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "displayName" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "leetcodeUrl" TEXT,
    "sourcePlatform" "Platform" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceSlug" TEXT,
    "slug" TEXT,
    "sourceUrl" TEXT,
    "sourceRating" INTEGER,
    "paidOnly" BOOLEAN,
    "acceptanceRate" DOUBLE PRECISION,
    "frequency" "Frequency",
    "statement" TEXT,
    "examples" JSONB,
    "constraints" JSONB,
    "acceptedCount" INTEGER,
    "submissionCount" INTEGER,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestionBank" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" "UserQuestionStatus" NOT NULL DEFAULT 'UNSOLVED',
    "solvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestionBank_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_points_idx" ON "User"("points");

-- CreateIndex
CREATE INDEX "User_branch_points_idx" ON "User"("branch", "points");

-- CreateIndex
CREATE INDEX "User_year_points_idx" ON "User"("year", "points");

-- CreateIndex
CREATE INDEX "User_college_points_idx" ON "User"("college", "points");

-- CreateIndex
CREATE INDEX "PlatformConnection_platform_idx" ON "PlatformConnection"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_userId_platform_key" ON "PlatformConnection"("userId", "platform");

-- CreateIndex
CREATE INDEX "DailyActivity_date_idx" ON "DailyActivity"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "DailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "placements_companyId_idx" ON "placements"("companyId");

-- CreateIndex
CREATE INDEX "InterviewSet_companyId_idx" ON "InterviewSet"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");

-- CreateIndex
CREATE INDEX "Question_sourcePlatform_idx" ON "Question"("sourcePlatform");

-- CreateIndex
CREATE UNIQUE INDEX "Question_sourcePlatform_sourceId_key" ON "Question"("sourcePlatform", "sourceId");

-- CreateIndex
CREATE INDEX "CompanyQuestion_questionId_idx" ON "CompanyQuestion"("questionId");

-- CreateIndex
CREATE INDEX "RelatedQuestion_toId_idx" ON "RelatedQuestion"("toId");

-- CreateIndex
CREATE INDEX "UserQuestion_questionId_idx" ON "UserQuestion"("questionId");

-- CreateIndex
CREATE INDEX "ForumPost_userId_idx" ON "ForumPost"("userId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Vote_postId_idx" ON "Vote"("postId");

-- CreateIndex
CREATE INDEX "contact_submissions_createdAt_idx" ON "contact_submissions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "College_domain_key" ON "College"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_collegeId_name_key" ON "Branch"("collegeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Sheet_slug_key" ON "Sheet"("slug");

-- CreateIndex
CREATE INDEX "SheetSection_sheetId_idx" ON "SheetSection"("sheetId");

-- CreateIndex
CREATE INDEX "SheetSection_parentId_idx" ON "SheetSection"("parentId");

-- CreateIndex
CREATE INDEX "SheetProblem_sheetId_idx" ON "SheetProblem"("sheetId");

-- CreateIndex
CREATE INDEX "SheetProblem_sectionId_idx" ON "SheetProblem"("sectionId");

-- CreateIndex
CREATE INDEX "SheetProblem_questionId_idx" ON "SheetProblem"("questionId");

-- CreateIndex
CREATE INDEX "UserSheetProblem_sheetProblemId_idx" ON "UserSheetProblem"("sheetProblemId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBank_slug_key" ON "QuestionBank"("slug");

-- CreateIndex
CREATE INDEX "QuestionBank_sourcePlatform_idx" ON "QuestionBank"("sourcePlatform");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBank_sourcePlatform_sourceId_key" ON "QuestionBank"("sourcePlatform", "sourceId");

-- CreateIndex
CREATE INDEX "UserQuestionBank_questionId_idx" ON "UserQuestionBank"("questionId");

-- AddForeignKey
ALTER TABLE "PlatformConnection" ADD CONSTRAINT "PlatformConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSet" ADD CONSTRAINT "InterviewSet_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyQuestion" ADD CONSTRAINT "CompanyQuestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyQuestion" ADD CONSTRAINT "CompanyQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedQuestion" ADD CONSTRAINT "RelatedQuestion_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedQuestion" ADD CONSTRAINT "RelatedQuestion_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestion" ADD CONSTRAINT "UserQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestion" ADD CONSTRAINT "UserQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetSection" ADD CONSTRAINT "SheetSection_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetSection" ADD CONSTRAINT "SheetSection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SheetSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetProblem" ADD CONSTRAINT "SheetProblem_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetProblem" ADD CONSTRAINT "SheetProblem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SheetSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetProblem" ADD CONSTRAINT "SheetProblem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSheetProblem" ADD CONSTRAINT "UserSheetProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSheetProblem" ADD CONSTRAINT "UserSheetProblem_sheetProblemId_fkey" FOREIGN KEY ("sheetProblemId") REFERENCES "SheetProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionBank" ADD CONSTRAINT "UserQuestionBank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionBank" ADD CONSTRAINT "UserQuestionBank_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

