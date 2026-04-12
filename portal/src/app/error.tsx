'use client'

import ClientErrorState from '@/components/ClientErrorState'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <ClientErrorState
        title="Application Error"
        message={error.message || 'The interface failed to load.'}
        onRetry={reset}
      />
    </div>
  )
}
