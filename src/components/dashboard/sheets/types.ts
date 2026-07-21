export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";
export type ProblemStatus = "SOLVED" | "UNSOLVED";

export interface SheetProblem {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  difficulty: ProblemDifficulty | null;
  articleUrl: string | null;
  youtubeUrl: string | null;
  practiceUrl: string | null;
  plusUrl: string | null;
  editorialUrl: string | null;
  questionId: string | null;
  status: ProblemStatus;
  starred: boolean;
  note: string | null;
  needsReview?: boolean;
}

export interface SheetSectionNode {
  id: string;
  title: string;
  order: number;
  problems: SheetProblem[];
  children: SheetSectionNode[];
  total?: number;
  solved?: number;
}

export interface SheetListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  author: string | null;
  sourceUrl: string | null;
  coverImage: string | null;
  totalProblems: number;
  solvedCount: number;
}

export interface SheetDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  author: string | null;
  sourceUrl: string | null;
  coverImage: string | null;
  totalProblems: number;
  solvedCount: number;
  sections: SheetSectionNode[];
}

export interface ProgressUpdatePayload {
  status?: ProblemStatus;
  starred?: boolean;
  note?: string;
}
