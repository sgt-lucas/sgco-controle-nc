// Caminho do arquivo: app/dashboard/page.tsx (com Dialog e AddNcForm)
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, // Adicionado para estrutura do modal
  DialogClose // Adicionado para o botão cancelar funcionar no modal
} from "@/components/ui/dialog";
import { AddNcForm } from "@/components/AddNcForm"; // Importa o formulário

// Tipo NotaCredito (mantém os nomes minúsculos)
type NotaCredito = {
  id: number;
  numeronc: string;
  datarecepcao: string;
  ptres: string;
  naturezadespesa: string;
  fonterecurso: string;
  pi: string | null;
  valortotal: number;
  saldodisponivel: number;
  datavalidade: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingNCs, setLoadingNCs] = useState(false);
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([]);
  const [errorNCs, setErrorNCs] = useState<string | null>(null);
  const [isAddNcDialogOpen, setIsAddNcDialogOpen] = useState(false); // Estado para controlar o Dialog

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUserEmail(session.user?.email ?? null);
        setLoadingUser(false);
        fetchNotasCredito(); // Busca NCs após login
      }
    };
    checkUser();
  }, [supabase, router]);

  const fetchNotasCredito = async () => {
    setLoadingNCs(true);
    setErrorNCs(null);
    const { data, error } = await supabase
      .from('NotasCredito')
      .select('id, numeronc, datarecepcao, ptres, naturezadespesa, fonterecurso, pi, valortotal, saldodisponivel, datavalidade')
      .order('datarecepcao', { ascending: false });

    if (error) {
      console.error("Erro ao buscar Notas de Crédito:", error);
      setErrorNCs(`Falha ao carregar dados: ${error.message}`);
      setNotasCredito([]);
    } else {
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

  // Função chamada pelo AddNcForm em caso de sucesso
  const handleNcAdded = () => {
    setIsAddNcDialogOpen(false); // Fecha o Dialog
    fetchNotasCredito(); // Atualiza a lista de NCs
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
             {/* --- Botão Adicionar NC --- */}
             <Dialog open={isAddNcDialogOpen} onOpenChange={setIsAddNcDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm">Adicionar NC</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"> {/* Ajusta largura e altura máxima */}
                    <DialogHeader>
                    <DialogTitle>Cadastrar Nova Nota de Crédito</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da NC recebida. Campos com * são obrigatórios.
                    </DialogDescription>
                    </DialogHeader>
                    {/* Renderiza o formulário dentro do Dialog */}
                    <AddNcForm
                        onSuccess={handleNcAdded}
                        onCancel={() => setIsAddNcDialogOpen(false)}
                    />
                     {/* Footer apenas para fechar visualmente, botões estão no form */}
                    {/* <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Fechar</Button>
                         </DialogClose>
                    </DialogFooter> */}
                </DialogContent>
            </Dialog>
        </div>

        {/* --- Tabela de NCs (sem alterações) --- */}
        {loadingNCs && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" />
          </div>
        )}
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
                  <TableHead>PTRES</TableHead> <TableHead>ND</TableHead> <TableHead>Fonte</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right font-semibold">Saldo Disponível</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasCredito.map((nc) => (
                  <TableRow key={nc.id}>
                    <TableCell className="font-medium">{nc.numeronc}</TableCell>
                    <TableCell>{nc.datarecepcao ? new Date(nc.datarecepcao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>{nc.ptres}</TableCell> <TableCell>{nc.naturezadespesa}</TableCell> <TableCell>{nc.fonterecurso}</TableCell>
                    <TableCell className="text-right">{nc.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell className="text-right font-semibold">{nc.saldodisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
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