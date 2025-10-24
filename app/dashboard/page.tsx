// Caminho do arquivo: app/dashboard/page.tsx (VERSÃO SIMPLIFICADA PARA TESTE)
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

import { Button } from "@/components/ui/button";
// Apenas importa o Dialog e seus subcomponentes básicos
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
// Não importa AddNcForm nem Table/Skeleton por enquanto

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Removemos estados relacionados à tabela NC
  const [isAddNcDialogOpen, setIsAddNcDialogOpen] = useState(false); // Estado que controla o Dialog

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUserEmail(session.user?.email ?? null);
        setLoadingUser(false);
        // Não busca NCs nesta versão
      }
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependências simplificadas

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Função para abrir o Dialog manualmente
  const openAddNcDialog = () => {
    setIsAddNcDialogOpen(true);
  };

  if (loadingUser) { return ( <div className="flex h-screen items-center justify-center"><p>Verificando autenticação...</p></div> ); }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
            <Image
                src="/logo-2cgeo.png" alt="Distintivo 2º CGEO"
                width={40} height={50} priority
            />
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
             {/* Botão simples que abre o Dialog */}
             <Button size="sm" onClick={openAddNcDialog}>Adicionar NC (Teste)</Button>
        </div>

         {/* Dialog SIMPLIFICADO - Sem o formulário complexo */}
         <Dialog open={isAddNcDialogOpen} onOpenChange={setIsAddNcDialogOpen}>
            <DialogContent className="sm:max-w-[425px]"> {/* Largura menor para teste */}
                <DialogHeader>
                    <DialogTitle>Teste Dialog</DialogTitle>
                    <DialogDescription>
                        Se isto aparecer sem erro no console, o problema está no AddNcForm.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>Conteúdo simples do modal.</p>
                </div>
                {/* Botão para fechar manualmente */}
                 <Button variant="outline" onClick={() => setIsAddNcDialogOpen(false)}>Fechar</Button>
            </DialogContent>
        </Dialog>

        {/* Tabela e lógica de NC removidas temporariamente */}
        <p className='text-muted-foreground mt-4'>Tabela de NCs desativada para teste.</p>

      </section>
    </div>
  );
}