'use client';

import { useRouter } from 'next/navigation';
import { Calendar, MessageSquare, Send, Trash2, Pencil, ArrowLeft } from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/common';
import { useUserStore } from '@/store/useUserStore';
import { VoteButtons } from './VoteButtons';
import { CommentNode } from './CommentNode';
import { buildCommentTree, formatDate, renderPostContent } from './markdown';
import type { ForumPost } from './types';

interface PostDetailProps {
  post: ForumPost;
  commentContent: string;
  onCommentContentChange: (value: string) => void;
  submittingComment: boolean;
  onBack: () => void;
  onVote: (e: React.MouseEvent, postId: string, value: number) => void;
  onEdit: (post: ForumPost) => void;
  onDelete: (postId: string) => void;
  onTagClick: (tag: string) => void;
  onAddComment: (e: React.FormEvent) => void;
  onAddReply: (parentId: string, content: string) => Promise<void> | void;
  onDeleteComment: (commentId: string) => Promise<void> | void;
}

export function PostDetail({
  post,
  commentContent,
  onCommentContentChange,
  submittingComment,
  onBack,
  onVote,
  onEdit,
  onDelete,
  onTagClick,
  onAddComment,
  onAddReply,
  onDeleteComment,
}: PostDetailProps) {
  const router = useRouter();
  const loggedInUser = useUserStore((state) => state.user);
  const commentTree = buildCommentTree(post.comments);

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="outline"
        size="sm"
        className="text-[#9CA3AF] hover:text-white border-none bg-transparent hover:bg-neutral-900/40 px-3 py-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Forum
      </Button>

      <Card variant="default" animated={false} className="rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F2937] pb-6">
          <div
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (post.author?.userName) router.push(`/profile/${post.author.userName}`);
            }}
          >
            <img
              src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'Anonymous'}`}
              alt="avatar"
              className="w-12 h-12 rounded-xl bg-[#0D1117] border border-[#1F2937] p-0.5"
            />
            <div>
              <h4 className="text-white font-extrabold text-base leading-snug">
                {post.author?.name || 'Anonymous'}
              </h4>
              <p className="text-[#6B7280] text-xs font-semibold mt-0.5">
                {post.author?.college || 'NSUT'} • {post.author?.branch || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-semibold font-mono">
              <Calendar className="w-4 h-4" />
              {formatDate(post.createdAt)}
            </div>
            {loggedInUser?.id === post.author?.id && (
              <button
                onClick={() => onEdit(post)}
                className="text-[#9CA3AF] hover:text-white p-2 rounded-xl bg-[#0D1117] border border-[#1F2937] hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                title="Edit Post"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            )}
            {(loggedInUser?.id === post.author?.id || loggedInUser?.role === 'admin') && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this experience post? This will delete all comments and cannot be undone.')) {
                    onDelete(post.id);
                  }
                }}
                className="text-red-500 hover:text-red-400 p-2 rounded-xl bg-[#0D1117] border border-[#1F2937] hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags?.map((tag) => (
              <button key={tag} type="button" onClick={() => onTagClick(tag)} className="cursor-pointer">
                <Badge className="bg-[#0D1117] hover:bg-[#1F2937] cursor-pointer text-[#35b9f1] border border-[#1F2937] font-bold text-xs px-2.5 py-0.5">
                  #{tag}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div
          className="text-[#E5E7EB] text-sm leading-relaxed space-y-4 font-medium"
          dangerouslySetInnerHTML={{ __html: renderPostContent(post.content) }}
        />

        <div className="flex items-center gap-4 border-t border-[#1F2937] pt-6 select-none">
          <VoteButtons
            score={post.score || 0}
            userVote={post.userVote}
            onVote={(e, value) => onVote(e, post.id, value)}
          />
          <div className="flex items-center gap-2 text-[#9CA3AF] text-sm font-semibold font-mono bg-[#0D1117] border border-[#1F2937] rounded-xl px-4 py-2">
            <MessageSquare className="w-4 h-4" />
            {post.comments?.length || 0} Comments
          </div>
        </div>
      </Card>

      <Card variant="default" animated={false} className="rounded-2xl p-6 md:p-8 space-y-6">
        <h3 className="text-white font-extrabold text-lg">Discussion</h3>

        <form onSubmit={onAddComment} className="flex gap-4">
          <img
            src={loggedInUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${loggedInUser?.name || 'User'}`}
            alt="my avatar"
            className="w-9 h-9 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5 shrink-0"
          />
          <div className="flex-1 flex gap-3">
            <Input
              type="text"
              placeholder="Share your thoughts or ask a question..."
              value={commentContent}
              onChange={(e) => onCommentContentChange(e.target.value)}
              className="flex-1"
              inputClassName="py-2.5 bg-[#0D1117] border-[#1F2937] rounded-xl focus:border-[#35b9f1]/30"
              required
            />
            <Button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              variant="accent"
              className="rounded-xl px-5 h-[42px] shrink-0 font-extrabold flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Comment
            </Button>
          </div>
        </form>

        <div className="border-t border-[#1F2937] pt-6">
          <div className="space-y-6">
            {commentTree.length > 0 ? (
              commentTree.map((comment) => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  onAddReply={onAddReply}
                  onDeleteComment={onDeleteComment}
                />
              ))
            ) : (
              <div className="text-center py-10 bg-[#0D1117]/30 border border-dashed border-[#1F2937] rounded-xl">
                <p className="text-[#6B7280] font-mono text-xs">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
