"use client";

import { useEffect, useState, useTransition } from "react";
import { ALLOWED_EMOJIS } from "@/lib/constants";
import { toggleReaction } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";
import { useToast } from "./toast-provider";
import { Spinner } from "./ui/spinner";

type Reaction = {
  id: string;
  emoji: string | null;
  text: string | null;
  author: { id: string; displayName: string; username: string };
};

export function EmojiReactions({
  target,
  reactions: initialReactions,
  currentUserId,
  favoriteEmojis,
}: {
  target: { postId: string } | { commentId: string };
  reactions: Reaction[];
  currentUserId: string;
  favoriteEmojis?: string[];
}) {
  const [reactions, setReactions] = useState(initialReactions);
  const [pending, startTransition] = useTransition();
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState("");
  const [poppedEmoji, setPoppedEmoji] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  const mine = reactions.find((r) => r.author.id === currentUserId);
  const emojis = favoriteEmojis?.length
    ? [...new Set([...favoriteEmojis, ...ALLOWED_EMOJIS])].slice(0, 8)
    : [...ALLOWED_EMOJIS];

  const grouped = reactions.reduce<Record<string, { count: number; authors: string[] }>>((acc, r) => {
    const key = r.emoji || r.text || "?";
    if (!acc[key]) acc[key] = { count: 0, authors: [] };
    acc[key].count++;
    acc[key].authors.push(r.author.displayName);
    return acc;
  }, {});

  function react(emoji: string) {
    setPoppedEmoji(emoji);
    setTimeout(() => setPoppedEmoji(null), 400);

    const prev = reactions;
    const existing = reactions.find((r) => r.author.id === currentUserId);
    if (existing?.emoji === emoji) {
      setReactions(reactions.filter((r) => r.author.id !== currentUserId));
    } else {
      const filtered = reactions.filter((r) => r.author.id !== currentUserId);
      setReactions([
        ...filtered,
        {
          id: "optimistic",
          emoji,
          text: null,
          author: { id: currentUserId, displayName: "את/ה", username: "" },
        },
      ]);
    }

    startTransition(async () => {
      const result = await toggleReaction(target, emoji);
      if (!result.ok) {
        setReactions(prev);
        toast(result.error, "error");
      }
    });
  }

  function submitText() {
    if (!text.trim()) return;
    const val = text.trim();
    const prev = reactions;

    setReactions([
      ...reactions.filter((r) => r.author.id !== currentUserId),
      {
        id: "optimistic",
        emoji: null,
        text: val,
        author: { id: currentUserId, displayName: "את/ה", username: "" },
      },
    ]);
    setText("");
    setShowText(false);

    startTransition(async () => {
      const result = await toggleReaction(target, undefined, val);
      if (!result.ok) {
        setReactions(prev);
        toast(result.error, "error");
      }
    });
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            disabled={pending}
            onClick={() => react(emoji)}
            className={cn(
              "relative rounded-full px-2.5 py-1 text-lg transition-all duration-200 interactive-scale",
              "hover:bg-violet-500/10",
              mine?.emoji === emoji &&
                "bg-violet-500/15 ring-2 ring-violet-400/60 shadow-sm shadow-violet-500/20",
              poppedEmoji === emoji && "animate-pop"
            )}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowText(!showText)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            showText
              ? "bg-violet-500/15 text-violet-600"
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          {showText ? "סגור" : "+ טקסט"}
        </button>
        {pending && <Spinner size="sm" className="text-violet-500 mr-1" />}
      </div>

      {showText && (
        <div className="flex gap-2 animate-slide-up">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={40}
            placeholder="תגובה קצרה..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && submitText()}
            className="flex-1 rounded-xl border border-zinc-200/80 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={submitText}
            disabled={pending || !text.trim()}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            שליחה
          </button>
        </div>
      )}

      {Object.keys(grouped).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(grouped).map(([key, { count, authors }]) => (
            <span
              key={key}
              title={authors.join(", ")}
              className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-500/15 dark:text-violet-300"
            >
              <span className="text-sm">{key}</span>
              <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px]">{count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
