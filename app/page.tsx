import { redirect } from "next/navigation"

/**
 * Home pública — redirect server-side a /chat.
 * No hay landing aparte: la app entra directo al cuarto de Tanit.
 */
export default function HomePage() {
  redirect("/chat")
}
