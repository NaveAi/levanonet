import { prisma } from "@/lib/prisma";
import type { FeedSort } from "@prisma/client";

export const postInclude = {
  author: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      reactions: {
        include: {
          author: { select: { id: true, displayName: true, username: true } },
        },
      },
    },
  },
  reactions: {
    include: {
      author: { select: { id: true, displayName: true, username: true } },
    },
  },
};

export async function getFeedPosts(feedSort: FeedSort = "NEWEST") {
  return prisma.post.findMany({
    orderBy: { createdAt: feedSort === "NEWEST" ? "desc" : "asc" },
    include: postInclude,
    take: 50,
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      settings: true,
      _count: { select: { posts: true, comments: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: postInclude,
      },
    },
  });
}

export async function getAdminStats() {
  const [users, posts, comments] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
  ]);
  return { users, posts, comments };
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

export async function getRecentPostsAdmin() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: { select: { displayName: true, username: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });
}

export async function getRecentCommentsAdmin() {
  return prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: { select: { displayName: true, username: true } },
      post: { select: { id: true, content: true } },
    },
  });
}

export async function getAdminDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [users, posts, comments, bannedUsers, admins, postsThisWeek, usersThisWeek] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.user.count({ where: { banned: true } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.post.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);

  const recentActivity = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      content: true,
      createdAt: true,
      imageUrl: true,
      author: { select: { displayName: true, username: true } },
      _count: { select: { comments: true } },
    },
  });

  return {
    users,
    posts,
    comments,
    bannedUsers,
    admins,
    postsThisWeek,
    usersThisWeek,
    recentActivity,
  };
}
