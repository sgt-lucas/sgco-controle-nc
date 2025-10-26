// Caminho do arquivo: app/layout.tsx (Atualizado com MantineProvider)
import '@mantine/core/styles.css'; // Importa o CSS base do Mantine
import '@mantine/dates/styles.css'; // Importa o CSS do DatePicker
import '@mantine/notifications/styles.css'; // Importa o CSS das Notificações

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core'; // Importações do Mantine
import { Notifications } from '@mantine/notifications'; // Importa o componente Notifications
import { Roboto } from "next/font/google"; // Mantém a fonte Roboto
import "./globals.css"; // Mantém o CSS global (para Tailwind e variáveis)

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Branding (mantido)
export const metadata: Metadata = {
  title: "2º CGEO - SALC",
  description: "2º Centro de Geoinformação - SALC",
};

// Define um tema básico para o Mantine (podemos customizar depois)
const theme = createTheme({
  // Adicione customizações de tema aqui se desejar
  // Ex: fontFamily: roboto.style.fontFamily,
  // primaryColor: 'green', // Pode definir a cor primária
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* ColorSchemeScript é necessário para temas claro/escuro (mesmo que usemos só claro) */}
        <ColorSchemeScript />
      </head>
      {/* Aplica a classe da fonte Roboto */}
      <body className={roboto.className}>
        {/* Envolve toda a aplicação com o MantineProvider */}
        <MantineProvider theme={theme} defaultColorScheme="light">
           {/* Componente para exibir notificações */}
           <Notifications position="top-right" zIndex={1000} />
           {/* Estrutura flex para manter o rodapé em baixo */}
           <div className="flex min-h-screen flex-col">
              <main className="flex-grow">
                {children} {/* Aqui as páginas serão renderizadas */}
              </main>
              {/* Rodapé (mantido) */}
              <footer className="py-4 text-center text-xs text-gray-500">
                Desenvolvido por 3º Sgt SCT COM Lucas <br /> Assistência de IA por Gemini (Google)
              </footer>
           </div>
        </MantineProvider>
      </body>
    </html>
  );
}