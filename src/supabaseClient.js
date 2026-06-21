import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rycqiprwddgagmlfptdd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Y3FpcHJ3ZGRnYWdtbGZwdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzQyMDMsImV4cCI6MjA5NjUxMDIwM30.sL28Odr000_T7hZ0YyIkbQN_TEDdQ-qBdUbCKWY0wGY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
