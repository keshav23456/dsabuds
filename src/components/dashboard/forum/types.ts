export interface ForumAuthor {
  id: string;
  name: string;
  userName?: string | null;
  avatarUrl?: string | null;
  college?: string | null;
  branch?: string | null;
}

export interface ForumComment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  author: ForumAuthor | null;
  replies?: ForumComment[];
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  author: ForumAuthor | null;
  commentCount?: number;
  comments?: ForumComment[];
  score: number;
  userVote: number;
  upvoteCount?: number;
  isUpvoted?: boolean;
}
