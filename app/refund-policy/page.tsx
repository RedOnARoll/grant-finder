import type { Metadata } from "next"
import LegalPage from "@/components/LegalPage"

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy - GrantWay",
  description: "How refunds, cancellations, and subscription access work for GrantWay paid features.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund and Cancellation Policy"
      description="This policy explains how GrantWay handles subscription cancellations and refund requests."
      sections={[
        {
          title: "Subscriptions",
          body: [
            "Monthly and annual subscriptions can be cancelled from the account subscription page. When you cancel, access continues through the end of the current billing period.",
            "After the billing period ends, premium access is removed unless you renew or resume the subscription.",
          ],
        },
        {
          title: "One-Time Purchases",
          body: [
            "One-time purchases provide the credits or access described at checkout. Unused credits may remain available on your account unless the service is discontinued or your account is closed for misuse.",
          ],
        },
        {
          title: "Refund Requests",
          body: [
            "If you believe you were charged in error, contact support@grantway.org within 14 days of the charge and include the email address on your account.",
            "Refunds are reviewed case by case. Approved refunds are returned to the original payment method through Stripe and may take several business days to appear.",
          ],
        },
        {
          title: "Non-Refundable Situations",
          body: [
            "We generally do not refund charges after substantial use of paid AI generation or application preparation features, unless required by law.",
            "GrantWay fees are for software access and preparation tools. They are not application fees and do not guarantee grant or benefit approval.",
          ],
        },
        {
          title: "Cancellation Help",
          body: [
            "If you cannot access your account or need help cancelling, email support@grantway.org before your next renewal date.",
          ],
        },
      ]}
    />
  )
}
