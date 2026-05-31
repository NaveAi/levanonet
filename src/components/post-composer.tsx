"use client";

import { useRef, useState, useTransition } from "react";
import { createPost } from "@/lib/actions/posts";
import { MAX_POST_LENGTH, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { useToast } from "./toast-provider";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ImagePlus, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function PostComposer() {
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [focused, setFocused] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const remaining = MAX_POST_LENGTH - content.length;
  const canSubmit = content.trim().length > 0 || preview;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast("התמונה גדולה מדי (מקסימום 5MB).", "error");
      if (fileRef.current) fileRef.current.value = "";
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(formData: FormData) {
    if (!content.trim() && !fileRef.current?.files?.[0]?.size) {
      toast("כתבו משהו או צרפו תמונה.", "error");
      return;
    }
    startTransition(async () => {
      try {
        const result = await createPost(formData);
        if (!result.ok) {
          toast(result.error, "error");
          return;
        }
        formRef.current?.reset();
        setContent("");
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
        toast("הפוסט פורסם! 🎉", "success");
      } catch {
        toast("שגיאה בפרסום. נסו שוב.", "error");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300",
        focused && "ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/10"
      )}
    >
      <Textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="מה קורה במשפחה?..."
        rows={3}
        maxLength={MAX_POST_LENGTH}
        className="border-0 bg-transparent p-0 focus:ring-0 text-[15px]"
      />

      {preview && (
        <div className="relative mt-4 overflow-hidden rounded-2xl animate-scale-in ring-1 ring-violet-500/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="תצוגה מקדימה" className="max-h-72 w-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 left-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-violet-500/10 pt-4">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-violet-500/10 hover:text-violet-600">
            <ImagePlus className="h-5 w-5" />
            תמונה
            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
          <span
            className={cn(
              "text-xs font-medium transition-colors",
              remaining < 30 ? "text-amber-500" : "text-zinc-400",
              remaining < 10 && "text-red-500"
            )}
          >
            {remaining}
          </span>
        </div>
        <Button type="submit" disabled={!canSubmit} loading={pending} size="sm">
          <Send className="h-4 w-4" />
          פרסום
        </Button>
      </div>
    </form>
  );
}
