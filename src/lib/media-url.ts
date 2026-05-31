import { extractS3Key, getPresignedReadUrl, isS3Provider } from "./s3";

/** Turn DB/local path into URL the browser can load */
export async function resolveMediaUrl(stored: string | null | undefined): Promise<string | null> {
  if (!stored) return null;
  if (stored.startsWith("/uploads/")) return stored;

  const key = extractS3Key(stored);
  if (!key || !isS3Provider()) return stored;

  return getPresignedReadUrl(key);
}

type PostWithMedia = {
  imageUrl: string | null;
  author: { avatarUrl: string | null };
  comments: Array<{
    author: { avatarUrl: string | null };
  }>;
};

export async function resolvePostMedia<T extends PostWithMedia>(post: T): Promise<T> {
  const [imageUrl, authorAvatar, ...commentAvatars] = await Promise.all([
    resolveMediaUrl(post.imageUrl),
    resolveMediaUrl(post.author.avatarUrl),
    ...post.comments.map((c) => resolveMediaUrl(c.author.avatarUrl)),
  ]);

  return {
    ...post,
    imageUrl,
    author: { ...post.author, avatarUrl: authorAvatar },
    comments: post.comments.map((c, i) => ({
      ...c,
      author: { ...c.author, avatarUrl: commentAvatars[i] ?? c.author.avatarUrl },
    })),
  };
}

export async function resolvePostsMedia<T extends PostWithMedia>(posts: T[]): Promise<T[]> {
  return Promise.all(posts.map(resolvePostMedia));
}
