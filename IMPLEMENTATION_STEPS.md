# 🚀 צעדי יישום: אילן יוחסין + בוט AI

## **שלב 1: ניתוק ודיפוןמשמר המידע**

```bash
# בדוק את ה-branch החדש
git checkout feature/family-tree-ai-bot

# תשנה את Prisma schema
npm install
```

---

## **שלב 2: עדכון Prisma Schema**

### **ב-`prisma/schema.prisma`:**

```diff
enum Role {
  MEMBER
  ADMIN
+ BOT
}

model User {
  // ... existing fields
+ isBot        Boolean   @default(false)
  
+ parentRelations   FamilyRelation[] @relation("parent")
+ childRelations    FamilyRelation[] @relation("child")
+ spouseRelations   FamilyRelation[] @relation("spouse")
}

+ model FamilyRelation {
+   id              String   @id @default(cuid())
+   parentId        String
+   parent          User     @relation("parent", fields: [parentId], references: [id], onDelete: Cascade)
+   childId         String
+   child           User     @relation("child", fields: [childId], references: [id], onDelete: Cascade)
+   relationshipType String   // "parent-child" | "spouse" | "sibling"
+   createdAt       DateTime @default(now())
+
+   @@unique([parentId, childId, relationshipType])
+   @@index([parentId])
+   @@index([childId])
+ }
```

---

## **שלב 3: הפעלת Migration**

```bash
# צור migration
npm run prisma migrate dev --name add-family-tree-and-bot

# או דחוק ישירות
npm run db:push

# בדוק את הנתונים
npm run db:studio
```

**SQL שיווצר:**
```sql
ALTER TABLE "User" ADD COLUMN "isBot" BOOLEAN NOT NULL DEFAULT false;
ALTER TYPE "Role" ADD VALUE 'BOT';

CREATE TABLE "FamilyRelation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "parentId" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "relationshipType" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE CASCADE,
  UNIQUE ("parentId", "childId", "relationshipType")
);

CREATE INDEX "FamilyRelation_parentId_idx" ON "FamilyRelation" ("parentId");
CREATE INDEX "FamilyRelation_childId_idx" ON "FamilyRelation" ("childId");
```

---

## **שלב 4: הנחת בוט AI**

### **ב-`src/app/layout.tsx`:**

```typescript
import { initializeAIBot } from "@/lib/actions/ai-bot";

export default async function RootLayout({ children }) {
  // Initialize bot on app startup
  await initializeAIBot().catch((e) => console.error(e));
  
  // ... rest of layout
}
```

**זה יוצור משתמש חדש:**
```
Username:    levanobot
Display:     לבנו הבוט 🤖
Role:        BOT
Email:       levanobot@levanonet.local
Password:    disabled (cannot login)
```

---

## **שלב 5: הוספת ניווט לאילן יוחסין**

### **ב-`src/components/nav-links.tsx`:**

```typescript
const links = [
  { href: "/", label: "דף הבית", icon: Home },
  { href: "/family-tree", label: "אילן יוחסין", icon: Users },  // ✅ חדש
  { href: "/profile/me", label: "הפרופיל שלי", icon: User },
  { href: "/settings", label: "הגדרות", icon: Settings },
];
```

---

## **שלב 6: פעולות לכימות Admins**

### **שימוש ב-Server Actions:**

#### **הוסף קשר משפחתי:**
```typescript
import { addFamilyRelation } from "@/lib/actions/family-tree";

// בקומפוננט Admin Panel:
const handleAddRelation = async () => {
  const result = await addFamilyRelation(
    "parent-id",
    "child-id",
    "parent-child"
  );
  
  if (result.ok) {
    toast.success("קשר הוסף בהצלחה!");
  } else {
    toast.error(result.error);
  }
};
```

#### **הסר קשר משפחתי:**
```typescript
import { removeFamilyRelation } from "@/lib/actions/family-tree";

const handleRemoveRelation = async () => {
  const result = await removeFamilyRelation(
    "parent-id",
    "child-id",
    "parent-child"
  );
  
  if (result.ok) {
    toast.success("קשר הוסר בהצלחה!");
  }
};
```

---

## **שלב 7: בדיקה**

### **טסט את אילן יוחסין:**
```bash
# 1. הפעל את האפליקציה
npm run dev

# 2. עבור ל-http://localhost:3000/family-tree

# 3. אתה תראה את כל חברי המשפחה

# 4. לחץ על חבר משפחה כדי להרחיב/צמצם
```

### **טסט את בוט AI:**
```bash
# 1. צור פוסט חדש בדף הבית

# 2. המתן 5-6 שניות

# 3. אם מאפשר (30% chance), בוט AI יוסיף תגובה הומוריסטית

# 4. בדוק logs:
node_modules/.bin/prisma studio
# ובחן את Comment table
```

---

## **שלב 8: הגדרות סביבה (אין צורך בחדשות!)**

כל ההגדרות כבר בקונסטנטות:
```typescript
// src/lib/constants.ts
export const AI_BOT_USERNAME = "levanobot";
export const AI_BOT_DISPLAY_NAME = "לבנו הבוט 🤖";
export const AI_BOT_COMMENT_CHANCE = 0.3;  // 30%
export const AI_BOT_COMMENT_DELAY = 5000;  // 5 seconds
```

**אם רוצה לשנות:**
```bash
# שנה את הערכים בקובץ זה
src/lib/constants.ts

# ואז:
git add .
git commit -m "chore: adjust AI bot settings"
```

---

## **שלב 9: Merge ל-Master**

### **כשהכל עובד:**

```bash
# 1. בדוק כל התוקני ב-dev
git checkout master
git pull origin master

# 2. Merge את ה-feature
git merge feature/family-tree-ai-bot

# 3. דחוק ל-GitHub
git push origin master

# 4. או צור Pull Request:
# https://github.com/NaveAi/levanonet/pull/new/feature/family-tree-ai-bot
```

---

## **שלב 10: פרסום (Vercel)**

### **קובץ db הישן צריך להתעדכן:**

```bash
# 1. Connect Vercel:
vercel link

# 2. עדכן environment vars (אם צריך):
vercel env pull

# 3. הפעל migration בפרודקשן:
vercel env set DATABASE_URL="your-prod-db-url"

# 4. Prisma migrate בפרודקשן:
vercel run "npm run db:push" --prod

# 5. Deploy:
git push origin master
# Vercel deploy automatically
```

---

## **שלב 11: Troubleshooting**

### **בוט AI לא מוצא או משהו לא עובד:**

```bash
# בדוק logs:
npm run db:studio

# ובחן:
1. האם יש משתמש "levanobot"?
2. האם role = "BOT"?
3. האם isBot = true?

# אם לא קיים, בצע:
const bot = await initializeAIBot();
console.log(bot);
```

### **אילן יוחסין לא מציג קשרים:**

```bash
# בדוק FamilyRelation table:
npm run db:studio

# צור קשר דרך:
await addFamilyRelation("user1", "user2", "parent-child");

# או ידני:
INSERT INTO "FamilyRelation" (id, parentId, childId, relationshipType, createdAt)
VALUES (cuid(), 'user1', 'user2', 'parent-child', NOW());
```

### **Revalidate לא עובד:**

```bash
# ודא שאתה משתמש בServer Actions ולא Regular Functions:
"use server";  // ✅ חייב להיות בתחילת הקובץ
```

---

## **שלב 12: הרחבה עתידית**

### **שיפורים אפשריים:**

1. **בוט AI משוכלל יותר:**
   ```typescript
   // השתמש ב-OpenAI/Anthropic API
   export async function generateSmartAIComment(postContent: string) {
     const response = await openai.chat.completions.create({
       model: "gpt-4",
       messages: [
         { role: "system", content: "אתה בוט הומוריסטי בעברית" },
         { role: "user", content: postContent }
       ]
     });
     return response.choices[0].message.content;
   }
   ```

2. **אילן יוחסין אינטראקטיבי:**
   ```typescript
   // הוסף כפתור "הוסף הורה" ישירות בעץ
   <button onClick={() => openFamilyModal(memberId)}>➕ הוסף הורה</button>
   ```

3. **ייצוא PDF של אילן יוחסין:**
   ```typescript
   import html2pdf from "html2pdf.js";
   
   const handleExportPDF = () => {
     html2pdf().set(options).from(familyTreeRef.current).save();
   };
   ```

4. **אנימציות בעץ:**
   ```css
   @keyframes slideIn {
     from { opacity: 0; transform: translateY(-10px); }
     to { opacity: 1; transform: translateY(0); }
   }
   
   .family-member {
     animation: slideIn 0.3s ease-out;
   }
   ```

---

## **שלב 13: Documentation**

### **תיעוד מלא זמין ב:**
- `FAMILY_TREE_AND_AI_BOT_GUIDE.md` — המדריך המלא
- `LEVANONET_COMPREHENSIVE_DOCUMENTATION.md` — כל התכונות
- `README.md` — התחלה מהירה

---

## **שלב 14: סיכום**

✅ **התקנת Prisma schema עם:**
- `FamilyRelation` table
- `BOT` role
- `isBot` field

✅ **בנייית אילן יוחסין:**
- Component: `FamilyTree.tsx`
- Page: `/family-tree`
- Queries: `getFamilyTree*`
- Actions: `addFamilyRelation`, `removeFamilyRelation`

✅ **בנייית בוט AI:**
- User: `levanobot` (auto-created)
- Comments: Random humorous Hebrew messages
- Integration: Automatic on post creation
- Non-blocking: 5-second delay, 30% chance

✅ **כל הקבצים:**
- 9 files created/modified
- Full documentation
- Tests & examples
- Deployment ready

---

## **צעד הבא**

1. **Pull** את הקוד מ-GitHub
2. **Run** `npm install`
3. **Execute** `npm run db:push`
4. **Start** `npm run dev`
5. **Enjoy** 🎉

```bash
git clone https://github.com/NaveAi/levanonet.git
cd levanonet
git checkout feature/family-tree-ai-bot
npm install
npm run db:push
npm run dev
# Navigate to http://localhost:3000/family-tree
```

---

**כל מה שצריך כבר הוכן והמוקד!** 🚀
