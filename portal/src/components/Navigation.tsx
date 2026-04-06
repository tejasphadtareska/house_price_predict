import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Housing Portal
        </Link>
        <div className="space-x-4">
          <Link href="/property-estimator" className="hover:underline">
            Property Value Estimator
          </Link>
          <Link href="/market-analysis" className="hover:underline">
            Market Analysis
          </Link>
        </div>
      </div>
    </nav>
  )
}