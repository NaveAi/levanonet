# 📚 עדכון README - לבנונט v2.0

## **תכונות חדשות** 🎉

### 🌳 אילן יוחסין
צפה בכל משפחתך כעץ יוחסין אינטראקטיבי:
- 📊 קשרים: הורים, ילדים, זוגות, אחים
- ⭐ המשתמש המוקד מודגש
- 🎨 Dark mode, RTL עברית

**URL:** `/family-tree`

### 🤖 בוט AI הומוריסטי
בוט שכותב הערות מצחיקות על הפוסטים שלך:
- 💬 30% סיכוי לתגובה
- ⏱️ 5 שניות delay
- 🎭 עברית הומוריסטית טבעית

---

## **התקנה מהירה**

```bash
# Clone + setup
git clone https://github.com/NaveAi/levanonet
cd levanonet

# ✨ New: Checkout feature branch
git checkout feature/family-tree-ai-bot

# Install
npm install

# Database
npm run prisma migrate dev --name add-family-tree-and-bot

# Run
npm run dev

# Open http://localhost:3000
```

---

## **מה שנוסף**

| תכונה | קבצים | Status |
|-------|-------|--------|
| אילן יוחסין | `src/components/family-tree.tsx`, `src/app/family-tree/page.tsx` | ✅ Ready |
| בוט AI | `src/lib/actions/ai-bot.ts`, `src/lib/actions/family-tree.ts` | ✅ Ready |
| DB Schema | `prisma/schema.prisma` | ✅ Migrated |
| Documentation | `FAMILY_TREE_AND_AI_BOT_GUIDE.md` | ✅ Complete |

---

## **צעדי Merge**

```bash
# 1. כשהכל עובד:
git checkout master

# 2. Merge
git merge feature/family-tree-ai-bot

# 3. Push
git push origin master

# 4. או צור PR ב-GitHub UI
```

---

## **Deployment**

```bash
# Vercel auto-deploys on push to master
# אם צריך migration בפרודקשן:
vercel env pull
npm run prisma migrate deploy
```

---

## **צעדי הבא**

- [ ] Pull branch חדש
- [ ] Run migrations
- [ ] Test `/family-tree` page
- [ ] Test AI bot comments
- [ ] Merge ל-master
- [ ] Deploy ל-Vercel

---

ראה `QUICK_UPDATE.md` עבור סיכום מהיר או `FAMILY_TREE_AND_AI_BOT_GUIDE.md` לתיעוד מלא.
