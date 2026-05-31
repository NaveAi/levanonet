import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isS3Provider, uploadObject } from "./s3";
import { MAX_UPLOAD_BYTES } from "./constants";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = MAX_UPLOAD_BYTES;

export async function saveImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("סוג קובץ לא נתמך. השתמשו ב-JPEG, PNG, WebP או GIF.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("הקובץ גדול מדי (מקסימום 5MB).");
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `uploads/${filename}`;

  if (isS3Provider()) {
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID) {
      throw new Error("S3 לא מוגדר: השלימו AWS_S3_BUCKET ומפתחות IAM ב-.env");
    }
    try {
      return await uploadObject(key, buffer, file.type);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "שגיאת S3";
      throw new Error(`העלאה ל-S3 נכשלה: ${msg}`);
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}
