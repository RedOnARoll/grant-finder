"use client"

import { useState } from "react"
import Link from "next/link"
import type { EligibilityCriteria } from "@/lib/types"

type Answer = "yes" | "no" | null

interface Question {
  id: string
  text: string
  failReason: string
}

function buildQuestions(criteria: EligibilityCriteria | string[]): Question[] {
  if (Array.isArray(criteria)) {
    return criteria.map((req, i) => ({
      id: `req_${i}`,
      text: req,
      failReason: req,
    }))
  }

  const c = criteria
  const questions: Question[] = []

  if (c.requires_us_citizen) {
    questions.push({
      id: "citizen",
      text: "Are you a US citizen?",
      failReason: "Must be a US citizen",
    })
  }
  if (c.requires_us_resident && !c.requires_us_citizen) {
    questions.push({
      id: "resident",
      text: "Are you a US resident or permanent resident?",
      failReason: "Must be a US resident or permanent resident",
    })
  }
  if (c.requires_student) {
    questions.push({
      id: "student",
      text: "Are you currently enrolled as a student?",
      failReason: "Must be currently enrolled as a student",
    })
  }
  if (c.max_household_income) {
    const limit = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(c.max_household_income)
    questions.push({
      id: "income",
      text: `Is your annual household income below ${limit}?`,
      failReason: `Annual household income must not exceed ${limit}`,
    })
  }
  if (c.max_household_income_percent_poverty) {
    questions.push({
      id: "poverty",
      text: `Is your household income at or below ${c.max_household_income_percent_poverty}% of the federal poverty level?`,
      failReason: `Income must be at or below ${c.max_household_income_percent_poverty}% of the federal poverty level`,
    })
  }
  if (c.max_household_income_percent_ami) {
    questions.push({
      id: "ami",
      text: `Is your household income at or below ${c.max_household_income_percent_ami}% of the Area Median Income in your area?`,
      failReason: `Income must be at or below ${c.max_household_income_percent_ami}% of AMI`,
    })
  }
  if (c.requires_rural) {
    questions.push({
      id: "rural",
      text: "Do you live in a rural area?",
      failReason: "Must reside in a rural area",
    })
  }

  return questions
}

export default function EligibilityQuiz({
  criteria,
  slug,
}: {
  criteria: EligibilityCriteria | string[]
  slug: string
}) {
  const questions = buildQuestions(criteria)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [submitted, setSubmitted] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Eligibility</h2>
        <p className="text-sm text-zinc-500 mb-4">
          This program has no strict automated eligibility criteria. Review the full requirements on the official program page.
        </p>
        <Link
          href={`/benefits/${slug}/apply`}
          className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Start Application →
        </Link>
      </div>
    )
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)
  const failedQuestions = questions.filter((q) => answers[q.id] === "no")
  const isEligible = allAnswered && failedQuestions.length === 0

  function handleAnswer(id: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    setSubmitted(false)
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-6">
      <h2 className="text-xl font-semibold text-zinc-900 mb-1">Am I Eligible?</h2>
      <p className="text-sm text-zinc-500 mb-6">Answer a few questions to check if you qualify.</p>

      <div className="space-y-5">
        {questions.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-zinc-800 mb-2">{q.text}</p>
            <div className="flex gap-3">
              {(["yes", "no"] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAnswer(q.id, val)}
                  className={`h-9 px-5 rounded-full text-sm font-medium border transition-colors ${
                    answers[q.id] === val
                      ? val === "yes"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-red-500 text-white border-red-500"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {val === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div className="mt-8">
          {isEligible ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
              <p className="text-sm font-semibold text-green-800 mb-1">You appear to be eligible</p>
              <p className="text-sm text-green-700">
                Based on your answers, you meet the requirements for this benefit. Continue to see what documents you&apos;ll need.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">You may not qualify</p>
              <p className="text-sm text-amber-700 mb-2">
                Based on your answers, you may not meet all requirements:
              </p>
              <ul className="text-sm text-amber-700 space-y-1">
                {failedQuestions.map((q) => (
                  <li key={q.id} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{q.failReason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            href={`/benefits/${slug}/apply`}
            className="inline-flex items-center h-11 px-6 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Start Application →
          </Link>
        </div>
      )}
    </div>
  )
}
