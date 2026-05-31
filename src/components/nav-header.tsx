import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { resolveMediaUrl } from "@/lib/media-url";
import { Avatar } from "./avatar";
import { Button } from "./ui/button";
import { NavLinks } from "./nav-links";
import { LogOut, Heart } from "lucide-react";

export async function NavHeader() {
  const session = await auth();
  const avatarSrc = session?.user?.image
    ? await resolveMediaUrl(session.user.image)
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/10 bg-white/70 backdrop-blur-xl dark:bg-zinc-950/70">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <div className="leading-tight">
            <span className="block text-base font-bold bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              לבנונט
            </span>
            <span className="hidden text-[10px] text-zinc-500 sm:block">רשת המשפחה</span>
          </div>
        </Link>

        {session?.user ? (
          <nav className="flex items-center gap-0.5">
            <NavLinks username={session.user.username} isAdmin={session.user.role === "ADMIN"} />
            <Link
              href={`/profile/${session.user.username}`}
              className="rounded-xl p-1 transition-all hover:ring-2 hover:ring-violet-500/30 interactive-scale"
            >
              <Avatar src={avatarSrc} name={session.user.name ?? "?"} size="sm" />
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm" title="התנתקות">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </nav>
        ) : (
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                התחברות
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">הצטרפות</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
