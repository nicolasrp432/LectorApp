
import { supabase } from "../utils/supabase";
import { User, ReadingLog, Book, Flashcard, MemoryPalace, UserStats, UserPreferences } from "../types";

export const dbService = {
    // --- Auth & User ---
    async getUserProfile(userId: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error || !data) return null;

        const stats = {
            streak: 0,
            tel: 0,
            xp: 0,
            maxSchulteLevel: 1,
            maxWordSpan: 3,
            ...data.stats
        };

        return {
            id: data.id,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatar_url,
            stats: stats,
            preferences: data.preferences,
            achievements: data.achievements || [],
            joinedDate: new Date(data.joined_at).getTime(),
            baselineWPM: 200, 
            level: 'Estudiante'
        };
    },

    async createUserProfile(user: User): Promise<void> {
        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatarUrl,
            stats: user.stats,
            preferences: user.preferences,
            achievements: user.achievements || []
        });

        if (error) console.error("Error creating profile:", error.message);
    },

    // Fix: Added missing method to update user statistics
    async updateUserStats(userId: string, stats: UserStats): Promise<void> {
        const { error } = await supabase.from('profiles').update({
            stats: stats
        }).eq('id', userId);
        if (error) console.error("Error updating stats:", error.message);
    },

    // Fix: Added missing method to update user preferences
    async updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
        const { error } = await supabase.from('profiles').update({
            preferences: preferences
        }).eq('id', userId);
        if (error) console.error("Error updating preferences:", error.message);
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
            dueDate: Number(row.due_date),
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

        const { error } = await supabase.from('flashcards').insert(dbCards);
        if (error) console.error("Error adding flashcards:", error.message);
    },

    async updateFlashcard(card: Flashcard): Promise<void> {
        const { error } = await supabase.from('flashcards').update({
            interval: card.interval,
            repetition: card.repetition,
            efactor: card.efactor,
            due_date: card.dueDate,
            last_reviewed: card.lastReviewed,
            mastery_level: card.masteryLevel
        }).eq('id', card.id);

        if (error) console.error("Error updating flashcard:", error.message);
    },

    // --- Books ---
    // Fix: Added missing method to retrieve books for a specific user
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
            coverUrl: row.cover_url,
            content: row.content,
            progress: row.progress,
            isAnalyzed: row.is_analyzed,
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

    // Fix: Added missing method to log a reading session or exercise
    async addReadingLog(log: ReadingLog): Promise<void> {
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
        if (error) console.error("Error adding reading log:", error.message);
    },

    // --- Memory Palaces ---
    // Fix: Added missing method to retrieve memory palaces for a user
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

    // Fix: Added missing method to save a memory palace to the database
    async addMemoryPalace(palace: MemoryPalace): Promise<void> {
        const { error } = await supabase.from('memory_palaces').insert({
            user_id: palace.userId,
            name: palace.name,
            method: palace.method,
            description: palace.description,
            items: palace.items
        });
        if (error) console.error("Error adding memory palace:", error.message);
    }
};
