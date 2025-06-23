-- קובץ תיקון לטבלאות קיימות
-- הרץ את זה רק אם כבר יצרת את הטבלאות עם השמות הישנים

-- אם הטבלה connections כבר קיימת עם created_date, נמחק אותה ונוצר מחדש
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS matches CASCADE;

-- יצירת טבלת חיבורים מחדש (גרסה תקינה)
CREATE TABLE connections (
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

-- יצירת טבלת התאמות מחדש (גרסה תקינה)
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection1_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    connection2_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- הגדרת Row Level Security מחדש
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- יצירת מדיניות גישה מחדש
CREATE POLICY "Everyone can view connections" ON connections
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own connections" ON connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON connections
    FOR DELETE USING (auth.uid() = user_id);

-- יצירת אינדקסים מחדש
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_type ON connections(connection_type);
CREATE INDEX idx_connections_region ON connections(region);
CREATE INDEX idx_connections_city ON connections(city);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created_at ON connections(created_at);

-- יצירת trigger מחדש
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE
    ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE
    ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 