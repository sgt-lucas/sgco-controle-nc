// Caminho do arquivo: app/dashboard/page.tsx (CORRIGIDO - Modal Manual com Tailwind)
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
// Importa o formulário do local CORRETO
import { AddNcForm } from "@/components/AddNcForm";

// Tipo NotaCredito
type NotaCredito = {
  id: number; numeronc: string; datarecepcao: string; ptres: string;
  naturezadespesa: string; fonterecurso: string; pi: string | null;
  valortotal: number; saldodisponivel: number; datavalidade: string | null;
};

// Exportação PADRÃO para a página (Correto)
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingNCs, setLoadingNCs] = useState(false);
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([]);
  const [errorNCs, setErrorNCs] = useState<string | null>(null);
  const [isAddNcModalOpen, setIsAddNcModalOpen] = useState(false);

  const fetchNotasCredito = useCallback(async () => {
    setLoadingNCs(true);
    setErrorNCs(null);
    // Corrigindo a query para usar os nomes de coluna minúsculos corretos
    const { data, error } = await supabase
      .from('NotasCredito') // Use o nome exato da sua tabela
      .select('id, numeronc, datarecepcao, ptres, naturezadespesa, fonterecurso, pi, valortotal, saldodisponivel, datavalidade')
      .order('datarecepcao', { ascending: false });

    if (error) {
      console.error("Erro ao buscar Notas de Crédito:", error);
      setErrorNCs(`Falha ao carregar dados: ${error.message}`);
      setNotasCredito([]);
    } else {
       const dataTyped = data?.map(item => ({...item, valortotal: Number(item.valortotal), saldodisponivel: Number(item.saldodisponivel)})) || [];
      setNotasCredito(dataTyped);
    }
    setLoadingNCs(false);
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); }
      else {
        setUserEmail(session.user?.email ?? null);
        setLoadingUser(false);
        fetchNotasCredito();
      }
    };
    checkUser();
  }, [supabase, router, fetchNotasCredito]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Funções de controlo do modal manual
  const openAddNcModal = () => setIsAddNcModalOpen(true);
  const closeAddNcModal = () => setIsAddNcModalOpen(false);

  // Função chamada pelo AddNcForm em caso de sucesso
  const handleNcAdded = () => {
    closeAddNcModal(); // Fecha o modal manual
    fetchNotasCredito(); // Rebusca os dados
  };

  if (loadingUser) { return ( <div className="flex h-screen items-center justify-center"><p>Verificando autenticação...</p></div> ); }

  return (
    // Adiciona `relative` para o posicionamento do modal
    <div className="container relative mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between border-b pb-4">
         <div className="flex items-center gap-4">
             <Image src="/logo-2cgeo.png" alt="Distintivo 2º CGEO" width={40} height={50} priority />
             <div>
               <h1 className="text-xl font-semibold text-primary"> Painel de Controle - SALC </h1>
               {userEmail && <span className="text-xs text-muted-foreground">Logado como: {userEmail.split('@')[0]}</span>}
             </div>
         </div>
         <Button variant="outline" size="sm" onClick={handleLogout}> Sair </Button>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium">Notas de Crédito Recebidas</h2>
             <Button size="sm" onClick={openAddNcModal}>Adicionar NC</Button>
        </div>

        {/* Tabela de NCs */}
        {loadingNCs && (<div className="space-y-2"> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> </div>)}
        {!loadingNCs && errorNCs && (<p className="text-center text-red-600">{errorNCs}</p>)}
        {!loadingNCs && !errorNCs && notasCredito.length === 0 && (<p className="text-center text-muted-foreground">Nenhuma Nota de Crédito encontrada.</p>)}
        {!loadingNCs && !errorNCs && notasCredito.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableCaption>Lista das últimas notas de crédito recebidas.</TableCaption>
              <TableHeader> <TableRow> <TableHead className="w-[150px]">Número NC</TableHead> <TableHead>Data Recepção</TableHead> <TableHead>PTRES</TableHead> <TableHead>ND</TableHead> <TableHead>Fonte</TableHead> <TableHead className="text-right">Valor Total</TableHead> <TableHead className="text-right font-semibold">Saldo Disponível</TableHead> </TableRow> </TableHeader>
              <TableBody>
                {/* Corrigindo para nomes de coluna minúsculos */}
                {notasCredito.map((nc) => (
                  <TableRow key={nc.id}>
                    <TableCell className="font-medium">{nc.numeronc}</TableCell>
                    <TableCell>{nc.datarecepcao ? new Date(nc.datarecepcao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>{nc.ptres}</TableCell>
                    <TableCell>{nc.naturezadespesa}</TableCell>
                    <TableCell>{nc.fonterecurso}</TableCell>
                    <TableCell className="text-right">{nc.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell className="text-right font-semibold">{nc.saldodisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* --- Modal Manual com Tailwind --- */}
      {isAddNcModalOpen && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeAddNcModal}
        >
          <div
            className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-semibold text-gray-900">Cadastrar Nova Nota de Crédito</h3>
                <Button variant="ghost" size="icon" onClick={closeAddNcModal} className="h-6 w-6 rounded-full p-0">
                   <span className="text-gray-500 hover:text-gray-800">X</span>
                </Button>
             </div>
             <p className="mb-4 text-sm text-gray-600">Preencha os dados da NC recebida.</p>
             {/* Importa e usa o AddNcForm correto */}
             <AddNcForm onSuccess={handleNcAdded} onCancel={closeAddNcModal} />
          </div>
        </div>
      )}
      {/* ----------------------------- */}
    </div>
  );
}