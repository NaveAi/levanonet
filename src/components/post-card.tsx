"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar } from "./avatar";
import { PostImage } from "./post-image";
import { EmojiReactions } from "./emoji-reactions";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { formatRelativeTime } from "@/lib/utils";
import { addComment, deletePost } from "@/lib/actions/posts";
import { Button } from "./ui/button";
import { Trash2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type PostData = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: { id: string; username: string; displayName: string; avatarUrl: string | null };
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: { id: string; username: string; displayName: string; avatarUrl: string | null };
    reactions: Array<{
      id: string;
      emoji: string | null;
      text: string | null;
      author: { id: string; displayName: string; username: string };
    }>;
  }>;
  reactions: Array<{
    id: string;
    emoji: string | null;
    text: string | null;
    author: { id: string; displayName: string; username: string };
  }>;
};

export function PostCard({
  post,
  currentUserId,
  isAdmin,
  favoriteEmojis,
  imagePriority = false,
}: {
  post: PostData;
  currentUserId: string;
  isAdmin: boolean;
  favoriteEmojis?: string[];
  /** First visible post image — improves LCP */
  imagePriority?: boolean;
}) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(post.comments.length > 0);
  const [showDelete, setShowDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const canDelete = post.author.id === currentUserId || isAdmin;

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    const text = comment.trim();
    setComment("");
    startTransition(async () => {
      const result = await addComment(post.id, text);
      if (!result.ok) {
        toast(result.error, "error");
        setComment(text);
      } else {
        toast("התגובה פורסמה!", "success");
        setShowComments(true);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.ok) toast("הפוסט נמחק", "success");
      else toast(result.error, "error");
      setShowDelete(false);
    });
  }

  const reactionCount = post.reactions.length;

  return (
    <>
      <article className="glass-card animate-slide-up rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5">
        <header className="flex items-start justify-between gap-2">
          <Link
            href={`/profile/${post.author.username}`}
            className="group flex items-center gap-3 interactive-scale"
          >
            <Avatar src={post.author.avatarUrl} name={post.author.displayName} />
            <div>
              <p className="font-bold text-zinc-900 transition group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400">
                {post.author.displayName}
              </p>
              <p className="text-xs text-zinc-500">
                @{post.author.username} · {formatRelativeTime(new Date(post.createdAt))}
              </p>
            </div>
          </Link>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={pending}
              className="opacity-60 hover:opacity-100 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </header>

        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-violet-500/10">
            <PostImage
              src={post.imageUrl}
              alt="תמונה בפוסט"
              priority={imagePriority}
              className="transition duration-500 hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="mt-4 border-t border-violet-500/10 pt-4">
          <EmojiReactions
            target={{ postId: post.id }}
            reactions={post.reactions}
            currentUserId={currentUserId}
            favoriteEmojis={favoriteEmojis}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          {post.comments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-violet-600"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments.length} תגובות
              {showComments ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          {reactionCount > 0 && (
            <span className="text-xs text-zinc-400">{reactionCount} תגובות רגש</span>
          )}
        </div>

        {showComments && post.comments.length > 0 && (
          <ul className="mt-3 space-y-2.5 animate-slide-up">
            {post.comments.map((c) => (
              <li key={c.id} className="flex gap-2.5">
                <Avatar src={c.author.avatarUrl} name={c.author.displayName} size="sm" />
                <div className="flex-1 rounded-2xl bg-violet-500/5 px-3.5 py-2.5 ring-1 ring-violet-500/10 dark:bg-violet-500/10">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{c.author.displayName}</p>
                    <p className="text-[10px] text-zinc-400">{formatRelativeTime(new Date(c.createdAt))}</p>
                  </div>
                  <p className="mt-0.5 text-sm">{c.content}</p>
                  <div className="mt-2">
                    <EmojiReactions
                      target={{ commentId: c.id }}
                      reactions={c.reactions}
                      currentUserId={currentUserId}
                      favoriteEmojis={favoriteEmojis}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submitComment} className="mt-4 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="כתבו תגובה..."
            maxLength={120}
            className={cn(
              "flex-1 rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-2.5 text-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400",
              "dark:border-zinc-700 dark:bg-zinc-900/80"
            )}
          />
          <Button type="submit" size="sm" loading={pending} disabled={!comment.trim()}>
            שליחה
          </Button>
        </form>
      </article>

      <ConfirmDialog
        open={showDelete}
        title="מחיקת פוסט"
        description="הפוסט והתגובות שלו יימחקו לצמיתות. להמשיך?"
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
