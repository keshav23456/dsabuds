'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { forumService } from '@/services/forumService';
import { Button, Card, CreateExperienceFullPage } from '@/components/common';
import { getErrorMessage } from '@/utils';
import { PostCard } from '@/components/dashboard/forum/PostCard';
import { PostDetail } from '@/components/dashboard/forum/PostDetail';
import { SearchAndFilters } from '@/components/dashboard/forum/SearchAndFilters';
import type { ForumPost } from '@/components/dashboard/forum/types';

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const [selectedTag, setSelectedTag] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedTag) filters.tag = selectedTag;

      const data = (await forumService.getPosts(filters)) as unknown as { posts: ForumPost[] };
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch forum posts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const fetchPostDetail = async (id: string) => {
    try {
      setLoading(true);
      const data = (await forumService.getPost(id)) as unknown as { post: ForumPost };
      setSelectedPost(data.post);
    } catch (err) {
      console.error('Failed to fetch post details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e: React.MouseEvent, postId: string, value: number) => {
    e.stopPropagation();
    try {
      const data = (await forumService.votePost(postId, value)) as unknown as { userVote: number; score: number };

      setSelectedPost((prev) =>
        prev && prev.id === postId
          ? { ...prev, userVote: data.userVote, score: data.score, upvoteCount: data.score, isUpvoted: data.userVote === 1 }
          : prev
      );

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, userVote: data.userVote, score: data.score, upvoteCount: data.score, isUpvoted: data.userVote === 1 }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to update vote:', err);
    }
  };

  const handleEditClick = (post: ForumPost) => {
    setEditingPostId(post.id);
    setPostTitle(post.title || '');
    setPostContent(post.content || '');
    setPostTags(Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''));
    setShowCreateModal(true);
  };

  const handleNewPostClick = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostContent('');
    setPostTags('');
    setShowCreateModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await forumService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedPost(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost) return;
    try {
      await forumService.deleteComment(commentId);

      const getDescendantIds = (cId: string, allComments: { id: string; parentId: string | null }[]): string[] => {
        const directChildren = allComments.filter((c) => c.parentId === cId);
        let ids = [cId];
        for (const child of directChildren) {
          ids = [...ids, ...getDescendantIds(child.id, allComments)];
        }
        return ids;
      };

      const descendantIds = getDescendantIds(commentId, selectedPost.comments || []);
      const countDeleted = descendantIds.length;

      setSelectedPost((prev) =>
        prev
          ? { ...prev, comments: (prev.comments || []).filter((c) => !descendantIds.includes(c.id)) }
          : prev
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - countDeleted) }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleAddCommentOrReply = async (parentId: string | null, content: string) => {
    if (!selectedPost) return;
    try {
      const data = (await forumService.addComment(selectedPost.id, { content, parentId })) as unknown as {
        comment: NonNullable<ForumPost['comments']>[number];
      };

      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), data.comment] } : prev
      );

      setPosts((prev) =>
        prev.map((p) => (p.id === selectedPost.id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to add comment/reply:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      await handleAddCommentOrReply(null, commentContent);
      setCommentContent('');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (showCreateModal) {
    return (
      <CreateExperienceFullPage
        initialTitle={postTitle}
        initialContent={postContent}
        initialTags={postTags ? postTags.split(',').map((t) => t.trim()).filter(Boolean) : []}
        onPublish={async ({ title, content, tags }) => {
          try {
            setSubmittingPost(true);
            if (editingPostId) {
              const data = (await forumService.updatePost(editingPostId, { title, content, tags })) as unknown as {
                post: ForumPost;
              };
              setPosts((prev) => prev.map((p) => (p.id === editingPostId ? data.post : p)));
              setSelectedPost(data.post);
            } else {
              const data = (await forumService.createPost({ title, content, tags })) as unknown as {
                post: ForumPost;
              };
              setPosts((prev) => [data.post, ...prev]);
            }
            setShowCreateModal(false);
            setEditingPostId(null);
            setPostTitle('');
            setPostContent('');
            setPostTags('');
          } catch (err) {
            console.error(err);
            throw new Error(getErrorMessage(err));
          } finally {
            setSubmittingPost(false);
          }
        }}
        onCancel={() => {
          setShowCreateModal(false);
          setEditingPostId(null);
          setPostTitle('');
          setPostContent('');
          setPostTags('');
        }}
      />
    );
  }

  if (selectedPost) {
    return (
      <div className="space-y-8 pb-16">
        <PostDetail
          post={selectedPost}
          commentContent={commentContent}
          onCommentContentChange={setCommentContent}
          submittingComment={submittingComment}
          onBack={() => {
            setSelectedPost(null);
            fetchPosts();
          }}
          onVote={handleVote}
          onEdit={handleEditClick}
          onDelete={handleDeletePost}
          onTagClick={(tag) => {
            setSelectedTag(tag);
            setSelectedPost(null);
          }}
          onAddComment={handleAddComment}
          onAddReply={handleAddCommentOrReply}
          onDeleteComment={handleDeleteComment}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-8">
        <Card variant="default" animated={false} className="rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-lg border-[#1F2937]">
          <div className="absolute inset-0 bg-[#0D1117]/10 backdrop-blur-[2px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#35b9f1]/10 via-[#35b9f1]/3 to-transparent opacity-30 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-white text-4xl font-normal italic mb-2 font-serif">
                Interview Experiences Forum
              </h1>
              <p className="text-[#9CA3AF] text-sm font-medium">
                Read, search, and share real placement and internship interview journeys from students.
              </p>
            </div>
            <Button
              onClick={handleNewPostClick}
              className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[#35b9f1]/10 transition-all"
            >
              <Plus className="w-5 h-5" />
              Share Experience
            </Button>
          </div>
        </Card>

        <SearchAndFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          selectedTag={selectedTag}
          onSelectedTagChange={setSelectedTag}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={fetchPostDetail} onVote={handleVote} />
          ))}

          {loading && (
            <div className="col-span-full py-16 flex items-center justify-center text-[#9CA3AF] font-mono text-sm">
              Loading forum experiences...
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="col-span-full text-center py-20 bg-[#161B22]/30 rounded-2xl border border-dashed border-[#1F2937]">
              <p className="text-[#6B7280] font-mono text-sm">No experiences found matching filters.</p>
              <Button
                onClick={handleNewPostClick}
                className="mt-4 bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-4 py-2 transition-all text-xs"
              >
                Share Your Experience
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
