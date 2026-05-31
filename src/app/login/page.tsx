import Link from "next/link";
import { LoginForm } from "@/components/auth-form";
import { Heart } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <div className="mb-8 text-center animate-slide-up">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-500/30">
          <Heart className="h-7 w-7 fill-current" />
        </span>
        <h1 className="text-3xl font-bold bg-gradient-to-l from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          ברוכים השבים
        </h1>
        <p className="mt-2 text-sm text-zinc-500">התחברו לרשת המשפחה</p>
      </div>
      <div className="glass-card animate-slide-up rounded-2xl p-8">
        <LoginForm />
        <p className="mt-6 text-center text-sm text-zinc-500">
          חדשים כאן?{" "}
          <Link href="/register" className="font-semibold text-violet-600 hover:underline">
            הצטרפות עם קוד הזמנה
          </Link>
        </p>
      </div>
    </div>
  );
}
