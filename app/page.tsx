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
    Paper, // Similar ao Card
    Title,
    Text,
    Stack,
    Center,
    Alert,
} from '@mantine/core';
// Importa ícones (Tabler Icons é instalado com @mantine/core)
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

const DOMAIN_SUFFIX = '@salc.com'; // Use o sufixo que definimos

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
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
    setLoading(false);
  };

  return (
    // Usa Center para centralizar na tela (desconta a altura do rodapé)
    <Center style={{ minHeight: 'calc(100vh - 60px)' }}>
      <Stack align="center" gap="xl">
        {/* Logo (usa o componente Image do Next.js) */}
        <Image
            src="/logo-2cgeo.png" // Caminho relativo à pasta /public
            alt="Distintivo 2º CGEO"
            width={120} // Tamanho ajustado
            height={150} // Altura ajustada para proporção
            priority
        />

        {/* Paper (substituto do Card) */}
        <Paper withBorder shadow="md" p="xl" radius="md" w={400}>
          <Title order={2} ta="center" mb="sm" c="var(--mantine-color-green-7)">
            2º CENTRO DE GEOINFORMAÇÃO
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="lg">
            Controle Orçamentário - SALC
          </Text>

          <form onSubmit={handleSignIn}>
            <Stack gap="md">
              <TextInput
                required
                label="Usuário"
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                error={error ? ' ' : undefined} // Mostra espaço se houver erro geral
                onKeyDown={(e) => { if (e.key === '@') e.preventDefault(); }}
              />

              <PasswordInput
                required
                label="Senha"
                placeholder="Sua senha"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                error={error ? ' ' : undefined}
              />

              {error && (
                 <Alert variant="light" color="red" title="Erro no Login" icon={<IconAlertCircle size={16} />} withCloseButton onClose={() => setError(null)}>
                   {error}
                 </Alert>
              )}

              {message && (
                 <Alert variant="light" color="green" title="Sucesso" icon={<IconCheck size={16} />}>
                   {message}
                 </Alert>
              )}

              {/* Botão Mantine (usará a cor primária verde que definimos) */}
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