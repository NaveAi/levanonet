"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerUser(formData: FormData): Promise<ActionResult> {
  const inviteCode = (formData.get("inviteCode") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string)?.trim();
  const username = (formData.get("username") as string)?.trim().toLowerCase();

  if (inviteCode !== process.env.INVITE_CODE) {
    return { ok: false, error: "קוד הזמנה שגוי." };
  }
  if (!email || !password || !displayName || !username) {
    return { ok: false, error: "יש למלא את כל השדות." };
  }
  if (password.length < 6) {
    return { ok: false, error: "הסיסמה חייבת להכיל לפחות 6 תווים." };
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { ok: false, error: "שם משתמש: 3-20 תווים, אותיות קטנות, מספרים ו-_ בלבד." };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return { ok: false, error: "אימייל או שם משתמש כבר קיימים." };
  }

  const userCount = await prisma.user.count();
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      username,
      role: userCount === 0 ? "ADMIN" : "MEMBER",
      settings: { create: {} },
    },
  });

  await signIn("credentials", { email, password, redirectTo: "/" });

  return { ok: true };
}

export async function loginUser(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError && e.type === "CredentialsSignin") {
      return { ok: false, error: "אימייל או סיסמה שגויים." };
    }
    throw e;
  }
}
