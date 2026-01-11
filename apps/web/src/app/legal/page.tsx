import { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Legal Notices | Carolina Growth",
    description: "Legal notices, terms of service, privacy policy, and other important legal information for Carolina Growth.",
    path: "/legal",
    keywords: ["legal", "terms", "privacy", "notices", "disclaimer"],
    robots: {
      index: true,
      follow: true,
    },
  });
}

export default function LegalPage() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="title text-4xl font-semibold">Legal Notices</h1>
        <p className="mt-4 text-base text-[var(--muted)]">
          Important legal information regarding your use of Carolina Growth services and website.
        </p>

        <div className="mt-12 grid gap-12">
          {/* Terms of Service */}
          <div>
            <h2 className="title text-2xl font-semibold">Terms of Service</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Last updated: January 15, 2026</p>
            <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
              <div>
                <p className="font-semibold text-[var(--foreground)]">1. Acceptance of Terms</p>
                <p className="mt-1">
                  By accessing and using Carolina Growth's website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">2. Services</p>
                <p className="mt-1">
                  Carolina Growth provides marketing, growth, and web design services. Specific scopes, timelines, deliverables, and payment terms are detailed in individual statements of work (SOW) or service agreements. All services are subject to the terms outlined in the applicable SOW.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">3. Payment Terms</p>
                <p className="mt-1">
                  Payment terms are specified in each service agreement. Subscriptions are billed monthly or annually as agreed. One-time services require payment as specified in the SOW. Late payments may result in service suspension or termination.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">4. Confidentiality</p>
                <p className="mt-1">
                  We protect all client data, proprietary information, and confidential materials shared with us. We require the same level of confidentiality for any materials we share with clients. This obligation survives termination of our engagement.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">5. Intellectual Property</p>
                <p className="mt-1">
                  All work product, deliverables, and materials created by Carolina Growth remain our property until full payment is received. Upon full payment, ownership transfers to the client as specified in the SOW. Client-provided materials remain the client's property.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">6. Limitation of Liability</p>
                <p className="mt-1">
                  Our liability is limited to the scope of services agreed upon in the applicable SOW. We are not liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid by the client for the specific service giving rise to the claim.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">7. Termination</p>
                <p className="mt-1">
                  Either party may terminate services with written notice as specified in the SOW. Upon termination, all outstanding fees become immediately due. Work completed up to the termination date remains billable.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">8. Modifications</p>
                <p className="mt-1">
                  We reserve the right to modify these terms at any time. Continued use of our services after modifications constitutes acceptance of the updated terms.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Policy */}
          <div>
            <h2 className="title text-2xl font-semibold">Privacy Policy</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Last updated: January 15, 2026</p>
            <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Information We Collect</p>
                <p className="mt-1">
                  We collect information you provide directly (name, email, company, phone), information collected automatically (IP address, browser type, usage data), and information from third parties (analytics services, payment processors).
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">How We Use Information</p>
                <p className="mt-1">
                  We use collected information to provide and improve our services, process payments, communicate with you, send marketing communications (with your consent), and comply with legal obligations.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Information Sharing</p>
                <p className="mt-1">
                  We do not sell your personal information. We may share information with service providers (payment processors, email services, analytics), when required by law, or to protect our rights and safety.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Data Security</p>
                <p className="mt-1">
                  We implement appropriate technical and organizational measures to protect your data. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Your Rights</p>
                <p className="mt-1">
                  You have the right to access, update, delete, or restrict processing of your personal information. You may also opt-out of marketing communications at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <h2 className="title text-2xl font-semibold">Disclaimer</h2>
            <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Service Results</p>
                <p className="mt-1">
                  While we strive to deliver exceptional results, we cannot guarantee specific outcomes, rankings, traffic increases, or revenue growth. Results depend on numerous factors beyond our control, including market conditions, competition, and client implementation.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Third-Party Services</p>
                <p className="mt-1">
                  Our services may integrate with third-party platforms and tools. We are not responsible for the availability, functionality, or terms of these third-party services.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Website Content</p>
                <p className="mt-1">
                  The information on this website is provided "as is" without warranties of any kind. We make no representations or warranties regarding the accuracy, completeness, or suitability of the information.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Policy */}
          <div>
            <h2 className="title text-2xl font-semibold">Cookie Policy</h2>
            <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
              <div>
                <p className="font-semibold text-[var(--foreground)]">What Are Cookies</p>
                <p className="mt-1">
                  Cookies are small text files stored on your device when you visit our website. They help us provide, protect, and improve our services.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">How We Use Cookies</p>
                <p className="mt-1">
                  We use cookies for essential website functionality, analytics to understand usage patterns, and to remember your preferences. You can manage cookie preferences through your browser settings or our cookie settings page.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="title text-2xl font-semibold">Contact Us</h2>
            <div className="mt-6 space-y-2 text-sm text-[var(--muted)]">
              <p>
                For questions about these legal notices, please contact us:
              </p>
              <p>
                <strong className="text-[var(--foreground)]">Email:</strong> help@carolinagrowth.co
              </p>
              <p>
                <strong className="text-[var(--foreground)]">Website:</strong>{" "}
                <a href="https://carolinagrowth.co/contact" className="text-[var(--accent)] hover:underline">
                  carolinagrowth.co/contact
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
