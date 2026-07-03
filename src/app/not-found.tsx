import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="font-display text-6xl italic text-ink-200">404</p>
      <h1 className="mt-4 font-display text-2xl text-ink-900">That shelf is empty</h1>
      <p className="mt-2 text-sm text-ink-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-700"
      >
        Back to homepage
      </Link>
    </div>
  )
}
