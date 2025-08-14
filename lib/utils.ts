import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { twMerge } from "tailwind-merge"
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatDate(date: Date) {
  return format(date, "LLL dd, y", { locale: es })
}

export function extractSegmentURL(path: string) {
  if (!path) return ""
  if (path === "/") return null
  return path.split("/")[1]
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export async function markdownToHtml(markdown: string): Promise<string> {
  try {
    const result = await remark()
      .use(remarkHtml, { sanitize: false })
      .process(markdown)
    return result.toString()
  } catch (error) {
    console.error('Error converting markdown to HTML:', error)
    return markdown // Fallback to original text
  }
}
