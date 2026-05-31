import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForms } from "@/components/settings-forms";
import { resolveMediaUrl } from "@/lib/media-url";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true },
  });
  if (!user) redirect("/login");

  const displayUser = {
    ...user,
    avatarUrl: await resolveMediaUrl(user.avatarUrl),
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <p className="text-sm text-zinc-500">נהלו את הפרופיל, ההעדפות והאבטחה</p>
      </div>
      <SettingsForms user={displayUser} settings={user.settings} />
    </div>
  );
}
