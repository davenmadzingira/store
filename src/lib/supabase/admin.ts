import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// SERVER-ONLY. Bypasses Row Level Security using the service role key.
// Never import this file from a Client Component or expose it to the browser.
// Use for: webhook handlers, signed download generation, admin operations
// that need to act outside a specific user's permissions.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
