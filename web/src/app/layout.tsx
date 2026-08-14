import type { Metadata } from "next"
import "./globals.css"
import { NavBar } from "@/components/NavBar"

export const metadata: Metadata = {
  title: "ProMatch — Vagas compatíveis com seu perfil",
  description: "Encontre vagas que combinam com suas skills e candidate-se automaticamente.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gray-50 min-h-screen">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
