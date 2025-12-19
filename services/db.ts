
import { supabase } from "../utils/supabase";
import { User, ReadingLog, Book, Flashcard, MemoryPalace } from "../types";

const LOCAL_PALACES_KEY = 'lector_local_palaces';

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

    async updateUserPreferences(userId: string, prefs: any): Promise<void> {
        const { data } = await supabase.from('profiles').select('preferences').eq('id', userId).single();
        const currentPrefs = data?.preferences || {};
        const newPrefs = { ...currentPrefs, ...prefs };
        await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', userId);
    },
    
    async updateUserStats(userId: string, stats: any): Promise<void> {
        await supabase.from('profiles').update({ stats: stats }).eq('id', userId);
    },

    // --- Memory Palaces ---
    async addMemoryPalace(palace: MemoryPalace): Promise<void> {
        // SQL Recommendation for user: 
        // CREATE TABLE memory_palaces (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES profiles(id), name TEXT, method TEXT, description TEXT, items JSONB, created_at TIMESTAMPTZ DEFAULT NOW());
        
        try {
            const { error } = await supabase.from('memory_palaces').insert({
                user_id: palace.userId,
                name: palace.name,
                method: palace.method,
                description: palace.description,
                items: palace.items,
                created_at: new Date(palace.timestamp).toISOString()
            });
            
            if (error) throw error;
        } catch (error: any) {
            console.warn("Database table 'memory_palaces' not found or inaccessible. Falling back to LocalStorage.", error.message);
            // Fallback strategy: Persist locally so user data isn't lost
            const localPalaces = JSON.parse(localStorage.getItem(LOCAL_PALACES_KEY) || '[]');
            localPalaces.push(palace);
            localStorage.setItem(LOCAL_PALACES_KEY, JSON.stringify(localPalaces));
        }
    },

    async getMemoryPalaces(userId: string): Promise<MemoryPalace[]> {
        let dbPalaces: MemoryPalace[] = [];
        
        try {
            const { data, error } = await supabase
                .from('memory_palaces')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                dbPalaces = data.map((row: any) => ({
                    id: row.id,
                    userId: row.user_id,
                    name: row.name,
                    method: row.method,
                    description: row.description,
                    items: row.items,
                    timestamp: new Date(row.created_at).getTime()
                }));
            }
        } catch (e) {
            console.warn("Could not fetch memory_palaces from DB.");
        }

        // Merge with local storage items
        const localPalaces: MemoryPalace[] = JSON.parse(localStorage.getItem(LOCAL_PALACES_KEY) || '[]')
            .filter((p: MemoryPalace) => p.userId === userId);

        // Deduplicate and return (prefer DB items if ID matches, though local IDs are generated differently)
        const combined = [...dbPalaces, ...localPalaces].sort((a, b) => b.timestamp - a.timestamp);
        return combined;
    },

    // --- Logs ---
    async addReadingLog(log: ReadingLog): Promise<void> {
        const { error } = await supabase.from('reading_logs').insert({
            user_id: log.userId,
            exercise_type: log.exerciseType,
            score_data: {
                levelOrSpeed: log.levelOrSpeed,
                durationSeconds: log.durationSeconds,
                wpmCalculated: log.wpmCalculated,
                telCalculated: log.telCalculated,
                comprehensionRate: log.comprehensionRate,
                fixationTimeAvg: log.fixationTimeAvg,
                errors: log.errors
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
            fixationTimeAvg: row.score_data.fixationTimeAvg,
            errors: row.score_data.errors,
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

        if(error) return [];

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
            book_id: c.bookId?.length && c.bookId.length > 20 ? c.bookId : null,
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
