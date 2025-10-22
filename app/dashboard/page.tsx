// Caminho do arquivo: app/dashboard/page.tsx (CORRIGIDO com nomes de colunas minúsculos)
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
import { Skeleton } from "@/components/ui/skeleton";

// --- CORREÇÃO PRINCIPAL: Tipo alinhado com nomes de coluna minúsculos do DB ---
type NotaCredito = {
  id: number; // Geralmente 'id' minúsculo por padrão no Supabase/SQL
  numeronc: string;
  datarecepcao: string;
  ptres: string;
  naturezadespesa: string;
  fonterecurso: string;
  pi: string | null;
  valortotal: number;
  saldodisponivel: number;
  datavalidade: string | null;
  // Adicione outros campos se necessário (valorreservado, valorempenhado, valorrecolhido, datacriacao)
  // Se você precisar deles para exibição ou lógica futura.
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingNCs, setLoadingNCs] = useState(false);
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([]);
  const [errorNCs, setErrorNCs] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
      } else {
        setUserEmail(session.user?.email ?? null);
        setLoadingUser(false);
        fetchNotasCredito();
      }
    };
    checkUser();
  }, [supabase, router]);

  const fetchNotasCredito = async () => {
    setLoadingNCs(true);
    setErrorNCs(null);

    // Seleciona as colunas usando os nomes minúsculos esperados
    const { data, error } = await supabase
      .from('NotasCredito') // Certifique-se que o NOME DA TABELA está correto aqui
      .select('id, numeronc, datarecepcao, ptres, naturezadespesa, fonterecurso, pi, valortotal, saldodisponivel, datavalidade') // Seleciona colunas específicas
      .order('datarecepcao', { ascending: false });

    if (error) {
      console.error("Erro ao buscar Notas de Crédito:", error);
      // Mantém a mensagem de erro original do Supabase para diagnóstico
      setErrorNCs(`Falha ao carregar dados: ${error.message}`);
      setNotasCredito([]);
    } else {
      // Ajusta os tipos se necessário (ex: Supabase pode retornar números como strings às vezes)
      const dataTyped = data?.map(item => ({
        ...item,
        valortotal: Number(item.valortotal),
        saldodisponivel: Number(item.saldodisponivel),
      })) || [];
      setNotasCredito(dataTyped);
    }
    setLoadingNCs(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loadingUser) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Verificando autenticação...</p>
        </div>
    );
  }

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
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium">Notas de Crédito Recebidas</h2>
            {/* <Button size="sm">Adicionar NC</Button> */}
        </div>

        {loadingNCs && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!loadingNCs && errorNCs && (
          <p className="text-center text-red-600">{errorNCs}</p>
        )}

        {!loadingNCs && !errorNCs && notasCredito.length === 0 && (
          <p className="text-center text-muted-foreground">Nenhuma Nota de Crédito encontrada.</p>
        )}

        {!loadingNCs && !errorNCs && notasCredito.length > 0 && (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* --- CORREÇÃO PRINCIPAL: Usando nomes de propriedade minúsculos --- */}
                {notasCredito.map((nc) => (
                  <TableRow key={nc.id}> {/* <- id */}
                    <TableCell className="font-medium">{nc.numeronc}</TableCell> {/* <- numeronc */}
                    <TableCell>
                      {/* Adiciona verificação para data inválida */}
                      {nc.datarecepcao ? new Date(nc.datarecepcao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                      </TableCell> {/* <- datarecepcao */}
                    <TableCell>{nc.ptres}</TableCell> {/* <- ptres */}
                    <TableCell>{nc.naturezadespesa}</TableCell> {/* <- naturezadespesa */}
                    <TableCell>{nc.fonterecurso}</TableCell> {/* <- fonterecurso */}
                    <TableCell className="text-right">
                      {nc.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell> {/* <- valortotal */}
                    <TableCell className="text-right font-semibold">
                      {nc.saldodisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell> {/* <- saldodisponivel */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}