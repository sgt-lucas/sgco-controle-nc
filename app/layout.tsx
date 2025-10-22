// Caminho do arquivo: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SGCO - Gestão de Créditos",
  description: "Sistema de Gerenciamento de Créditos Orçamentários",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* bg-gray-100 dark:bg-gray-900 define um fundo cinza claro */}
        <div className="min-h-screen bg-gray-100 text-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}