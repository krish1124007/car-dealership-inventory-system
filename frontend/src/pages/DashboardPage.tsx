import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Crown, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { HeroShowcase } from '../components/HeroShowcase'
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
      <HeroShowcase />
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

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white text-center px-6 py-14 shadow-lg shadow-blue-200/70">
              <div
                aria-hidden
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-indigo-400/20 blur-2xl"
              />
              <h2 className="font-display relative text-3xl sm:text-4xl font-bold tracking-tight">
                Explore our full collection
              </h2>
              <p className="relative mt-4 text-blue-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                These are just the highlights — visit our car collections to
                browse every make, model and price range in the showroom.
              </p>
              <Link
                to="/cars"
                className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold px-8 py-3 shadow-lg transition"
              >
                Visit our collections
                <ArrowRight size={15} />
              </Link>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
