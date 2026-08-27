import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { aboutSeo } from '../lib/seoData'

const HTML = `<p>iBamboo is a <strong>bamboo living storefront</strong>. We gather kitchen, table, bath, desk, and home pieces so you can browse a calmer house language in one place, then continue to Amazon when you are ready to buy.</p>
<h2>Weekly Amazon Best Sellers drops</h2>
<p>Each week we refresh a limited-time house edit from Amazon Best Sellers lists, kept to bamboo living. Rankings rotate. The shop stays current without becoming a warehouse catalog.</p>
<h2>How shopping works</h2>
<p>We are an Amazon Associates editorial site. We do not warehouse, sell, or ship the products featured here. Checkout, shipping, taxes, and returns belong to Amazon or the listed seller. As an Amazon Associate, we may earn from qualifying purchases.</p>
<h2>Who we are</h2>
<p>iBamboo is operated by SYMO, LLC, Sheridan, Wyoming, USA. Questions: hello@ibamboo.com.</p>`

export function About() {
  return (
    <div className="pb-24">
      <Seo {...aboutSeo()} />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">About</p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-8">
          About iBamboo
        </h1>
        <div
          className="legal-prose space-y-4 text-sm sm:text-base text-ink-soft leading-relaxed [&_h2]:text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: HTML }}
        />
        <p className="mt-10 text-sm text-muted">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          {' · '}
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          {' · '}
          <Link to="/terms" className="hover:underline">
            Terms of Use
          </Link>
        </p>
      </article>
    </div>
  )
}
