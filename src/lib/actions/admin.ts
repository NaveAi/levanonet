"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "./auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("אין הרשאת מנהל");
  }
  return session.user.id;
}

export async function toggleBan(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { ok: false, error: "משתמש לא נמצא." };
    if (user.role === "ADMIN") return { ok: false, error: "לא ניתן לחסום מנהל." };

    await prisma.user.update({
      where: { id: userId },
      data: { banned: !user.banned },
    });
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function setUserRole(userId: string, role: "MEMBER" | "ADMIN"): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin();
    if (userId === adminId && role === "MEMBER") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return { ok: false, error: "חייב להישאר לפחות מנהל אחד במערכת." };
      }
    }
    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function adminDeletePost(postId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function adminDeleteComment(commentId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}
