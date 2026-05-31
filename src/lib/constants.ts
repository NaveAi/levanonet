export const ALLOWED_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🎉", "🔥", "👏"] as const;

export const MAX_POST_LENGTH = 280;
export const MAX_COMMENT_LENGTH = 120;
export const MAX_BIO_LENGTH = 160;
export const MAX_REACTION_TEXT = 40;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];
