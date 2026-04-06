import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Housing Portal</h1>
        <p className="text-lg mb-8">
          Unified platform for housing price estimation and market analysis.
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Property Value Estimator</h2>
            <p className="mb-4">
              Estimate the value of a property using our advanced machine learning model.
              Input property details and get instant predictions.
            </p>
            <Link
              href="/property-estimator"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Market Analysis</h2>
            <p className="mb-4">
              Analyze housing market trends, compare properties, and explore
              what-if scenarios with interactive visualizations.
            </p>
            <Link
              href="/market-analysis"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
