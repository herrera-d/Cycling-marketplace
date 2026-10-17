import { Suspense } from "react";
import { ArrowRight, PackagePlus } from "lucide-react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { verifySession } from "@/lib/dal";

export const metadata = {
  title: "Publicar artículo",
  description: "Publica tu bici o componentes en BiciMarket.",
};

/**
 * Ruta protegida (Fase 2). El formulario multi-step real llega en la Fase 5;
 * de momento valida el flujo de autenticación end-to-end.
 */
export default function SellPage() {
  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<SellSkeleton />}>
          <SellContent />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

async function SellContent() {
  // Comprobación "segura": vuelve a validar la sesión junto a los datos.
  const { user } = await verifySession();

  return (
    <div className="rounded-3xl border bg-card p-8 shadow-sm sm:p-10">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <PackagePlus className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">
        Hola{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-2 text-muted-foreground">
        Has iniciado sesión correctamente. El asistente para publicar tu artículo
        llega en la <strong>Fase 5</strong>.
      </p>

      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <ArrowRight className="size-4 text-primary" aria-hidden="true" />
          Sesión activa y verificada en el servidor.
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="size-4 text-primary" aria-hidden="true" />
          Ruta protegida por <code className="font-mono">proxy.ts</code>.
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="size-4 text-primary" aria-hidden="true" />
          Listo para la subida de imágenes con Supabase Storage.
        </li>
      </ul>
    </div>
  );
}

function SellSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-72 animate-pulse rounded-3xl border bg-card shadow-sm"
    />
  );
}
