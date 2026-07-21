export const sanitizeUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  if (!/^(https?:)?\/\//i.test(trimmed) && !/^[./#]/i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

export const escapeAttr = (str?: string): string => {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

export const parseMarkdownToHTML = (text?: string): string => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-white text-lg font-bold mt-4 mb-2 ">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-white text-xl font-bold mt-4 mb-2 ">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-white text-2xl font-bold mt-4 mb-2 ">$1</h1>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-[#0D1117] border border-[#1F2937] rounded-xl p-4 font-mono text-xs my-4 overflow-x-auto text-gray-300">$1</pre>');
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-[#0D1117] border border-[#1F2937] rounded px-1.5 py-0.5 font-mono text-xs text-[#FF453A]">$1</code>');
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return '[Invalid Image URL]';
    return `<div class="my-4 flex justify-center"><img src="${escapeAttr(safeUrl)}" alt="${escapeAttr(alt)}" class="max-w-full rounded-xl object-contain max-h-[400px] border border-[#1F2937] shadow-lg" /></div>`;
  });
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return text;
    return `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="text-[#35b9f1] hover:underline">${text}</a>`;
  });
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([\s\S]*?)_/g, '<em>$1</em>');
  html = html.replace(/^\s*[-*+]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-gray-300 ">$1</li>');
  html = html.replace(/\n/g, '<br />');
  return html;
};

export interface FlatComment {
  id: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  author?: {
    id?: string;
    name?: string;
    userName?: string;
    avatarUrl?: string | null;
    college?: string | null;
    branch?: string | null;
  } | null;
}

export interface CommentTreeNode extends FlatComment {
  replies: CommentTreeNode[];
}

export const buildCommentTree = (flatComments?: FlatComment[]): CommentTreeNode[] => {
  if (!flatComments) return [];
  const map: Record<string, CommentTreeNode> = {};
  const tree: CommentTreeNode[] = [];
  flatComments.forEach((comment) => {
    map[comment.id] = { ...comment, replies: [] };
  });
  flatComments.forEach((comment) => {
    if (comment.parentId && map[comment.parentId]) {
      map[comment.parentId].replies.push(map[comment.id]);
    } else {
      tree.push(map[comment.id]);
    }
  });
  return tree;
};
