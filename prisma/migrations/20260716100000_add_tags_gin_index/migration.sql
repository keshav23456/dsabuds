-- CreateIndex
CREATE INDEX "Question_tags_idx" ON "Question" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "QuestionBank_tags_idx" ON "QuestionBank" USING GIN ("tags");
