# מדריך פריסה לאפליקציית "חיבורים"

## שלב 1: הקמת Supabase

### יצירת פרוייקט חדש
1. היכנס ל-[Supabase](https://supabase.com)
2. לחץ "New Project"
3. בחר ארגון או צור חדש
4. מלא פרטי הפרוייקט:
   - שם הפרוייקט: `chiborim`
   - סיסמה לדטהבייס (שמור אותה!)
   - בחר אזור (Europe West - לביצועים טובים בישראל)

### הגדרת הדטהבייס
1. לאחר יצירת הפרוייקט, עבור ל-SQL Editor
2. העתק והדבק את כל הקוד מקובץ `supabase_setup.sql`
3. הרץ את הקוד (Run)
4. וודא שכל הטבלאות נוצרו בהצלחה ב-Table Editor

### הגדרת Authentication
1. עבור ל-Authentication > Settings
2. בחר "Email" כ-Provider
3. הגדר Template לאימיילים (אופציונלי)
4. ב-Site URL הוסף את הכתובת שלך (למשל: `https://yourapp.vercel.app`)

## שלב 2: הגדרת קבצי הפרוייקט

### עדכון פרטי החיבור
1. פתח את `config.js`
2. החלף את `SUPABASE_URL` ו-`SUPABASE_ANON_KEY` עם הפרטים שלך:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. את הפרטים תמצא ב-Settings > API

### הוספת רשימת ערים מלאה
1. פתח את `cities.js`
2. החלף את הערים לדוגמה ברשימה מלאה של ערים בישראל

## שלב 3: פריסה

### אופציה 1: Vercel (מומלץ)
1. העלה את הקבצים ל-GitHub repository
2. היכנס ל-[Vercel](https://vercel.com)
3. חבר את ה-repository
4. Vercel יזהה אוטומטית שזה static site
5. לחץ Deploy

### אופציה 2: Netlify
1. העלה את הקבצים ל-GitHub repository
2. היכנס ל-[Netlify](https://netlify.com)
3. "New site from Git"
4. בחר את ה-repository
5. הגדרות build:
   - Build command: `# (ריק)`
   - Publish directory: `./`

### אופציה 3: GitHub Pages
1. העלה את הקבצים ל-GitHub repository
2. עבור ל-Settings של ה-repository
3. גלול ל-Pages
4. בחר source: "Deploy from a branch"
5. בחר branch: `main`
6. folder: `/ (root)`

## שלב 4: הגדרות נוספות ב-Supabase

### Row Level Security (RLS)
הטבלאות כבר מוגדרות עם RLS. וודא שהמדיניות עובדת:
1. עבור ל-Authentication > Users
2. צור משתמש בדיקה
3. נסה ליצור חיבור ולוודא שהוא נשמר

### Real-time (אופציונלי)
להפעלת עדכונים בזמן אמת:
1. עבור ל-Database > Replication
2. הפעל replication לטבלאות: `connections`, `messages`

## שלב 5: בדיקה ותחזוקה

### בדיקות
- [ ] הרשמה עובדת
- [ ] התחברות עובדת
- [ ] יצירת חיבור עובדת
- [ ] חיפוש חיבורים עובד
- [ ] התנתקות עובדת

### ניטור
1. עבור ל-Supabase Dashboard > Reports
2. עקוב אחר:
   - מספר משתמשים פעילים
   - מספר קריאות לדטהבייס
   - שגיאות

### גיבויים
1. ב-Settings > Database
2. הגדר automatic backups
3. מומלץ: גיבוי יומי לשבוע הראשון

## שלב 6: אבטחה

### Environment Variables (לפריסה מתקדמת)
אם תרצה להסתיר את ה-API keys:
1. צור קובץ `.env` (לא להעלות ל-Git!)
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
2. עדכן את `config.js` להשתמש במשתני סביבה
3. הוסף את המשתנים בפלטפורמת הפריסה

### הגדרות אבטחה נוספות
1. ב-Supabase Settings > API
2. הוסף את הדומיין שלך ל-Site URL
3. הגדר CORS origins

## שגיאות נפוצות ופתרונות

### שגיאה: "Invalid API key"
- וודא שהעתקת נכון את ה-API key
- בדוק שהפרוייקט פעיל ב-Supabase

### שגיאה: "Row Level Security"
- וודא שרצת את כל הקוד SQL
- בדוק שהמדיניות מוגדרת נכון

### שגיאה: "CORS"
- הוסף את הדומיין ב-Supabase Settings
- וודא ש-Site URL מוגדר נכון

## תמיכה
- [תיעוד Supabase](https://supabase.com/docs)
- [קהילת Supabase](https://discord.supabase.com)
- [GitHub Issues](https://github.com/your-repo/issues) 