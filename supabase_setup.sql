-- קובץ SQL ליצירת הטבלאות ב-Supabase
-- הרץ את הקוד הזה ב-SQL Editor של Supabase

-- 1. יצירת טבלת משתמשים
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_image_url TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. יצירת טבלת חיבורים
CREATE TABLE IF NOT EXISTS connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    connection_type VARCHAR(50) NOT NULL CHECK (connection_type IN ('barter', 'service', 'collaboration', 'acquaintance', 'help', 'advice', 'recommendation')),
    offer_or_request VARCHAR(10) NOT NULL CHECK (offer_or_request IN ('give', 'get')),
    region VARCHAR(50) NOT NULL CHECK (region IN ('south', 'north', 'center', 'shfela', 'jerusalem', 'sharon')),
    city VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    is_negotiable BOOLEAN DEFAULT true,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    expires_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. יצירת טבלת התאמות
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection1_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    connection2_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. יצירת טבלת הודעות
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. יצירת טבלת דירוגים
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rated_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. הגדרת Row Level Security (RLS)
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- 7. יצירת מדיניות גישה לטבלת חיבורים
-- כל אחד יכול לראות את כל החיבורים
CREATE POLICY "Everyone can view connections" ON connections
    FOR SELECT USING (true);

-- רק בעלי החיבורים יכולים לערוך אותם
CREATE POLICY "Users can insert their own connections" ON connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON connections
    FOR DELETE USING (auth.uid() = user_id);

-- 8. יצירת מדיניות גישה לטבלת הודעות
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 9. יצירת מדיניות גישה לטבלת דירוגים
CREATE POLICY "Everyone can view ratings" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert ratings" ON ratings
    FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- 10. יצירת אינדקסים לביצועים
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
CREATE INDEX idx_connections_region ON connections(region);
CREATE INDEX idx_connections_city ON connections(city);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created_at ON connections(created_at);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_connection ON messages(connection_id);

-- 11. יצירת פונקציה לעדכון timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. יצירת triggers לעדכון אוטומטי של updated_at
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE
    ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE
    ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 