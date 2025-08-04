-- קובץ לבדיקת מבנה הטבלה הקיימת
-- הרץ את זה ב-SQL Editor כדי לראות איך הטבלה נראית עכשיו

-- בדיקה אם הטבלה קיימת ומה המבנה שלה
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'connections' 
ORDER BY ordinal_position;

-- אם הטבלה לא קיימת, נקבל 0 תוצאות
-- אם היא קיימת, נראה את כל העמודות 