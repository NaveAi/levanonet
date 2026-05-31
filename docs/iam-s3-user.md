# משתמש IAM לאפליקציה (bucket פרטי)

ה-bucket נשאר **פרטי**. האפליקציה משתמשת במפתחות IAM לעלייה ולקישורים חתומים (presigned) לצפייה.

## 1. צור משתמש IAM

AWS Console → IAM → Users → Create user  
שם מוצע: `lev-net-app`

## 2. הרשאות (Policy)

Attach policy → Create inline policy → JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LevNetBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::levanonet",
        "arn:aws:s3:::levanonet/uploads/*"
      ]
    }
  ]
}
```

החלף `levanonet` בשם ה-bucket שלך.

## 3. מפתחות גישה

Security credentials → Create access key → Application running outside AWS  
העתק ל-`.env`:

```env
UPLOAD_PROVIDER=s3
AWS_REGION=us-west-2
AWS_S3_BUCKET=levanonet
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

`AWS_S3_PUBLIC_URL` — **לא חובה** במצב פרטי.

## 4. Bucket

- Block Public Access — **השאר מופעל** (פרטי)
- אין צורך ב-Bucket Policy ציבורית

## 5. תמונות ישנות

פוסטים עם URL מלא (`https://...amazonaws.com/...`) עדיין יעבדו — האפליקציה חותמת אותם presigned אוטומטית.

פוסטים חדשים נשמרים כ-`s3:uploads/...` ב-DB.
