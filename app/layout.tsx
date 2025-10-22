// Caminho do arquivo: app/layout.tsx
import type { Metadata } from "next";
// 1. Importa a fonte Roboto
import { Roboto } from "next/font/google"; 
import "./globals.css";

// 2. Configura a fonte Roboto (com pesos diferentes)
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Padrão, Médio e Negrito
});

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
      {/* 3. Aplica a classe da fonte ao body */}
      <body className={roboto.className}>
        <div className="min-h-screen bg-gray-100 text-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}