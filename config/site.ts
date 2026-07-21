export type SiteConfig = typeof siteConfig

export const siteConfig = {
  title: "Aldebaran - Eventos atletismo",
  name: "Aldebaran",
  description:
    "¡Bienvenido a Aldebaran: Tu Guía de Carreras de Atletismo en Colombia!",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://aldebaran.colombia",
  ogImage: "/images/hero/hero-home.jpg",
  mainNav: [
    {
      title: "Explorar",
      href: "/explorar",
    },
    {
      title: "Eventos",
      href: "/events",
    },
    {
      title: "Mapa",
      href: "/mapa",
    },
    {
      title: "Recursos",
      href: "/recursos",
    },
    {
      title: "Proponer Evento",
      href: "/propose-event",
    },
  ],
  links: {
    twitter: "https://twitter.com/luismateoh",
    github: "https://github.com/luismateoh",
  },
  keywords:
    "atletismo, carreras, maratones, Colombia, eventos, competencias, correr, corredores, corredoras, deporte, calendario maratones 2024 colombia, calendario maratones 2025 colombia",
}
