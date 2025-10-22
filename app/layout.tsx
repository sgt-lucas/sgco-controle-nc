// Caminho do arquivo: app/layout.tsx
import type { Metadata } from "next";
import { Roboto } from "next/font/google"; // Mantém a fonte Roboto
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Branding atualizado
export const metadata: Metadata = {
  title: "2º CGEO - SALC",
  description: "2º Centro de Geoinformação - SALC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={roboto.className}>
        {/* Esta estrutura (flex-col) garante que o rodapé fique no final */}
        <div className="flex min-h-screen flex-col">
          {/* O 'flex-grow' faz o conteúdo principal empurrar o rodapé */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* Rodapé de Atribuição Adicionado */}
          <footer className="py-4 text-center text-xs text-gray-500">
            Desenvolvido por 3º Sgt SCT COM Lucas
            <br />
            Assistência de IA por Gemini (Google)
          </footer>
        </div>
      </body>
    </html>
  );
}