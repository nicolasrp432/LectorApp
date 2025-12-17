import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ahnvjxyordnvdaaysuua.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ojcNfJU7wXIwhCVlg38fUw_oWGCAiF6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);