'use client'

interface ClientErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export default function ClientErrorState({ title = 'Something went wrong', message, onRetry }: ClientErrorStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-rose-900">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">{title}</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
