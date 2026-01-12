import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkpbvipkkverihlymole.supabase.co';
const supabaseKey = 'sb_publishable_zaAffA3Gry96v7UNGONTcg_cbrTFmNu';

export const supabase = createClient(supabaseUrl, supabaseKey);
