"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  toggleBan,
  setUserRole,
  adminDeletePost,
  adminDeleteComment,
} from "@/lib/actions/admin";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Shield,
  Users,
  FileText,
  MessageSquare,
  LayoutDashboard,
  Search,
  Copy,
  Ban,
  UserCog,
  Trash2,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";

type Tab = "overview" | "users" | "posts" | "comments";

type UserRow = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: Date;
  _count: { posts: number };
};

type PostRow = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: { displayName: string; username: string };
  _count: { comments: number; reactions: number };
};

type CommentRow = {
  id: string;
  content: string;
  createdAt: Date;
  author: { displayName: string; username: string };
  post: { id: string; content: string };
};

type Dashboard = {
  users: number;
  posts: number;
  comments: number;
  bannedUsers: number;
  admins: number;
  postsThisWeek: number;
  usersThisWeek: number;
  recentActivity: Array<{
    id: string;
    content: string;
    createdAt: Date;
    imageUrl: string | null;
    author: { displayName: string; username: string };
    _count: { comments: number };
  }>;
};

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "סקירה", icon: LayoutDashboard },
  { id: "users", label: "משתמשים", icon: Users },
  { id: "posts", label: "פוסטים", icon: FileText },
  { id: "comments", label: "תגובות", icon: MessageSquare },
];

export function AdminPanel({
  dashboard,
  users,
  posts,
  comments,
  currentUserId,
  inviteCode,
}: {
  dashboard: Dashboard;
  users: UserRow[];
  posts: PostRow[];
  comments: CommentRow[];
  currentUserId: string;
  inviteCode: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [userQuery, setUserQuery] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "active" | "banned" | "admin">("all");
  const [postQuery, setPostQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "banned" && u.banned) ||
        (userFilter === "admin" && u.role === "ADMIN") ||
        (userFilter === "active" && !u.banned);
      return matchesQuery && matchesFilter;
    });
  }, [users, userQuery, userFilter]);

  const filteredPosts = useMemo(() => {
    const q = postQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.author.displayName.toLowerCase().includes(q) ||
        p.author.username.toLowerCase().includes(q)
    );
  }, [posts, postQuery]);

  function copyInvite() {
    void navigator.clipboard.writeText(inviteCode);
    toast("קוד ההזמנה הועתק!", "success");
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-l from-violet-600/20 via-fuchsia-500/10 to-transparent px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                <Shield className="h-7 w-7" />
              </span>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">מרכז ניהול</h1>
                <p className="text-sm text-zinc-500">ניהול משתמשים, תוכן והגדרות משפחה</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="secondary" size="sm">
                חזרה לפיד
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs — גלילה אופקית במובייל */}
      <div className="sticky top-16 z-40 -mx-4 bg-[var(--background)]/90 px-4 py-2 backdrop-blur-md sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-violet-500/5 p-1 ring-1 ring-violet-500/10 scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                tab === id
                  ? "bg-white text-violet-700 shadow-sm dark:bg-zinc-800 dark:text-violet-300"
                  : "text-zinc-500 hover:text-violet-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { label: "משתמשים", value: dashboard.users, icon: Users, color: "text-violet-600" },
              { label: "פוסטים", value: dashboard.posts, icon: FileText, color: "text-fuchsia-600" },
              { label: "תגובות", value: dashboard.comments, icon: MessageSquare, color: "text-blue-600" },
              { label: "מנהלים", value: dashboard.admins, icon: Shield, color: "text-amber-600" },
              { label: "חסומים", value: dashboard.bannedUsers, icon: Ban, color: "text-red-600" },
              { label: "פוסטים השבוע", value: dashboard.postsThisWeek, icon: TrendingUp, color: "text-emerald-600" },
              { label: "חדשים השבוע", value: dashboard.usersThisWeek, icon: Users, color: "text-teal-600" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <s.icon className={cn("h-5 w-5", s.color)} />
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="mb-3 font-bold">קוד הזמנה למשפחה</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 rounded-xl bg-violet-500/10 px-4 py-3 text-center text-lg font-mono font-bold text-violet-700 dark:text-violet-300 sm:text-right">
                {inviteCode || "—"}
              </code>
              <Button variant="secondary" onClick={copyInvite} className="shrink-0">
                <Copy className="h-4 w-4 ml-1.5" />
                העתקה
              </Button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">שתפו רק עם בני המשפחה. ניתן לשנות בקובץ .env</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 font-bold">פעילות אחרונה</h2>
            <ul className="space-y-3">
              {dashboard.recentActivity.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start gap-3 rounded-xl bg-violet-500/5 p-3 ring-1 ring-violet-500/10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {p.author.displayName}{" "}
                      <span className="text-xs text-zinc-500">@{p.author.username}</span>
                    </p>
                    <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">{p.content}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatRelativeTime(new Date(p.createdAt))} · {p._count.comments} תגובות
                      {p.imageUrl && " · תמונה"}
                    </p>
                  </div>
                  {p.imageUrl && <ImageIcon className="h-5 w-5 shrink-0 text-violet-500" />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="חיפוש לפי שם, משתמש או אימייל..."
                className="pr-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "הכל"],
                  ["active", "פעילים"],
                  ["banned", "חסומים"],
                  ["admin", "מנהלים"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setUserFilter(id)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                    userFilter === id
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-zinc-500">{filteredUsers.length} משתמשים</p>

          <ul className="space-y-3">
            {filteredUsers.map((u) => (
              <li key={u.id} className="glass-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{u.displayName}</p>
                      <span className="text-sm text-violet-600">@{u.username}</span>
                      {u.role === "ADMIN" && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700">
                          מנהל
                        </span>
                      )}
                      {u.banned && (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-600">
                          חסום
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-zinc-500">{u.email}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {u._count.posts} פוסטים · הצטרף {new Date(u.createdAt).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/profile/${u.username}`}>
                      <Button variant="ghost" size="sm">
                        פרופיל
                      </Button>
                    </Link>
                    {u.id !== currentUserId && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              const r = await toggleBan(u.id);
                              toast(
                                r.ok ? (u.banned ? "החסימה בוטלה" : "המשתמש נחסם") : r.error,
                                r.ok ? "success" : "error"
                              );
                            })
                          }
                        >
                          <Ban className="h-3.5 w-3.5 ml-1" />
                          {u.banned ? "ביטול חסימה" : "חסימה"}
                        </Button>
                        {u.role !== "ADMIN" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                const r = await setUserRole(u.id, "ADMIN");
                                toast(r.ok ? "הפך למנהל" : r.error, r.ok ? "success" : "error");
                              })
                            }
                          >
                            <UserCog className="h-3.5 w-3.5 ml-1" />
                            הפוך למנהל
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                const r = await setUserRole(u.id, "MEMBER");
                                toast(r.ok ? "הוסר ממנהלים" : r.error, r.ok ? "success" : "error");
                              })
                            }
                          >
                            הסרת מנהל
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Posts */}
      {tab === "posts" && (
        <div className="space-y-4 animate-slide-up">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={postQuery}
              onChange={(e) => setPostQuery(e.target.value)}
              placeholder="חיפוש בפוסטים..."
              className="pr-10"
            />
          </div>
          <ul className="space-y-3">
            {filteredPosts.map((p) => (
              <li key={p.id} className="glass-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {p.author.displayName}{" "}
                      <Link href={`/profile/${p.author.username}`} className="text-violet-600">
                        @{p.author.username}
                      </Link>
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm">{p.content}</p>
                    <p className="mt-2 text-xs text-zinc-400">
                      {formatRelativeTime(new Date(p.createdAt))} · {p._count.comments} תגובות ·{" "}
                      {p._count.reactions} תגובות רגש
                      {p.imageUrl && " · 📷"}
                    </p>
                  </div>
                  <Button variant="danger" size="sm" disabled={pending} onClick={() => setDeletePostId(p.id)}>
                    <Trash2 className="h-3.5 w-3.5 ml-1" />
                    מחיקה
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comments */}
      {tab === "comments" && (
        <div className="space-y-4 animate-slide-up">
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="glass-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {c.author.displayName}{" "}
                      <span className="text-violet-600">@{c.author.username}</span>
                    </p>
                    <p className="mt-2 text-sm">{c.content}</p>
                    <p className="mt-2 text-xs text-zinc-400">
                      {formatRelativeTime(new Date(c.createdAt))} · על פוסט: &quot;
                      {c.post.content.slice(0, 50)}
                      {c.post.content.length > 50 ? "…" : ""}&quot;
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={pending}
                    onClick={() => setDeleteCommentId(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 ml-1" />
                    מחיקה
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={!!deletePostId}
        title="מחיקת פוסט"
        description="הפוסט והתגובות שלו יימחקו לצמיתות."
        confirmLabel="מחק"
        onConfirm={() => {
          if (!deletePostId) return;
          startTransition(async () => {
            const r = await adminDeletePost(deletePostId);
            toast(r.ok ? "הפוסט נמחק" : r.error, r.ok ? "success" : "error");
            setDeletePostId(null);
          });
        }}
        onCancel={() => setDeletePostId(null)}
      />

      <ConfirmDialog
        open={!!deleteCommentId}
        title="מחיקת תגובה"
        description="התגובה תימחק לצמיתות."
        confirmLabel="מחק"
        onConfirm={() => {
          if (!deleteCommentId) return;
          startTransition(async () => {
            const r = await adminDeleteComment(deleteCommentId);
            toast(r.ok ? "התגובה נמחקה" : r.error, r.ok ? "success" : "error");
            setDeleteCommentId(null);
          });
        }}
        onCancel={() => setDeleteCommentId(null)}
      />
    </div>
  );
}
