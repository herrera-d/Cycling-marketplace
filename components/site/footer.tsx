import Link from "next/link";
import { Bike } from "lucide-react";

const SECTIONS = [
  {
    title: "Navegar",
    links: [
      { href: "/", label: "Todos los anuncios" },
      { href: "/#categorias", label: "Categorías" },
      { href: "/sell", label: "Publicar artículo" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: "/favoritos", label: "Mis favoritos" },
      { href: "/mis-articulos", label: "Mis artículos" },
      { href: "/login", label: "Iniciar sesión" },
    ],
  },
] as const;

/**
 * Año del copyright.
 *
 * Se calcula a nivel de módulo (no durante el render) porque con
 * `cacheComponents` Next no permite leer `new Date()` mientras prerenderiza:
 * el valor sería inestable entre renders. Al evaluarse una sola vez al
 * importar el módulo, queda congelado en el build.
 */
const COPYRIGHT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Bike className="size-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-lg font-semibold tracking-tight">
                BiciMarket
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Marketplace de ciclismo de segunda mano. Compra y vende de forma
              simple, segura y sin comisiones.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-eyebrow">{section.title}</h2>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {COPYRIGHT_YEAR} BiciMarket.</p>
          <p>Hecho para gente que rueda.</p>
        </div>
      </div>
    </footer>
  );
}
