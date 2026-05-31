# פריסה ל-Vercel

## משתני סביבה (Settings → Environment Variables)

| משתנה | דוגמה | חובה |
|--------|--------|------|
| `DATABASE_URL` | `postgresql://...@neon.tech/neondb?sslmode=require` | כן |
| `AUTH_SECRET` | מחרוזת אקראית ארוכה | כן |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | כן |
| `INVITE_CODE` | קוד משפחה | כן |
| `UPLOAD_PROVIDER` | `s3` | כן (בפרודקשן) |
| `AWS_REGION` | `us-west-2` | אם S3 |
| `AWS_S3_BUCKET` | `levanonet` | אם S3 |
| `AWS_ACCESS_KEY_ID` | ... | אם S3 |
| `AWS_SECRET_ACCESS_KEY` | ... | אם S3 |

**אל תעלה** קובץ `.env` ל-GitHub.

## מסד נתונים (Neon — חינם)

1. [neon.tech](https://neon.tech) → פרויקט חדש
2. העתק **Connection string** → `DATABASE_URL` ב-Vercel
3. אחרי Deploy ראשון, הרץ מקומית פעם אחת:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   ```

## NEXTAUTH_URL

חייב להתאים לדומיין האמיתי, למשל:
`https://levanonet.vercel.app`

## בדיקה אחרי Deploy

1. `/register` — הרשמה עם קוד הזמנה
2. פרסום פוסט + תמונה
3. `/admin` — רק למנהל
