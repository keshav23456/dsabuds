'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Card, Badge } from '@/components/common';
import { VoteButtons } from './VoteButtons';
import { formatDate, getPostPreviewText } from './markdown';
import type { ForumPost } from './types';

interface PostCardProps {
  post: ForumPost;
  onOpen: (id: string) => void;
  onVote: (e: React.MouseEvent, postId: string, value: number) => void;
}

export function PostCard({ post, onOpen, onVote }: PostCardProps) {
  const router = useRouter();

  return (
    <Card
      variant="default"
      onClick={() => onOpen(post.id)}
      className="p-6 flex flex-col justify-between cursor-pointer hover:border-[#35b9f1]/20 rounded-2xl w-full h-auto"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              if (post.author?.userName) {
                e.stopPropagation();
                router.push(`/profile/${post.author.userName}`);
              }
            }}
          >
            <img
              src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'Anonymous'}`}
              alt="avatar"
              className="w-9 h-9 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5"
            />
            <div>
              <span className="text-white font-bold text-sm block leading-none">
                {post.author?.name || 'Anonymous'}
              </span>
              <span className="text-[#6B7280] text-[10px] font-bold mt-1 block">
                {post.author?.college || 'NSUT'}
              </span>
            </div>
          </div>
          <span className="text-[#6B7280] text-[10px] font-mono font-bold">
            {formatDate(post.createdAt)}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-white font-bold text-lg leading-snug group-hover:text-[#35b9f1] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-[#9CA3AF] text-sm leading-relaxed line-clamp-3 font-medium">
            {getPostPreviewText(post.content)}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-[#1F2937] pt-4 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {post.tags?.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              className="bg-[#0D1117] text-[#9CA3AF] border border-[#1F2937] text-[10px] font-bold px-2 py-0.5"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VoteButtons
              score={post.score || 0}
              userVote={post.userVote}
              onVote={(e, value) => onVote(e, post.id, value)}
              size="sm"
            />
            <div className="flex items-center gap-1.5 text-[#6B7280] text-xs font-semibold font-mono">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentCount || 0}
            </div>
          </div>

          <span className="text-[#35b9f1] text-xs font-extrabold group-hover:underline flex items-center gap-1">
            Read Experience
          </span>
        </div>
      </div>
    </Card>
  );
}
