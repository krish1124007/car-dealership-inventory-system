import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Crown, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { FeaturedCarHero } from '../components/FeaturedCarHero'
import { OfferStrip } from '../components/OfferStrip'
import { HeroShowcase } from '../components/HeroShowcase'
import { CarSpotlight } from '../components/CarSpotlight'
import { Loading } from '../components/Loading'
import { VehicleCard } from '../components/VehicleCard'
import { useToast } from '../components/Toast'
import { listVehicles } from '../api/vehicles.api'
import type { Vehicle } from '../api/schemas'

const COLLECTION_SIZE = 3

function CollectionSection({
  label,
  title,
  subtitle,
  icon,
  vehicles,
}: {
  label: string
  title: string
  subtitle: string
  icon: ReactNode
  vehicles: Vehicle[]
}) {
  return (
    <section aria-label={label} className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display inline-flex items-center gap-2.5 text-2xl font-bold text-gray-900 tracking-tight">
            {icon}
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      <div className="flex justify-center pt-1">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600 text-sm font-semibold px-8 py-2.5 shadow-sm transition"
        >
          View more
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}

/** Public landing page: banners, curated collections, a closing invite
 * and a simple footer. */
export function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const toast = useToast()

  useEffect(() => {
    listVehicles()
      .then(setVehicles)
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : 'Failed to load vehicles',
        ),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const luxury = vehicles
    ? [...vehicles].sort((a, b) => b.price - a.price).slice(0, COLLECTION_SIZE)
    : []
  const affordable = vehicles
    ? [...vehicles].sort((a, b) => a.price - b.price).slice(0, COLLECTION_SIZE)
    : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <FeaturedCarHero />
      <OfferStrip />
      <CarSpotlight />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-12">
        {vehicles === null ? (
          <Loading label="Loading collections…" />
        ) : (
          <>
            <CollectionSection
              label="Luxury cars collection"
              title="Our luxury cars collection"
              subtitle="Flagship machines for those who settle for nothing less."
              icon={<Crown size={20} className="text-amber-500" />}
              vehicles={luxury}
            />

            <CollectionSection
              label="Affordable cars collection"
              title="Most affordable cars collection"
              subtitle="Great first cars and daily drivers that go easy on the wallet."
              icon={<Wallet size={20} className="text-emerald-600" />}
              vehicles={affordable}
            />
          </>
        )}
      </main>

      {/* The former landing showcase now lives after the collections as
          the connected-brands band. */}
      <HeroShowcase />

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
        {/* Closing invite, in the same language as the hero: ghost
            lettering behind a car cutout on a light card. */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-100 border border-gray-200 shadow-sm">
          <p
            aria-hidden
            className="font-hero absolute inset-x-0 top-4 text-center text-[20vw] sm:text-[11rem] leading-[0.8] uppercase text-gray-900/5 select-none pointer-events-none"
          >
            Showroom
          </p>

          <div className="relative grid lg:grid-cols-2 items-center gap-8 px-6 sm:px-12 py-12 sm:py-14">
            <div className="text-center lg:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                The full showroom
              </p>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Explore our full collection
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed max-w-md mx-auto lg:mx-0">
                These are just the highlights — visit our car collections to
                browse every make, model and price range in the showroom.
              </p>
              <Link
                to="/cars"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-gray-900 text-white hover:bg-blue-600 text-sm font-semibold px-8 py-3 shadow-lg transition-colors duration-300"
              >
                Visit our collections
                <ArrowRight size={15} />
              </Link>
            </div>

            <img
              src="/landing-photo/p3-show.png"
              alt=""
              aria-hidden
              className="w-full max-w-md lg:max-w-xl mx-auto object-contain drop-shadow-2xl"
            />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
