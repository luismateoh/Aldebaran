import Link from "next/link"

import { Icons } from "@/components/icons"
import { NewsletterForm } from "@/components/newsletter-form"
import { siteConfig } from "@/config/site"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="content-container py-16 md:py-20">
        {/* Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Logo + Description + Social */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Icons.logo className="h-12 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {siteConfig.description} Aldebaran es tu guía de carreras de
              atletismo en Colombia. Descubre, participa y disfruta del running
              en todo el país.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Icons.twitter className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Icons.gitHub className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Navegación
            </h3>
            <nav>
              <ul className="space-y-3" role="list">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Eventos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/map"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mapa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Recursos
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Legal
            </h3>
            <nav>
              <ul className="space-y-3" role="list">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Política de cookies
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Newsletter
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Recibe las últimas carreras y eventos directamente en tu correo.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 md:mt-16 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} {siteConfig.name}. Todos los derechos
              reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Hecho con pasión por el running en Colombia.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
