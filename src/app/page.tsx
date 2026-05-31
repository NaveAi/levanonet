import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFeedPosts } from "@/lib/queries";
import { resolvePostsMedia } from "@/lib/media-url";
import { PostComposer } from "@/components/post-composer";
import { PostCard } from "@/components/post-card";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  const rawPosts = await getFeedPosts(settings?.feedSort ?? "NEWEST");
  const posts = await resolvePostsMedia(rawPosts);
  const favoriteEmojis = settings?.favoriteEmojis.split(",").filter(Boolean);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : hour < 21 ? "ערב טוב" : "לילה טוב";

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{greeting}</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {session.user.name} 👋
        </h1>
        <p className="text-sm text-zinc-500">מה חדש במשפחה היום?</p>
      </div>

      <PostComposer />

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="glass-card rounded-2xl border-dashed p-12 text-center animate-slide-up">
            <span className="text-4xl">📸</span>
            <p className="mt-3 font-medium text-zinc-700 dark:text-zinc-300">עדיין אין פוסטים</p>
            <p className="mt-1 text-sm text-zinc-500">תהיו הראשונים לשתף רגע מהמשפחה!</p>
          </div>
        ) : (
          posts.map((post, i) => {
            const firstWithImage = posts.findIndex((p) => p.imageUrl) === i;
            return (
              <div key={post.id} style={{ animationDelay: `${i * 50}ms` }}>
                <PostCard
                  post={post}
                  currentUserId={session.user.id}
                  isAdmin={session.user.role === "ADMIN"}
                  favoriteEmojis={favoriteEmojis}
                  imagePriority={firstWithImage}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
