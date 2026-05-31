"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/lib/actions/auth";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          const result = await loginUser(fd);
          if (!result.ok) toast(result.error, "error");
          else {
            toast("ברוכים השבים! 👋", "success");
            router.push("/");
            router.refresh();
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">אימייל</label>
        <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" dir="ltr" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">סיסמה</label>
        <Input name="password" type="password" required autoComplete="current-password" />
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        התחברות
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          const result = await registerUser(fd);
          if (!result.ok) toast(result.error, "error");
          else {
            toast("ברוכים הבאים למשפחה! 🎉", "success");
            router.push("/");
            router.refresh();
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium">קוד הזמנה למשפחה</label>
        <Input name="inviteCode" required placeholder="הקוד שקיבלתם" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">שם תצוגה</label>
        <Input name="displayName" required placeholder="למשל: מיכל" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">שם משתמש (באנגלית)</label>
        <Input name="username" required placeholder="michal" pattern="[a-z0-9_]{3,20}" dir="ltr" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">אימייל</label>
        <Input name="email" type="email" required dir="ltr" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">סיסמה</label>
        <Input name="password" type="password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        הצטרפות למשפחה
      </Button>
    </form>
  );
}
