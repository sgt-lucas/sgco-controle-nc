// Caminho do arquivo: app/dashboard/page.tsx

// 'use client' // Manter comentado por enquanto, pois não há interatividade

import { Button } from "@/components/ui/button"; // Importaremos o botão para logout depois

export default function DashboardPage() {

  // Futuramente, adicionaremos aqui:
  // 1. Verificação se o usuário está realmente logado (proteção de rota)
  // 2. Busca dos dados das Notas de Crédito no Supabase
  // 3. Renderização das tabelas e formulários

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">
          Painel de Controle - SALC
        </h1>
        {/* Botão de Logout (funcionalidade futura) */}
        {/* <Button variant="outline" size="sm">Sair</Button> */}
      </header>

      <section>
        <p className="text-muted-foreground">
          Bem-vindo ao painel. Funcionalidades de gestão de NC/NE serão adicionadas aqui.
        </p>
        {/* Aqui entrarão as tabelas e componentes */}
      </section>

    </div>
  );
}