// Caminho do arquivo: app/layout.tsx (Atualizado com MantineProvider)

// Importa o CSS base do Mantine (CORRIGIDO)
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Roboto } from "next/font/google";
import "./globals.css"; // Mantém o CSS global (Tailwind)

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "2º CGEO - SALC",
  description: "2º Centro de Geoinformação - SALC",
};

// Define o tema Mantine (usando as cores EB que definimos no CSS)
const theme = createTheme({
  fontFamily: roboto.style.fontFamily,
  primaryColor: 'green', // Define 'green' como a cor primária
  colors: {
    // Mapeia a cor 'green' para o nosso tema EB (definido no globals.css)
    'green': [
      "var(--mantine-color-green-0)",
      "var(--mantine-color-green-1)",
      "var(--mantine-color-green-2)",
      "var(--mantine-color-green-3)",
      "var(--mantine-color-green-4)",
      "var(--mantine-color-green-5)",
      "var(--mantine-color-green-6, #04773B)", // Cor primária EB
      "var(--mantine-color-green-7)",
      "var(--mantine-color-green-8)",
      "var(--mantine-color-green-9)"
    ],
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={roboto.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
           <Notifications position="top-right" zIndex={1000} />
           <div className="flex min-h-screen flex-col">
              {/* Mantém o fundo cinza claro do Tailwind (opcional) */}
              <main className="flex-grow bg-gray-100">
                {children}
              </main>
              <footer className="py-4 text-center text-xs text-gray-500 bg-gray-100">
                Desenvolvido por 3º Sgt SCT COM Lucas <br /> Assistência de IA por Gemini (Google)
              </footer>
           </div>
        </MantineProvider>
      </body>
    </html>
  );
}