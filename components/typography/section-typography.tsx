import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type Align = "left" | "center" | "right"

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

interface TypographyBaseProps {
  /** Controls text alignment */
  align?: Align
  /** Additional class names */
  className?: string
  /** Children content */
  children?: React.ReactNode
}

// ─── Polymorphic helper ──────────────────────────────────────────────────────

type PolymorphicProps<C extends React.ElementType, P = object> = P &
  Omit<React.ComponentPropsWithoutRef<C>, keyof P> & {
    as?: C
  }

// ─── Align utility ───────────────────────────────────────────────────────────

function alignClass(align: Align = "left") {
  return cn(
    align === "left" && "text-left",
    align === "center" && "text-center",
    align === "right" && "text-right"
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
/**
 * Small, uppercase label with primary colour.
 * Ideal for section eyebrow / kicker text.
 *
 * @example
 * <SectionLabel>Eventos destacados</SectionLabel>
 */
function SectionLabel<C extends React.ElementType = "p">({
  as,
  align = "left",
  className,
  children,
  ...props
}: PolymorphicProps<C, TypographyBaseProps>) {
  const Component = as || "p"

  return (
    <Component
      className={cn(
        "font-heading text-caption font-semibold uppercase tracking-widest text-primary",
        alignClass(align),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

SectionLabel.displayName = "SectionLabel"

// ─── SectionTitle ─────────────────────────────────────────────────────────────
/**
 * Large h2 heading with bold weight and tight tracking.
 * Used as the main title for sections.
 *
 * @example
 * <SectionTitle>Próximas carreras en Colombia</SectionTitle>
 */
function SectionTitle<C extends React.ElementType = "h2">({
  as,
  align = "left",
  className,
  children,
  ...props
}: PolymorphicProps<C, TypographyBaseProps>) {
  const Component = as || "h2"

  return (
    <Component
      className={cn(
        "font-heading text-heading-2 font-bold tracking-tight text-foreground",
        "md:text-heading-1",
        "text-balance",
        alignClass(align),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

SectionTitle.displayName = "SectionTitle"

// ─── SectionSubtitle ──────────────────────────────────────────────────────────
/**
 * Larger body text in muted foreground.
 * Used as supporting text below SectionTitle.
 *
 * @example
 * <SectionSubtitle>
 *   Explora los mejores eventos de atletismo en todo el país.
 * </SectionSubtitle>
 */
function SectionSubtitle<C extends React.ElementType = "p">({
  as,
  align = "left",
  className,
  children,
  ...props
}: PolymorphicProps<C, TypographyBaseProps>) {
  const Component = as || "p"

  return (
    <Component
      className={cn(
        "text-body-large text-muted-foreground",
        "max-w-[640px]",
        align === "center" && "mx-auto",
        alignClass(align),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

SectionSubtitle.displayName = "SectionSubtitle"

// ─── HeroTitle ────────────────────────────────────────────────────────────────
/**
 * Extra-large h1 heading (64–72 px).
 * Best used at the top of landing / hero sections.
 *
 * @example
 * <HeroTitle>Corre por Colombia</HeroTitle>
 */
function HeroTitle<C extends React.ElementType = "h1">({
  as,
  align = "left",
  className,
  children,
  ...props
}: PolymorphicProps<C, TypographyBaseProps>) {
  const Component = as || "h1"

  return (
    <Component
      className={cn(
        "font-heading text-hero font-bold tracking-tight text-foreground",
        "md:text-hero-xl",
        "text-balance",
        alignClass(align),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

HeroTitle.displayName = "HeroTitle"

export { SectionLabel, SectionTitle, SectionSubtitle, HeroTitle }
export type { Align, HeadingLevel, TypographyBaseProps, PolymorphicProps }
