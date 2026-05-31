import { auth } from "@/lib/auth";
import { getUserByUsername } from "@/lib/queries";
import { resolveMediaUrl, resolvePostsMedia } from "@/lib/media-url";
import { Avatar } from "@/components/avatar";
import { PostCard } from "@/components/post-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, Calendar, FileText } from "lucide-react";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const rawUser = await getUserByUsername(username);
  if (!rawUser || rawUser.banned) notFound();

  const avatarUrl = await resolveMediaUrl(rawUser.avatarUrl);
  const posts = await resolvePostsMedia(rawUser.posts);
  const user = { ...rawUser, avatarUrl, posts };

  const isOwn = session?.user?.id === user.id;
  const favoriteEmojis =
    session?.user?.id === user.id
      ? user.settings?.favoriteEmojis.split(",").filter(Boolean)
      : undefined;

  return (
    <div className="space-y-6">
      <div className="glass-card animate-slide-up overflow-hidden rounded-2xl">
        <div className="h-24 bg-gradient-to-l from-violet-600/30 via-fuchsia-500/20 to-violet-600/10" />
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <Avatar src={user.avatarUrl} name={user.displayName} size="lg" className="ring-4 ring-white dark:ring-zinc-900" />
            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="font-medium text-violet-600 dark:text-violet-400">@{user.username}</p>
              {user.bio && (
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {user.bio}
                </p>
              )}
            </div>
            {isOwn && (
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 ml-1.5" />
                  עריכת פרופיל
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-4 sm:justify-start">
            <span className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
              <FileText className="h-3.5 w-3.5" />
              {user._count.posts} פוסטים
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
              <Calendar className="h-3.5 w-3.5" />
              חבר/ה מאז {new Date(user.createdAt).toLocaleDateString("he-IL")}
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold">פוסטים</h2>
      <div className="space-y-4">
        {user.posts.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-zinc-500">אין עדיין פוסטים</p>
          </div>
        ) : (
          user.posts.map((post) =>
            session?.user?.id ? (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session.user.id}
                isAdmin={session.user.role === "ADMIN"}
                favoriteEmojis={favoriteEmojis}
              />
            ) : null
          )
        )}
      </div>
    </div>
  );
}
