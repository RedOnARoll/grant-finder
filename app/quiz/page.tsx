import Link from "next/link"

export default function QuizLandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      <nav className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900">GrantFinder</Link>
          <div className="flex gap-6 text-sm font-medium text-zinc-600">
            <Link href="/grants" className="hover:text-zinc-900 transition-colors">Grants</Link>
            <Link href="/benefits" className="hover:text-zinc-900 transition-colors">Benefits</Link>
            <Link href="/quiz" className="text-zinc-900 font-semibold">Eligibility Quiz</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Eligibility Quiz</h1>
          <p className="text-lg text-zinc-500">
            Answer a few questions to find out what you qualify for.
            Choose the quiz that matches what you&apos;re looking for.
          </p>
        </div>

        <div className="grid gap-6">
          <Link
            href="/quiz/grants"
            className="group rounded-2xl border-2 border-zinc-200 p-8 hover:border-zinc-900 transition-colors"
          >
            <div className="flex items-start gap-5">
              <span className="text-4xl">💰</span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700">
                  Grants Quiz
                </h2>
                <p className="text-zinc-500 mb-4">
                  Find competitive funding for your business, research, farm, arts project, or personal goals.
                  We&apos;ll ask about your category and specific situation to match you with the right grants.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Small Business", "Research", "Agricultural", "Arts", "Veterans", "Individual"].map((cat) => (
                    <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-zinc-400 group-hover:text-zinc-900 transition-colors text-xl mt-1">→</span>
            </div>
          </Link>

          <Link
            href="/quiz/benefits"
            className="group rounded-2xl border-2 border-zinc-200 p-8 hover:border-zinc-900 transition-colors"
          >
            <div className="flex items-start gap-5">
              <span className="text-4xl">🤝</span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700">
                  Benefits Quiz
                </h2>
                <p className="text-zinc-500 mb-4">
                  Discover government assistance programs you may be eligible for — housing, food,
                  healthcare, disability support, and more. Choose to search by your situation or by category.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["By Situation", "By Category", "Housing", "Food", "Healthcare", "Disability"].map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-zinc-400 group-hover:text-zinc-900 transition-colors text-xl mt-1">→</span>
            </div>
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-sm text-zinc-500">
        Information is for reference only. Verify eligibility directly with each program.
      </footer>
    </div>
  )
}
