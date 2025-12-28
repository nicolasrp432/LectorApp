
import { supabase } from "../utils/supabase.ts";
import { User, ReadingLog, Book, Flashcard, MemoryPalace, UserStats, UserPreferences } from "../types.ts";

export const dbService = {
    // --- Auth & User ---
    async getUserProfile(userId: string): Promise<User | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
                
            if (error) {
                console.error("[DB] Error consultando perfil:", error.message);
                return null;
            }
            if (!data) return null;

            return {
                id: data.id,
                name: data.name || 'Usuario',
                email: data.email || '',
                avatarUrl: data.avatar_url || '',
                stats: data.stats || { streak: 1, tel: 200, xp: 100, lastActiveDate: Date.now() },
                preferences: data.preferences || { dailyGoalMinutes: 15, targetWPM: 300, difficultyLevel: 'Básico', notificationsEnabled: true, soundEnabled: true },
                achievements: data.achievements || [],
                joinedDate: data.joined_at ? new Date(data.joined_at).getTime() : Date.now(),
                baselineWPM: 200, 
                level: data.level || 'Iniciado'
            };
        } catch (e) {
            console.error("[DB] Error de excepción en getUserProfile:", e);
            return null;
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
                level: user.level || 'Iniciado',
                joined_at: new Date().toISOString()
            }, { onConflict: 'id' });

            if (error) throw error;
        } catch (error: any) {
            console.error("[DB] Fallo crítico al crear perfil:", error.message);
            // Intentamos una inserción simplificada si la completa falla por esquema
            try {
                await supabase.from('profiles').insert({
                    id: user.id,
                    email: user.email,
                    name: user.name
                });
            } catch (e) {
                console.error("[DB] Error en inserción simplificada");
            }
        }
    },

    async updateUserStats(userId: string, stats: UserStats): Promise<void> {
        try {
            const { error } = await supabase.from('profiles').update({ stats }).eq('id', userId);
            if (error) throw error;
        } catch (e) {
            console.error("[DB] Error updating user stats:", e);
        }
    },

    async updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
        try {
            const { error } = await supabase.from('profiles').update({ preferences }).eq('id', userId);
            if (error) throw error;
        } catch (e) {
            console.error("[DB] Error updating preferences:", e);
        }
    },

    // --- Flashcards ---
    async getFlashcards(userId: string): Promise<Flashcard[]> {
        const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('user_id', userId);
        if (error) return [];
        return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            bookId: row.book_id,
            front: row.front,
            back: row.back,
            interval: Number(row.interval),
            repetition: Number(row.repetition),
            efactor: Number(row.efactor),
            due_date: Number(row.due_date),
            lastReviewed: row.last_reviewed ? Number(row.last_reviewed) : undefined,
            masteryLevel: row.mastery_level ? Number(row.mastery_level) : 0
        }));
    },

    async addFlashcards(cards: Flashcard[]): Promise<void> {
        if(cards.length === 0) return;
        const dbCards = cards.map(c => ({
            user_id: c.userId,
            book_id: c.bookId && c.bookId.length > 20 ? c.bookId : null,
            front: c.front,
            back: c.back,
            interval: c.interval,
            repetition: c.repetition,
            efactor: c.efactor,
            due_date: c.dueDate,
            mastery_level: c.masteryLevel || 0
        }));
        try {
            const { error } = await supabase.from('flashcards').insert(dbCards);
            if (error) throw error;
        } catch (e) {
            console.error("[DB] Error adding flashcards:", e);
        }
    },

    async updateFlashcard(card: Flashcard): Promise<void> {
        try {
            const { error } = await supabase.from('flashcards').update({
                interval: card.interval,
                repetition: card.repetition,
                efactor: card.efactor,
                due_date: card.dueDate,
                last_reviewed: card.lastReviewed,
                mastery_level: card.masteryLevel
            }).eq('id', card.id);
            if (error) throw error;
        } catch (e) {
            console.error("[DB] Error updating flashcard:", e);
        }
    },

    // --- Books ---
    async getUserBooks(userId: string): Promise<Book[]> {
        const { data, error } = await supabase
            .from('user_books')
            .select('*')
            .eq('user_id', userId);
        if (error || !data) return [];
        return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            author: row.author,
            cover_url: row.cover_url,
            content: row.content,
            progress: row.progress,
            is_analyzed: row.is_analyzed,
            category: 'user'
        }));
    },

    async addUserBook(book: Book): Promise<string | null> {
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
        if (error) return null;
        return data.id;
    },

    // --- Reading Logs ---
    async getReadingLogs(userId: string): Promise<ReadingLog[]> {
        const { data, error } = await supabase
            .from('reading_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        if (error || !data) return [];
        return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            exerciseType: row.exercise_type,
            levelOrSpeed: row.score_data?.levelOrSpeed || 0,
            durationSeconds: row.score_data?.durationSeconds || 0,
            wpmCalculated: row.score_data?.wpmCalculated || 0,
            telCalculated: row.score_data?.telCalculated || 0,
            comprehensionRate: row.score_data?.comprehensionRate || 0,
            timestamp: new Date(row.created_at).getTime()
        }));
    },

    async addReadingLog(log: ReadingLog): Promise<void> {
        try {
            const { error } = await supabase.from('reading_logs').insert({
                user_id: log.userId,
                exercise_type: log.exerciseType,
                score_data: {
                    levelOrSpeed: log.levelOrSpeed,
                    durationSeconds: log.durationSeconds,
                    wpmCalculated: log.wpmCalculated,
                    telCalculated: log.telCalculated,
                    comprehensionRate: log.comprehensionRate
                }
            });
            if (error) throw error;
        } catch (e) {
            console.error("[DB] Error adding reading log:", e);
        }
    },

    // --- Memory Palaces ---
    async getMemoryPalaces(userId: string): Promise<MemoryPalace[]> {
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
    },

    async addMemoryPalace(palace: MemoryPalace): Promise<void> {
        try {
            const { error } = await supabase.from('memory_palaces').insert({
                user_id: palace.userId,
                name: palace.name,
                method: palace.method,
                description: palace.description,
                items: palace.items
            });
            if (error) throw error;
        } catch (e) {
            console.error("[DB] Error adding memory palace:", e);
        }
    }
};
