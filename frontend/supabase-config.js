// Supabase configuration
const SUPABASE_URL = 'https://xodvvcdsflfpqszmmupj.supabase.co'; // <-- Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZHZ2Y2RzZmxmcHFzem1tdXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MDU3MzQsImV4cCI6MjA2MzM4MTczNH0.XfhMxP652Br1dXhcsEa7es8NvuK2h_NCFGyDK7_kRqY';        // <-- Replace with your Supabase anon/public key

// Initialize Supabase client
const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabase;
