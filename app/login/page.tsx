import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Bike, ShieldCheck } from "lucide-react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";
import { getSession } from "@/lib/dal";

export const metadata = {
  title: "Iniciar sesión",
  description:
    "Entra con tu cuenta de Google para publicar y guardar artículos en BiciMarket.",
};

/** Solo acepta rutas internas (evita redirecciones abiertas). */
function safeCallbackUrl(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }
  return raw;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<LoginCardSkeleton />}>
          <LoginCard searchParams={searchParams} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

async function LoginCard({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const session = await getSession();
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-sm sm:p-10">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Bike className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Bienvenido a BiciMarket
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entra para publicar tus artículos y guardar tus favoritos.
        </p>
      </div>

      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl });
        }}
      >
        <Button
          type="submit"
          size="lg"
          variant="outline"
          className="w-full rounded-full bg-background"
        >
          <GoogleIcon />
          Continuar con Google
        </Button>
      </form>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
        Solo usamos tu nombre y foto de perfil. Nunca publicamos en tu nombre.
      </p>
    </div>
  );
}

function LoginCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-80 w-full max-w-md animate-pulse rounded-3xl border bg-card shadow-sm"
    />
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 shrink-0"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.4 5.4 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
