'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Card, Button, Input } from '@/components/common';
import { useUserStore } from '@/store/useUserStore';
import type { CommentTreeNode } from './markdown';

function countAllReplies(node: CommentTreeNode): number {
  let count = 0;
  if (node.replies) {
    count += node.replies.length;
    node.replies.forEach((reply) => {
      count += countAllReplies(reply);
    });
  }
  return count;
}

interface CommentNodeProps {
  comment: CommentTreeNode;
  depth?: number;
  onAddReply: (parentId: string, content: string) => Promise<void> | void;
  onDeleteComment: (commentId: string) => Promise<void> | void;
  formatDate: (dateString: string) => string;
}

export function CommentNode({
  comment,
  depth = 0,
  onAddReply,
  onDeleteComment,
  formatDate,
}: CommentNodeProps) {
  const router = useRouter();
  const loggedInUser = useUserStore((state) => state.user);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await onAddReply(comment.id, replyContent);
    setReplyContent('');
    setReplying(false);
  };

  const totalReplies = countAllReplies(comment);

  return (
    <div className="space-y-3 relative" style={{ marginLeft: depth > 0 ? '1.5rem' : '0px' }}>
      {depth > 0 && (
        <div className="absolute top-0 bottom-0 -left-3 w-0.5 bg-[#1F2937] pointer-events-none" />
      )}

      {collapsed ? (
        <div className="bg-[#0D1117]/30 border border-[#1F2937]/50 rounded-xl p-3 flex items-center justify-between hover:border-[#35b9f1]/10 transition-all duration-300">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (comment.author?.userName) router.push(`/profile/${comment.author.userName}`);
            }}
          >
            <img
              src={
                comment.author?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name || 'Anonymous'}`
              }
              alt="avatar"
              className="w-6 h-6 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5 opacity-50"
            />
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280] font-bold text-xs">
                {comment.author?.name || 'Anonymous'}
              </span>
              <span className="text-[#4B5563] text-[9px] font-bold">
                {comment.author?.college || 'NSUT'} • {comment.author?.branch || 'N/A'}
              </span>
              <span className="text-[#4B5563] text-xs font-semibold">
                (Collapsed {totalReplies > 0 ? `• ${totalReplies} replies hidden` : ''})
              </span>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="text-[#35b9f1] hover:text-[#6fd3ff] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg bg-[#1F2937]/30 hover:bg-[#1F2937]/50"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Expand
          </button>
        </div>
      ) : (
        <>
          <Card
            variant="accent"
            animated={false}
            className="p-5 space-y-3 relative hover:border-[#35b9f1]/10 transition-all duration-300 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (comment.author?.userName) router.push(`/profile/${comment.author.userName}`);
                }}
              >
                <img
                  src={
                    comment.author?.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name || 'Anonymous'}`
                  }
                  alt="avatar"
                  className="w-8 h-8 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5"
                />
                <div>
                  <span className="text-white font-bold text-sm block leading-none">
                    {comment.author?.name || 'Anonymous'}
                  </span>
                  <span className="text-[#6B7280] text-[10px] font-bold mt-1.5 block">
                    {comment.author?.college || 'NSUT'} • {comment.author?.branch || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#6B7280] text-[10px] font-mono font-bold">
                  {formatDate(comment.createdAt)}
                </span>
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-[#6B7280] hover:text-[#35b9f1] p-1 rounded-lg hover:bg-[#1F2937] transition-all cursor-pointer"
                  title="Collapse thread"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[#9CA3AF] text-sm leading-relaxed font-medium pl-11">
              {comment.content}
            </p>

            {/* Reply Action Row */}
            <div className="pl-11 pt-1 flex items-center gap-4">
              <button
                onClick={() => setReplying(!replying)}
                className="text-[#35b9f1] hover:text-[#6fd3ff] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
              {(loggedInUser?.id === comment.author?.id || loggedInUser?.role === 'admin') && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this comment?')) {
                      onDeleteComment(comment.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>

            {/* Inline Reply Input */}
            {replying && (
              <form onSubmit={handleReplySubmit} className="pl-11 pt-2 flex gap-3 items-center">
                <Input
                  type="text"
                  placeholder={`Reply to ${comment.author?.name || 'Anonymous'}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1"
                  inputClassName="py-2 text-xs border-[#1F2937]/30 bg-[#0D1117] rounded-lg"
                  autoFocus
                />
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    onClick={() => setReplying(false)}
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 rounded-lg border-[#1F2937] text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!replyContent.trim()}
                    variant="accent"
                    size="sm"
                    className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Render nested replies recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 pt-1">
              {comment.replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onAddReply={onAddReply}
                  onDeleteComment={onDeleteComment}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
