// Caminho do arquivo: app/dashboard/page.tsx (TESTE FINAL DE ISOLAMENTO DO MODAL)
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

import { Button } from "@/components/ui/button";
// Removidos imports não utilizados (Table, Skeleton, AddNcForm)

// Tipo NotaCredito (mantido mas não usado neste teste)
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado do modal

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUserEmail(session.user?.email ?? null);
        setLoadingUser(false);
        // Não busca NCs neste teste
      }
    };
    checkUser();
  }, [supabase, router]); // Dependências simplificadas

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Funções para abrir/fechar o modal manual
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loadingUser) { return ( <div className="flex h-screen items-center justify-center"><p>Verificando autenticação...</p></div> ); }

  return (
    <div className="container relative mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between border-b pb-4">
        {/* ... (cabeçalho com logo e botão Sair inalterado) ... */}
        <div className="flex items-center gap-4"> <Image src="/logo-2cgeo.png" alt="Distintivo 2º CGEO" width={40} height={50} priority /> <div> <h1 className="text-xl font-semibold text-primary"> Painel de Controle - SALC </h1> {userEmail && <span className="text-xs text-muted-foreground">Logado como: {userEmail.split('@')[0]}</span>} </div> </div> <Button variant="outline" size="sm" onClick={handleLogout}> Sair </Button>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium">Notas de Crédito Recebidas</h2>
             {/* --- Botão que abre o modal manual --- */}
             <Button size="sm" onClick={openModal}>Adicionar NC (Teste Isolamento)</Button>
             {/* ------------------------------------ */}
        </div>

        {/* Tabela e lógica de NC removidas temporariamente */}
        <p className='text-muted-foreground mt-4'>Funcionalidades desativadas para teste.</p>

      </section>

      {/* --- Modal Manual com Conteúdo Mínimo --- */}
      {isModalOpen && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeModal} // Fecha ao clicar fora
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" // Largura menor
            onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro
          >
             <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Teste Modal Manual</h3>
                <Button variant="ghost" size="icon" onClick={closeModal} className="h-6 w-6 rounded-full p-0"> <span className="text-gray-500 hover:text-gray-800">X</span> </Button>
             </div>
            <div className="py-4">
                <p className="text-sm text-gray-700">Se isto abrir sem erro no console, o problema está no AddNcForm ou suas dependências internas.</p>
            </div>
             <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={closeModal}>Fechar</Button>
             </div>
          </div>
        </div>
      )}
      {/* ------------------------------------- */}
    </div>
  );
}