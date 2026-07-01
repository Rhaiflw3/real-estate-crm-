import Link from "next/link"

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">401 - Unauthorized</h1>
        <p className="text-slate-600 mb-8">
          You need to be logged in to access this page.
        </p>
        <Link 
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
