"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/upload";
import { MAX_BIO_LENGTH } from "@/lib/constants";
import type { FeedSort, Theme } from "@prisma/client";
import type { ActionResult } from "./auth";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("לא מחובר");
  return session.user.id;
}

export async function updateProfile(formData: FormData): Promise<ActionResult & { username?: string }> {
  try {
    const userId = await requireUser();
    const displayName = (formData.get("displayName") as string)?.trim();
    const username = (formData.get("username") as string)?.trim().toLowerCase();
    const bio = (formData.get("bio") as string)?.trim() || null;
    const avatar = formData.get("avatar") as File | null;

    if (!displayName) return { ok: false, error: "שם תצוגה חובה." };
    if (!username) return { ok: false, error: "שם משתמש חובה." };
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return { ok: false, error: "שם משתמש: 3-20 תווים, אותיות קטנות, מספרים ו-_ בלבד." };
    }
    if (bio && bio.length > MAX_BIO_LENGTH) {
      return { ok: false, error: `ביו עד ${MAX_BIO_LENGTH} תווים.` };
    }

    const current = await prisma.user.findUnique({ where: { id: userId } });
    if (!current) return { ok: false, error: "משתמש לא נמצא." };

    if (username !== current.username) {
      const taken = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
      });
      if (taken) return { ok: false, error: "שם המשתמש כבר תפוס." };
    }

    let avatarUrl: string | undefined;
    if (avatar && avatar.size > 0) {
      avatarUrl = await saveImage(avatar);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        username,
        bio,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/");
    revalidatePath(`/profile/${current.username}`);
    revalidatePath(`/profile/${username}`);
    return { ok: true, username };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUser();
    const theme = formData.get("theme") as Theme;
    const feedSort = formData.get("feedSort") as FeedSort;
    const fontSize = (formData.get("fontSize") as string) || "normal";
    const favoriteEmojis = (formData.get("favoriteEmojis") as string) || "❤️,👍,😂";
    const notifyComments = formData.get("notifyComments") === "on";
    const notifyReactions = formData.get("notifyReactions") === "on";

    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        theme,
        feedSort,
        fontSize,
        favoriteEmojis,
        notifyComments,
        notifyReactions,
      },
      update: {
        theme,
        feedSort,
        fontSize,
        favoriteEmojis,
        notifyComments,
        notifyReactions,
      },
    });

    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireUser();
    const current = formData.get("currentPassword") as string;
    const next = formData.get("newPassword") as string;
    if (!next || next.length < 6) {
      return { ok: false, error: "סיסמה חדשה: לפחות 6 תווים." };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { ok: false, error: "משתמש לא נמצא." };

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(current, user.passwordHash);
    if (!valid) return { ok: false, error: "סיסמה נוכחית שגויה." };

    const passwordHash = await bcrypt.hash(next, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}
