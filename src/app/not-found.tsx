import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <div className="mb-8 inline-flex items-center justify-center">
          <svg className="w-24 h-24 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 10h.01M16 10h.01" />
            <path d="M8 16c1.333-1 2.667-1 4 0 1.333 1 2.667 1 4 0" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          404 · Page Not Found
        </h1>
        <p className="mt-4 text-gray-300">
          Looks like our detective couldn’t find the page you’re looking for. The trail may have gone cold or the URL is a little suspect.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all duration-300"
          >
            Back to Headlines
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-10 opacity-60">
          <div className="mx-auto w-40 h-40 relative">
            <img
              src="/sherlock.svg"
              alt="Sherlock silhouette"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


