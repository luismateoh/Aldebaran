"use client"
export default function InteractiveSection({ children }: any) {
  const handleCopy = (e: any) => {
    e.preventDefault()
  }

  return <section onCopy={handleCopy}>{children}</section>
}
