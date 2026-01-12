import LoginForm from "./login-form"

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Streamix</h1>
      <p className="mt-2 text-sm opacity-80">
        Sign in with your email. We’ll send you a secure magic link.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </main>
  )
}
