"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/upload";
import { ALLOWED_EMOJIS, MAX_COMMENT_LENGTH, MAX_POST_LENGTH, MAX_REACTION_TEXT } from "@/lib/constants";
import { addAIBotComment } from "@/lib/actions/ai-bot";
import type { ActionResult } from "./auth";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("לא מחובר");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.banned) throw new Error("חשבון חסום");
  return user;
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const content = (formData.get("content") as string)?.trim() ?? "";
    const image = formData.get("image") as File | null;

    if (!content && (!image || image.size === 0)) {
      return { ok: false, error: "כתבו משהו או צרפו תמונה." };
    }
    if (content.length > MAX_POST_LENGTH) {
      return { ok: false, error: `מקסימום ${MAX_POST_LENGTH} תווים.` };
    }

    let imageUrl: string | undefined;
    if (image && image.size > 0) {
      imageUrl = await saveImage(image);
    }

    const post = await prisma.post.create({
      data: { authorId: user.id, content: content || "📷", imageUrl },
    });

    // AI Bot may add a comment
    setTimeout(() => {
      addAIBotComment(post.id).catch((e) => console.error(e));
    }, 5000); // 5 second delay

    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { ok: false, error: "פוסט לא נמצא." };
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return { ok: false, error: "אין הרשאה." };
    }
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function addComment(postId: string, content: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const text = content.trim();
    if (!text) return { ok: false, error: "תגובה ריקה." };
    if (text.length > MAX_COMMENT_LENGTH) {
      return { ok: false, error: `מקסימום ${MAX_COMMENT_LENGTH} תווים.` };
    }
    await prisma.comment.create({
      data: { postId, authorId: user.id, content: text },
    });
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}

export async function toggleReaction(
  target: { postId: string } | { commentId: string },
  emoji?: string,
  text?: string
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const emojiVal = emoji?.trim();
    const textVal = text?.trim();

    if (emojiVal && !ALLOWED_EMOJIS.includes(emojiVal as (typeof ALLOWED_EMOJIS)[number])) {
      return { ok: false, error: "אימוג'י לא מורשה." };
    }
    if (textVal && textVal.length > MAX_REACTION_TEXT) {
      return { ok: false, error: "טקסט תגובה ארוך מדי." };
    }
    if (!emojiVal && !textVal) {
      return { ok: false, error: "בחרו אימוג'י או טקסט." };
    }

    const where =
      "postId" in target
        ? { authorId_postId: { authorId: user.id, postId: target.postId } }
        : { authorId_commentId: { authorId: user.id, commentId: target.commentId } };

    const existing = await prisma.reaction.findUnique({ where });

    if (existing) {
      if (existing.emoji === emojiVal && existing.text === (textVal || null)) {
        await prisma.reaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.reaction.update({
          where: { id: existing.id },
          data: { emoji: emojiVal || null, text: textVal || null },
        });
      }
    } else {
      await prisma.reaction.create({
        data: {
          authorId: user.id,
          emoji: emojiVal || null,
          text: textVal || null,
          ...("postId" in target ? { postId: target.postId } : { commentId: target.commentId }),
        },
      });
    }

    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "שגיאה" };
  }
}
