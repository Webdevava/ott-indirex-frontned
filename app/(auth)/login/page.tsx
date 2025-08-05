/* eslint-disable @next/next/no-img-element */
import { LoginForm } from "@/components/forms/login-form"


export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
             <img src='/rex.svg' alt="logo" className="w-full h-8"/>
          </div>
          Indirex
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
