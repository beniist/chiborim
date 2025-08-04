-- יצירת טבלת חיבורים - גרסה פשוטה ובטוחה
-- הרץ את זה ב-SQL Editor של Supabase

-- מחיקת הטבלה אם קיימת (זה ימחק נתונים!)
DROP TABLE IF EXISTS connections CASCADE;

-- יצירת הטבלה מחדש
CREATE TABLE connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    connection_type TEXT NOT NULL,
    offer_or_request TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    is_negotiable BOOLEAN DEFAULT true,
    tags TEXT[],
    status TEXT DEFAULT 'active',
    expires_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- הגדרת Row Level Security
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- מדיניות גישה - כל אחד יכול לקרוא
CREATE POLICY "Anyone can view connections" ON connections
    FOR SELECT USING (true);

-- רק המשתמש יכול ליצור/לערוך/למחוק את החיבורים שלו
CREATE POLICY "Users can insert their own connections" ON connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON connections
    FOR DELETE USING (auth.uid() = user_id);

-- אינדקסים לביצועים
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
CREATE INDEX idx_connections_region ON connections(region);
CREATE INDEX idx_connections_city ON connections(city);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created_at ON connections(created_at);

-- פונקציה לעדכון updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger לעדכון אוטומטי של updated_at
CREATE TRIGGER update_connections_updated_at 
    BEFORE UPDATE ON connections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- הודעת הצלחה
SELECT 'Table connections created successfully!' as message; 