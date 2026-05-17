import type { Metadata } from "next";
import MuiProvider from "@/components/MuiProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vagas Jacareí | Plataforma de Empregos",
  description: "Plataforma de vagas de emprego da cidade de Jacareí-SP. Encontre oportunidades de trabalho na sua cidade.",
  keywords: ["vagas", "emprego", "Jacareí", "São Paulo", "trabalho", "oportunidades"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
