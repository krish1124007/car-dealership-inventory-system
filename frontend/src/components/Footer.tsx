import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

const explore = [
  { label: 'Home', to: '/' },
  { label: 'All cars', to: '/cars' },
  { label: 'Contact us', to: '/contact' },
  { label: 'Sign in', to: '/login' },
]

const collections = [
  { label: 'Electric cars', to: '/cars?category=EV' },
  { label: 'Pre-launch cars', to: '/cars?type=pre-launch' },
  { label: 'SUVs', to: '/cars?category=SUV' },
  { label: 'Sedans', to: '/cars?category=Sedan' },
]

/** Same details as the contact page, so the two can never disagree. */
const reachUs = [
  { icon: <Phone size={14} />, text: '+91 98250 00000' },
  { icon: <Mail size={14} />, text: 'hello@cardealership.com' },
  { icon: <MapPin size={14} />, text: 'SG Highway, Ahmedabad' },
  { icon: <Clock size={14} />, text: 'Mon–Sat, 9am to 8pm' },
]

function Column({
  heading,
  links,
}: {
  heading: string
  links: { label: string; to: string }[]
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
        {heading}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-gray-600 hover:text-blue-600 transition"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Site footer: brand and promise, the two link columns, and how to reach us. */
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo/logo_cars.png"
              alt=""
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="font-hero text-xl text-gray-900 tracking-wide leading-none pt-0.5">
              Car Dealership
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
            New and pre-launch cars from the brands people actually want, with
            the price you were quoted honoured at the desk.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Assured discount · 2-year warranty · up to ₹20,000 cashback
          </p>
        </div>

        <Column heading="Explore" links={explore} />
        <Column heading="Collections" links={collections} />

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Reach us
          </h3>
          <ul className="mt-4 space-y-3">
            {reachUs.map((item) => (
              <li
                key={item.text}
                className="flex items-start gap-2.5 text-sm text-gray-600"
              >
                <span className="shrink-0 mt-0.5 text-blue-600">
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Car Dealership. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Prices are ex-showroom and exclude registration and insurance.
          </p>
        </div>
      </div>
    </footer>
  )
}
