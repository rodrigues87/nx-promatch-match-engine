/**
 * Landing page — redireciona para dashboard (modo mock).
 */

import { redirect } from "next/navigation"

export default function Home() {
  // Em modo mock, vai direto para o dashboard
  redirect("/dashboard")
}
