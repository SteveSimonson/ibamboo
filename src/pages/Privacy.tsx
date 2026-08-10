import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

const HTML = `<p><strong>Effective date:</strong> August 7, 2026</p>
<p>This Privacy Policy describes how <strong>iBamboo</strong> (“we,” “us”), operated by SYMO, LLC (Sheridan, Wyoming, USA), handles information when you visit <strong>https://ibamboo.com</strong> (the “Site”).</p>
<h2>1. Who we are</h2>
<p>iBamboo is an Amazon Associates editorial site. We publish product information, guides, and links so you can discover bamboo home goods and related Amazon catalog picks. We are <strong>not</strong> the seller of record for products linked on the Site. Purchases are completed on Amazon or another third-party retailer.</p>
<h2>2. Information we collect</h2>
<ul>
  <li><strong>Information you provide.</strong> If you use a contact form, waitlist, quiz, or similar feature, we may collect your name, email address, message content, and any other fields you submit.</li>
  <li><strong>Automatic technical data.</strong> Servers and security providers (including Cloudflare) may log IP address, browser type, device type, referring URL, and timestamps for security, reliability, and basic operations.</li>
  <li><strong>Cookies and similar tech.</strong> We may use analytics tools (for example Google Analytics or similar) to understand aggregate traffic and page performance. Those tools may set cookies or similar identifiers. You can control cookies through your browser settings.</li>
</ul>
<p>If you complete a quiz or profile tool, we may store your answers and any contact details you provide so we can return results and improve the experience.</p>
<h2>3. How we use information</h2>
<ul>
  <li>To respond to inquiries and operate the Site</li>
  <li>To improve content, performance, and security</li>
  <li>To send follow-up only when you requested it</li>
  <li>To comply with law and enforce our Terms</li>
</ul>
<p>Contact and lead information may be processed through our CRM provider (Parsimony Automate / LeadConnector infrastructure) on our behalf. We do not sell your personal information for money.</p>
<h2>4. Amazon and other third parties</h2>
<p>Links on the Site may send you to Amazon.com, partner specialty sites, or other retailers. Those sites have their own privacy policies and cookie practices. We do not control data collection after you leave our Site. As an Amazon Associate, we may earn commissions on qualifying purchases.</p>
<h2>5. Sharing</h2>
<p>We may share information with service providers who help us run the Site (hosting, security, CRM, email infrastructure), when required by law, or in connection with a business transfer. We do not sell personal information as defined under California law (CCPA/CPRA).</p>
<h2>6. Retention</h2>
<p>We keep information only as long as needed for the purposes above, unless a longer period is required by law.</p>
<h2>7. Security</h2>
<p>We use reasonable administrative and technical measures appropriate to a small editorial site. No method of transmission or storage is 100% secure.</p>
<h2>8. Children</h2>
<p>The Site is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>
<h2>9. Your choices</h2>
<ul>
  <li>You may request access, correction, or deletion of contact information we hold by contacting us (see below).</li>
  <li>You can block or delete cookies in your browser.</li>
  <li>California residents may have additional rights under the CCPA/CPRA; contact us to exercise them. We will not discriminate for exercising privacy rights.</li>
</ul>
<h2>10. International visitors</h2>
<p>The Site is operated from the United States. If you visit from elsewhere, you understand information may be processed in the U.S.</p>
<h2>11. Changes</h2>
<p>We may update this policy from time to time. The effective date above will change when we do. Continued use of the Site after changes means you accept the updated policy.</p>
<h2>12. Contact</h2>
<p>Privacy questions: contact us via hello@ibamboo.com or the contact options on this website. Operator: SYMO, LLC, Sheridan, Wyoming, USA.</p>`

/** Minimum Privacy Policy for iBamboo. Not a substitute for legal counsel. */
export function Privacy() {
  return (
    <div className="pb-24">
      <Seo
        title="Privacy Policy"
        description="Privacy Policy for iBamboo (ibamboo.com)."
        path="/privacy"
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">Legal</p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-8">Privacy Policy</h1>
        <div
          className="legal-prose space-y-4 text-sm sm:text-base text-ink-soft leading-relaxed [&_h2]:text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: HTML }}
        />
        <p className="mt-10 text-sm text-muted">
          <Link to="/" className="hover:underline">Home</Link>
          {' · '}
          <Link to="/terms" className="hover:underline">
            Terms of Use
          </Link>
        </p>
      </article>
    </div>
  )
}
