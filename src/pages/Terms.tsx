import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

const HTML = `<p><strong>Effective date:</strong> August 7, 2026</p>
<p>These Terms of Use (“Terms”) govern your use of <strong>https://ibamboo.com</strong> (the “Site”), operated by SYMO, LLC (“iBamboo,” “we,” “us”). By using the Site, you agree to these Terms.</p>
<h2>1. What this Site is</h2>
<p>iBamboo is an <strong>editorial Amazon Associates</strong> website. We curate and describe products and gift routes related to bamboo home goods and related Amazon catalog picks. We provide information and outbound shopping links. We do <strong>not</strong> warehouse, sell, ship, or process payment for the products featured here.</p>
<h2>2. Amazon Associates</h2>
<p>We are a participant in the Amazon Services LLC Associates Program. We may earn a commission on qualifying purchases made through links on the Site. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. Product prices, availability, shipping, taxes, and returns are controlled by Amazon (or the listed seller) and may change without notice.</p>
<h2>3. No purchase contract with us</h2>
<p>Any purchase you make is solely between you and the third-party seller (often Amazon). Their terms, privacy policy, and customer service apply to your order.</p>
<h2>4. Informational content only</h2>
<p>Guides, calendars, FAQs, product notes, and recommendations are for general information and shopping convenience. They are not professional advice (including medical, legal, financial, or engineering advice). Always verify product fit, safety, and installation requirements with the manufacturer and qualified professionals where appropriate.</p>
<h2>5. Acceptable use</h2>
<p>You agree not to misuse the Site, attempt unauthorized access, scrape in a way that harms service, or use the Site for unlawful purposes.</p>
<h2>6. Intellectual property</h2>
<p>Site design, branding, and original written content are owned by us or our licensors. You may not copy the Site for commercial republication without permission. Product names and images may be trademarks of their respective owners.</p>
<h2>7. Disclaimer of warranties</h2>
<p>THE SITE AND ALL CONTENT ARE PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED OR ERROR-FREE.</p>
<h2>8. Limitation of liability</h2>
<p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, SYMO, LLC AND IBAMBOO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR DATA, ARISING FROM YOUR USE OF THE SITE OR RELIANCE ON CONTENT. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE SITE SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS (US \$100).</p>
<h2>9. Indemnity</h2>
<p>You agree to indemnify and hold harmless SYMO, LLC and its officers and agents from claims arising out of your misuse of the Site or violation of these Terms.</p>
<h2>10. Links</h2>
<p>Outbound links are provided for convenience. We are not responsible for third-party sites or services.</p>
<h2>11. Changes</h2>
<p>We may modify these Terms at any time by posting an updated version on the Site. Continued use after changes constitutes acceptance.</p>
<h2>12. Governing law</h2>
<p>These Terms are governed by the laws of the State of Wyoming, USA, without regard to conflict-of-law rules. Exclusive venue for disputes shall be state or federal courts located in Wyoming, unless applicable law requires otherwise.</p>
<h2>13. Contact</h2>
<p>Questions about these Terms: hello@ibamboo.com or the contact options on this website. Operator: SYMO, LLC, Sheridan, Wyoming, USA.</p>
<p class="muted tiny">© 2026 SYMO, LLC. All rights reserved.</p>`

/** Minimum Terms of Use for iBamboo. Not a substitute for legal counsel. */
export function Terms() {
  return (
    <div className="pb-24">
      <Seo
        title="Terms of Use"
        description="Terms of Use for iBamboo (ibamboo.com)."
        path="/terms"
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">Legal</p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-8">Terms of Use</h1>
        <div
          className="legal-prose space-y-4 text-sm sm:text-base text-ink-soft leading-relaxed [&_h2]:text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: HTML }}
        />
        <p className="mt-10 text-sm text-muted">
          <Link to="/" className="hover:underline">Home</Link>
          {' · '}
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </p>
      </article>
    </div>
  )
}
