import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_PREFIX = "s3:";

export function isS3Provider(): boolean {
  return (process.env.UPLOAD_PROVIDER ?? "local").trim().toLowerCase() === "s3";
}

export function resolveBucketName(): string {
  const raw = (process.env.AWS_S3_BUCKET ?? "").trim();
  if (!raw) throw new Error("AWS_S3_BUCKET לא מוגדר.");
  if (raw.startsWith("arn:aws:s3:::")) {
    const name = raw.replace("arn:aws:s3:::", "").split("/")[0];
    if (!name) throw new Error("AWS_S3_BUCKET: ARN לא תקין.");
    return name;
  }
  return raw;
}

export function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION ?? "eu-central-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

/** DB value → object key (uploads/xxx.jpg) */
export function extractS3Key(stored: string): string | null {
  if (stored.startsWith(S3_PREFIX)) {
    return stored.slice(S3_PREFIX.length);
  }
  if (stored.startsWith("/uploads/")) {
    return null;
  }
  try {
    const url = new URL(stored);
    if (url.hostname.includes("amazonaws.com")) {
      return url.pathname.replace(/^\//, "");
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export function toS3StoredKey(key: string): string {
  return `${S3_PREFIX}${key}`;
}

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const client = getS3Client();
  const bucket = resolveBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "private, max-age=31536000",
    })
  );

  return toS3StoredKey(key);
}

/** Presigned GET — bucket stays private; IAM user needs s3:GetObject */
export async function getPresignedReadUrl(key: string, expiresIn = 60 * 60 * 24): Promise<string> {
  const client = getS3Client();
  const bucket = resolveBucketName();

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );
}
