// Caminho do arquivo: app/dashboard/page.tsx (Modal 100% Manual com Tailwind)
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
// REMOVIDO: Imports do shadcn Dialog
import { AddNcForm } from "@/components/AddNcForm"; // Mantém a importação do formulário

// Tipo NotaCredito
type NotaCredito = {
  id: number; numeronc: string; datarecepcao: string; ptres: string;
  naturezadespesa: string; fonterecurso: string; pi: string | null;
  valortotal: number; saldodisponivel: number; datavalidade: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingNCs, setLoadingNCs] = useState(false);
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([]);
  const [errorNCs, setErrorNCs] = useState<string | null>(null);
  const [isAddNcModalOpen, setIsAddNcModalOpen] = useState(false); // Estado do modal

  const fetchNotasCredito = useCallback(async () => {
    // ... (lógica inalterada) ...
    setLoadingNCs(true);
    setErrorNCs(null);
    const { data, error } = await supabase.from('NotasCredito').select('*').order('datarecepcao', { ascending: false });
    if (error) { console.error("Erro NCs:", error); setErrorNCs(error.message); setNotasCredito([]); }
    else { const dataTyped = data?.map(item => ({...item, valortotal: Number(item.valortotal), saldodisponivel: Number(item.saldodisponivel)})) || []; setNotasCredito(dataTyped); }
    setLoadingNCs(false);
  }, [supabase]);

  useEffect(() => {
    // ... (lógica inalterada) ...
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); }
      else { setUserEmail(session.user?.email ?? null); setLoadingUser(false); fetchNotasCredito(); }
    };
    checkUser();
  }, [supabase, router, fetchNotasCredito]);

  const handleLogout = async () => { /* ... (lógica inalterada) ... */
    await supabase.auth.signOut(); router.push('/');
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
        {/* ... (cabeçalho com logo e botão Sair inalterado) ... */}
        <div className="flex items-center gap-4"> <Image src="/logo-2cgeo.png" alt="Distintivo 2º CGEO" width={40} height={50} priority /> <div> <h1 className="text-xl font-semibold text-primary"> Painel de Controle - SALC </h1> {userEmail && <span className="text-xs text-muted-foreground">Logado como: {userEmail.split('@')[0]}</span>} </div> </div> <Button variant="outline" size="sm" onClick={handleLogout}> Sair </Button>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium">Notas de Crédito Recebidas</h2>
             {/* --- Botão agora controla o estado do modal manual --- */}
             <Button size="sm" onClick={openAddNcModal}>Adicionar NC</Button>
             {/* --------------------------------------------------- */}
        </div>

        {/* Tabela de NCs (lógica inalterada) */}
        {loadingNCs && (<div className="space-y-2"> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> </div>)}
        {!loadingNCs && errorNCs && (<p className="text-center text-red-600">{errorNCs}</p>)}
        {!loadingNCs && !errorNCs && notasCredito.length === 0 && (<p className="text-center text-muted-foreground">Nenhuma Nota de Crédito encontrada.</p>)}
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
                {notasCredito.map((nc) => (
                  <TableRow key={nc.id}>
                    <TableCell className="font-medium">{nc.numeronc}</TableCell>
                    <TableCell>
                      {nc.datarecepcao
                        ? new Date(nc.datarecepcao + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell>{nc.ptres}</TableCell>
                    <TableCell>{nc.naturezadespesa}</TableCell>
                    <TableCell>{nc.fonterecurso}</TableCell>
                    <TableCell className="text-right">
                      {nc.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {nc.saldodisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

    </div>
  );
}fundo escuro)
        // Usa `fixed inset-0` para cobrir a tela, `z-50` para ficar acima, `flex items-center justify-center` para centrar
        // `bg-black/60 backdrop-blur-sm` para o efeito visual
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeAddNcModal} // Fecha ao clicar fora (opcional)
        >
          {/* Container do Modal (conteúdo branco) */}
          {/* `max-w-xl` define a largura máxima, `bg-white`, `rounded-lg`, `shadow-xl` para aparência */}
          {/* `p-6` adiciona padding interno */}
          {/* `max-h-[90vh] overflow-y-auto` permite scroll se o conteúdo for grande */}
          {/* `onClick={(e) => e.stopPropagation()}` impede que clicar DENTRO do modal o feche */}
          <div
            className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Cabeçalho do Modal Manual */}
             <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-semibold text-gray-900">Cadastrar Nova Nota de Crédito</h3>
                {/* Botão X para fechar */}
                <Button variant="ghost" size="icon" onClick={closeAddNcModal} className="h-6 w-6 rounded-full p-0">
                  {/* Pode usar um ícone X aqui se tiver lucide-react ou similar */}
                   <span className="text-gray-500 hover:text-gray-800">X</span>
                </Button>
             </div>
             {/* Descrição (opcional) */}
             <p className="mb-4 text-sm text-gray-600">Preencha os dados da NC recebida.</p>

             {/* Formulário (agora as props onCancel/onSuccess controlarão o fecho) */}
             <AddNcForm onSuccess={handleNcAdded} onCancel={closeAddNcModal} />
          </div>
        </div>
      )}
      {/* ----------------------------- */}
    </div>
  );
}                    <TableCell className="text-right font-semibold">{nc.saldodisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  </TableRow>
                ))} 