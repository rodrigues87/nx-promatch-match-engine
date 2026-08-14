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
    <html lang="pt-BR" className="dark">
      <body className="antialiased min-h-screen">
        <NavBar />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  )
}
