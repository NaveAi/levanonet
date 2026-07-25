# 🌳 אילן יוחסין ו-🤖 בוט AI - מדריך מלא

---

## **תוכן עניינים**

1. [סקירת תכונות](#סקירת-תכונות)
2. [אילן יוחסין](#אילן-יוחסין)
3. [בוט AI](#בוט-ai)
4. [עדכוני Schema](#עדכוני-schema)
5. [API וServer Actions](#api-וserver-actions)
6. [הוראות התקנה](#הוראות-התקנה)
7. [דוגמאות שימוש](#דוגמאות-שימוש)
8. [אפשרויות מתקדמות](#אפשרויות-מתקדמות)

---

## **🎯 סקירת תכונות**

### **1. אילן יוחסין (Family Tree)**

**מה זה:**
מפה ויזואלית של קשרי המשפחה המוצגת כעץ יוחסין. המשתמש שנבחר מודגש בתוך העץ.

**דף:**
- `/family-tree` — צפייה באילן היוחסין של כל המשפחה

**אפשריות:**
- ✅ הצגת הורים וילדים בהיררכיה
- ✅ הצגת בן/בת זוג
- ✅ הצגת אחים/אחיות
- ✅ לחץ על חבר משפחה כדי להרחיב/צמצם
- ✅ המשתמש הנוכחי מודגש בתוך העץ (⭐)

**דוגמה ויזואלית:**
```
👨 דוד (סבא)
 ├─ 👩 דודה (סבתא)
 ├─ 👨 אבא
 │  ├─ 👩 אמא (בן זוג)
 │  ├─ 👤 אני ⭐ (מודגש)
 │  └─ 👧 אחות
 └─ 👨 דוד
```

---

### **2. בוט AI (AI Bot Commenter)**

**מה זה:**
משתמש מיוחד בעל תפקיד `BOT` שכותב הערות קצרות והומוריסטיות על פוסטים של חברי המשפחה.

**פרטים:**
- **Username:** `levanobot`
- **Display Name:** `לבנו הבוט 🤖`
- **ביו:** `תגובות הומוריסטיות ומשחקי מילים משפחתיים`
- **תפקיד:** `BOT` (מיוחד)
- **סיסמה:** לא פעיל (לא ניתן להתחבר)

**התנהגות:**
- מוצפן אוטומטית לכל פוסט חדש (30% סיכוי)
- מוסיף הערה קצרה (עד 120 תווים) בעיכוב של 5 שניות
- הערות בעברית — הומורוסטיות וקשורות לתוכן

**דוגמאות הערות:**
```
"אופס, זה נראה כמו פוסט משפחתי אמיתי 😄"
"מעניין... האם זה הטרנד בטיקטוק 🤔"
"תן לי ששנייה, אני מנסה להבין את זה דרך AI 🧠"
"הוואי, זה רציני או שזה משהו חשוב בחוק המשפחה? 👨‍⚖️"
```

---

## **🌳 אילן יוחסין**

### **Schema Updates (Prisma)**

#### **הוספת Role "BOT"**
```prisma
enum Role {
  MEMBER
  ADMIN
  BOT      // ← חדש
}
```

#### **שדות חדשים ב-User**
```prisma
model User {
  // ... existing fields
  isBot        Boolean   @default(false)     // ← חדש
  
  // Family tree relationships
  parentRelations   FamilyRelation[] @relation("parent")  // ← חדש
  childRelations    FamilyRelation[] @relation("child")   // ← חדש
  spouseRelations   FamilyRelation[] @relation("spouse")  // ← חדש
}
```

#### **טבלה חדשה: FamilyRelation**
```prisma
model FamilyRelation {
  id              String   @id @default(cuid())
  parentId        String
  parent          User     @relation("parent", fields: [parentId], references: [id], onDelete: Cascade)
  childId         String
  child           User     @relation("child", fields: [childId], references: [id], onDelete: Cascade)
  relationshipType String   // "parent-child" | "spouse" | "sibling"
  createdAt       DateTime @default(now())

  @@unique([parentId, childId, relationshipType])
  @@index([parentId])
  @@index([childId])
}
```

**שדות:**
- `parentId` + `childId` — משתמשי הקשר
- `relationshipType` — סוג הקשר:
  - `"parent-child"` — הורה-ילד
  - `"spouse"` — בן/בת זוג
  - `"sibling"` — אח/אחות (דו-כיווני)

---

### **Component: FamilyTree**

**ממקום:** `src/components/family-tree.tsx`

**Props:**
```typescript
interface FamilyTreeProps {
  members: FamilyMember[];        // כל חברי המשפחה עם קשריהם
  highlightedUserId: string;      // ID של המשתמש שיהיה מודגש
}

interface FamilyMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  children?: FamilyMember[];      // ילדים
  spouse?: FamilyMember;          // בן/בת זוג
  siblings?: FamilyMember[];      // אחים/אחיות
}
```

**Features:**
- ✅ ניתן להרחיב/צמצם כל קשר
- ✅ אייקונים (User, ChevronDown, ChevronUp)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ המשתמש המודגש עם ring וצבע violet

**מראה:**
```
┌─────────────────────────────────────┐
│ 👤 דוד                              │  ← Expandable
│ @דוד_משפחה                          │
└─────────────────────────────────────┘
  └─ 💔 Partner: דודה
  └─ 👶 ילדים
      ├─ 👤 אבא
      └─ ⭐ 👤 אני (מודגש, ring)
```

---

### **Page: `/family-tree`**

**ממקום:** `src/app/family-tree/page.tsx`

**Flow:**
```typescript
1. GET session (redirect to /login if not authenticated)
2. FETCH all users (role != BOT)
3. FETCH all family relationships
4. BUILD tree structure in memory
5. FIND root members (no parents)
6. RENDER FamilyTree component
```

**Query:**
```typescript
// Get all members
const allMembers = await prisma.user.findMany({
  where: { role: { not: "BOT" } },
  select: { id, username, displayName, avatarUrl },
  orderBy: { displayName: "asc" }
});

// Get relationships
const relationships = await prisma.familyRelation.findMany({
  include: {
    parent: { select: { id, username, displayName, avatarUrl } },
    child: { select: { id, username, displayName, avatarUrl } }
  }
});
```

---

### **Server Actions**

#### `addFamilyRelation(parentId, childId, type)`

**File:** `src/lib/actions/family-tree.ts`

**תפקיד:** הוסף קשר משפחתי

**Parameters:**
```typescript
parentId: string;                    // ID של ההורה
childId: string;                     // ID של הילד
relationshipType: "parent-child" | "spouse" | "sibling"
```

**Validation:**
- ✅ רק `ADMIN` יכול להוסיף קשרים
- ✅ שני המשתמשים חייבים להיות קיימים
- ✅ לא ניתן להוסיף קשר עם עצמו

**Side Effects:**
- יצירה ב-`FamilyRelation`
- אם `sibling` → create bidirectional
- `revalidatePath("/family-tree")`

**Return:**
```typescript
{ ok: true } | { ok: false, error: string }
```

**דוגמה:**
```typescript
await addFamilyRelation(
  "parent123",  // הורה
  "child456",   // ילד
  "parent-child"
);
```

---

#### `removeFamilyRelation(parentId, childId, type)`

**תפקיד:** הסר קשר משפחתי

**Logic:**
```
1. בדוק ADMIN
2. אם sibling → מחק בשני הכיוונים
3. אחרת → מחק קשר יחיד
4. revalidate
```

---

### **Queries**

#### `getUserWithFamilyTree(userId: string)`

**תפקיד:** קבל משתמש עם כל קשריו

**Return:**
```typescript
{
  id, username, displayName, avatarUrl,
  parentRelations: [
    { parent: { id, username, displayName, avatarUrl } }
  ],
  childRelations: [
    { child: { id, username, displayName, avatarUrl } }
  ],
  spouseRelations: [
    { parent: { id, username, displayName, avatarUrl } }
  ]
}
```

---

#### `getFamilyTreeAncestors(userId: string, depth: number = 3)`

**תפקיד:** קבל עץ מלא של הורים רקורסיבית

**Depth:** כמה דורות לחזור (default: 3)

**Return:** עץ מלא עם `parentRelations` רקורסיבי

---

#### `getAllFamilyMembers()`

**תפקיד:** קבל כל חברי המשפחה (role != BOT)

**Return:**
```typescript
[
  { id, username, displayName, avatarUrl },
  ...
]
```

---

## **🤖 בוט AI**

### **Schema Updates**

#### **Enum Role (updated)**
```prisma
enum Role {
  MEMBER
  ADMIN
  BOT        // ← חדש
}
```

#### **User Fields (updated)**
```prisma
model User {
  // ... existing
  role         Role      @default(MEMBER)    // כולל BOT
  isBot        Boolean   @default(false)     // ← חדש
  // ...
}
```

---

### **Constants**

**File:** `src/lib/constants.ts`

```typescript
// AI Bot Configuration
export const AI_BOT_USERNAME = "levanobot";
export const AI_BOT_DISPLAY_NAME = "לבנו הבוט 🤖";
export const AI_BOT_BIO = "תגובות הומוריסטיות ומשחקי מילים משפחתיים";
export const AI_BOT_COMMENT_CHANCE = 0.3;        // 30% chance
export const AI_BOT_COMMENT_DELAY = 5000;        // 5 seconds

// Humor templates (Hebrew)
export const AI_HUMOR_TEMPLATES = [
  "אופס, זה נראה כמו פוסט משפחתי אמיתי 😄",
  "מעניין... האם זה הטרנד בטיקטוק 🤔",
  "תן לי ששנייה, אני מנסה להבין את זה דרך AI 🧠",
  "הוואי, זה רציני או שזה משהו חשוב בחוק המשפחה? 👨‍⚖️",
  "זה כל כך משפחתי שאני כמעט מחזיר לכם דחייה מערכתית 🤖",
  "לא בטוח מה זה, אבל זה נראה מרושע! 👺",
  "קצת יותר מדי משפחתי בשבילי 😅",
  "יום שמח! (או קצת פחות, אני לא יודע משהו משפחתיים)",
  "אם זה משהו חשוב בעולם היא שחסום בגן אדם",
  "השווה שזה הטרנד הבא בעולם האינטרנט 🌐",
  "הומוריסטיקה + משחקי מילים משפחתיים",
] as const;
```

---

### **Actions: AI Bot**

**File:** `src/lib/actions/ai-bot.ts`

#### `initializeAIBot() → User`

**תפקיד:** אתחל את בוט ה-AI כמשתמש אם הוא לא קיים

**Flow:**
```typescript
1. Check if bot exists by username (levanobot)
2. If exists → return bot
3. If not → create new user:
   {
     username: "levanobot",
     displayName: "לבנו הבוט 🤖",
     email: "levanobot@levanonet.local",
     passwordHash: "disabled",
     role: "BOT",
     isBot: true,
     settings: { create: { locale: "he" } }
   }
4. Return bot
```

**Called On:**
- First app startup (middleware or layout)
- Admin initialization

---

#### `getRandomAIComment() → string`

**תפקיד:** בחר הערה אקראית מ-`AI_HUMOR_TEMPLATES`

**Return:**
```
"אופס, זה נראה כמו פוסט משפחתי אמיתי 😄"
```

---

#### `shouldAIComment() → boolean`

**תפקיד:** קבע אם בוט צריך להגיב

**Logic:**
```typescript
return Math.random() < AI_BOT_COMMENT_CHANCE;  // 30%
```

---

#### `getAIBot() → User | null`

**תפקיד:** קבל את בוט ה-AI

**Query:**
```typescript
await prisma.user.findUnique({
  where: { username: AI_BOT_USERNAME }
});
```

---

#### `addAIBotComment(postId: string) → void`

**תפקיד:** הוסף הערת בוט לפוסט (async, non-blocking)

**Flow:**
```typescript
1. Check shouldAIComment()
2. If false → return
3. Get bot user
4. Get random comment
5. Create Comment:
   {
     postId,
     authorId: bot.id,
     content: comment
   }
6. Emit event / log
```

**Called From:**
- `createPost()` (in `src/lib/actions/posts.ts`)
- After 5 second delay
- Non-blocking (setTimeout)

**Errors:**
- Logged but not thrown (non-blocking)

---

### **Integration in Posts**

**File:** `src/lib/actions/posts.ts`

**Updated `createPost()`:**
```typescript
export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser();
    // ... validation

    const post = await prisma.post.create({
      data: { authorId: user.id, content, imageUrl }
    });

    // Trigger AI Bot comment (non-blocking)
    setTimeout(() => {
      addAIBotComment(post.id).catch((e) => console.error(e));
    }, 5000);  // ← 5 second delay

    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: ... };
  }
}
```

---

### **Query: Exclude Bot from Counts**

**Updated `getAdminStats()`:**
```typescript
const [users, posts, comments] = await Promise.all([
  prisma.user.count({ where: { role: { not: "BOT" } } }),  // ← Exclude bot
  prisma.post.count(),
  prisma.comment.count(),
]);
```

**Updated `getAllUsers()`:**
```typescript
return prisma.user.findMany({
  where: { role: { not: "BOT" } },  // ← Exclude bot
  orderBy: { createdAt: "asc" },
  include: { _count: { select: { posts: true } } },
});
```

---

## **عدكتوی Schema**

### **Prisma Migration**

```bash
# Generate migration
npm run prisma migrate dev --name add-family-tree-and-bot

# Apply to database
npm run db:push
```

**SQL (generated):**
```sql
-- Add isBot column to User
ALTER TABLE "User" ADD COLUMN "isBot" BOOLEAN NOT NULL DEFAULT false;

-- Update Role enum
ALTER TYPE "Role" ADD VALUE 'BOT';

-- Create FamilyRelation table
CREATE TABLE "FamilyRelation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "parentId" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "relationshipType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FamilyRelation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "FamilyRelation_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE CASCADE,
  CONSTRAINT "FamilyRelation_parentId_childId_relationshipType_key" UNIQUE ("parentId", "childId", "relationshipType")
);

-- Create indexes
CREATE INDEX "FamilyRelation_parentId_idx" ON "FamilyRelation" ("parentId");
CREATE INDEX "FamilyRelation_childId_idx" ON "FamilyRelation" ("childId");
```

---

## **API וServer Actions**

### **Family Tree**

| Function | Type | Auth | Input | Output |
|----------|------|------|-------|--------|
| `addFamilyRelation` | Server Action | ADMIN | `(parentId, childId, type)` | `ActionResult` |
| `removeFamilyRelation` | Server Action | ADMIN | `(parentId, childId, type)` | `ActionResult` |
| `getUserWithFamilyTree` | Query | — | `userId` | User + relations |
| `getFamilyTreeAncestors` | Query | — | `userId, depth?` | Recursive tree |
| `getAllFamilyMembers` | Query | — | — | `FamilyMember[]` |

### **AI Bot**

| Function | Type | Auth | Input | Output |
|----------|------|------|-------|--------|
| `initializeAIBot` | Server Action | — | — | `User` |
| `getAIBot` | Query | — | — | `User \| null` |
| `getRandomAIComment` | Pure Function | — | — | `string` |
| `shouldAIComment` | Pure Function | — | — | `boolean` |
| `addAIBotComment` | Server Action | — | `postId` | `void` |

---

## **הוראות התקנה**

### **1. ברנץ חדש**
```bash
git checkout feature/family-tree-ai-bot
```

### **2. עדכן Prisma Schema**
```bash
cd levanonet
npm install
```

### **3. הפעל Migration**
```bash
npm run prisma migrate dev --name add-family-tree-and-bot
```

### **4. הנח בוט AI**
```typescript
// src/app/layout.tsx (in RootLayout)
import { initializeAIBot } from "@/lib/actions/ai-bot";

export default async function RootLayout({ children }) {
  await initializeAIBot();  // ← Initialize bot on app start
  // ...
}
```

### **5. עדכן Env Vars (.env)**
```env
# No new env vars needed!
# AI Bot uses existing settings
```

### **6. בדוק את העמודים החדשים**
```
/family-tree — אילן יוחסין
```

---

## **דוגמאות שימוש**

### **דוגמה 1: הוסף קשר משפחתי**

```typescript
// כפתור בפאנל מנהל
import { addFamilyRelation } from "@/lib/actions/family-tree";

export function AddFamilyRelationButton() {
  const handleAdd = async () => {
    const result = await addFamilyRelation(
      "user123",     // אבא
      "user456",     // בן/בת
      "parent-child"
    );

    if (result.ok) {
      toast.success("קשר הוסף בהצלחה!");
    } else {
      toast.error(result.error);
    }
  };

  return <button onClick={handleAdd}>הוסף הורה</button>;
}
```

### **דוגמה 2: צפיית אילן יוחסין**

```typescript
// /family-tree page
import { FamilyTree } from "@/components/family-tree";

export default async function FamilyTreePage() {
  const members = await getAllFamilyMembers();
  const session = await auth();

  return (
    <FamilyTree
      members={members}
      highlightedUserId={session.user.id}
    />
  );
}
```

### **דוגמה 3: בוט כותב תגובה**

```typescript
// Automatic on post creation
export async function createPost(formData: FormData) {
  const post = await prisma.post.create({ ... });

  // 30% chance bot will comment after 5 seconds
  setTimeout(() => {
    addAIBotComment(post.id);
  }, 5000);

  return { ok: true };
}
```

**Result:**
```
👤 משתמש אמיתי
"היום יום יפה במשפחה!"

🤖 לבנו הבוט
"אופס, זה נראה כמו פוסט משפחתי אמיתי 😄"
```

### **דוגמה 4: הנח בוט בהפעלה**

```typescript
// src/middleware.ts or src/app/layout.tsx
import { initializeAIBot } from "@/lib/actions/ai-bot";

export default async function RootLayout() {
  // Initialize bot once per app startup
  const bot = await initializeAIBot();
  console.log(`Bot initialized: ${bot.displayName}`);
  
  return (
    <html>
      {/* ... */}
    </html>
  );
}
```

---

## **אפשרויות מתקדמות**

### **1. שינוי אחוז הסיכוי של בוט**

```typescript
// src/lib/constants.ts
export const AI_BOT_COMMENT_CHANCE = 0.5;  // 50% instead of 30%
```

### **2. הוסף תגובות מותאמות בהתאם לזמן**

```typescript
// src/lib/actions/ai-bot.ts
export function getContextualAIComment(): string {
  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;
  
  if (isNight) {
    return "בוקר טוב! (או לילה טוב, תלוי איפה אתה)";
  }
  
  return getRandomAIComment();
}
```

### **3. אפשר בוט לתגובה לתגובות**

```typescript
// src/lib/actions/ai-bot.ts
export async function addAIBotCommentToComment(commentId: string) {
  const bot = await getAIBot();
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true }
  });

  if (shouldAIComment() && comment) {
    await prisma.comment.create({
      data: {
        postId: comment.postId,
        authorId: bot!.id,
        content: getRandomAIComment()
      }
    });
  }
}
```

### **4. Reactions מהבוט**

```typescript
// src/lib/actions/ai-bot.ts
export async function addAIBotReaction(postId: string) {
  const bot = await getAIBot();
  const emojis = ["❤️", "👍", "😂", "🎉"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  await prisma.reaction.create({
    data: {
      postId,
      authorId: bot!.id,
      emoji: randomEmoji
    }
  });
}
```

### **5. הנח משתמש AI במקום בוט זה**

```typescript
// src/lib/actions/ai-bot.ts
export async function switchAIProvider(
  provider: "openai" | "anthropic" | "local"
) {
  // Fetch AI response from external API
  const response = await fetch(
    `https://api.${provider}.com/generate`,
    { /* config */ }
  );
  
  const comment = await response.json();
  return comment.text;
}
```

### **6. Dashboard לבוט (כמה הערות, מה הגבוה ביותר לايקד וכו')**

```typescript
// src/lib/queries.ts
export async function getAIBotStats() {
  const bot = await getAIBot();
  if (!bot) return null;

  const [comments, reactions, likes] = await Promise.all([
    prisma.comment.count({ where: { authorId: bot.id } }),
    prisma.reaction.count({ where: { authorId: bot.id } }),
    prisma.reaction.count({
      where: {
        authorId: bot.id,
        emoji: "❤️"
      }
    })
  ]);

  return { comments, reactions, likes };
}
```

---

## **בדיקה (Testing)**

### **Unit Tests**

```typescript
// __tests__/ai-bot.test.ts
import { shouldAIComment, getRandomAIComment } from "@/lib/actions/ai-bot";

describe("AI Bot", () => {
  it("should return boolean from shouldAIComment", () => {
    const result = shouldAIComment();
    expect(typeof result).toBe("boolean");
  });

  it("should return string from getRandomAIComment", () => {
    const comment = getRandomAIComment();
    expect(typeof comment).toBe("string");
    expect(comment.length).toBeGreaterThan(0);
    expect(comment.length).toBeLessThanOrEqual(120);
  });
});
```

### **Integration Tests**

```typescript
// __tests__/family-tree.test.ts
import { addFamilyRelation } from "@/lib/actions/family-tree";

describe("Family Tree", () => {
  it("should add family relation", async () => {
    const result = await addFamilyRelation(
      "parent123",
      "child456",
      "parent-child"
    );
    expect(result.ok).toBe(true);
  });

  it("should reject invalid relations", async () => {
    const result = await addFamilyRelation(
      "user123",
      "user123",  // ← Same user
      "parent-child"
    );
    expect(result.ok).toBe(false);
    expect(result.error).toContain("לא ניתן");
  });
});
```

---

## **סיכום**

### **תכונות החדשות**

✅ **אילן יוחסין**
- Genealogy tree visualization
- Expandable/collapsible nodes
- User highlighting
- Bidirectional relationships (spouse, sibling)

✅ **בוט AI**
- Automatic humorous comments
- 30% chance per post
- 5-second delay
- Hebrew humor templates
- Non-blocking async execution

### **Files Added/Modified**

**New Files:**
- `src/components/family-tree.tsx`
- `src/app/family-tree/page.tsx`
- `src/lib/actions/family-tree.ts`
- `src/lib/actions/ai-bot.ts`

**Modified Files:**
- `prisma/schema.prisma` — New tables & fields
- `src/lib/constants.ts` — AI config
- `src/lib/queries.ts` — Family tree queries
- `src/lib/actions/posts.ts` — AI bot integration
- `src/components/nav-links.tsx` — Link to family tree

---

## **עזרה ותמיכה**

**שאלות או בעיות?**

1. בדוק את `src/lib/actions/ai-bot.ts` להתחלת בוט
2. בדוק את `FamilyRelation` schema בـ `prisma/schema.prisma`
3. הריץ `npm run db:studio` לצפיית נתונים
4. בדוק console logs עבור שגיאות

---

**גרסה:** 1.0.0  
**תאריך:** July 2026  
**Branch:** `feature/family-tree-ai-bot`
