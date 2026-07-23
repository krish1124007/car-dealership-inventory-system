import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface Banner {
  title: string
  subtitle: string
  image: string
  accent: string
}

const banners: Banner[] = [
  {
    title: 'Find your dream car today',
    subtitle:
      'Hand-picked premium cars, transparent pricing and instant purchase.',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=70',
    accent: 'from-gray-950/80 via-gray-900/50',
  },
  {
    title: 'New EVs & coupes in stock',
    subtitle:
      'Fresh arrivals every week — from family sedans to sports coupes.',
    image:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=70',
    accent: 'from-blue-950/80 via-blue-900/50',
  },
  {
    title: 'Adventure-ready SUVs',
    subtitle: 'Built for every road. Restocked weekly, ready to drive home.',
    image:
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=70',
    accent: 'from-emerald-950/80 via-emerald-900/50',
  },
]

const AUTO_ADVANCE_MS = 5000

/** Auto-advancing promotional carousel with dot navigation. */
export function BannerCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % banners.length),
      AUTO_ADVANCE_MS,
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      aria-label="Promotions"
      className="relative rounded-3xl overflow-hidden shadow-md h-64 sm:h-80"
    >
      {banners.map((banner, index) => (
        <div
          key={banner.title}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={banner.image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${banner.accent} to-transparent`}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
              {banner.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/85">
              {banner.subtitle}
            </p>
            <Link
              to="/cars"
              className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-white text-gray-900 hover:bg-blue-50 text-sm font-semibold px-6 py-2.5 shadow transition"
            >
              Browse cars
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.title}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full transition-all ${
              index === active ? 'w-6 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
