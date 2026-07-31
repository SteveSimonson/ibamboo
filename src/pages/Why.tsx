import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Seo } from '../components/Seo'
import { whySeo } from '../lib/seoData'

export function Why() {
  return (
    <div>
      <Seo {...whySeo()} />
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <img
          src="/brand/landing-forest.webp"
          alt="Bamboo forest canopy in soft light"
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-14 pt-28">
          <p className="label-micro !text-gold mb-3">Our story</p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-white max-w-2xl leading-tight">
            A brand built around one material.
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-10">
        <p className="text-xl text-ink-soft font-light leading-relaxed">
          iBamboo is a destination for people who want natural materials in the
          rooms they live in most—the kitchen, the table, the bath, the desk.
          We bring the collection together; Amazon handles fulfillment you
          already trust.
        </p>

        <div className="space-y-8">
          {[
            {
              t: 'Material first',
              d: 'Bamboo is strong, light, and renews at a pace few hardwoods can match. We focus on objects where that grain and structure improve daily life—not gimmicks.',
            },
            {
              t: 'A full house, not a single SKU',
              d: 'From prep boards to monitor stands, the assortment is meant to feel like one language of form across every room.',
            },
            {
              t: 'Shop the story. Check out when ready.',
              d: 'Explore photography, specifications, and related pieces on iBamboo. When you are ready, continue to the retailer of record for shipping and checkout.',
            },
          ].map((x) => (
            <div key={x.t} className="border-t border-line pt-8">
              <h2 className="font-display text-2xl font-semibold">{x.t}</h2>
              <p className="text-ink-soft mt-2 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden border border-line">
          <img
            src="/brand/soho-collection.webp"
            alt="iBamboo lifestyle"
            className="w-full aspect-[16/9] object-cover"
          />
        </div>

        <Link to="/shop" className="btn-primary">
          Shop the collection <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
