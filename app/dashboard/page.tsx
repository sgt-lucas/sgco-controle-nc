// Caminho: app/dashboard/page.tsx (Reescrito com Mantine UI)
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { notifications } from '@mantine/notifications';

// Importações Mantine
import {
  Button,
  Title,
  Text,
  Table,
  Group,
  ScrollArea,
  Skeleton,
  Modal, // Importa o Modal do Mantine
  Box,
  Anchor, // Para links futuros (ex: Detalhes)
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

// Importa o novo formulário Mantine
import { AddNcForm } from '@/components/AddNcForm';

// Tipo NotaCredito (Nomes de coluna minúsculos do DB)
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
  const [loadingNCs, setLoadingNCs] = useState(true); // Começa true na primeira carga
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([]);
  const [errorNCs, setErrorNCs] = useState<string | null>(null);
  
  // Estado para controlar o Modal do Mantine
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca os dados
  const fetchNotasCredito = useCallback(async () => {
    setLoadingNCs(true);
    setErrorNCs(null);
    const { data, error } = await supabase
      .from('NotasCredito') // Use o nome exato da sua tabela
      .select('id, numeronc, datarecepcao, ptres, naturezadespesa, fonterecurso, pi, valortotal, saldodisponivel, datavalidade')
      .order('datarecepcao', { ascending: false });

    if (error) {
      console.error("Erro ao buscar Notas de Crédito:", error);
      setErrorNCs(`Falha ao carregar dados: ${error.message}`);
      setNotasCredito([]);
      notifications.show({ title: 'Erro!', message: 'Não foi possível carregar as Notas de Crédito.', color: 'red', icon: <IconX size={16} /> });
    } else {
       const dataTyped = data?.map(item => ({...item, valortotal: Number(item.valortotal), saldodisponivel: Number(item.saldodisponivel)})) || [];
      setNotasCredito(dataTyped);
    }
    setLoadingNCs(false);
  }, [supabase]);

  // Verifica o usuário
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

  // Funções de controlo do modal
  const openAddNcModal = () => setIsModalOpen(true);
  const closeAddNcModal = () => setIsModalOpen(false);

  const handleNcAdded = () => {
    closeAddNcModal(); // Fecha o modal
    fetchNotasCredito(); // Rebusca os dados
  };

  // ----- Renderização -----

  if (loadingUser) {
    return (
        <Center style={{ height: '100vh' }}>
            <Text>Verificando autenticação...</Text>
        </Center>
    );
  }

  // Gera as linhas da tabela
  const rows = notasCredito.map((nc) => (
    <Table.Tr key={nc.id}>
      <Table.Td>
          {/* Futuramente um link para detalhes */}
          <Anchor component="button" fz="sm">{nc.numeronc}</Anchor>
      </Table.Td>
      <Table.Td>{nc.datarecepcao ? new Date(nc.datarecepcao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</Table.Td>
      <Table.Td>{nc.ptres}</Table.Td>
      <Table.Td>{nc.naturezadespesa}</Table.Td>
      <Table.Td>{nc.fonterecurso}</Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>{nc.valortotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Table.Td>
      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>{nc.saldodisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Table.Td>
    </Table.Tr>
  ));

  return (
    // Usa Box como container principal (similar ao div)
    <Box p="md">
      {/* Modal para Adicionar NC (não dá erro pois usa o portal Mantine) */}
      <Modal
        opened={isModalOpen}
        onClose={closeAddNcModal}
        title="Cadastrar Nova Nota de Crédito"
        size="xl" // Tamanho 'xl' (extra large)
        scrollAreaComponent={ScrollArea.Autosize} // Permite scroll interno
        centered
      >
        <AddNcForm onSuccess={handleNcAdded} onCancel={closeAddNcModal} />
      </Modal>

      {/* Cabeçalho */}
      <Group justify="space-between" mb="lg" pb="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group gap="md">
            <Image src="/logo-2cgeo.png" alt="Distintivo 2º CGEO" width={40} height={50} priority />
            <Stack gap={0}>
              <Title order={3} c="green.6">Painel de Controle - SALC</Title>
              {userEmail && <Text size="xs" c="dimmed">Logado como: {userEmail.split('@')[0]}</Text>}
            </Stack>
        </Group>
        <Button variant="outline" size="sm" onClick={handleLogout}> Sair </Button>
      </Group>

      {/* Seção Principal */}
      <section>
        <Group justify="space-between" mb="md">
            <Title order={4}>Notas de Crédito Recebidas</Title>
             <Button size="sm" onClick={openAddNcModal}>Adicionar NC</Button>
        </Group>

        {/* Tabela de NCs */}
        <Paper withBorder shadow="sm" radius="md">
          <ScrollArea>
            <Table miw={800} verticalSpacing="sm" striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Número NC</Table.Th>
                  <Table.Th>Data Recepção</Table.Th>
                  <Table.Th>PTRES</Table.Th>
                  <Table.Th>ND</Table.Th>
                  <Table.Th>Fonte</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Valor Total</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Saldo Disponível</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loadingNCs && (
                    // Skeleton (esqueleto) enquanto carrega
                    [...Array(3)].map((_, index) => (
                        <Table.Tr key={index}>
                            <Table.Td colSpan={7}><Skeleton height={20} radius="sm" /></Table.Td>
                        </Table.Tr>
                    ))
                )}
                {!loadingNCs && errorNCs && (
                    <Table.Tr>
                        <Table.Td colSpan={7}><Text c="red" ta="center">{errorNCs}</Text></Table.Td>
                    </Table.Tr>
                )}
                {!loadingNCs && !errorNCs && notasCredito.length === 0 && (
                     <Table.Tr>
                        <Table.Td colSpan={7}><Text c="dimmed" ta="center">Nenhuma Nota de Crédito encontrada.</Text></Table.Td>
                    </Table.Tr>
                )}
                {!loadingNCs && !errorNCs && rows.length > 0 && rows}
              </Table.Tbody>
              <Table.Caption>Lista das últimas notas de crédito recebidas.</Table.Caption>
            </Table>
          </ScrollArea>
        </Paper>
      </section>
    </Box>
  );
}