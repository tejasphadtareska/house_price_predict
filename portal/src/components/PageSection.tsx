import type { ReactNode } from 'react'

interface PageSectionProps {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  aside?: ReactNode
}

export default function PageSection({ eyebrow, title, description, children, aside }: PageSectionProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur xl:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">{eyebrow}</p>}
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
          {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}
