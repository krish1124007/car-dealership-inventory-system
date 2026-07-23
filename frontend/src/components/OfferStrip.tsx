import { BadgePercent, ShieldCheck, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

interface Offer {
  icon: ReactNode
  /** The headline number or claim, set in the display face. */
  headline: string
  title: string
  detail: string
}

const offers: Offer[] = [
  {
    icon: <BadgePercent size={20} />,
    headline: 'Guaranteed discount',
    title: 'On every booking this month',
    detail: 'Locked in before you pay — no haggling at the desk.',
  },
  {
    icon: <ShieldCheck size={20} />,
    headline: '2-year warranty',
    title: 'Unlimited mileage, bumper to bumper',
    detail: 'Covered at any authorised service centre in India.',
  },
  {
    icon: <Wallet size={20} />,
    headline: 'Up to ₹20,000 cashback',
    title: 'On exchange and select bank cards',
    detail: 'Credited straight back after delivery.',
  },
]

/** Offer band sitting between the hero and the showroom content. */
export function OfferStrip() {
  return (
    <section
      aria-label="Offers"
      className="bg-white border-y border-gray-200/80"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid gap-6 sm:gap-8 sm:grid-cols-3 sm:divide-x sm:divide-gray-100">
        {offers.map((offer) => (
          <div
            key={offer.headline}
            className="flex items-start gap-3.5 sm:px-6 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="shrink-0 mt-0.5 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {offer.icon}
            </span>
            <div className="min-w-0">
              <p className="font-hero text-xl text-gray-900 tracking-wide leading-none">
                {offer.headline}
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1.5">
                {offer.title}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {offer.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
