import type { Metadata } from "next";
import MuiProvider from "@/components/MuiProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vagas Jacareí | Plataforma de Empregos",
  description: "Plataforma de vagas de emprego da cidade de Jacareí-SP. Encontre oportunidades de trabalho na sua cidade.",
  keywords: ["vagas", "emprego", "Jacareí", "São Paulo", "trabalho", "oportunidades"],
};

import GlobalFooter from "@/components/GlobalFooter";
import NextAuthProvider from "@/components/NextAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning style={{ display: "flex", flexDirection: "column", minHeight: "100vh", margin: 0 }}>
        <NextAuthProvider>
          <MuiProvider>
            {children}
            <GlobalFooter />
          </MuiProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
