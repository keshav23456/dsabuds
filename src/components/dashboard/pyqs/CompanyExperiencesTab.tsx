'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { Card, Button, Input, Badge, CreateExperienceFullPage } from '@/components/common';
import type { User } from '@/store/useUserStore';
import { CommentNode } from './CommentNode';
import type { CommentTreeNode } from './markdown';

export interface ForumAuthor {
  id?: string;
  name?: string;
  userName?: string;
  avatarUrl?: string | null;
  college?: string | null;
  branch?: string | null;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  author?: ForumAuthor | null;
  comments?: { id: string; content: string; parentId?: string | null; createdAt: string; author?: ForumAuthor | null }[];
  commentCount?: number;
  score?: number;
  userVote?: number;
  upvoteCount?: number;
  isUpvoted?: boolean;
}

interface CompanyExperiencesTabProps {
  selectedCompany: string;
  loggedInUser: User | null;
  formatDate: (dateString: string) => string;
  renderPostContent: (content: string) => string;
  commentTree: CommentTreeNode[];

  creatingExperience: boolean;
  setCreatingExperience: (v: boolean) => void;
  publishExperience: (data: { title: string; content: string; tags: string[] }) => Promise<void> | void;

  selectedExperience: ForumPost | null;
  setSelectedExperience: (v: ForumPost | null) => void;
  fetchExperienceDetail: (id: string) => void;
  handleVote: (e: React.MouseEvent, postId: string, value: number) => void;
  handleDeletePost: (postId: string) => void;
  handleDeleteComment: (commentId: string) => void;
  handleAddCommentOrReply: (parentId: string | null, content: string) => Promise<void> | void;

  commentContent: string;
  setCommentContent: (v: string) => void;
  submittingComment: boolean;
  handleAddTopComment: (e: React.FormEvent) => void;

  experienceSearchInput: string;
  setExperienceSearchInput: (v: string) => void;
  loadingExperiences: boolean;
  filteredExperiences: ForumPost[];
}

export function CompanyExperiencesTab({
  selectedCompany,
  loggedInUser,
  formatDate,
  renderPostContent,
  commentTree,

  creatingExperience,
  setCreatingExperience,
  publishExperience,

  selectedExperience,
  setSelectedExperience,
  fetchExperienceDetail,
  handleVote,
  handleDeletePost,
  handleDeleteComment,
  handleAddCommentOrReply,

  commentContent,
  setCommentContent,
  submittingComment,
  handleAddTopComment,

  experienceSearchInput,
  setExperienceSearchInput,
  loadingExperiences,
  filteredExperiences,
}: CompanyExperiencesTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {creatingExperience ? (
        <CreateExperienceFullPage
          company={selectedCompany}
          onPublish={publishExperience}
          onCancel={() => setCreatingExperience(false)}
        />
      ) : selectedExperience ? (
        // ─── Detailed Experience View ───
        <div className="space-y-6 animate-fadeIn">
          <Button
            onClick={() => setSelectedExperience(null)}
            variant="outline"
            size="sm"
            className="rounded-xl border-neutral-900 text-neutral-400 hover:text-white flex items-center gap-2 cursor-pointer font-mono uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Experiences
          </Button>

          <Card
            variant="default"
            animated={false}
            className="rounded-2xl p-6 md:p-8 space-y-6 border-neutral-900 bg-neutral-950/20"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
              <div
                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all"
                onClick={() => {
                  if (selectedExperience.author?.userName)
                    router.push(`/profile/${selectedExperience.author.userName}`);
                }}
              >
                <img
                  src={
                    selectedExperience.author?.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedExperience.author?.name || 'Anonymous'}`
                  }
                  alt="avatar"
                  className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-900 p-0.5"
                />
                <div>
                  <h4 className="text-white font-extrabold text-base leading-snug">
                    {selectedExperience.author?.name || 'Anonymous'}
                  </h4>
                  <p className="text-neutral-500 text-xs font-semibold mt-1">
                    {selectedExperience.author?.college || 'NSUT'} •{' '}
                    {selectedExperience.author?.branch || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold font-mono">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedExperience.createdAt)}
                </div>
                {(loggedInUser?.id === selectedExperience.author?.id ||
                  loggedInUser?.role === 'admin') && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to delete this experience post? This will delete all comments and cannot be undone.',
                        )
                      ) {
                        handleDeletePost(selectedExperience.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-400 p-2 rounded-xl bg-neutral-950 border border-neutral-900/60 hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                    title="Delete Experience"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Title & Tags */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {selectedExperience.title}
              </h1>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedExperience.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-neutral-950 text-[#35b9f1] border border-neutral-900 font-bold text-xs px-2.5 py-0.5 rounded-lg"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Post Content */}
            <div
              className="wysiwyg-content text-[#E5E7EB] text-base leading-relaxed font-medium border-b border-neutral-900 pb-6"
              dangerouslySetInnerHTML={{ __html: renderPostContent(selectedExperience.content) }}
            />

            {/* Voting & Footer info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-neutral-950 border border-neutral-900 rounded-xl p-1 gap-1">
                <button
                  onClick={(e) => handleVote(e, selectedExperience.id, 1)}
                  className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedExperience.userVote === 1
                      ? 'text-[#35b9f1] bg-[#35b9f1]/10'
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                  }`}
                  title="Upvote"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>

                <span
                  className={`px-2 font-mono font-bold text-sm min-w-[20px] text-center ${
                    selectedExperience.userVote === 1
                      ? 'text-[#35b9f1]'
                      : selectedExperience.userVote === -1
                        ? 'text-red-500'
                        : 'text-[#E5E7EB]'
                  }`}
                >
                  {selectedExperience.score || 0}
                </span>

                <button
                  onClick={(e) => handleVote(e, selectedExperience.id, -1)}
                  className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedExperience.userVote === -1
                      ? 'text-red-500 bg-red-500/10'
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                  }`}
                  title="Downvote"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-neutral-500 text-sm font-semibold font-mono pl-2">
                <MessageSquare className="w-4 h-4" />
                {selectedExperience.comments?.length || 0} Comments
              </div>
            </div>

            {/* Comments Area */}
            <div className="space-y-6 pt-6 border-t border-neutral-900">
              <h3 className="text-lg font-extrabold text-white">Comments</h3>

              {/* Comment submission form */}
              <form onSubmit={handleAddTopComment} className="flex gap-4">
                <textarea
                  placeholder="Share your thoughts or ask a question..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 min-h-[48px] max-h-[160px] bg-neutral-950 border border-neutral-900 rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-neutral-600 focus:outline-none focus:border-[#35b9f1]/30 transition-all"
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 flex items-center justify-center cursor-pointer transition-all self-end h-[48px]"
                >
                  {submittingComment ? 'Posting...' : <Send className="w-4 h-4" />}
                </Button>
              </form>

              {/* Comments list */}
              <div className="space-y-6 pt-2">
                {commentTree && commentTree.length > 0 ? (
                  commentTree.map((comment) => (
                    <CommentNode
                      key={comment.id}
                      comment={comment}
                      onAddReply={handleAddCommentOrReply}
                      onDeleteComment={handleDeleteComment}
                      formatDate={formatDate}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 bg-neutral-950/20 border border-dashed border-neutral-900 rounded-xl">
                    <p className="text-neutral-600 font-mono text-xs">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        // ─── Experiences List View ───
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Input
              type="text"
              placeholder="Search experiences..."
              value={experienceSearchInput}
              onChange={(e) => setExperienceSearchInput(e.target.value)}
              icon={Search}
              className="w-full md:w-80"
              inputClassName="py-2.5 bg-neutral-950 border-neutral-900 rounded-xl placeholder-neutral-600 text-white"
            />

            <Button
              onClick={() => setCreatingExperience(true)}
              className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-5 h-5" />
              Share Experience
            </Button>
          </div>

          {loadingExperiences ? (
            <div className="text-center py-20 font-mono text-neutral-500 uppercase tracking-widest text-xs">
              Loading Experiences...
            </div>
          ) : filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExperiences.map((post) => (
                <Card
                  key={post.id}
                  variant="default"
                  onClick={() => fetchExperienceDetail(post.id)}
                  className="p-6 flex flex-col justify-between cursor-pointer hover:border-[#35b9f1]/20 rounded-2xl w-full h-auto bg-neutral-950/20 border-neutral-900"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
                        onClick={(e) => {
                          if (post.author?.userName) {
                            e.stopPropagation();
                            router.push(`/profile/${post.author.userName}`);
                          }
                        }}
                      >
                        <img
                          src={
                            post.author?.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'Anonymous'}`
                          }
                          alt="avatar"
                          className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-900 p-0.5"
                        />
                        <div>
                          <span className="text-white font-bold text-sm block leading-none">
                            {post.author?.name || 'Anonymous'}
                          </span>
                          <span className="text-neutral-500 text-[10px] font-bold mt-1 block">
                            {post.author?.college || 'NSUT'} • {post.author?.branch || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <span className="text-neutral-600 text-[10px] font-mono">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-base leading-snug hover:text-[#35b9f1] transition-all">
                        {post.title}
                      </h3>
                      <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3 font-medium">
                        {post.content?.replace(/<[^>]*>/g, '').replace(/[#*`_[\]()]/g, '').slice(0, 200)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-900/60 pt-4 mt-5">
                    <div className="flex items-center gap-1.5 bg-neutral-950/50 border border-neutral-900 rounded-lg py-1 px-2">
                      <button
                        onClick={(e) => handleVote(e, post.id, 1)}
                        className={`p-0.5 rounded transition-all duration-200 cursor-pointer ${
                          post.userVote === 1 ? 'text-[#35b9f1]' : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono font-bold text-neutral-300 min-w-[12px] text-center">
                        {post.score || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-neutral-500 font-mono text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {post.commentCount || 0}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-neutral-900 rounded-2xl bg-neutral-950/5 font-mono">
              <div className="w-16 h-16 border border-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-6 bg-neutral-950/10">
                <MessageSquare className="w-6 h-6 text-neutral-600" />
              </div>
              <p className="text-neutral-500 text-xs tracking-widest uppercase mb-2">
                No Experiences
              </p>
              <p className="text-neutral-600 text-sm mb-6">
                Interview experiences for {selectedCompany} will appear here.
              </p>
              <Button
                onClick={() => setCreatingExperience(true)}
                className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 py-2.5 text-xs cursor-pointer shadow-lg transition-all"
              >
                Share your experience
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
