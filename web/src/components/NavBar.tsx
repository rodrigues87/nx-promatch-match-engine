"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Vagas" },
  { href: "/applications", label: "Candidaturas" },
  { href: "/profile", label: "Perfil" },
]

export function NavBar() {
  const pathname = usePathname()

  // Não mostra nav em login/onboarding
  if (pathname === "/login" || pathname?.startsWith("/onboarding")) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-border bg-dark-bg/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-white">
              ProMatch<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-accent bg-accent-glow"
                      : "text-surface-800 hover:text-white hover:bg-surface-200"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
