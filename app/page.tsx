// Caminho do arquivo: app/page.tsx (Reescrito com Mantine UI)
'use client'

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// Importações do Mantine UI
import {
    TextInput,
    PasswordInput,
    Button,
    Paper, // Similar ao Card, para agrupar o formulário
    Title,
    Text,
    Stack, // Para empilhar elementos verticalmente
    Center, // Para centralizar na página
    Alert, // Para exibir mensagens de erro/sucesso
    Loader, // Para indicar carregamento
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'; // Ícones opcionais para Alertas

const DOMAIN_SUFFIX = '@salc.com'; // Mantém o sufixo

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const emailWithSuffix = `${username}${DOMAIN_SUFFIX}`;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailWithSuffix,
      password: password,
    });

    if (signInError) {
      setError('Usuário ou senha inválidos.');
      console.error("Erro de login:", signInError.message);
    } else {
      setMessage('Login bem-sucedido! Redirecionando...');
      // Pequeno delay para o utilizador ver a mensagem antes de redirecionar
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
    setLoading(false);
  };

  return (
    // Usa Center para centralizar o conteúdo vertical e horizontalmente
    <Center style={{ minHeight: 'calc(100vh - 60px)' }}> {/* Ajusta altura para descontar possível header/footer */}
      <Stack align="center" gap="xl"> {/* Empilha logo e Paper */}
        {/* Logo */}
        <Image
            src="/logo-2cgeo.png"
            alt="Distintivo 2º CGEO"
            width={100} // Tamanho ligeiramente menor
            height={125} // Ajuste a altura proporcionalmente
            priority
        />

        {/* Paper contém o formulário */}
        <Paper withBorder shadow="md" p="xl" radius="md" w={400}> {/* w={400} define largura fixa */}
          <Title order={2} ta="center" mb="sm">
            2º CENTRO DE GEOINFORMAÇÃO
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="lg">
            Controle Orçamentário - SALC
          </Text>

          <form onSubmit={handleSignIn}>
            <Stack gap="md"> {/* Empilha os campos do formulário */}
              <TextInput
                required
                label="Usuário"
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                error={error ? ' ' : undefined} // Mostra espaço para erro geral abaixo
                onKeyDown={(e) => { if (e.key === '@') e.preventDefault(); }} // Impede @
              />

              <PasswordInput
                required
                label="Senha"
                placeholder="Sua senha"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                error={error ? ' ' : undefined} // Mostra espaço para erro geral abaixo
              />

              {/* Exibe mensagem de erro geral */}
              {error && (
                 <Alert variant="light" color="red" title="Erro no Login" icon={<IconAlertCircle size={16} />} withCloseButton onClose={() => setError(null)}>
                   {error}
                 </Alert>
              )}

               {/* Exibe mensagem de sucesso */}
              {message && (
                 <Alert variant="light" color="green" title="Sucesso" icon={<IconCheck size={16} />}>
                   {message}
                 </Alert>
              )}

              <Button type="submit" fullWidth mt="xl" loading={loading} loaderProps={{ type: 'dots' }}>
                Entrar
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Center>
  );
}