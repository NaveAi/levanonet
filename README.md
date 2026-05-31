# לו (Lev Net) — רשת משפחתית פרטית

רשת חברתית קטנה למשפחה: פוסטים, תמונות, תגובות, אימוג'י, פרופילים והגדרות, ופאנל ניהול.

## התחלה מהירה (מקומי, חינם)

### 1. דרישות

- [Node.js](https://nodejs.org/) 20+
- npm

### 2. התקנה

```bash
cd lev_net
npm install
npm run db:push
npm run dev
```

פתחו: **http://localhost:3000**

### 3. הרשמה ראשונה

- המשתמש **הראשון** שנרשם הופך אוטומטית ל**מנהל**
- קוד הזמנה ברירת מחדל (בקובץ `.env`): `משפחת-לו`
- שנהו ב-`.env` את `INVITE_CODE` ו-`AUTH_SECRET` לפני שיתוף עם המשפחה

### 4. משתני סביבה

העתיקו `.env.example` ל-`.env` ועדכנו:

| משתנה | תיאור |
|--------|--------|
| `AUTH_SECRET` | מחרוזת אקראית ארוכה (חובה בפרודקשן) |
| `INVITE_CODE` | קוד שהמשפחה צריכה להרשמה |
| `UPLOAD_PROVIDER` | `local` (ברירת מחדל) או `s3` |

## תכונות

- פיד פוסטים + תמונות
- תגובות מילוליות קצרות
- אימוג'י מוגבלים + תגובת טקסט קצרה על פוסט/תגובה
- פרופיל אישי (שם, ביו, תמונה)
- הגדרות: ערכת נושא, מיון פיד, גודל טקסט, אימוג'י מועדפים
- פאנל מנהל: משתמשים, חסימה, מחיקת פוסטים, קוד הזמנה

## AWS S3 (אופציונלי)

Bucket **פרטי** + משתמש IAM — האפליקציה מעלה עם המפתחות ומציגה תמונות בקישורים חתומים (presigned).

הוראות מלאות: **[docs/iam-s3-user.md](docs/iam-s3-user.md)**

```env
UPLOAD_PROVIDER=s3
AWS_REGION=us-west-2
AWS_S3_BUCKET=levanonet
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## פריסה חינמית (אופציונלי)

| שירות | שימוש | עלות |
|--------|--------|------|
| [Vercel](https://vercel.com) | אירוח Next.js | חינם |
| [Neon](https://neon.tech) | PostgreSQL (החלפת SQLite) | חינם |
| S3 | תמונות | Free tier 12 חודשים |

**הערה:** SQLite עובד מצוין מקומית. ל-Vercel צריך DB בענן — עדכנו `schema.prisma` ל-`postgresql` ו-`DATABASE_URL` מ-Neon.

## מבנה הפרויקט

```
src/
  app/          # דפים (פיד, התחברות, פרופיל, הגדרות, ניהול)
  components/   # UI
  lib/          # auth, prisma, actions, uploads
prisma/         # סכמת DB
public/uploads/ # תמונות מקומיות (כש-UPLOAD_PROVIDER=local)
```

## פקודות

```bash
npm run dev        # פיתוח
npm run build      # בנייה
npm run db:push    # עדכון DB
npm run db:studio  # צפייה ב-DB
```
