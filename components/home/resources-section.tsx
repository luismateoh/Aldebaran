"use client"

import { motion, type Variants } from "framer-motion"
import { Dumbbell, Apple, Shirt, Heart } from "lucide-react"

import { BentoGrid } from "@/components/layout/bento-grid"
import { ResourceCard } from "@/components/cards/resource-card"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
interface ResourceEntry {
  title: string
  description: string
  image: string
  icon: typeof Dumbbell
  href: string
}

const RESOURCES: ResourceEntry[] = [
  {
    title: "Entrenamiento y Preparación",
    description:
      "Planes de entrenamiento personalizados, tips para mejorar tu rendimiento y guías para prepararte en cada distancia.",
    image: "/images/resources/training.jpg",
    icon: Dumbbell,
    href: "/blog/entrenamiento",
  },
  {
    title: "Nutrición Deportiva",
    description:
      "Guías de alimentación para runners, hidratación estratégica y suplementación para cada fase de tu carrera.",
    image: "/images/resources/nutrition.jpg",
    icon: Apple,
    href: "/blog/nutricion",
  },
  {
    title: "Equipamiento",
    description:
      "Reseñas de zapatillas, ropa técnica y accesorios esenciales para correr en cualquier terreno de Colombia.",
    image: "/images/resources/gear.jpg",
    icon: Shirt,
    href: "/blog/equipamiento",
  },
  {
    title: "Comunidad",
    description:
      "Conecta con otros corredores, encuentra grupos de entrenamiento y participa en eventos sociales de tu región.",
    image: "/images/resources/community.jpg",
    icon: Heart,
    href: "/blog/comunidad",
  },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// ---------------------------------------------------------------------------
// ResourcesSection
// ---------------------------------------------------------------------------
export function ResourcesSection() {
  return (
    <section className="container py-20 md:py-28">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-14 text-center"
      >
        <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Aprende y prepárate
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Todo lo que necesitas para
          <br />
          <span className="text-gradient">tu próxima carrera</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          Desde planes de entrenamiento hasta nutrición y equipamiento, tenemos
          todo lo que necesitas para llegar en tu mejor forma
        </p>
      </motion.div>

      {/* ─── BentoGrid with staggered cards ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <BentoGrid layout="resources">
          {RESOURCES.map((resource) => (
            <motion.div key={resource.title} variants={itemVariants}>
              <ResourceCard
                title={resource.title}
                description={resource.description}
                image={resource.image}
                icon={resource.icon}
                href={resource.href}
              />
            </motion.div>
          ))}
        </BentoGrid>
      </motion.div>
    </section>
  )
}
