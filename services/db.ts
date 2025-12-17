import { supabase } from "../utils/supabase";
import { User, ReadingLog, Book, Flashcard } from "../types";

export const dbService = {
    // --- Auth & User ---
    async getUserProfile(userId: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error || !data) return null;

        // Merge defaults for stats that might not exist in old records
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
            unlockedRewards: data.unlocked_rewards || [],
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
            achievements: user.achievements || [],
            unlocked_rewards: user.unlockedRewards || []
        });

        if (error) {
            console.error("Error creating profile:", error.message, error.details || '');
        }
    },

    async updateUserPreferences(userId: string, prefs: any): Promise<void> {
        // Fetch current to merge
        const { data } = await supabase.from('profiles').select('preferences').eq('id', userId).single();
        const currentPrefs = data?.preferences || {};
        const newPrefs = { ...currentPrefs, ...prefs };

        const { error } = await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', userId);
        if (error) console.error("Error updating prefs:", error.message);
    },
    
    async updateUserStats(userId: string, stats: any): Promise<void> {
        const { error } = await supabase.from('profiles').update({ stats: stats }).eq('id', userId);
        if (error) console.error("Error updating stats:", error.message);
    },

    // --- Logs ---
    async addReadingLog(log: ReadingLog): Promise<void> {
        // No enviamos ID (deja que la DB genere UUID) ni timestamp (DB usa default now())
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
        
        if (error) console.error("Error logging reading:", error.message);
    },

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
            levelOrSpeed: row.score_data.levelOrSpeed,
            durationSeconds: row.score_data.durationSeconds,
            wpmCalculated: row.score_data.wpmCalculated,
            telCalculated: row.score_data.telCalculated,
            comprehensionRate: row.score_data.comprehensionRate,
            timestamp: new Date(row.created_at).getTime()
        }));
    },

    // --- Books ---
    async getUserBooks(userId: string): Promise<Book[]> {
        const { data, error } = await supabase
            .from('user_books')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if(error) {
            console.error("Error fetching books:", error.message);
            return [];
        }

        return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            author: row.author || 'Desconocido',
            coverUrl: row.cover_url || '',
            content: row.content,
            progress: row.progress || 0,
            totalPages: row.content ? Math.ceil(row.content.length / 2000) : 0,
            isAnalyzed: row.is_analyzed
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

        if (error) {
            console.error("Error adding book:", error.message);
            return null;
        }
        return data.id;
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
            dueDate: Number(row.due_date)
        }));
    },

    async addFlashcards(cards: Flashcard[]): Promise<void> {
        if(cards.length === 0) return;
        
        const dbCards = cards.map(c => ({
            user_id: c.userId,
            book_id: c.bookId?.length && c.bookId.length > 20 ? c.bookId : null, // Validación simple de UUID
            front: c.front,
            back: c.back,
            interval: c.interval,
            repetition: c.repetition,
            efactor: c.efactor,
            due_date: c.dueDate
        }));

        const { error } = await supabase.from('flashcards').insert(dbCards);
        if (error) console.error("Error adding flashcards:", error.message);
    },

    async updateFlashcard(card: Flashcard): Promise<void> {
        const { error } = await supabase.from('flashcards').update({
            interval: card.interval,
            repetition: card.repetition,
            efactor: card.efactor,
            due_date: card.dueDate
        }).eq('id', card.id);

        if (error) console.error("Error updating flashcard:", error.message);
    }
};