interface ErrorAlertProps {
  message: string
  title?: string
}

export function ErrorAlert({ message, title = 'Error' }: ErrorAlertProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p className="font-semibold">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  )
}

interface SuccessAlertProps {
  title: string
  children: React.ReactNode
}

export function SuccessAlert({ title, children }: SuccessAlertProps) {
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      <h3 className="font-semibold text-green-800">{title}</h3>
      <div className="text-sm mt-2">{children}</div>
    </div>
  )
}
