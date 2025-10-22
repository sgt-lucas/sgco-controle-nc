// Caminho do arquivo: app/dashboard/page.tsx
'use client' // Necessário para hooks (useState, useEffect) e interações (logout)

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Hook para redirecionamento
import { createClient } from '@/lib/supabase/client';

// Importa os componentes de UI necessários
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton"; // Usaremos para indicar carregamento

// Define a estrutura (tipo) dos dados de uma Nota de Crédito
// Baseado no schema SQL que criamos na Fase 2
type NotaCredito = {
  Id: number;
  NumeroNC: string;
  DataRecepcao: string; // Datas virão como string
  PTRES: string;
  NaturezaDespesa: string;
  FonteRecurso: string;
  PI: string | null;
  ValorTotal: number;
  SaldoDisponivel: number; // Campo crucial calculado pelos triggers
  DataValidade: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Estados do componente
  const [loadingUser, setLoadingUser] = useState(true); // Estado inicial: verificando usuário
  const [userEmail, setUserEmail] = useState<string | null>(null); // Guardar email (username@sufixo)
  const [loadingNCs, setLoadingNCs] = useState(false);
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([]);
  const [errorNCs, setErrorNCs] = useState<string | null>(null);

  // Efeito para verificar autenticação ao carregar a página
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/'); // Redireciona para login se não houver sessão
      } else {
        setUserEmail(session.user?.email ?? null); // Guarda o email (com sufixo)
        setLoadingUser(false); // Terminou de verificar
        fetchNotasCredito(); // Busca os dados das NCs após confirmar login
      }
    };
    checkUser();
  }, [supabase, router]); // Dependências do efeito

  // Função para buscar as Notas de Crédito
  const fetchNotasCredito = async () => {
    setLoadingNCs(true);
    setErrorNCs(null);

    const { data, error } = await supabase
      .from('NotasCredito') // Nome exato da tabela no Supabase
      .select('*') // Seleciona todas as colunas
      .order('DataRecepcao', { ascending: false }); // Ordena pelas mais recentes

    if (error) {
      console.error("Erro ao buscar Notas de Crédito:", error);
      setErrorNCs(`Falha ao carregar dados: ${error.message}`);
      setNotasCredito([]); // Limpa dados em caso de erro
    } else {
      setNotasCredito(data || []);
    }
    setLoadingNCs(false);
  };

  // Função para Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redireciona para a página de login após sair
  };

  // ----- Renderização Condicional -----

  // Se ainda estiver verificando o usuário, mostra uma mensagem simples
  if (loadingUser) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Verificando autenticação...</p>
        </div>
    );
  }

  // Se chegou aqui, o usuário está logado (ou foi redirecionado)
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
           <h1 className="text-2xl font-semibold text-primary">
            Painel de Controle - SALC
           </h1>
           {userEmail && <span className="text-xs text-muted-foreground">Logado como: {userEmail.split('@')[0]}</span>}
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Sair
        </Button>
      </header>

      <section>
        {/* Título da Seção e Botão Adicionar (funcionalidade futura) */}
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium">Notas de Crédito Recebidas</h2>
            {/* <Button size="sm">Adicionar NC</Button> */}
        </div>

        {/* Exibição da Tabela ou Indicadores de Estado */}
        {loadingNCs && (
          // Mostra esqueletos enquanto carrega
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!loadingNCs && errorNCs && (
          // Mostra mensagem de erro
          <p className="text-center text-red-600">{errorNCs}</p>
        )}

        {!loadingNCs && !errorNCs && notasCredito.length === 0 && (
          // Mostra mensagem se não houver dados
          <p className="text-center text-muted-foreground">Nenhuma Nota de Crédito encontrada.</p>
        )}

        {!loadingNCs && !errorNCs && notasCredito.length > 0 && (
          // Renderiza a tabela se houver dados
          <div className="rounded-md border">
            <Table>
              <TableCaption>Lista das últimas notas de crédito recebidas.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Número NC</TableHead>
                  <TableHead>Data Recepção</TableHead>
                  <TableHead>PTRES</TableHead>
                  <TableHead>ND</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right font-semibold">Saldo Disponível</TableHead>
                  {/* Adicionar coluna de Ações (Editar/Detalhes) depois */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasCredito.map((nc) => (
                  <TableRow key={nc.Id}>
                    <TableCell className="font-medium">{nc.NumeroNC}</TableCell>
                    <TableCell>{new Date(nc.DataRecepcao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{nc.PTRES}</TableCell>
                    <TableCell>{nc.NaturezaDespesa}</TableCell>
                    <TableCell>{nc.FonteRecurso}</TableCell>
                    <TableCell className="text-right">
                      {nc.ValorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {nc.SaldoDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Seção Futura para Notas de Empenho */}
      {/* <section className="mt-8"> ... </section> */}

    </div>
  );
}

// Componente Skeleton (adicione este código no final do arquivo, ou crie components/ui/skeleton.tsx)
// Se você já tiver o skeleton.tsx pelo shadcn, ignore esta parte.
// Verifique se falta: npx shadcn@latest add skeleton
// Se for adicionar, crie o arquivo components/ui/skeleton.tsx e cole:

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }