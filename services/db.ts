
import { supabase } from "../utils/supabase.ts";
import { User, ReadingLog, Book, Flashcard, MemoryPalace } from "../types.ts";

// Cache interno para evitar lecturas repetitivas en la misma sesión
const _cache: Record<string, {data: any, timestamp: number}> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos

const getFromCache = (key: string) => {
    const entry = _cache[key];
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
    return null;
};

const setToCache = (key: string, data: any) => {
    _cache[key] = { data, timestamp: Date.now() };
};

export const dbService = {
    // --- Auth & User Management ---
    async getUserProfile(userId: string): Promise<User | null> {
        try {
            // Intentar recuperar de cache primero
            const cached = getFromCache(`profile_${userId}`);
            if (cached) return cached;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
                
            if (error || !data) return null;

            const profile = {
                id: data.id,
                name: data.name || 'Usuario',
                email: data.email || '',
                avatarUrl: data.avatar_url || '',
                stats: {
                    streak: data.stats?.streak ?? 0,
                    tel: data.stats?.tel ?? 0,
                    xp: data.stats?.xp ?? 0,
                    lastActiveDate: data.stats?.lastActiveDate ?? Date.now(),
                    maxSchulteLevel: data.stats?.maxSchulteLevel ?? 1,
                    maxWordSpan: data.stats?.maxWordSpan ?? 3
                },
                preferences: {
                    dailyGoalMinutes: data.preferences?.dailyGoalMinutes ?? 15,
                    targetWPM: data.preferences?.targetWPM ?? 300,
                    difficultyLevel: data.preferences?.difficultyLevel ?? 'Básico',
                    notificationsEnabled: data.preferences?.notificationsEnabled ?? true,
                    soundEnabled: data.preferences?.soundEnabled ?? true,
                    themeColor: data.preferences?.themeColor ?? '#19e65e',
                    unlockedRewards: data.preferences?.unlockedRewards ?? []
                },
                achievements: data.achievements || [],
                learningProgress: data.learning_progress || [],
                joinedDate: data.joined_at ? new Date(data.joined_at).getTime() : Date.now(),
                baselineWPM: data.baseline_wpm ?? 200, 
                level: data.level || 'Iniciado'
            };

            setToCache(`profile_${userId}`, profile);
            return profile;
        } catch (e) {
            return null;
        }
    },

    async updateFullProfile(userId: string, updates: Partial<User>): Promise<void> {
        try {
            // Invalidar cache local
            delete _cache[`profile_${userId}`];

            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
            if (updates.stats) dbUpdates.stats = updates.stats;
            if (updates.preferences) dbUpdates.preferences = updates.preferences;
            if (updates.achievements) dbUpdates.achievements = updates.achievements;
            if (updates.learningProgress) dbUpdates.learning_progress = updates.learningProgress;
            if (updates.level) dbUpdates.level = updates.level;
            if (updates.baselineWPM) dbUpdates.baseline_wpm = updates.baselineWPM;

            const { error } = await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', userId);

            if (error) throw error;
        } catch (e) {
            console.error("[DB Performance] Sync error bypassed to prevent freeze:", e);
        }
    },

    async createUserProfile(user: User): Promise<void> {
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatarUrl,
                stats: user.stats,
                preferences: user.preferences,
                achievements: user.achievements || [],
                learning_progress: user.learningProgress || [],
                level: user.level || 'Iniciado',
                baseline_wpm: user.baselineWPM,
                joined_at: new Date().toISOString()
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("[DB] Create profile error:", error.message);
        }
    },

    // --- Books Management ---
    async getUserBooks(userId: string): Promise<Book[]> {
        const cacheKey = `books_${userId}`;
        const cached = getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const { data, error } = await supabase
                .from('user_books')
                .select('id, user_id, title, author, cover_url, content, progress, is_analyzed')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error || !data) return [];
            const books = data.map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                title: row.title,
                author: row.author,
                coverUrl: row.cover_url,
                content: row.content,
                progress: row.progress,
                isAnalyzed: row.is_analyzed,
                category: 'user'
            }));

            setToCache(cacheKey, books);
            return books;
        } catch (e) {
            return [];
        }
    },

    async addUserBook(book: Book): Promise<string | null> {
        try {
            delete _cache[`books_${book.userId}`];
            const { data, error } = await supabase
                .from('user_books')
                .insert({
                    user_id: book.userId,
                    title: book.title,
                    author: book.author,
                    cover_url: book.coverUrl,
                    content: book.content,
                    progress: book.progress,
                    is_analyzed: book.isAnalyzed
                })
                .select('id')
                .single();
            if (error) throw error;
            return data.id;
        } catch (e) {
            return null;
        }
    },

    async deleteUserBook(bookId: string): Promise<boolean> {
        try {
            // Invalidación agresiva para asegurar que la UI se refresque
            Object.keys(_cache).forEach(k => { if(k.startsWith('books_')) delete _cache[k]; });
            const { error } = await supabase
                .from('user_books')
                .delete()
                .eq('id', bookId);
            if (error) throw error;
            return true;
        } catch (e) {
            return false;
        }
    },

    // --- Logs ---
    async getReadingLogs(userId: string): Promise<ReadingLog[]> {
        const cacheKey = `logs_${userId}`;
        const cached = getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const { data, error } = await supabase
                .from('reading_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50); // Limitar a los más recientes para ahorrar memoria

            if (error || !data) return [];
            const logs = data.map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                exerciseType: row.exercise_type,
                levelOrSpeed: row.score_data?.levelOrSpeed,
                durationSeconds: row.score_data?.durationSeconds,
                wpmCalculated: row.score_data?.wpmCalculated,
                telCalculated: row.score_data?.telCalculated,
                comprehensionRate: row.score_data?.comprehensionRate,
                errors: row.score_data?.errors,
                timestamp: new Date(row.created_at).getTime()
            }));

            setToCache(cacheKey, logs);
            return logs;
        } catch (e) {
            return [];
        }
    },

    async addReadingLog(log: ReadingLog): Promise<void> {
        try {
            delete _cache[`logs_${log.userId}`];
            const { error } = await supabase.from('reading_logs').insert({
                user_id: log.userId,
                exercise_type: log.exerciseType,
                score_data: {
                    levelOrSpeed: log.levelOrSpeed,
                    durationSeconds: log.durationSeconds,
                    wpmCalculated: log.wpmCalculated,
                    telCalculated: log.telCalculated,
                    comprehensionRate: log.comprehensionRate,
                    errors: log.errors
                }
            });
            if (error) throw error;
        } catch (e) {}
    },

    async getMemoryPalaces(userId: string): Promise<MemoryPalace[]> {
        try {
            const { data, error } = await supabase
                .from('memory_palaces')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error || !data) return [];
            return data.map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                name: row.name,
                method: row.method,
                description: row.description,
                items: row.items,
                timestamp: new Date(row.created_at).getTime()
            }));
        } catch (e) {
            return [];
        }
    },

    async addMemoryPalace(palace: MemoryPalace): Promise<void> {
        try {
            const { error } = await supabase.from('memory_palaces').insert({
                id: palace.id,
                user_id: palace.userId,
                name: palace.name,
                method: palace.method,
                description: palace.description,
                items: palace.items
            });
            if (error) throw error;
        } catch (e) {
            console.error("[DB] Error adding palace:", e);
        }
    }
};
