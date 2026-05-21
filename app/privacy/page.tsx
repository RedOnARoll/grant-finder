import type { Metadata } from "next"
import LegalPage from "@/components/LegalPage"

export const metadata: Metadata = {
  title: "Privacy Policy - GrantWay",
  description: "How GrantWay collects, uses, and protects account and program matching information.",
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what information GrantWay collects, how we use it, and the choices you have."
      sections={[
        {
          title: "Information We Collect",
          body: [
            "We collect information you provide directly, including your name, email address, ZIP code, profile answers, saved programs, application status notes, and account preferences.",
            "If you choose to use paid features, payment details are handled by Stripe. GrantWay does not store full card numbers.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "We use your information to provide program search, eligibility matching, saved-program tracking, application preparation tools, account support, and subscription access.",
            "Profile details may be used to personalize grant and benefit matches, improve document checklists, and generate application draft content when you request it.",
          ],
        },
        {
          title: "Service Providers",
          body: [
            "GrantWay uses trusted providers such as Supabase for authentication and database services, Stripe for payments, Resend for transactional email, Vercel for hosting, and AI providers for requested generation features.",
            "These providers process information only as needed to operate GrantWay and deliver requested services.",
          ],
        },
        {
          title: "Your Choices",
          body: [
            "You can update your profile, change notification preferences, manage your subscription, or delete your account from the account area.",
            "You can contact support@grantway.org for help with privacy questions or account requests.",
          ],
        },
        {
          title: "Data Security",
          body: [
            "We use reasonable administrative and technical safeguards to protect account information. No internet service can guarantee absolute security.",
            "Do not upload or enter sensitive documents unless they are needed for your own application preparation.",
          ],
        },
        {
          title: "Program Information",
          body: [
            "GrantWay is not a government agency. Program listings and eligibility estimates are informational and should be verified with official program sources before applying.",
          ],
        },
      ]}
    />
  )
}
