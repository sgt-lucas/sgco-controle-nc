// Caminho do arquivo: src/utils/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // O Next.js automaticamente disponibiliza as variáveis de ambiente do Vercel
  // para este processo, desde que comecem com NEXT_PUBLIC_
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}