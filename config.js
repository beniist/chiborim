// קובץ קונפיגורציה לחיבור ל-Supabase
const SUPABASE_URL = 'https://bhhvglrmeyadbpbpdsyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaHZnbHJtZXlhZGJwYnBkc3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTg0MDMsImV4cCI6MjA2NDk3NDQwM30.CM50ocubMi9NpRaFolKzPQCP8tW1T6tJfeB-5Cb4h2E';

// יצירת הקשר עם Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// פונקציות עזר לעבודה עם Supabase
class SupabaseManager {
    constructor() {
        this.client = supabaseClient;
    }

    // יצירת חיבור חדש
    async createConnection(connectionData) {
        try {
            const { data, error } = await this.client
                .from('connections')
                .insert([connectionData]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה ביצירת חיבור:', error);
            return { success: false, error: error.message };
        }
    }

    // חיפוש חיבורים
    async searchConnections(searchParams) {
        try {
            let query = this.client.from('connections').select('*');
            
            if (searchParams.connection_type) {
                query = query.eq('connection_type', searchParams.connection_type);
            }
            if (searchParams.offer_or_request) {
                query = query.eq('offer_or_request', searchParams.offer_or_request);
            }
            if (searchParams.region) {
                query = query.eq('region', searchParams.region);
            }
            if (searchParams.city) {
                query = query.eq('city', searchParams.city);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בחיפוש חיבורים:', error);
            return { success: false, error: error.message };
        }
    }

    // רישום משתמש חדש
    async signUp(email, password, userData) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה ברישום:', error);
            return { success: false, error: error.message };
        }
    }

    // התחברות
    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בהתחברות:', error);
            return { success: false, error: error.message };
        }
    }

    // התנתקות
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('שגיאה בהתנתקות:', error);
            return { success: false, error: error.message };
        }
    }

    // קבלת משתמש נוכחי
    async getCurrentUser() {
        try {
            const { data: { user } } = await this.client.auth.getUser();
            return user;
        } catch (error) {
            console.error('שגיאה בקבלת משתמש נוכחי:', error);
            return null;
        }
    }

    // עדכון פרופיל משתמש
    async updateUserProfile(userId, profileData) {
        try {
            const { data, error } = await this.client
                .from('users')
                .upsert([{
                    id: userId,
                    ...profileData,
                    updated_at: new Date().toISOString()
                }]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בעדכון פרופיל:', error);
            return { success: false, error: error.message };
        }
    }

    // קבלת חיבורים של משתמש
    async getUserConnections(userId) {
        try {
            const { data, error } = await this.client
                .from('connections')
                .select('*')
                .eq('user_id', userId)
                .order('created_date', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בקבלת חיבורי משתמש:', error);
            return { success: false, error: error.message };
        }
    }

    // מחיקת חיבור
    async deleteConnection(connectionId, userId) {
        try {
            const { data, error } = await this.client
                .from('connections')
                .delete()
                .eq('id', connectionId)
                .eq('user_id', userId);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה במחיקת חיבור:', error);
            return { success: false, error: error.message };
        }
    }

    // חיפוש מתקדם עם פילטרים
    async advancedSearch(filters) {
        try {
            let query = this.client
                .from('connections')
                .select(`
                    *,
                    users:user_id (
                        full_name,
                        email
                    )
                `)
                .eq('status', 'active');
            
            if (filters.connection_type) {
                query = query.eq('connection_type', filters.connection_type);
            }
            if (filters.offer_or_request) {
                query = query.eq('offer_or_request', filters.offer_or_request);
            }
            if (filters.region) {
                query = query.eq('region', filters.region);
            }
            if (filters.city) {
                query = query.ilike('city', `%${filters.city}%`);
            }
            if (filters.tags && filters.tags.length > 0) {
                query = query.overlaps('tags', filters.tags);
            }
            if (filters.priceMin !== undefined) {
                query = query.gte('price', filters.priceMin);
            }
            if (filters.priceMax !== undefined) {
                query = query.lte('price', filters.priceMax);
            }
            
            const { data, error } = await query
                .order('created_date', { ascending: false })
                .limit(50);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בחיפוש מתקדם:', error);
            return { success: false, error: error.message };
        }
    }

    // שליחת הודעה
    async sendMessage(senderId, receiverId, connectionId, content) {
        try {
            const { data, error } = await this.client
                .from('messages')
                .insert([{
                    sender_id: senderId,
                    receiver_id: receiverId,
                    connection_id: connectionId,
                    content: content
                }]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בשליחת הודעה:', error);
            return { success: false, error: error.message };
        }
    }

    // קבלת הודעות משתמש
    async getUserMessages(userId) {
        try {
            const { data, error } = await this.client
                .from('messages')
                .select(`
                    *,
                    sender:sender_id (full_name, email),
                    receiver:receiver_id (full_name, email),
                    connection:connection_id (title, connection_type)
                `)
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בקבלת הודעות:', error);
            return { success: false, error: error.message };
        }
    }

    // סימון הודעה כנקראה
    async markMessageAsRead(messageId, userId) {
        try {
            const { data, error } = await this.client
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId)
                .eq('receiver_id', userId);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('שגיאה בסימון הודעה כנקראה:', error);
            return { success: false, error: error.message };
        }
    }
}

// יצירת instance של המנהל
const supabaseManager = new SupabaseManager(); 