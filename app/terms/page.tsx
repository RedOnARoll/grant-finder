import type { Metadata } from "next"
import LegalPage from "@/components/LegalPage"

export const metadata: Metadata = {
  title: "Terms of Service - GrantWay",
  description: "The terms that apply when using GrantWay.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms describe the rules for using GrantWay. By using the service, you agree to these terms."
      sections={[
        {
          title: "Use of GrantWay",
          body: [
            "GrantWay helps users discover grants and benefits, organize application materials, and prepare draft application content.",
            "You are responsible for the accuracy of information you enter and for reviewing any generated or suggested content before using it.",
          ],
        },
        {
          title: "No Government Affiliation",
          body: [
            "GrantWay is an independent service. We are not affiliated with, endorsed by, or operated by any federal, state, local, or tribal government agency.",
            "Using GrantWay does not submit an application for you and does not guarantee eligibility, approval, funding, benefits, or award amounts.",
          ],
        },
        {
          title: "Program Listings and Eligibility",
          body: [
            "Program information may change without notice. Deadlines, eligibility rules, funding amounts, required documents, and application instructions must be verified with the official source.",
            "Eligibility matches are estimates based on available data and your profile answers. Final decisions are made by the administering program or agency.",
          ],
        },
        {
          title: "Paid Features",
          body: [
            "Paid features may include AI-assisted draft generation, expanded application preparation tools, and subscription access. Prices and feature availability may change prospectively.",
            "You agree not to misuse paid features, attempt to bypass access controls, or use GrantWay to generate unlawful, misleading, or fraudulent application materials.",
          ],
        },
        {
          title: "Account Responsibilities",
          body: [
            "You are responsible for keeping your account credentials secure and for activity under your account.",
            "We may suspend or limit access if we believe an account is being used abusively, unlawfully, or in a way that harms the service or other users.",
          ],
        },
        {
          title: "Contact",
          body: [
            "Questions about these terms can be sent to support@grantway.org.",
          ],
        },
      ]}
    />
  )
}
