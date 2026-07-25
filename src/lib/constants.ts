export const ALLOWED_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🎉", "🔥", "👏"] as const;

export const MAX_POST_LENGTH = 280;
export const MAX_COMMENT_LENGTH = 120;
export const MAX_BIO_LENGTH = 160;
export const MAX_REACTION_TEXT = 40;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];

// AI Bot Configuration
export const AI_BOT_USERNAME = "levanobot";
export const AI_BOT_DISPLAY_NAME = "לבנו הבוט 🤖";
export const AI_BOT_BIO = "תגובות הומוריסטיות ומשחקי מילים משפחתיים";
export const AI_BOT_COMMENT_CHANCE = 0.3; // 30% chance to comment on posts
export const AI_BOT_COMMENT_DELAY = 5000; // 5 seconds after post creation

// AI comment templates (humorous Hebrew responses)
export const AI_HUMOR_TEMPLATES = [
  "אופס, זה נראה כמו פוסט משפחתי אמיתי 😄",
  "מעניין... האם זה אפילו חוקי בחוק המשפחה? 🤔",
  "תן לי שניה, אני מנסה להבין את זה דרך AI 🧠",
  "זה כל כך משפחתי שאני כמעט קראתי לוואטס אפ 📱",
  "שמעתי שזה הטרנד הבא בטיקטוק 🎬",
  "לא בטוח מה זה, אבל זה נראה משהו חשוב! 🎯",
  "השוואה לאחי? בטוח שהוא לא יתפוס 😅",
  "זה המיטב שראיתי מאז שהופעלתי! ⭐",
  "קצת יותר מדי מ'דמיון', אבל אני נהנה מזה 🎪",
  "אם זה משפחה, אז כל הכלכלה בעולם היא ביחסי ציבור! 💼",
  "הוואי, זה רציני או שזה ממש בדיחה? 🤷",
  "יום שמח! (או קצת פחות משמח, אבל כן, יום) 🎉"
] as const;
