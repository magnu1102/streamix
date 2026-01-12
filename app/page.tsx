import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignOutButton from "./signout-button"

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Streamix</h1>
      <p className="mt-2">
        Signed in as <span className="font-medium">{session.user.email}</span>
      </p>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  )
}
