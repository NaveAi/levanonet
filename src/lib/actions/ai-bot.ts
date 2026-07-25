"use server";

import { prisma } from "@/lib/prisma";
import {
  AI_BOT_USERNAME,
  AI_BOT_DISPLAY_NAME,
  AI_BOT_BIO,
  AI_HUMOR_TEMPLATES,
  AI_BOT_COMMENT_CHANCE,
} from "@/lib/constants";

/**
 * Initialize AI Bot user if it doesn't exist
 */
export async function initializeAIBot() {
  try {
    const existingBot = await prisma.user.findUnique({
      where: { username: AI_BOT_USERNAME },
    });

    if (existingBot) {
      return existingBot;
    }

    // Create AI Bot user
    const bot = await prisma.user.create({
      data: {
        username: AI_BOT_USERNAME,
        displayName: AI_BOT_DISPLAY_NAME,
        email: `${AI_BOT_USERNAME}@levanonet.local`,
        passwordHash: "disabled", // Bot cannot login
        bio: AI_BOT_BIO,
        role: "BOT",
        isBot: true,
        settings: {
          create: {
            locale: "he",
          },
        },
      },
    });

    return bot;
  } catch (e) {
    console.error("Failed to initialize AI Bot:", e);
    throw e;
  }
}

/**
 * Get random humorous comment from AI
 */
export function getRandomAIComment(): string {
  const randomIndex = Math.floor(Math.random() * AI_HUMOR_TEMPLATES.length);
  return AI_HUMOR_TEMPLATES[randomIndex];
}

/**
 * Determine if AI Bot should comment on post
 */
export function shouldAIComment(): boolean {
  return Math.random() < AI_BOT_COMMENT_CHANCE;
}

/**
 * Get AI Bot user
 */
export async function getAIBot() {
  return prisma.user.findUnique({
    where: { username: AI_BOT_USERNAME },
  });
}

/**
 * Add AI Bot comment to post (called after post creation)
 */
export async function addAIBotComment(postId: string): Promise<void> {
  try {
    if (!shouldAIComment()) {
      return;
    }

    const bot = await getAIBot();
    if (!bot) {
      console.warn("AI Bot not initialized");
      return;
    }

    const comment = getRandomAIComment();

    await prisma.comment.create({
      data: {
        postId,
        authorId: bot.id,
        content: comment,
      },
    });

    console.log(`AI Bot commented on post ${postId}`);
  } catch (e) {
    console.error("Failed to add AI Bot comment:", e);
    // Don't throw - this should be non-blocking
  }
}
