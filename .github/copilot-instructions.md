README

Questo arquivo fornece instruções concisas para agentes de codificação (Copilot/AI) que trabalham neste repositório.

Objetivo rápido
- Repositório: `sgco-controle-nc` — aplicativo Next.js (app router) usado como painel de controle orçamentário.
- Linguagens: TypeScript, React 19, Next.js 16, TailwindCSS, Supabase (cliente browser via `@supabase/ssr`).

Arquitetura (visão grande)
- Frontend: Next.js App Router com arquivos em `app/` (ex.: `app/layout.tsx`, `app/page.tsx`). A UI é composta por componentes em `components/ui/`.
- Estado/integração: autenticação e chamadas ao Supabase via `lib/supabase/client.ts` usando `createBrowserClient`. As variáveis aparecem como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Utilitários: pequenas helpers em `lib/` (ex.: `lib/utils.ts` para `cn()` — combinação de classes Tailwind).

Padrões e convenções do projeto
- App Router: rotas e páginas usam arquivos sob `app/`. Componentes React são TSX e usam 'use client' quando precisam de estado/efeitos (veja `app/page.tsx`).
- Estilo/UI: Tailwind via `globals.css` + utilitário `cn()` para mesclar classes (`lib/utils.ts`). Componentes visuais estão em `components/ui/` e exportam padrões (Button, Card, Input, Label).
- Supabase: cliente criado no browser pelo wrapper `createClient()` em `lib/supabase/client.ts`. Sempre use esse wrapper em vez de instanciar `createClient` direto para manter compatibilidade com variáveis de ambiente.
- Internacionalização: strings estão em português (pt-BR). Mantenha o idioma consistente ao adicionar UI/erros.

Build, desenvolvimento e scripts
- Para rodar localmente:
  - `npm run dev` — inicia Next.js em modo desenvolvimento (porta 3000 por padrão).
  - `npm run build` — build de produção (`next build`).
  - `npm run start` — inicia servidor de produção (`next start`).
  - `npm run lint` — roda ESLint configurado por `eslint.config.mjs`.

Variáveis de ambiente importantes
- NEXT_PUBLIC_SUPABASE_URL — URL do Supabase (ex.: https://xyz.supabase.co)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — chave anônima do Supabase
Observação: `lib/supabase/client.ts` assume presença dessas variáveis (usa o operador `!` para garantir que não sejam undefined).

Padrões de autenticação/UX
- O formulário de login em `app/page.tsx` usa `supabase.auth.signInWithPassword({ email: username, password })`. O campo `username` é mapeado para `email` — preserve esse comportamento ao refatorar autenticação.
- Em caso de sucesso o código redireciona com `window.location.href = '/dashboard'`.

Quando alterar/introduzir rotas
- App Router: adicione novas rotas criando pastas/arquivos sob `app/` (ex.: `app/dashboard/page.tsx`). Use `use client` apenas em componentes que precisam de estado/efeitos do navegador.

Exemplos rápidos (copiar/colar seguro)
- Importar o supabase client (use o wrapper):
  import { createClient } from '@/lib/supabase/client'

- Mesclar classes Tailwind (ex.:):
  import { cn } from '@/lib/utils'
  <div className={cn('p-4', isActive && 'bg-blue-500')} />

Casos a evitar / notas de segurança
- Não mover chaves do Supabase para código não-`NEXT_PUBLIC_` sem rever o fluxo (o projeto espera chaves públicas no browser). Não comite segredos.
- Evite usar Node-only Supabase server clients no browser; este repo usa `createBrowserClient` para operações do cliente.

Arquivos chave para revisão rápida
- `app/layout.tsx` — layout global e rodapé
- `app/page.tsx` — página de login (mapeamento username -> email)
- `lib/supabase/client.ts` — wrapper do Supabase
- `lib/utils.ts` — utilitário `cn`
- `components/ui/*` — componentes estilizados com Tailwind

Perguntas comuns
- Onde adicionar uma nova página? `app/<rota>/page.tsx`.
- Como autenticar no servidor? Atualmente não há client server-side dedicado; revise uso de `@supabase/ssr` se precisar de SSR/SSG.

Se precisar de mais contexto, pergunte: posso abrir arquivos adicionais, mostrar componentes `components/ui/*` ou explicar o fluxo de autenticação com mais detalhe.
