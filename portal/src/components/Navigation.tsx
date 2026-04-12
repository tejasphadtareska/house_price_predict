'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/property-estimator', label: 'Estimator' },
  { href: '/market-analysis', label: 'Market Analysis' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-30 border-b border-white/30 bg-slate-950/80 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-400 text-lg font-bold text-slate-950">
            HP
          </span>
          <span>
            <span className="block text-base font-semibold tracking-wide">Housing Portal</span>
            <span className="block text-xs text-slate-300">Prediction, comparison, and market intelligence</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {links.map(link => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
