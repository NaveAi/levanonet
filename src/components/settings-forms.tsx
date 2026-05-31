"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateProfile, updateSettings, changePassword } from "@/lib/actions/profile";
import { ALLOWED_EMOJIS } from "@/lib/constants";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar } from "./avatar";
import { cn } from "@/lib/utils";
import { User, Palette, Lock, Camera } from "lucide-react";
import type { FeedSort, Theme, User as UserModel, UserSettings } from "@prisma/client";

type Tab = "profile" | "preferences" | "security";

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "פרופיל", icon: User },
  { id: "preferences", label: "העדפות", icon: Palette },
  { id: "security", label: "אבטחה", icon: Lock },
];

export function SettingsForms({
  user,
  settings,
}: {
  user: UserModel;
  settings: UserSettings | null;
}) {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-2xl bg-violet-500/5 p-1 ring-1 ring-violet-500/10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
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

      {tab === "profile" && <ProfileSection user={user} />}
      {tab === "preferences" && <PreferencesSection settings={settings} />}
      {tab === "security" && <PasswordSection />}
    </div>
  );
}

function ProfileSection({ user }: { user: UserModel }) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const { update: updateSession } = useSession();

  return (
    <section className="glass-card animate-slide-up rounded-2xl p-6">
      <h2 className="mb-5 text-lg font-bold">עריכת פרופיל</h2>
      <form
        action={(fd) => {
          startTransition(async () => {
            const r = await updateProfile(fd);
            if (!r.ok) {
              toast(r.error, "error");
              return;
            }
            toast("הפרופיל עודכן!", "success");
            await updateSession();
            if (r.username && r.username !== user.username) {
              router.push(`/profile/${r.username}`);
            }
            router.refresh();
          });
        }}
        className="space-y-5"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              src={avatarPreview ?? user.avatarUrl}
              name={user.displayName}
              size="lg"
            />
            <label className="absolute -bottom-1 -left-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:bg-violet-500">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                name="avatar"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAvatarPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>
          <div className="text-sm text-zinc-500">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">תמונת פרופיל</p>
            <p className="text-xs mt-1">JPEG, PNG, WebP עד 5MB</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">שם תצוגה</label>
          <Input name="displayName" defaultValue={user.displayName} required />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">שם משתמש</label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">@</span>
            <Input
              name="username"
              defaultValue={user.username}
              required
              pattern="[a-z0-9_]{3,20}"
              className="pr-8"
              dir="ltr"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-400">3-20 תווים: a-z, 0-9, _ — זה הקישור לפרופיל שלך</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">ביו</label>
          <Textarea name="bio" defaultValue={user.bio ?? ""} rows={3} maxLength={160} placeholder="ספר/י קצת על עצמך..." />
        </div>

        <Button type="submit" loading={pending} className="w-full sm:w-auto">
          שמירת פרופיל
        </Button>
      </form>
    </section>
  );
}

function PreferencesSection({ settings }: { settings: UserSettings | null }) {
  const [pending, startTransition] = useTransition();
  const [favorites, setFavorites] = useState(
    (settings?.favoriteEmojis ?? "❤️,👍,😂").split(",").filter(Boolean)
  );
  const { toast } = useToast();
  const router = useRouter();

  function toggleFavorite(emoji: string) {
    setFavorites((prev) => {
      if (prev.includes(emoji)) return prev.filter((e) => e !== emoji);
      return [...prev, emoji].slice(0, 5);
    });
  }

  return (
    <section className="glass-card animate-slide-up rounded-2xl p-6">
      <h2 className="mb-5 text-lg font-bold">העדפות תצוגה</h2>
      <form
        action={(fd) => {
          fd.set("favoriteEmojis", favorites.join(","));
          startTransition(async () => {
            const r = await updateSettings(fd);
            if (!r.ok) toast(r.error, "error");
            else {
              toast("ההעדפות נשמרו!", "success");
              router.refresh();
            }
          });
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">ערכת נושא</label>
            <select
              name="theme"
              defaultValue={settings?.theme ?? "SYSTEM"}
              className="w-full rounded-xl border border-zinc-200/80 bg-white/90 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="SYSTEM">לפי המערכת</option>
              <option value="LIGHT">בהיר</option>
              <option value="DARK">כהה</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">מיון פיד</label>
            <select
              name="feedSort"
              defaultValue={settings?.feedSort ?? "NEWEST"}
              className="w-full rounded-xl border border-zinc-200/80 bg-white/90 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="NEWEST">חדש קודם</option>
              <option value="OLDEST">ישן קודם</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">גודל טקסט</label>
          <select
            name="fontSize"
            defaultValue={settings?.fontSize ?? "normal"}
            className="w-full rounded-xl border border-zinc-200/80 bg-white/90 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="normal">רגיל</option>
            <option value="large">גדול</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">אימוג&apos;י מועדפים (עד 5)</label>
          <div className="flex flex-wrap gap-2">
            {ALLOWED_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => toggleFavorite(e)}
                className={cn(
                  "text-2xl rounded-xl p-2 transition-all duration-200 interactive-scale",
                  favorites.includes(e)
                    ? "bg-violet-500/15 ring-2 ring-violet-400/60 scale-110"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-60 hover:opacity-100"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-violet-500/5 p-4">
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="notifyComments"
              defaultChecked={settings?.notifyComments ?? true}
              className="h-4 w-4 rounded accent-violet-600"
            />
            התראות על תגובות (בקרוב)
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="notifyReactions"
              defaultChecked={settings?.notifyReactions ?? true}
              className="h-4 w-4 rounded accent-violet-600"
            />
            התראות על אימוג&apos;י (בקרוב)
          </label>
        </div>

        <Button type="submit" loading={pending}>
          שמירת העדפות
        </Button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <section className="glass-card animate-slide-up rounded-2xl p-6">
      <h2 className="mb-5 text-lg font-bold">שינוי סיסמה</h2>
      <form
        action={(fd) => {
          startTransition(async () => {
            const r = await changePassword(fd);
            if (!r.ok) toast(r.error, "error");
            else toast("הסיסמה עודכנה בהצלחה!", "success");
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium">סיסמה נוכחית</label>
          <Input name="currentPassword" type="password" required autoComplete="current-password" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">סיסמה חדשה</label>
          <Input name="newPassword" type="password" required minLength={6} autoComplete="new-password" />
        </div>
        <Button type="submit" variant="secondary" loading={pending}>
          עדכון סיסמה
        </Button>
      </form>
    </section>
  );
}
