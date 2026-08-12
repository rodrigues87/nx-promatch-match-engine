import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "JobMatch — Vagas compatíveis com seu perfil",
  description: "Encontre vagas que combinam com suas skills e candidate-se automaticamente.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
